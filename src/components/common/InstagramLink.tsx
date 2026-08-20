/**
 * Instagram link (#30). The office publishes its news through Instagram, so this
 * points visitors there rather than embedding a feed — embedding needs either the
 * Meta API or a third-party widget, and #25 rules out adding packages for visual
 * effect. Renders nothing until the URL is filled in from the admin.
 */
export default function InstagramLink({
  href,
  className,
  showLabel = false,
}: {
  href?: string;
  className?: string;
  showLabel?: boolean;
}) {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Instagram"
      className={className}
    >
      <svg
        className="h-5 w-5 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.6"
        stroke="currentColor"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
      </svg>
      {showLabel && <span>Instagram</span>}
    </a>
  );
}
