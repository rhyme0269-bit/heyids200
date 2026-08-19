/**
 * 產生靜態網站
 *
 * 讀取本機 data/oneness.db 的內容（也就是您在後台編輯的結果），
 * 產生一份完整的靜態網站到 _site/ 資料夾，可直接發布到 GitHub Pages。
 *
 * 用法：
 *   npm run publish
 *   SITE_URL=https://example.com.tw npm run publish
 *
 * 與 CI 的差別：CI 每次都用全新的預設資料，這支腳本用的是您本機的實際內容。
 */

import { spawn, spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);

const ROOT = process.cwd();
const OUT = path.join(ROOT, "_site");
const DB_PATH = path.join(ROOT, "data", "oneness.db");
const PORT = Number(process.env.PUBLISH_PORT || 4321);
const ORIGIN = `http://127.0.0.1:${PORT}`;

// 自訂網域。留空則產生給 GitHub Pages 預設網址用的版本。
const SITE_URL = (process.env.SITE_URL || readEnvFile("NEXT_PUBLIC_SITE_URL") || "").replace(/\/$/, "");
const CUSTOM_DOMAIN = SITE_URL && !SITE_URL.includes("github.io")
  ? SITE_URL.replace(/^https?:\/\//, "")
  : "";
// GitHub Pages 的預設網址帶有 /<repo> 路徑；自訂網域則位於根目錄。
const BASE_PATH = CUSTOM_DOMAIN ? "" : (process.env.BASE_PATH ?? "/heyids200");

const MIME_EXT = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "image/avif": "avif",
};

function readEnvFile(key) {
  try {
    const line = fs
      .readFileSync(path.join(ROOT, ".env"), "utf8")
      .split("\n")
      .find((l) => l.startsWith(`${key}=`));
    return line ? line.slice(key.length + 1).trim() : "";
  } catch {
    return "";
  }
}

function log(msg) {
  console.log(msg);
}

function fail(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

async function waitForServer(timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${ORIGIN}${BASE_PATH}/`, { redirect: "manual" });
      if (res.status < 500) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  fail("網站伺服器啟動逾時");
}

/** 從 sitemap 取得所有已發布頁面的路徑，而非掃描檔案 —— 頁面是動態路由，檔案掃不出來。 */
async function discoverPages() {
  const res = await fetch(`${ORIGIN}${BASE_PATH}/sitemap.xml`);
  if (!res.ok) fail(`無法取得 sitemap（HTTP ${res.status}）`);
  const xml = await res.text();

  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1].replace(/^https?:\/\/[^/]+/, ""))
    .map((p) => (BASE_PATH && p.startsWith(BASE_PATH) ? p.slice(BASE_PATH.length) : p))
    .map((p) => p.replace(/^\//, ""));

  return [...new Set(paths)];
}

/**
 * 後台上傳的圖片存在資料庫裡，透過 /api/images/<key> 提供。
 * 靜態網站沒有這個路徑，因此匯出成實體檔案並改寫頁面中的網址。
 */
function exportImages() {
  if (!fs.existsSync(DB_PATH)) {
    log("  （找不到 data/oneness.db，略過圖片匯出）");
    return {};
  }

  let Database;
  try {
    Database = require("better-sqlite3");
  } catch {
    log("  （better-sqlite3 無法載入，略過圖片匯出）");
    return {};
  }

  const db = new Database(DB_PATH, { readonly: true });
  let rows = [];
  try {
    rows = db.prepare("SELECT key, data, mime_type FROM images").all();
  } catch {
    // images 表尚未建立
  }
  db.close();

  if (rows.length === 0) {
    log("  資料庫中沒有上傳的圖片，全部使用預設圖片");
    return {};
  }

  const dir = path.join(OUT, "img");
  fs.mkdirSync(dir, { recursive: true });

  const map = {};
  for (const row of rows) {
    const ext = MIME_EXT[row.mime_type] || "png";
    const file = `${row.key}.${ext}`;
    fs.writeFileSync(path.join(dir, file), row.data);
    map[row.key] = `${BASE_PATH}/img/${file}`;
    log(`  匯出圖片：${row.key} → img/${file}`);
  }
  return map;
}

function rewriteImageUrls(html, map) {
  // 有上傳圖片的改指向匯出的檔案；沒有的維持預設圖片路徑不動。
  return html.replace(/\/api\/images\/([A-Za-z0-9_-]+)/g, (whole, key) => map[key] ?? whole);
}

function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dest);
    else fs.copyFileSync(src, dest);
  }
}

async function main() {
  log("\n=== 產生靜態網站 ===\n");
  log(`網址設定：${SITE_URL || "（未設定，使用 GitHub Pages 預設網址）"}`);
  log(`路徑前綴：${BASE_PATH || "（根目錄）"}\n`);

  log("[1/6] 建置網站…");
  const build = spawnSync("npm", ["run", "build"], {
    stdio: "inherit",
    env: { ...process.env, NEXT_PUBLIC_SITE_URL: SITE_URL, NEXT_PUBLIC_BASE_PATH: BASE_PATH },
    shell: process.platform === "win32",
  });
  if (build.status !== 0) fail("建置失敗");

  log("\n[2/6] 準備伺服器…");
  copyDir(path.join(ROOT, ".next/static"), path.join(ROOT, ".next/standalone/.next/static"));
  copyDir(path.join(ROOT, "public"), path.join(ROOT, ".next/standalone/public"));

  const server = spawn("node", [".next/standalone/server.js"], {
    cwd: ROOT, // 讓伺服器讀到 ./data/oneness.db，也就是您的實際內容
    env: { ...process.env, PORT: String(PORT), HOSTNAME: "127.0.0.1" },
    stdio: "ignore",
  });

  try {
    await waitForServer();
    log("  伺服器已啟動");

    fs.rmSync(OUT, { recursive: true, force: true });
    fs.mkdirSync(OUT, { recursive: true });

    log("\n[3/6] 匯出後台圖片…");
    const imageMap = exportImages();

    log("\n[4/6] 擷取頁面…");
    const pages = await discoverPages();
    let failed = 0;

    for (const page of pages) {
      const url = `${ORIGIN}${BASE_PATH}${page ? `/${page}` : "/"}`;
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`  ✗ /${page} → HTTP ${res.status}`);
        failed++;
        continue;
      }
      const html = rewriteImageUrls(await res.text(), imageMap);
      const dest = page ? path.join(OUT, page, "index.html") : path.join(OUT, "index.html");
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, html);
      log(`  ✓ /${page}`);
    }

    if (failed > 0) fail(`${failed} 個頁面擷取失敗，未產生網站`);

    log("\n[5/6] 複製靜態資源…");
    copyDir(path.join(ROOT, ".next/static"), path.join(OUT, "_next/static"));
    copyDir(path.join(ROOT, "public"), OUT);

    // 直接輸入網址時導回正確位置
    fs.writeFileSync(
      path.join(OUT, "404.html"),
      `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Redirecting</title>\n` +
        `<script>var b='${BASE_PATH}',p=location.pathname;if(b&&!p.startsWith(b))location.replace(b+p+location.search+location.hash);</script>\n` +
        `</head><body></body></html>\n`
    );

    // GitHub Pages 綁定自訂網域需要這個檔案，缺少的話設定會在每次部署後被清掉
    if (CUSTOM_DOMAIN) {
      fs.writeFileSync(path.join(OUT, "CNAME"), `${CUSTOM_DOMAIN}\n`);
      log(`  已寫入 CNAME：${CUSTOM_DOMAIN}`);
    }

    // 避免 GitHub Pages 的 Jekyll 忽略底線開頭的資料夾（_next）
    fs.writeFileSync(path.join(OUT, ".nojekyll"), "");

    const fileCount = countFiles(OUT);
    log(`\n[6/6] 完成：${pages.length} 個頁面、${fileCount} 個檔案`);
    log(`\n輸出位置：${OUT}`);

    printBackupReminder();
  } finally {
    server.kill();
  }
}

/**
 * 網站內容只存在這台電腦上，備份由使用者自行負責，這裡每次發布後提醒一次。
 * 一併顯示檔案日期與大小，方便對照備份的是不是最新的。
 */
function printBackupReminder() {
  if (!fs.existsSync(DB_PATH)) return;

  const stat = fs.statSync(DB_PATH);
  const size = (stat.size / 1024 / 1024).toFixed(1);
  const date = stat.mtime.toLocaleDateString("zh-TW");
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const isWindows = process.platform === "win32";

  log("\n────────────────────────────────────────");
  log("⚠️  請記得備份網站內容");
  log("────────────────────────────────────────");
  log(`您在後台編輯的所有文字與圖片，都存在這個檔案裡：`);
  log(`  data/oneness.db（${size} MB，最後修改 ${date}）`);
  log("");
  log("這台電腦若損壞或遺失，未備份的內容將無法復原。");
  log("建議複製一份到雲端硬碟或隨身碟：");
  log("");
  log(
    isWindows
      ? `  copy data\\oneness.db "D:\\備份\\oneness-${stamp}.db"`
      : `  cp data/oneness.db ~/備份/oneness-${stamp}.db`
  );
  log("");
  log("此檔案包含後台密碼，請勿公開分享或上傳到公開的網路空間。");
  log("────────────────────────────────────────\n");
}

function countFiles(dir) {
  let n = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) n += countFiles(path.join(dir, entry.name));
    else n++;
  }
  return n;
}

main().catch((err) => fail(err?.stack || String(err)));
