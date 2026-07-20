"use client";

import { useState } from "react";
import { isPreview } from "@/lib/preview";

/**
 * Wraps any interactive element that requires server-side features.
 * In preview mode, shows a toast instead of executing the action.
 *
 * Usage:
 *   <PreviewGuard fallbackMessage="聯絡表單需正式部署後才能使用">
 *     <ContactForm />
 *   </PreviewGuard>
 *
 * Or wrap a button:
 *   <PreviewGuard fallbackMessage="此功能僅限正式版">
 *     <button onClick={handleSubmit}>送出</button>
 *   </PreviewGuard>
 */
export default function PreviewGuard({
  children,
  fallbackMessage = "此功能需正式部署後才能使用",
}: {
  children: React.ReactNode;
  fallbackMessage?: string;
}) {
  const [showToast, setShowToast] = useState(false);

  if (!isPreview) return <>{children}</>;

  return (
    <div className="relative">
      {/* Intercept all clicks in preview mode */}
      <div
        className="cursor-pointer"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
        }}
      >
        <div className="pointer-events-none opacity-75">{children}</div>
      </div>

      {/* Toast notification */}
      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-stone-800 text-white px-6 py-3 rounded-lg shadow-lg text-sm font-medium animate-fade-in-up">
          {fallbackMessage}
        </div>
      )}
    </div>
  );
}
