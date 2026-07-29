import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { migrateToCs } from "@/lib/migrate-to-cms";

export async function POST(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const result = migrateToCs();
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}
