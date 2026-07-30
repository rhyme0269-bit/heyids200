import { NextResponse } from "next/server";
import { listCalculators } from "@/lib/calc-db";

export const dynamic = "force-dynamic";

export async function GET() {
  const calcs = listCalculators(true);
  return NextResponse.json(calcs);
}
