import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import type {
  Page,
  Block,
  BlockConfig,
  BlockType,
  PageTemplate,
  NavItem,
  NavLink,
  PageStatus,
  HeroMode,
} from "./cms-types";
import {
  defaultAbout,
  defaultServices,
  defaultServiceFlow,
  defaultFaqs,
  defaultFeeSchedule,
  defaultFeeNotes,
  defaultSiteSettings,
} from "./default-data";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "oneness.db");

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (_db) return _db;
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");
  return _db;
}

function uuid(): string {
  return crypto.randomUUID();
}

// ===== Schema =====

function hashData(json: string): string {
  return crypto.createHash("sha256").update(json).digest("hex").slice(0, 16);
}

export function initCmsTables(db?: Database.Database) {
  const d = db ?? getDb();
  d.exec(`
    CREATE TABLE IF NOT EXISTS page_templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      default_blocks TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS pages (
      id TEXT PRIMARY KEY,
      template_id TEXT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      subtitle TEXT NOT NULL DEFAULT '',
      meta_description TEXT NOT NULL DEFAULT '',
      hero_mode TEXT NOT NULL DEFAULT 'default',
      hero_color TEXT NOT NULL DEFAULT '#4a3428',
      is_system INTEGER NOT NULL DEFAULT 0,
      seed_key TEXT DEFAULT NULL,
      show_in_nav INTEGER NOT NULL DEFAULT 1,
      nav_order INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'published',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (template_id) REFERENCES page_templates(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS blocks (
      id TEXT PRIMARY KEY,
      page_id TEXT NOT NULL,
      block_type TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      data TEXT NOT NULL DEFAULT '{}',
      config TEXT NOT NULL DEFAULT '{}',
      seed_hash TEXT DEFAULT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS nav_links (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      href TEXT NOT NULL,
      nav_order INTEGER NOT NULL DEFAULT 0,
      is_external INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_blocks_page_order ON blocks(page_id, sort_order);
    CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
  `);

  // Migration: add seed_key column for existing DBs
  const cols = d.prepare("PRAGMA table_info(pages)").all() as { name: string }[];
  if (!cols.some((c) => c.name === "seed_key")) {
    d.exec("ALTER TABLE pages ADD COLUMN seed_key TEXT DEFAULT NULL");
    d.exec("UPDATE pages SET seed_key = slug WHERE is_system = 1");
  }
  d.exec(
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_pages_seed_key ON pages(seed_key) WHERE seed_key IS NOT NULL"
  );

  // Migration: add seed_hash column to blocks for existing DBs
  const blockCols = d.prepare("PRAGMA table_info(blocks)").all() as { name: string }[];
  if (!blockCols.some((c) => c.name === "seed_hash")) {
    d.exec("ALTER TABLE blocks ADD COLUMN seed_hash TEXT DEFAULT NULL");
    const seedPages = getSeedPages();
    for (const sp of seedPages) {
      const page = d.prepare("SELECT id FROM pages WHERE seed_key = ?").get(sp.opts.seedKey) as { id: string } | undefined;
      if (!page) continue;
      const blocks = d.prepare("SELECT id, block_type, sort_order FROM blocks WHERE page_id = ? ORDER BY sort_order").all(page.id) as { id: string; block_type: string; sort_order: number }[];
      for (let i = 0; i < sp.blocks.length; i++) {
        const row = blocks.find(b => b.sort_order === i && b.block_type === sp.blocks[i].blockType);
        if (row) {
          d.prepare("UPDATE blocks SET seed_hash = ? WHERE id = ?").run(hashData(JSON.stringify(sp.blocks[i].data)), row.id);
        }
      }
    }
  }
}

// ===== Row → Object Mappers =====

interface PageRow {
  id: string;
  template_id: string | null;
  slug: string;
  title: string;
  subtitle: string;
  meta_description: string;
  hero_mode: string;
  hero_color: string;
  is_system: number;
  seed_key: string | null;
  show_in_nav: number;
  nav_order: number;
  status: string;
  created_at: string;
  updated_at: string;
}

function rowToPage(row: PageRow): Page {
  return {
    id: row.id,
    templateId: row.template_id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    metaDescription: row.meta_description,
    heroMode: row.hero_mode as HeroMode,
    heroColor: row.hero_color,
    isSystem: row.is_system === 1,
    seedKey: row.seed_key,
    showInNav: row.show_in_nav === 1,
    navOrder: row.nav_order,
    status: row.status as PageStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

interface BlockRow {
  id: string;
  page_id: string;
  block_type: string;
  sort_order: number;
  data: string;
  config: string;
  created_at: string;
  updated_at: string;
}

function rowToBlock(row: BlockRow): Block {
  return {
    id: row.id,
    pageId: row.page_id,
    blockType: row.block_type as BlockType,
    sortOrder: row.sort_order,
    data: JSON.parse(row.data),
    config: JSON.parse(row.config) as BlockConfig,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ===== Page CRUD =====

export function listPages(): Page[] {
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT * FROM pages ORDER BY nav_order, created_at"
    )
    .all() as PageRow[];
  return rows.map(rowToPage);
}

export function getPageById(id: string): Page | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM pages WHERE id = ?")
    .get(id) as PageRow | undefined;
  return row ? rowToPage(row) : null;
}

export function getPageBySlug(slug: string): Page | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM pages WHERE slug = ?")
    .get(slug) as PageRow | undefined;
  return row ? rowToPage(row) : null;
}

const RESERVED_SLUGS = new Set([
  "home", "about", "services", "fees", "tools", "faq", "contact", "links",
  "flow-sale",
  "admin", "api", "p", "_next",
]);

export function createPage(data: {
  slug: string;
  title: string;
  subtitle?: string;
  metaDescription?: string;
  templateId?: string;
  heroMode?: HeroMode;
  heroColor?: string;
  showInNav?: boolean;
  navOrder?: number;
  status?: PageStatus;
}): Page {
  if (RESERVED_SLUGS.has(data.slug)) {
    throw new Error(`網址路徑「${data.slug}」為系統保留，請使用其他名稱`);
  }
  const db = getDb();
  const id = uuid();
  db.prepare(
    `INSERT INTO pages (id, template_id, slug, title, subtitle, meta_description,
     hero_mode, hero_color, show_in_nav, nav_order, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    data.templateId ?? null,
    data.slug,
    data.title,
    data.subtitle ?? "",
    data.metaDescription ?? "",
    data.heroMode ?? "default",
    data.heroColor ?? "#4a3428",
    data.showInNav !== false ? 1 : 0,
    data.navOrder ?? 0,
    data.status ?? "published"
  );
  return getPageById(id)!;
}

export function updatePage(
  id: string,
  data: Partial<{
    slug: string;
    title: string;
    subtitle: string;
    metaDescription: string;
    heroMode: HeroMode;
    heroColor: string;
    showInNav: boolean;
    navOrder: number;
    status: PageStatus;
  }>
): Page | null {
  const db = getDb();
  const current = getPageById(id);
  if (!current) return null;

  db.prepare(
    `UPDATE pages SET slug = ?, title = ?, subtitle = ?, meta_description = ?,
     hero_mode = ?, hero_color = ?, show_in_nav = ?, nav_order = ?, status = ?,
     updated_at = datetime('now')
     WHERE id = ?`
  ).run(
    data.slug ?? current.slug,
    data.title ?? current.title,
    data.subtitle ?? current.subtitle,
    data.metaDescription ?? current.metaDescription,
    data.heroMode ?? current.heroMode,
    data.heroColor ?? current.heroColor,
    (data.showInNav ?? current.showInNav) ? 1 : 0,
    data.navOrder ?? current.navOrder,
    data.status ?? current.status,
    id
  );
  return getPageById(id);
}

export function deletePage(id: string): boolean {
  const db = getDb();
  const page = getPageById(id);
  if (!page || page.isSystem) return false;
  db.prepare("DELETE FROM pages WHERE id = ?").run(id);
  return true;
}

// ===== Block CRUD =====

export function getBlocksForPage(pageId: string): Block[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM blocks WHERE page_id = ? ORDER BY sort_order")
    .all(pageId) as BlockRow[];
  return rows.map(rowToBlock);
}

export function createBlock(data: {
  pageId: string;
  blockType: BlockType;
  sortOrder?: number;
  data?: Record<string, unknown>;
  config?: BlockConfig;
}): Block {
  const db = getDb();
  const id = uuid();

  const order =
    data.sortOrder ??
    ((
      db
        .prepare(
          "SELECT COALESCE(MAX(sort_order), -1) + 1 as next FROM blocks WHERE page_id = ?"
        )
        .get(data.pageId) as { next: number }
    ).next);

  db.prepare(
    `INSERT INTO blocks (id, page_id, block_type, sort_order, data, config)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    data.pageId,
    data.blockType,
    order,
    JSON.stringify(data.data ?? {}),
    JSON.stringify(data.config ?? {})
  );
  return rowToBlock(
    db.prepare("SELECT * FROM blocks WHERE id = ?").get(id) as BlockRow
  );
}

export function updateBlock(
  id: string,
  data: Partial<{
    data: Record<string, unknown>;
    config: BlockConfig;
    blockType: BlockType;
  }>
): Block | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM blocks WHERE id = ?")
    .get(id) as BlockRow | undefined;
  if (!row) return null;

  const current = rowToBlock(row);
  db.prepare(
    `UPDATE blocks SET data = ?, config = ?, block_type = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).run(
    JSON.stringify(data.data ?? current.data),
    JSON.stringify(data.config ?? current.config),
    data.blockType ?? current.blockType,
    id
  );
  return rowToBlock(
    db.prepare("SELECT * FROM blocks WHERE id = ?").get(id) as BlockRow
  );
}

export function deleteBlock(id: string): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM blocks WHERE id = ?").run(id);
  return result.changes > 0;
}

export function reorderBlocks(pageId: string, blockIds: string[]): void {
  const db = getDb();
  const update = db.prepare(
    "UPDATE blocks SET sort_order = ?, updated_at = datetime('now') WHERE id = ? AND page_id = ?"
  );
  const reorder = db.transaction(() => {
    blockIds.forEach((id, i) => update.run(i, id, pageId));
  });
  reorder();
}

// ===== Batch Save (atomic page + blocks) =====

export function savePageWithBlocks(
  pageId: string,
  pageData: Partial<{
    slug: string;
    title: string;
    subtitle: string;
    metaDescription: string;
    heroMode: HeroMode;
    heroColor: string;
    showInNav: boolean;
    navOrder: number;
    status: PageStatus;
  }>,
  blocks: Array<{
    id?: string;
    blockType: BlockType;
    sortOrder: number;
    data: Record<string, unknown>;
    config: BlockConfig;
  }>
): { page: Page; blocks: Block[] } {
  const db = getDb();

  const save = db.transaction(() => {
    // Update page
    updatePage(pageId, pageData);

    // Remove old blocks not in new list
    const newIds = blocks.filter((b) => b.id).map((b) => b.id!);
    const existing = db
      .prepare("SELECT id FROM blocks WHERE page_id = ?")
      .all(pageId) as { id: string }[];
    for (const row of existing) {
      if (!newIds.includes(row.id)) {
        db.prepare("DELETE FROM blocks WHERE id = ?").run(row.id);
      }
    }

    // Upsert blocks
    const upsert = db.prepare(
      `INSERT INTO blocks (id, page_id, block_type, sort_order, data, config)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         block_type = excluded.block_type,
         sort_order = excluded.sort_order,
         data = excluded.data,
         config = excluded.config,
         updated_at = datetime('now')`
    );

    for (const block of blocks) {
      const blockId = block.id ?? uuid();
      upsert.run(
        blockId,
        pageId,
        block.blockType,
        block.sortOrder,
        JSON.stringify(block.data),
        JSON.stringify(block.config)
      );
    }
  });

  save();
  return {
    page: getPageById(pageId)!,
    blocks: getBlocksForPage(pageId),
  };
}

// ===== Templates =====

export function listTemplates(): PageTemplate[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM page_templates ORDER BY id")
    .all() as {
    id: string;
    name: string;
    description: string;
    default_blocks: string;
  }[];
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    defaultBlocks: JSON.parse(r.default_blocks),
  }));
}

export function createPageFromTemplate(
  templateId: string,
  slug: string,
  title: string
): { page: Page; blocks: Block[] } | null {
  const db = getDb();
  const tplRow = db
    .prepare("SELECT * FROM page_templates WHERE id = ?")
    .get(templateId) as {
    id: string;
    name: string;
    description: string;
    default_blocks: string;
  } | undefined;
  if (!tplRow) return null;

  const defaultBlocks = JSON.parse(tplRow.default_blocks) as Array<{
    blockType: BlockType;
    defaultData: Record<string, unknown>;
    defaultConfig?: BlockConfig;
  }>;

  const page = createPage({ slug, title, templateId });

  const blocks: Block[] = [];
  for (let i = 0; i < defaultBlocks.length; i++) {
    const def = defaultBlocks[i];
    const block = createBlock({
      pageId: page.id,
      blockType: def.blockType,
      sortOrder: i,
      data: def.defaultData,
      config: def.defaultConfig,
    });
    blocks.push(block);
  }

  return { page, blocks };
}

// ===== Page Reorder =====

export function reorderPages(pageIds: string[]): void {
  const db = getDb();
  const update = db.prepare(
    "UPDATE pages SET nav_order = ?, updated_at = datetime('now') WHERE id = ?"
  );
  const reorder = db.transaction(() => {
    pageIds.forEach((id, i) => update.run(i, id));
  });
  reorder();
}

// ===== Custom Nav Links CRUD =====

interface NavLinkRow {
  id: string;
  label: string;
  href: string;
  nav_order: number;
  is_external: number;
  created_at: string;
}

function rowToNavLink(row: NavLinkRow): NavLink {
  return {
    id: row.id,
    label: row.label,
    href: row.href,
    navOrder: row.nav_order,
    isExternal: row.is_external === 1,
    createdAt: row.created_at,
  };
}

export function listNavLinks(): NavLink[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM nav_links ORDER BY nav_order")
    .all() as NavLinkRow[];
  return rows.map(rowToNavLink);
}

export function createNavLink(data: {
  label: string;
  href: string;
  navOrder?: number;
  isExternal?: boolean;
}): NavLink {
  const db = getDb();
  const id = uuid();
  const order =
    data.navOrder ??
    ((
      db
        .prepare("SELECT COALESCE(MAX(nav_order), -1) + 1 as next FROM nav_links")
        .get() as { next: number }
    ).next);
  db.prepare(
    "INSERT INTO nav_links (id, label, href, nav_order, is_external) VALUES (?, ?, ?, ?, ?)"
  ).run(id, data.label, data.href, order, data.isExternal ? 1 : 0);
  return rowToNavLink(
    db.prepare("SELECT * FROM nav_links WHERE id = ?").get(id) as NavLinkRow
  );
}

export function updateNavLink(
  id: string,
  data: Partial<{ label: string; href: string; navOrder: number; isExternal: boolean }>
): NavLink | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM nav_links WHERE id = ?")
    .get(id) as NavLinkRow | undefined;
  if (!row) return null;
  const current = rowToNavLink(row);
  db.prepare(
    "UPDATE nav_links SET label = ?, href = ?, nav_order = ?, is_external = ? WHERE id = ?"
  ).run(
    data.label ?? current.label,
    data.href ?? current.href,
    data.navOrder ?? current.navOrder,
    (data.isExternal ?? current.isExternal) ? 1 : 0,
    id
  );
  return rowToNavLink(
    db.prepare("SELECT * FROM nav_links WHERE id = ?").get(id) as NavLinkRow
  );
}

export function deleteNavLink(id: string): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM nav_links WHERE id = ?").run(id);
  return result.changes > 0;
}

// ===== Navigation (Public) =====

export function getNavItems(): NavItem[] {
  const db = getDb();
  const pageRows = db
    .prepare(
      "SELECT slug, title, nav_order, is_system FROM pages WHERE show_in_nav = 1 AND status = 'published' ORDER BY nav_order"
    )
    .all() as { slug: string; title: string; nav_order: number; is_system: number }[];
  const pageItems: NavItem[] = pageRows.map((r) => ({
    slug: r.slug,
    title: r.title,
    href: r.slug === "home" ? "/" : r.is_system === 1 ? `/${r.slug}` : `/p/${r.slug}`,
    navOrder: r.nav_order,
  }));

  const linkRows = db
    .prepare("SELECT * FROM nav_links ORDER BY nav_order")
    .all() as NavLinkRow[];
  const linkItems: NavItem[] = linkRows.map((r) => ({
    slug: `__link_${r.id}`,
    title: r.label,
    href: r.href,
    navOrder: r.nav_order,
    isExternal: r.is_external === 1,
  }));

  return [...pageItems, ...linkItems].sort((a, b) => a.navOrder - b.navOrder);
}

// ===== Check if CMS is initialized =====

export function isCmsInitialized(): boolean {
  try {
    const db = getDb();
    const row = db
      .prepare("SELECT COUNT(*) as c FROM pages")
      .get() as { c: number };
    return row.c > 0;
  } catch {
    return false;
  }
}

// ===== Auto-seed CMS pages on first run =====

function insertSeedPage(
  db: Database.Database,
  id: string,
  slug: string,
  title: string,
  subtitle: string,
  opts: {
    templateId?: string;
    heroMode?: string;
    heroColor?: string;
    navOrder: number;
    showInNav?: boolean;
    isSystem?: boolean;
    seedKey?: string;
  }
) {
  db.prepare(
    `INSERT INTO pages (id, template_id, slug, title, subtitle, hero_mode, hero_color,
     is_system, seed_key, show_in_nav, nav_order, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')`
  ).run(
    id,
    opts.templateId ?? null,
    slug,
    title,
    subtitle,
    opts.heroMode ?? "default",
    opts.heroColor ?? "#4a3428",
    opts.isSystem !== false ? 1 : 0,
    opts.seedKey ?? null,
    opts.showInNav !== false ? 1 : 0,
    opts.navOrder
  );
}

function insertSeedBlocks(
  db: Database.Database,
  pageId: string,
  blocks: Array<{
    blockType: BlockType;
    data: Record<string, unknown>;
    config?: BlockConfig;
  }>
) {
  const stmt = db.prepare(
    `INSERT INTO blocks (id, page_id, block_type, sort_order, data, config, seed_hash)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  blocks.forEach((b, i) => {
    const dataJson = JSON.stringify(b.data);
    stmt.run(uuid(), pageId, b.blockType, i, dataJson, JSON.stringify(b.config ?? {}), hashData(dataJson));
  });
}

function seedTemplates(d: Database.Database) {
  const insertTpl = d.prepare(
    "INSERT OR IGNORE INTO page_templates (id, name, description, default_blocks) VALUES (?, ?, ?, ?)"
  );
  insertTpl.run("blank", "空白頁面", "從零開始建立頁面", JSON.stringify([
    { blockType: "text_heading", defaultData: { text: "新頁面", level: "h1" } },
    { blockType: "text_body", defaultData: { html: "在這裡編輯內容..." } },
  ]));
  insertTpl.run("about", "關於我們", "介紹頁面模板", JSON.stringify([
    { blockType: "hero_banner", defaultData: { title: "", subtitle: "", bgMode: "default", bgColor: "#4a3428", bgImageKey: null } },
    { blockType: "profile_card", defaultData: { introduction: "", quote: "", imageKey: "", imageName: "", imageSubtitle: "" } },
    { blockType: "list", defaultData: { title: "特色", style: "numbered", items: [] } },
    { blockType: "two_column_list", defaultData: { leftTitle: "資歷", leftItems: [], leftStyle: "check", rightTitle: "經驗", rightItems: [], rightStyle: "circle-check" } },
    { blockType: "list", defaultData: { title: "專長領域", style: "tag", items: [] } },
  ]));
  insertTpl.run("services", "服務項目", "服務項目 + 收費 + 流程模板", JSON.stringify([
    { blockType: "hero_banner", defaultData: { title: "", subtitle: "", bgMode: "default", bgColor: "#4a3428", bgImageKey: null } },
    { blockType: "key_value_list", defaultData: { title: "服務項目", items: [] } },
    { blockType: "table", defaultData: { title: "收費標準", columns: [{ key: "service", label: "服務項目" }, { key: "fee", label: "收費" }, { key: "payer", label: "付費方" }, { key: "note", label: "備註" }], rows: [], footerNotes: [] } },
    { blockType: "steps_flow", defaultData: { title: "服務流程", steps: [] } },
  ]));
  insertTpl.run("faq", "常見問題", "FAQ 頁面模板", JSON.stringify([
    { blockType: "hero_banner", defaultData: { title: "", subtitle: "", bgMode: "default", bgColor: "#4a3428", bgImageKey: null } },
    { blockType: "faq_accordion", defaultData: { title: "常見問題", items: [] } },
  ]));
  insertTpl.run("contact", "聯絡我們", "聯絡頁面模板", JSON.stringify([
    { blockType: "hero_banner", defaultData: { title: "", subtitle: "", bgMode: "default", bgColor: "#4a3428", bgImageKey: null } },
    { blockType: "contact_layout", defaultData: { formTitle: "諮詢表單", infoTitle: "聯絡資訊", mapEmbedUrl: "" } },
  ]));
}

type SeedBlock = { blockType: BlockType; data: Record<string, unknown>; config?: BlockConfig };
type SeedPageDef = {
  slug: string; title: string; subtitle: string;
  opts: { templateId?: string; heroMode?: string; heroColor?: string; navOrder: number; showInNav?: boolean; isSystem?: boolean; seedKey: string };
  blocks: SeedBlock[];
};

// #32 的線條圖示代號，順序對應 defaultServices。ServiceIcon 認得這些代號；
// 若欄位存的是舊 emoji 仍會原樣顯示，所以資料轉換期間不會有圖示消失。
const SERVICE_ICONS = [
  "transfer",     // 不動產買賣移轉登記
  "inheritance",  // 繼承登記
  "gift",         // 贈與登記
  "mortgage",     // 抵押權設定／塗銷
  "tax",          // 房地合一稅
  "partition",    // 共有物分割
  "trust",        // 信託登記
  "planning",     // 節稅規劃
  "consult",      // 不動產相關諮詢
];

/**
 * 舊 emoji → 新圖示代號，**按頁面分開**。
 *
 * The seeded emoji are already written into every install's block data, so new
 * seed values alone reach nobody — the blocks exist and their seed_hash differs
 * once edited. The migration below converts in place instead.
 *
 * Scoped per page because the same emoji meant different things: 🏠 is the
 * buy/sell transfer service on /services but the price-registry lookup on /links,
 * so one flat table would give the registry a house icon. Self-limiting — once
 * converted the value is a key and no longer matches an emoji.
 */
const ICON_MIGRATION: Record<string, Record<string, string>> = {
  services: {
    "🏠": "transfer",
    "🌳": "inheritance",
    "🤲": "gift",
    "🔐": "mortgage",
    "🧾": "tax",
    "⚖️": "partition",
    "🏛": "trust",
    "📈": "planning",
    "💬": "consult",
  },
  links: {
    "🏠": "registry",
    "📋": "tax",
    "🔍": "search",
    "🏛️": "government",
    "🏗️": "escrow",
    "🤝": "escrow",
    "💧": "utility",
    "⚡": "power",
  },
};
// 首頁的服務區塊與 /services 是同一份內容
ICON_MIGRATION.home = ICON_MIGRATION.services;

// Services that have a detail page of their own, keyed by service title. A path
// starting with "/" makes the card an internal link, so adding a flow for another
// service is a matter of creating its page and adding an entry here — or simply
// filling in the card's url field in the admin, with no code change at all.
const SERVICE_FLOW_LINKS: Record<string, string> = {
  "不動產買賣移轉登記": "/flow-sale",
};

// Buy/sell transfer flow under price-escrow guarantee. Described in the office's
// own wording and referring to a generic 建經公司 rather than any one provider.
// Column text is one entry per line; the renderer numbers them.
const SALE_FLOW = {
  title: "買賣移轉登記流程",
  leftLabel: "地政士作業",
  rightLabel: "買、賣雙方作業",
  defaultOpen: true,
  stages: [
    {
      name: "簽約",
      left: "完成簽約作業並核發履約保證書。\n將相關文件送交建經公司。",
      right: "簽訂履約保證專用之不動產買賣契約書、價金信託履約保證申請書及撥款委託書。",
    },
    {
      name: "用印",
      left: "通知買方支付用印款。\n協同賣方完成備證及用印手續。",
      right: "買方將用印款匯入履約保證信託專戶。\n賣方配合備證及用印。",
    },
    {
      name: "核發稅單",
      left: "申報土地增值稅（一般用地約 7~14 個工作日，自用住宅用地約 14~21 個工作日）。\n申報契稅（約 7~14 個工作日）。",
      right: "買方如需辦理貸款，請自本階段起同步向銀行申請，詳細作業說明見下一階段。",
    },
    {
      name: "完稅",
      left: "確認買方已履行應盡義務，並代為保管尾款本票至點交完成。\n將稅單及尾款本票送交建經公司，申請撥付稅款。\n通知買方支付完稅款。",
      right: "買方需要貸款（自核發稅單階段起同步進行）：申請貸款、銀行鑑價、確認貸款額度、完成對保及開戶手續、銀行設定契約書用印。貸款金額不足時，須將完稅款與尾款差額一併匯入履約保證信託專戶，並簽立尾款擔保本票。\n買方不貸款：須將完稅款與尾款一併匯入履約保證信託專戶。",
    },
    {
      name: "過戶",
      left: "確認尾款或尾款差額已匯入履約保證信託專戶後，即辦理產權移轉登記。",
      right: "",
    },
    {
      name: "代償",
      left: "未辦理代償者，由買方貸款銀行將尾款直接匯入履約保證信託專戶。\n辦理代償者，檢附已完成登記之建物謄本，向建經公司申請配合清償作業。",
      right: "賣方向原貸款銀行確認清償金額。",
    },
    {
      name: "點交",
      left: "將房地點交證明書及完成塗銷之謄本送交建經公司。\n由建經公司將履約保證信託專戶餘款匯入賣方指定帳戶。",
      right: "買賣雙方點交確認無誤後，於房地點交確認單簽章。",
    },
    {
      name: "結案",
      left: "",
      right: "賣方確認收受屋款無誤，案件結案。",
    },
  ],
};

function getSeedPages(): SeedPageDef[] {
  return [
    {
      slug: "home", title: "首頁", subtitle: "",
      opts: { navOrder: 0, seedKey: "home" },
      blocks: [
        { blockType: "hero_banner", data: { title: "合一地政士事務所", subtitle: "專業、誠信、效率", bgMode: "default", bgColor: "#4a3428", bgImageKey: "hero_bg" } },
        { blockType: "text_body", data: { html: defaultAbout.introduction }, config: { bgVariant: "gray" } },
        { blockType: "list", data: { title: "事務所特色", style: "check", items: defaultAbout.features }, config: { bgVariant: "gray" } },
        { blockType: "stats_strip", data: { items: [{ value: "26+", label: "專業執業年資" }, { value: "10+", label: "房仲品牌合作" }, { value: "全台", label: "服務範圍涵蓋" }] } },
        { blockType: "image_gallery", data: { title: "事務所環境", images: [{ imageKey: "office_interior", alt: "內部環境" }, { imageKey: "office_exterior", alt: "外觀" }, { imageKey: "office_sign", alt: "招牌" }] } },
        { blockType: "key_value_list", data: { title: "服務項目", items: defaultServices.map((s, i) => ({ label: s.title, value: s.description, icon: SERVICE_ICONS[i] || "", url: SERVICE_FLOW_LINKS[s.title] ?? "" })) } },
        { blockType: "cta_section", data: { title: "需要不動產登記服務？", subtitle: "歡迎來電或填寫表單，我們將盡快與您聯繫", primaryLabel: "填寫諮詢表單", primaryHref: "/contact", secondaryLabel: "02-2282-6600", secondaryHref: "tel:02-2282-6600" } },
      ],
    },
    {
      slug: "about", title: "關於我們", subtitle: "認識合一地政士事務所",
      opts: { templateId: "about", navOrder: 1, seedKey: "about" },
      blocks: [
        { blockType: "hero_banner", data: { title: "關於我們", subtitle: "認識合一地政士事務所", bgMode: "default", bgColor: "#4a3428", bgImageKey: "about_bg" } },
        { blockType: "profile_card", data: { introduction: defaultAbout.introduction, quote: defaultAbout.philosophy, imageKey: "scrivener_photo", imageName: `${defaultSiteSettings.scrivenerName} 地政士`, imageSubtitle: defaultSiteSettings.licenseNumber } },
        { blockType: "list", data: { title: "事務所特色", style: "numbered", items: defaultAbout.features }, config: { bgVariant: "gray" } },
        { blockType: "two_column_list", data: { leftTitle: "現任資歷", leftItems: defaultAbout.qualifications, leftStyle: "check", rightTitle: "過去工作經驗", rightItems: defaultAbout.experience, rightStyle: "circle-check" } },
        { blockType: "list", data: { title: "專長領域", style: "tag", items: defaultAbout.specialties }, config: { bgVariant: "gray" } },
      ],
    },
    {
      slug: "services", title: "服務項目", subtitle: "全方位不動產登記服務",
      opts: { templateId: "services", navOrder: 2, seedKey: "services" },
      blocks: [
        { blockType: "hero_banner", data: { title: "服務項目", subtitle: "全方位不動產登記服務", bgMode: "default", bgColor: "#4a3428", bgImageKey: "services_bg" } },
        { blockType: "key_value_list", data: { title: "服務項目", items: defaultServices.map((s, i) => ({ label: s.title, value: s.description, icon: SERVICE_ICONS[i] || "", url: SERVICE_FLOW_LINKS[s.title] ?? "" })) } },
        { blockType: "steps_flow", data: { title: "服務流程", steps: defaultServiceFlow.map(f => ({ name: f.stepName, description: f.stepDescription })) } },
        { blockType: "cta_section", data: { title: "查看收費標準", subtitle: "了解各項服務的詳細收費資訊", primaryLabel: "收費標準", primaryHref: "/fees", secondaryLabel: "聯絡我們", secondaryHref: "/contact" } },
      ],
    },
    {
      slug: "fees", title: "收費標準", subtitle: "各項地政服務收費明細",
      opts: { navOrder: 3, seedKey: "fees" },
      blocks: [
        { blockType: "hero_banner", data: { title: "收費標準", subtitle: "各項地政服務收費明細", bgMode: "default", bgColor: "#4a3428", bgImageKey: "" } },
        { blockType: "table", data: { title: "收費標準", columns: [{ key: "service", label: "服務項目" }, { key: "fee", label: "收費" }, { key: "payer", label: "付費方" }, { key: "note", label: "備註" }], rows: defaultFeeSchedule.map(f => ({ service: f.service, fee: f.fee, payer: f.payer, note: f.note })), footerNotes: defaultFeeNotes } },
        { blockType: "cta_section", data: { title: "還有其他問題？", subtitle: "歡迎隨時與我們聯繫，提供免費諮詢", primaryLabel: "立即諮詢", primaryHref: "/contact", secondaryLabel: "", secondaryHref: "" } },
      ],
    },
    {
      slug: "flow-sale", title: "不動產買賣移轉登記流程", subtitle: "價金信託履約保證作業流程",
      opts: { navOrder: 90, showInNav: false, seedKey: "flow-sale" },
      blocks: [
        { blockType: "hero_banner", data: { title: "不動產買賣移轉登記流程", subtitle: "價金信託履約保證作業流程", bgMode: "default", bgColor: "#4a3428", bgImageKey: "" } },
        { blockType: "two_column_flow", data: SALE_FLOW },
        { blockType: "cta_section", data: { title: "對流程有疑問？", subtitle: "歡迎來電或透過 LINE 諮詢，我們會依您的案件情況詳細說明", primaryLabel: "立即諮詢", primaryHref: "/contact", secondaryLabel: "收費標準", secondaryHref: "/fees" } },
      ],
    },
    {
      slug: "faq", title: "常見問題", subtitle: "您想了解的常見問題",
      opts: { templateId: "faq", navOrder: 5, seedKey: "faq" },
      blocks: [
        { blockType: "hero_banner", data: { title: "常見問題", subtitle: "您想了解的常見問題", bgMode: "default", bgColor: "#4a3428", bgImageKey: "faq_bg" } },
        { blockType: "faq_accordion", data: { title: "常見問題", items: defaultFaqs.map(f => ({ question: f.question, answer: f.answer })) } },
        { blockType: "cta_section", data: { title: "還有其他問題？", subtitle: "歡迎來電或透過 LINE 諮詢，我們會盡快回覆", primaryLabel: "聯絡我們", primaryHref: "/contact", secondaryLabel: "", secondaryHref: "" } },
      ],
    },
    {
      slug: "contact", title: "聯絡我們", subtitle: "歡迎來電、來訊或填寫表單，我們將盡快回覆",
      opts: { templateId: "contact", navOrder: 7, seedKey: "contact" },
      blocks: [
        { blockType: "hero_banner", data: { title: "聯絡我們", subtitle: "歡迎來電、來訊或填寫表單，我們將盡快回覆", bgMode: "default", bgColor: "#4a3428", bgImageKey: "contact_bg" } },
        { blockType: "contact_layout", data: { formTitle: "諮詢表單", infoTitle: "聯絡資訊", mapEmbedUrl: "" } },
      ],
    },
    {
      slug: "tools", title: "小工具", subtitle: "實用的不動產計算工具",
      opts: { navOrder: 4, seedKey: "tools" },
      blocks: [
        { blockType: "hero_banner", data: { title: "小工具", subtitle: "實用的不動產計算工具", bgMode: "default", bgColor: "#4a3428", bgImageKey: "tools_bg" } },
        { blockType: "custom_html", data: { html: "__TOOLS_PAGE__" } },
      ],
    },
    {
      slug: "links", title: "實用連結", subtitle: "常用不動產相關網站與查詢工具",
      opts: { navOrder: 6, seedKey: "links" },
      blocks: [
        { blockType: "hero_banner", data: { title: "實用連結", subtitle: "常用不動產相關網站與查詢工具", bgMode: "default", bgColor: "#4a3428", bgImageKey: "" } },
        { blockType: "key_value_list", data: { title: "政府機關", items: [
          { label: "內政部實價登錄查詢", value: "查詢不動產成交案件的實際價格資訊", icon: "registry", url: "https://lvr.land.moi.gov.tw/" },
          { label: "申請地價稅自用住宅用地稅率", value: "財政部線上申辦地價稅自用住宅優惠稅率", icon: "tax", url: "https://www.etax.nat.gov.tw/etwmain/etw109w/cases/services/OLF013008/0" },
          { label: "地政士資料查詢", value: "內政部地政司地政士資格及開業資訊查詢", icon: "search", url: "https://resim.moi.gov.tw/Home/AgentIndex" },
          { label: "中華民國內政部地政司", value: "地政法規、公告及各項地政業務資訊", icon: "government", url: "https://www.land.moi.gov.tw/" },
        ] } },
        { blockType: "key_value_list", data: { title: "建經公司", items: [
          { label: "第一建經", value: "不動產交易安全履約保證服務", icon: "escrow", url: "https://www.first1.com.tw/" },
          { label: "合泰建經", value: "成屋履約保證、預售屋價金信託", icon: "escrow", url: "https://www.hou-tai.com.tw/inquiries.aspx" },
        ] } },
        { blockType: "key_value_list", data: { title: "過戶服務", items: [
          { label: "台水過戶", value: "台灣自來水公司用戶線上過戶申請", icon: "utility", url: "https://www.water.gov.tw/ch/ECounter/FeeCheck?NodeId=752&type=9&UseCertificate=0" },
          { label: "台電過戶", value: "台灣電力公司用電過戶線上申辦", icon: "power", url: "https://service.taipower.com.tw/wapp/newnas/nawp2j1Rwd.aspx?r=417643208" },
        ] } },
      ],
    },
  ];
}

function updateSeedBlocks(
  db: Database.Database,
  pageId: string,
  seedBlocks: SeedBlock[]
) {
  const existing = db.prepare(
    "SELECT id, block_type, sort_order, data, seed_hash FROM blocks WHERE page_id = ? ORDER BY sort_order"
  ).all(pageId) as { id: string; block_type: string; sort_order: number; data: string; seed_hash: string | null }[];

  const updateStmt = db.prepare(
    "UPDATE blocks SET data = ?, seed_hash = ?, updated_at = datetime('now') WHERE id = ?"
  );
  const updateHashStmt = db.prepare(
    "UPDATE blocks SET seed_hash = ? WHERE id = ?"
  );

  for (let i = 0; i < seedBlocks.length; i++) {
    const seed = seedBlocks[i];
    const row = existing.find(r => r.sort_order === i && r.block_type === seed.blockType);
    if (!row) continue;

    const seedJson = JSON.stringify(seed.data);
    const newHash = hashData(seedJson);
    if (row.seed_hash === newHash) continue;

    const currentHash = hashData(row.data);
    if (currentHash === row.seed_hash || !row.seed_hash) {
      updateStmt.run(seedJson, newHash, row.id);
    } else {
      updateHashStmt.run(newHash, row.id);
    }
  }
}

// Bumping this key re-applies the seed nav settings once on every existing
// database. Only do that when the intent really is to override manual ordering.
const NAV_ORDER_MIGRATION_KEY = "cms_nav_order_v2";

export function seedCmsPages(db?: Database.Database) {
  const d = db ?? getDb();

  seedTemplates(d);

  const existingPages = new Map(
    (d.prepare("SELECT id, seed_key FROM pages WHERE seed_key IS NOT NULL").all() as { id: string; seed_key: string }[])
      .map((r) => [r.seed_key, r.id])
  );

  const seedPages = getSeedPages();

  const needsFeeMigration = !existingPages.has("fees") && existingPages.has("services");
  const linksPageId = existingPages.get("links");
  const needsLinksMigration = linksPageId ? (d.prepare("SELECT COUNT(*) as cnt FROM blocks WHERE page_id = ?").get(linksPageId) as { cnt: number }).cnt === 2 : false;

  // Seeding only ever refreshes blocks, never page-level nav settings, so a
  // database created before a nav change keeps the old values forever — which is
  // why the faq/links navOrder collision fixed in 279e3ac never actually reached
  // any running deployment. Re-apply the seed nav settings once, recorded with a
  // marker so a later manual reorder in the admin is not overwritten on boot.
  const needsNavMigration =
    existingPages.size > 0 &&
    (d.prepare("SELECT COUNT(*) as cnt FROM settings WHERE key = ?").get(NAV_ORDER_MIGRATION_KEY) as { cnt: number }).cnt === 0;

  d.transaction(() => {
    for (const page of seedPages) {
      const existingPageId = existingPages.get(page.opts.seedKey);
      if (!existingPageId) {
        const id = uuid();
        insertSeedPage(d, id, page.slug, page.title, page.subtitle, page.opts);
        insertSeedBlocks(d, id, page.blocks);
      } else {
        updateSeedBlocks(d, existingPageId, page.blocks);
      }
    }

    if (needsFeeMigration) {
      const servicesPageId = existingPages.get("services")!;
      const servicesBlocks = getSeedPages().find(p => p.opts.seedKey === "services")!.blocks;
      d.prepare("DELETE FROM blocks WHERE page_id = ?").run(servicesPageId);
      insertSeedBlocks(d, servicesPageId, servicesBlocks);
    }

    if (needsLinksMigration && linksPageId) {
      const linksBlocks = getSeedPages().find(p => p.opts.seedKey === "links")!.blocks;
      d.prepare("DELETE FROM blocks WHERE page_id = ?").run(linksPageId);
      insertSeedBlocks(d, linksPageId, linksBlocks);
    }

    // A client who has edited the services block keeps their version (seed_hash
    // differs), so the new url would never reach them. Fill it in per item, and
    // only where the item has no url of its own — an existing link is never
    // replaced, which also makes this safe to run on every boot.
    for (const seedKey of ["home", "services"]) {
      const pageId = existingPages.get(seedKey);
      if (!pageId) continue;
      const row = d.prepare(
        "SELECT id, data FROM blocks WHERE page_id = ? AND block_type = 'key_value_list' LIMIT 1"
      ).get(pageId) as { id: string; data: string } | undefined;
      if (!row) continue;

      const parsed = JSON.parse(row.data) as { items?: Array<{ label?: string; url?: string }> };
      if (!parsed.items?.length) continue;

      let changed = false;
      for (const item of parsed.items) {
        const target = item.label ? SERVICE_FLOW_LINKS[item.label] : undefined;
        if (target && !item.url) {
          item.url = target;
          changed = true;
        }
      }
      if (changed) {
        d.prepare("UPDATE blocks SET data = ?, updated_at = datetime('now') WHERE id = ?")
          .run(JSON.stringify(parsed), row.id);
      }
    }

    // Emoji → 線條圖示代號（#32）。Same shape as the url backfill above: per item,
    // only where the value is one of the emoji we seeded, so an icon the office
    // picked itself is left alone. Safe to run on every boot — a converted value
    // is a key and no longer matches.
    for (const seedKey of ["home", "services", "links"]) {
      const pageId = existingPages.get(seedKey);
      const table = ICON_MIGRATION[seedKey];
      if (!pageId || !table) continue;

      const rows = d.prepare(
        "SELECT id, data FROM blocks WHERE page_id = ? AND block_type = 'key_value_list'"
      ).all(pageId) as { id: string; data: string }[];

      for (const row of rows) {
        const parsed = JSON.parse(row.data) as { items?: Array<{ icon?: string }> };
        if (!parsed.items?.length) continue;

        let changed = false;
        for (const item of parsed.items) {
          const mapped = item.icon ? table[item.icon] : undefined;
          if (mapped) {
            item.icon = mapped;
            changed = true;
          }
        }
        if (changed) {
          d.prepare("UPDATE blocks SET data = ?, updated_at = datetime('now') WHERE id = ?")
            .run(JSON.stringify(parsed), row.id);
        }
      }
    }

    if (needsNavMigration) {
      const setNav = d.prepare(
        "UPDATE pages SET nav_order = ?, show_in_nav = ? WHERE seed_key = ?"
      );
      for (const page of seedPages) {
        setNav.run(page.opts.navOrder, page.opts.showInNav === false ? 0 : 1, page.opts.seedKey);
      }
    }
    // Record the marker even on a fresh database, where the pages were just
    // inserted with these values and the migration is a no-op.
    d.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)").run(
      NAV_ORDER_MIGRATION_KEY,
      "done"
    );
  })();
}

export function resetPageToSeed(pageId: string): { success: boolean; error?: string } {
  const db = getDb();
  const page = db.prepare("SELECT id, seed_key, is_system FROM pages WHERE id = ?").get(pageId) as { id: string; seed_key: string | null; is_system: number } | undefined;
  if (!page) return { success: false, error: "頁面不存在" };
  if (!page.is_system || !page.seed_key) return { success: false, error: "只有系統預設頁面可以還原" };
  const seedPage = getSeedPages().find(sp => sp.opts.seedKey === page.seed_key);
  if (!seedPage) return { success: false, error: "找不到預設資料" };

  db.transaction(() => {
    db.prepare("DELETE FROM blocks WHERE page_id = ?").run(pageId);
    insertSeedBlocks(db, pageId, seedPage.blocks);
    db.prepare(
      "UPDATE pages SET title = ?, subtitle = ?, updated_at = datetime('now') WHERE id = ?"
    ).run(seedPage.title, seedPage.subtitle, pageId);
  })();
  return { success: true };
}
