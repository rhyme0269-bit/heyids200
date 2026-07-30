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
      hero_color TEXT NOT NULL DEFAULT '#44403c',
      is_system INTEGER NOT NULL DEFAULT 0,
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
    data.heroColor ?? "#44403c",
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
      "SELECT slug, title, nav_order FROM pages WHERE show_in_nav = 1 AND status = 'published' ORDER BY nav_order"
    )
    .all() as { slug: string; title: string; nav_order: number }[];
  const pageItems: NavItem[] = pageRows.map((r) => ({
    slug: r.slug,
    title: r.title,
    href: r.slug === "home" ? "/" : `/${r.slug}`,
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
    isSystem?: boolean;
  }
) {
  db.prepare(
    `INSERT INTO pages (id, template_id, slug, title, subtitle, hero_mode, hero_color,
     is_system, show_in_nav, nav_order, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 'published')`
  ).run(
    id,
    opts.templateId ?? null,
    slug,
    title,
    subtitle,
    opts.heroMode ?? "default",
    opts.heroColor ?? "#44403c",
    opts.isSystem !== false ? 1 : 0,
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
    `INSERT INTO blocks (id, page_id, block_type, sort_order, data, config)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  blocks.forEach((b, i) => {
    stmt.run(uuid(), pageId, b.blockType, i, JSON.stringify(b.data), JSON.stringify(b.config ?? {}));
  });
}

export function seedCmsPages(db?: Database.Database) {
  const d = db ?? getDb();

  const count = d.prepare("SELECT COUNT(*) as c FROM pages").get() as { c: number };
  if (count.c > 0) return;

  const seed = d.transaction(() => {
    // Seed templates
    const insertTpl = d.prepare(
      "INSERT OR IGNORE INTO page_templates (id, name, description, default_blocks) VALUES (?, ?, ?, ?)"
    );
    insertTpl.run("blank", "空白頁面", "從零開始建立頁面", JSON.stringify([
      { blockType: "text_heading", defaultData: { text: "新頁面", level: "h1" } },
      { blockType: "text_body", defaultData: { html: "在這裡編輯內容..." } },
    ]));
    insertTpl.run("about", "關於我們", "介紹頁面模板", JSON.stringify([
      { blockType: "hero_banner", defaultData: { title: "", subtitle: "", bgMode: "default", bgColor: "#44403c", bgImageKey: null } },
      { blockType: "profile_card", defaultData: { introduction: "", quote: "", imageKey: "", imageName: "", imageSubtitle: "" } },
      { blockType: "list", defaultData: { title: "特色", style: "numbered", items: [] } },
      { blockType: "two_column_list", defaultData: { leftTitle: "資歷", leftItems: [], leftStyle: "check", rightTitle: "經驗", rightItems: [], rightStyle: "circle-check" } },
      { blockType: "list", defaultData: { title: "專長領域", style: "tag", items: [] } },
    ]));
    insertTpl.run("services", "服務項目", "服務項目 + 收費 + 流程模板", JSON.stringify([
      { blockType: "hero_banner", defaultData: { title: "", subtitle: "", bgMode: "default", bgColor: "#44403c", bgImageKey: null } },
      { blockType: "key_value_list", defaultData: { title: "服務項目", items: [] } },
      { blockType: "table", defaultData: { title: "收費標準", columns: [{ key: "service", label: "服務項目" }, { key: "fee", label: "收費" }, { key: "payer", label: "付費方" }, { key: "note", label: "備註" }], rows: [], footerNotes: [] } },
      { blockType: "steps_flow", defaultData: { title: "服務流程", steps: [] } },
    ]));
    insertTpl.run("faq", "常見問題", "FAQ 頁面模板", JSON.stringify([
      { blockType: "hero_banner", defaultData: { title: "", subtitle: "", bgMode: "default", bgColor: "#44403c", bgImageKey: null } },
      { blockType: "faq_accordion", defaultData: { title: "常見問題", items: [] } },
    ]));
    insertTpl.run("contact", "聯絡我們", "聯絡頁面模板", JSON.stringify([
      { blockType: "hero_banner", defaultData: { title: "", subtitle: "", bgMode: "default", bgColor: "#44403c", bgImageKey: null } },
      { blockType: "contact_layout", defaultData: { formTitle: "諮詢表單", infoTitle: "聯絡資訊", mapAddress: "", mapEmbedUrl: "" } },
    ]));

    // Seed pages with default content

    // Home
    const homeId = uuid();
    insertSeedPage(d, homeId, "home", "首頁", "", { navOrder: 0 });
    insertSeedBlocks(d, homeId, [
      {
        blockType: "hero_banner",
        data: { title: "合一地政士事務所", subtitle: "專業、誠信、效率", bgMode: "default", bgColor: "#44403c", bgImageKey: "hero_bg" },
      },
      {
        blockType: "text_body",
        data: { html: defaultAbout.introduction },
        config: { bgVariant: "gray" },
      },
      {
        blockType: "list",
        data: { title: "事務所特色", style: "check", items: defaultAbout.features },
        config: { bgVariant: "gray" },
      },
      {
        blockType: "stats_strip",
        data: { items: [{ value: "26+", label: "專業執業年資" }, { value: "10+", label: "房仲品牌合作" }, { value: "全台", label: "服務範圍涵蓋" }] },
      },
      {
        blockType: "image_gallery",
        data: { title: "事務所環境", images: [{ imageKey: "office_interior", alt: "內部環境" }, { imageKey: "office_exterior", alt: "外觀" }, { imageKey: "office_sign", alt: "招牌" }] },
      },
      {
        blockType: "key_value_list",
        data: { title: "服務項目", items: defaultServices.map(s => ({ label: s.title, value: s.description })) },
      },
      {
        blockType: "cta_section",
        data: { title: "需要不動產登記服務？", subtitle: "歡迎來電或填寫表單，我們將盡快與您聯繫", primaryLabel: "填寫諮詢表單", primaryHref: "/contact", secondaryLabel: "02-2282-6600", secondaryHref: "tel:02-2282-6600" },
      },
    ]);

    // About
    const aboutId = uuid();
    insertSeedPage(d, aboutId, "about", "關於我們", "認識合一地政士事務所", { templateId: "about", navOrder: 1 });
    insertSeedBlocks(d, aboutId, [
      {
        blockType: "hero_banner",
        data: { title: "關於我們", subtitle: "認識合一地政士事務所", bgMode: "default", bgColor: "#44403c", bgImageKey: "about_bg" },
      },
      {
        blockType: "profile_card",
        data: { introduction: defaultAbout.introduction, quote: defaultAbout.philosophy, imageKey: "scrivener_photo", imageName: `${defaultSiteSettings.scrivenerName} 地政士`, imageSubtitle: defaultSiteSettings.licenseNumber },
      },
      {
        blockType: "list",
        data: { title: "事務所特色", style: "numbered", items: defaultAbout.features },
        config: { bgVariant: "gray" },
      },
      {
        blockType: "two_column_list",
        data: { leftTitle: "現任資歷", leftItems: defaultAbout.qualifications, leftStyle: "check", rightTitle: "過去工作經驗", rightItems: defaultAbout.experience, rightStyle: "circle-check" },
      },
      {
        blockType: "list",
        data: { title: "專長領域", style: "tag", items: defaultAbout.specialties },
        config: { bgVariant: "gray" },
      },
    ]);

    // Services
    const servicesId = uuid();
    insertSeedPage(d, servicesId, "services", "服務項目", "全方位不動產登記服務", { templateId: "services", navOrder: 2 });
    insertSeedBlocks(d, servicesId, [
      {
        blockType: "hero_banner",
        data: { title: "服務項目", subtitle: "全方位不動產登記服務", bgMode: "default", bgColor: "#44403c", bgImageKey: "services_bg" },
      },
      {
        blockType: "key_value_list",
        data: { title: "服務項目", items: defaultServices.map(s => ({ label: s.title, value: s.description })) },
      },
      {
        blockType: "table",
        data: {
          title: "收費標準",
          columns: [{ key: "service", label: "服務項目" }, { key: "fee", label: "收費" }, { key: "payer", label: "付費方" }, { key: "note", label: "備註" }],
          rows: defaultFeeSchedule.map(f => ({ service: f.service, fee: f.fee, payer: f.payer, note: f.note })),
          footerNotes: defaultFeeNotes,
        },
      },
      {
        blockType: "steps_flow",
        data: { title: "服務流程", steps: defaultServiceFlow.map(f => ({ name: f.stepName, description: f.stepDescription })) },
      },
      {
        blockType: "cta_section",
        data: { title: "還有其他問題？", subtitle: "歡迎隨時與我們聯繫，提供免費諮詢", primaryLabel: "立即諮詢", primaryHref: "/contact", secondaryLabel: "", secondaryHref: "" },
      },
    ]);

    // FAQ
    const faqId = uuid();
    insertSeedPage(d, faqId, "faq", "常見問題", "您想了解的常見問題", { templateId: "faq", navOrder: 5 });
    insertSeedBlocks(d, faqId, [
      {
        blockType: "hero_banner",
        data: { title: "常見問題", subtitle: "您想了解的常見問題", bgMode: "default", bgColor: "#44403c", bgImageKey: "faq_bg" },
      },
      {
        blockType: "faq_accordion",
        data: { title: "常見問題", items: defaultFaqs.map(f => ({ question: f.question, answer: f.answer })) },
      },
      {
        blockType: "cta_section",
        data: { title: "還有其他問題？", subtitle: "歡迎來電或透過 LINE 諮詢，我們會盡快回覆", primaryLabel: "聯絡我們", primaryHref: "/contact", secondaryLabel: "", secondaryHref: "" },
      },
    ]);

    // Contact
    const contactId = uuid();
    insertSeedPage(d, contactId, "contact", "聯絡我們", "歡迎來電、來訊或填寫表單，我們將盡快回覆", { templateId: "contact", navOrder: 6 });
    insertSeedBlocks(d, contactId, [
      {
        blockType: "hero_banner",
        data: { title: "聯絡我們", subtitle: "歡迎來電、來訊或填寫表單，我們將盡快回覆", bgMode: "default", bgColor: "#44403c", bgImageKey: "contact_bg" },
      },
      {
        blockType: "contact_layout",
        data: { formTitle: "諮詢表單", infoTitle: "聯絡資訊", mapAddress: defaultSiteSettings.address, mapEmbedUrl: defaultSiteSettings.googleMapEmbed },
      },
    ]);

    // Tools
    const toolsId = uuid();
    insertSeedPage(d, toolsId, "tools", "小工具", "實用的不動產計算工具", { navOrder: 4 });
    insertSeedBlocks(d, toolsId, [
      {
        blockType: "hero_banner",
        data: { title: "小工具", subtitle: "實用的不動產計算工具", bgMode: "default", bgColor: "#44403c", bgImageKey: "tools_bg" },
      },
      {
        blockType: "custom_html",
        data: { html: "__TOOLS_PAGE__" },
      },
    ]);

    // Links
    const linksId = uuid();
    insertSeedPage(d, linksId, "links", "實用連結", "常用不動產相關網站與查詢工具", { navOrder: 5 });
    insertSeedBlocks(d, linksId, [
      {
        blockType: "hero_banner",
        data: { title: "實用連結", subtitle: "常用不動產相關網站與查詢工具", bgMode: "default", bgColor: "#44403c", bgImageKey: "" },
      },
      {
        blockType: "key_value_list",
        data: {
          title: "政府查詢工具",
          items: [
            { label: "實價登錄", value: "查詢不動產成交案件的實際價格資訊", icon: "🏠", url: "https://lvr.land.moi.gov.tw/" },
            { label: "地籍圖資查詢", value: "內政部地政司地籍圖資網路便民服務", icon: "🗺️", url: "https://easymap.land.moi.gov.tw/" },
            { label: "土地增值稅試算", value: "財政部線上稅額試算服務", icon: "📈", url: "https://www.etax.nat.gov.tw/etwmain/etw158w/51" },
            { label: "房地合一稅試算", value: "財政部房地合一稅預繳稅額試算", icon: "🧾", url: "https://www.etax.nat.gov.tw/etwmain/online-service/tax-pre-calculation/house-land-transfer-tax" },
            { label: "公告土地現值查詢", value: "各縣市地政局公告現值查詢", icon: "📊", url: "https://www.land.moi.gov.tw/ngis/" },
            { label: "建物謄本查詢", value: "全國地政電子謄本系統", icon: "📋", url: "https://ep.land.nat.gov.tw/" },
          ],
        },
      },
    ]);
  });

  seed();
}
