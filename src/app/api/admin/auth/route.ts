import { NextRequest, NextResponse } from "next/server";
import { verifyLogin, deleteSession, verifySession } from "@/lib/db";

// POST: 登入
export async function POST(request: NextRequest) {
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

  // Set httpOnly session cookie
  // secure 只在實際使用 HTTPS 時啟用（透過 NEXT_PUBLIC_SITE_URL 判斷）
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const isHttps = siteUrl.startsWith("https://");

  response.cookies.set("session_token", result.token, {
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax",
    path: "/",
    maxAge: 24 * 60 * 60, // 24 hours
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
