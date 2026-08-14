import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { reorderPages } from "@/lib/cms-db";

export async function PUT(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const body = await request.json();
  if (!Array.isArray(body.pageIds)) {
    return NextResponse.json({ error: "pageIds 必須為陣列" }, { status: 400 });
  }

  reorderPages(body.pageIds as string[]);
  return NextResponse.json({ success: true });
}
