import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "./db";

export function checkAuth(request: NextRequest): NextResponse | null {
  // Check session cookie
  const token = request.cookies.get("session_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const session = verifySession(token);
  if (!session) {
    return NextResponse.json({ error: "登入已過期，請重新登入" }, { status: 401 });
  }

  return null; // Auth OK
}
