import { NextRequest, NextResponse } from "next/server";
import { getImage } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const image = getImage(key);

  if (!image) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(new Uint8Array(image.data), {
    headers: {
      "Content-Type": image.mime_type,
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
