"use client";

import { isPreview } from "@/lib/preview";

/**
 * Displays a banner at the top of the page when in preview mode.
 * Automatically hidden in production (Docker) deployments.
 */
export default function PreviewBanner() {
  if (!isPreview) return null;

  return (
    <div className="bg-amber-800 text-white text-center text-sm py-2 px-4">
      <span className="font-medium">設計預覽版</span>
      <span className="hidden sm:inline"> — 此為靜態預覽，聯絡表單等功能需正式部署後才能使用</span>
      <span className="sm:hidden"> — 部分功能僅限正式版</span>
    </div>
  );
}
