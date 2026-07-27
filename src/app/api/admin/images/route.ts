import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { listImages, upsertImage, deleteImage } from "@/lib/db";

const ALLOWED_KEYS = [
  "logo",
  "hero_bg",
  "scrivener_photo",
  "about_bg",
  "services_bg",
  "contact_bg",
  "faq_bg",
  "tools_bg",
];
const ALLOWED_MIME = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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
    return NextResponse.json({ error: "缺少 key 或檔案" }, { status: 400 });
  }

  // Key allowlist
  if (!ALLOWED_KEYS.includes(key)) {
    return NextResponse.json(
      { error: `不允許的圖片 key，僅支援: ${ALLOWED_KEYS.join(", ")}` },
      { status: 400 }
    );
  }

  // File size check
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "檔案大小不能超過 5MB" },
      { status: 400 }
    );
  }

  // MIME type check
  if (!ALLOWED_MIME.includes(file.type)) {
    return NextResponse.json(
      { error: `不支援的檔案類型，僅支援: ${ALLOWED_MIME.join(", ")}` },
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

  if (!key || !ALLOWED_KEYS.includes(key)) {
    return NextResponse.json({ error: "無效的 key" }, { status: 400 });
  }

  deleteImage(key);
  return NextResponse.json({ success: true });
}
