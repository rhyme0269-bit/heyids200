import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { getFaqs, replaceFaqs } from "@/lib/db";

export async function GET(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const faqs = getFaqs();
  return NextResponse.json(faqs);
}

export async function PUT(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const body = await request.json();
  replaceFaqs(body);
  const updated = getFaqs();
  return NextResponse.json(updated);
}
