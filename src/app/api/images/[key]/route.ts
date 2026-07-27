import { NextRequest, NextResponse } from "next/server";
import { getImage } from "@/lib/db";

const ALLOWED_MIME = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const image = getImage(key);

  if (!image) {
    return new NextResponse(null, { status: 404 });
  }

  // Only serve known safe MIME types
  const mimeType = ALLOWED_MIME.includes(image.mime_type)
    ? image.mime_type
    : "application/octet-stream";

  return new NextResponse(new Uint8Array(image.data), {
    headers: {
      "Content-Type": mimeType,
      "Cache-Control": "no-cache",
      "ETag": `"${image.updated_at}"`,
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
    },
  });
}
