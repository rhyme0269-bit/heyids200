import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { listImages, upsertImage, deleteImage } from "@/lib/db";

export async function GET(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const images = listImages();
  return NextResponse.json(images);
}

export async function POST(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const formData = await request.formData();
  const key = formData.get("key") as string;
  const file = formData.get("file") as File;

  if (!key || !file) {
    return NextResponse.json(
      { error: "Missing key or file" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  upsertImage(key, buffer, file.type);

  return NextResponse.json({ success: true, key });
}

export async function DELETE(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const { key } = await request.json();

  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  deleteImage(key);
  return NextResponse.json({ success: true });
}
