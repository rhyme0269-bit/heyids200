import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { getFees, getFeeNotes, replaceFees, replaceFeeNotes } from "@/lib/db";

export async function GET(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const fees = getFees();
  const notes = getFeeNotes();
  return NextResponse.json({ fees, notes });
}

export async function PUT(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const { fees, notes } = await request.json();
  if (fees) replaceFees(fees);
  if (notes) replaceFeeNotes(notes);
  return NextResponse.json({ fees: getFees(), notes: getFeeNotes() });
}
