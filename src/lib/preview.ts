// Preview mode detection utility.
// When NEXT_PUBLIC_BASE_PATH is set (GitHub Pages build),
// the site is in preview mode — server-side features are unavailable.

export const isPreview = !!process.env.NEXT_PUBLIC_BASE_PATH;
