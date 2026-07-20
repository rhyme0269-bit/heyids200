import { NextRequest, NextResponse } from "next/server";
import { verifyLogin, deleteSession, verifySession } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

// POST: 登入（限制 5 次 / 分鐘 per IP）
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = checkRateLimit(`login:${ip}`, 5, 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "嘗試次數過多，請稍後再試" },
      { status: 429 }
    );
  }

  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json({ error: "請輸入帳號和密碼" }, { status: 400 });
  }

  const result = verifyLogin(username, password);
  if (!result) {
    return NextResponse.json({ error: "帳號或密碼錯誤" }, { status: 401 });
  }

  const response = NextResponse.json({
    success: true,
    username: result.username,
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const isHttps = siteUrl.startsWith("https://");

  response.cookies.set("session_token", result.token, {
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax",
    path: "/",
    maxAge: 24 * 60 * 60,
  });

  return response;
}

// DELETE: 登出
export async function DELETE(request: NextRequest) {
  const token = request.cookies.get("session_token")?.value;
  if (token) {
    deleteSession(token);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete("session_token");
  return response;
}

// GET: 檢查登入狀態
export async function GET(request: NextRequest) {
  const token = request.cookies.get("session_token")?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const session = verifySession(token);
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    username: session.username,
  });
}
