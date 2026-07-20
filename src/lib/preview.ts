/**
 * Preview mode detection utility.
 *
 * When NEXT_PUBLIC_BASE_PATH is set (GitHub Pages build),
 * the site is in preview mode — server-side features are unavailable.
 *
 * Usage:
 *   import { isPreview } from "@/lib/preview";
 *   if (isPreview) { /* show fallback */ }
 *
 * For client components:
 *   import { usePreviewGuard } from "@/lib/preview";
 *   const handleSubmit = usePreviewGuard(() => { /* real logic */ });
 */

export const isPreview = !!process.env.NEXT_PUBLIC_BASE_PATH;
