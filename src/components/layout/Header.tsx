"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";

interface NavItem {
  title: string;
  href: string;
  isExternal?: boolean;
}

function NavLink({ item, className, onClick }: { item: NavItem; className: string; onClick?: () => void }) {
  if (item.isExternal) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className={className} onClick={onClick}>
        {item.title}
      </a>
    );
  }
  return (
    <Link href={item.href} className={className} onClick={onClick}>
      {item.title}
    </Link>
  );
}

// Enlarged ~15% over the previous 8/10/14/20 (#25).
const LOGO_SIZES: Record<string, string> = {
  small: "h-9",
  medium: "h-11",
  large: "h-16",
  xlarge: "h-23",
};

/**
 * Nav links get a gold underline that grows from the centre on hover. Done with
 * a pseudo-element via arbitrary variants so it stays a single class string and
 * needs no extra markup per link.
 */
const NAV_LINK_CLASS =
  "relative px-3 py-2 text-sm font-medium transition-colors text-stone-600 hover:text-stone-900 " +
  "after:absolute after:bottom-0 after:left-1/2 after:h-px after:w-0 after:-translate-x-1/2 " +
  "after:bg-gold after:transition-all after:duration-300 hover:after:w-[calc(100%-1.5rem)]";

export default function Header({ navItems, siteName, phone, logoSize, logoSrc }: { navItems: NavItem[]; siteName?: string; phone?: string; logoSize?: string; logoSrc?: string | null }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const logoClass = LOGO_SIZES[logoSize || "medium"] || LOGO_SIZES.medium;
  const logoRef = useCallback((img: HTMLImageElement | null) => {
    if (img && img.complete && img.naturalWidth > 0) {
      img.classList.remove("hidden");
    }
  }, []);

  // Frosted glass once scrolled away from the top (#25). Reads scroll position
  // rather than deriving it from state, so no cascading renders.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "bg-white/70 backdrop-blur-[12px] border-stone-200/70 shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
          : "bg-white border-stone-200/50 shadow-none"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            {/* Resolved on the server and passed in, so the URL is not baked into
                this client bundle — the static publish rewrites image URLs in the
                HTML, which cannot reach a literal inside a JS chunk. */}
            {logoSrc && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                ref={logoRef}
                src={logoSrc}
                alt={siteName || "合一地政士事務所"}
                className={`${logoClass} w-auto hidden`}
                onError={(e) => { (e.target as HTMLImageElement).classList.add("hidden"); }}
                onLoad={(e) => { (e.target as HTMLImageElement).classList.remove("hidden"); }}
              />
            )}
            <span className="text-xl font-bold text-stone-800">
              {siteName || "合一地政士事務所"}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                className={NAV_LINK_CLASS}
              />
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center">
            <a
              href={`tel:${phone || "02-2282-6600"}`}
              className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg transition-colors text-white bg-amber-800 hover:bg-amber-900"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                />
              </svg>
              {phone || "02-2282-6600"}
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md transition-colors text-stone-600 hover:text-stone-800 hover:bg-stone-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="開啟選單"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                className="block px-3 py-2 text-base font-medium text-stone-700 hover:text-amber-800 hover:bg-stone-50 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              />
            ))}
            <div className="pt-3 border-t border-stone-200">
              <a
                href={`tel:${phone || "02-2282-6600"}`}
                className="flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-amber-800 rounded-lg hover:bg-amber-900 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                  />
                </svg>
                {phone || "02-2282-6600"}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
