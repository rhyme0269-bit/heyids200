#!/usr/bin/env node

/**
 * 自動產生 docs/preview.html 靜態預覽檔
 *
 * 用法：node scripts/generate-preview.js
 *
 * 從 Docker 容器抓取完整頁面 HTML，組合成一頁式預覽。
 * 需要 Docker 服務正在運行（docker compose up）。
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const BASE_URL = process.env.PREVIEW_URL || "http://localhost:8081";
const OUTPUT = path.join(__dirname, "..", "docs", "preview.html");

const pages = [
  { path: "/", id: "hero" },
  { path: "/about", id: "about" },
  { path: "/services", id: "services" },
  { path: "/tools", id: "tools" },
  { path: "/faq", id: "faq" },
  { path: "/contact", id: "contact" },
];

function fetch(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? require("https") : http;
    mod
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

async function main() {
  console.log(`Fetching pages from ${BASE_URL} ...`);

  // Test connection
  try {
    await fetch(BASE_URL);
  } catch {
    console.error(
      `\nError: Cannot connect to ${BASE_URL}\n` +
        "Make sure Docker containers are running:\n" +
        "  docker compose up -d\n"
    );
    process.exit(1);
  }

  // Fetch each page
  const sections = [];
  for (const page of pages) {
    const url = `${BASE_URL}${page.path}`;
    console.log(`  Fetching ${url} ...`);
    try {
      const html = await fetch(url);
      // Extract <main> content
      const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/);
      if (mainMatch) {
        sections.push({
          id: page.id,
          path: page.path,
          content: mainMatch[1],
        });
      }
    } catch (err) {
      console.warn(`  Warning: Failed to fetch ${url}: ${err.message}`);
    }
  }

  // Fetch homepage for header/footer
  const homeHtml = await fetch(BASE_URL);
  const headerMatch = homeHtml.match(/<header[^>]*>[\s\S]*?<\/header>/);
  const footerMatch = homeHtml.match(/<footer[^>]*>[\s\S]*?<\/footer>/);

  // Extract <head> styles
  const styleMatches = homeHtml.match(/<style[^>]*>[\s\S]*?<\/style>/g) || [];
  const linkMatches =
    homeHtml.match(/<link[^>]*rel="stylesheet"[^>]*>/g) || [];

  // Build preview HTML
  const preview = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>合一地政士事務所 | 網站預覽</title>
  <script src="https://cdn.tailwindcss.com"><\/script>
  ${styleMatches.join("\n  ")}
  <style>
    html { scroll-behavior: smooth; }
  </style>
</head>
<body class="min-h-screen flex flex-col">

${headerMatch ? headerMatch[0] : "<!-- header not found -->"}

<main class="flex-1">
${sections.map((s) => `\n<!-- ===== ${s.path} ===== -->\n${s.content}`).join("\n")}
</main>

${footerMatch ? footerMatch[0] : "<!-- footer not found -->"}

<script>
  // Mobile menu toggle
  var menuBtn = document.querySelector('[data-menu-btn]') || document.querySelector('button.md\\\\:hidden');
  var mobileMenu = document.querySelector('[data-mobile-menu]') || document.getElementById('mobileMenu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function() {
      mobileMenu.classList.toggle('hidden');
    });
  }
</script>

</body>
</html>`;

  // Ensure output directory exists
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, preview, "utf-8");

  console.log(`\nPreview generated: ${OUTPUT}`);
  console.log(`File size: ${(Buffer.byteLength(preview) / 1024).toFixed(1)} KB`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
