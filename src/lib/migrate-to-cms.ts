import Database from "better-sqlite3";
import path from "path";
import crypto from "crypto";
import type { BlockType, BlockConfig } from "./cms-types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "oneness.db");

function uuid(): string {
  return crypto.randomUUID();
}

interface BlockDef {
  blockType: BlockType;
  data: Record<string, unknown>;
  config?: BlockConfig;
}

function insertPage(
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

function insertBlocks(
  db: Database.Database,
  pageId: string,
  blocks: BlockDef[]
) {
  const stmt = db.prepare(
    `INSERT INTO blocks (id, page_id, block_type, sort_order, data, config)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  blocks.forEach((b, i) => {
    stmt.run(
      uuid(),
      pageId,
      b.blockType,
      i,
      JSON.stringify(b.data),
      JSON.stringify(b.config ?? {})
    );
  });
}

function insertTemplate(
  db: Database.Database,
  id: string,
  name: string,
  description: string,
  defaultBlocks: Array<{
    blockType: BlockType;
    defaultData: Record<string, unknown>;
  }>
) {
  db.prepare(
    "INSERT INTO page_templates (id, name, description, default_blocks) VALUES (?, ?, ?, ?)"
  ).run(id, name, description, JSON.stringify(defaultBlocks));
}

export function migrateToCs() {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  // Check if already migrated
  try {
    const row = db.prepare("SELECT COUNT(*) as c FROM pages").get() as {
      c: number;
    };
    if (row.c > 0) {
      db.close();
      return { success: true, message: "Already migrated", migrated: false };
    }
  } catch {
    // pages table doesn't exist yet, that's fine
  }

  // Read existing data
  const settings: Record<string, string> = {};
  try {
    const rows = db
      .prepare("SELECT key, value FROM settings")
      .all() as { key: string; value: string }[];
    for (const r of rows) settings[r.key] = r.value;
  } catch {
    /* empty */
  }

  let about = {
    introduction: "",
    philosophy: "",
    features: [] as string[],
    qualifications: [] as string[],
    experience: [] as string[],
    specialties: [] as string[],
  };
  try {
    const row = db.prepare("SELECT * FROM about WHERE id = 1").get() as {
      introduction: string;
      philosophy: string;
      features: string;
      qualifications: string;
      experience: string;
      specialties: string;
    } | undefined;
    if (row) {
      about = {
        introduction: row.introduction,
        philosophy: row.philosophy,
        features: JSON.parse(row.features),
        qualifications: JSON.parse(row.qualifications),
        experience: JSON.parse(row.experience),
        specialties: JSON.parse(row.specialties),
      };
    }
  } catch {
    /* empty */
  }

  let services: Array<{ title: string; description: string }> = [];
  try {
    services = db
      .prepare("SELECT title, description FROM services ORDER BY sort_order")
      .all() as Array<{ title: string; description: string }>;
  } catch {
    /* empty */
  }

  let serviceFlow: Array<{ step_name: string; step_description: string }> = [];
  try {
    serviceFlow = db
      .prepare(
        "SELECT step_name, step_description FROM service_flow ORDER BY sort_order"
      )
      .all() as Array<{ step_name: string; step_description: string }>;
  } catch {
    /* empty */
  }

  let faqs: Array<{ question: string; answer: string }> = [];
  try {
    faqs = db
      .prepare("SELECT question, answer FROM faqs ORDER BY sort_order")
      .all() as Array<{ question: string; answer: string }>;
  } catch {
    /* empty */
  }

  let fees: Array<{
    service: string;
    fee: string;
    payer: string;
    note: string;
  }> = [];
  try {
    fees = db
      .prepare("SELECT service, fee, payer, note FROM fees ORDER BY id")
      .all() as Array<{
      service: string;
      fee: string;
      payer: string;
      note: string;
    }>;
  } catch {
    /* empty */
  }

  let feeNotes: string[] = [];
  try {
    const rows = db
      .prepare("SELECT note FROM fee_notes ORDER BY sort_order")
      .all() as { note: string }[];
    feeNotes = rows.map((r) => r.note);
  } catch {
    /* empty */
  }

  // Parse hero configs
  let heroConfigs: Record<string, { mode: string; color: string }> = {};
  if (settings.hero_configs) {
    try {
      heroConfigs = JSON.parse(settings.hero_configs);
    } catch {
      /* empty */
    }
  }

  // Run migration in a transaction
  const migrate = db.transaction(() => {
    // Create CMS tables
    db.exec(`
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
      CREATE INDEX IF NOT EXISTS idx_blocks_page_order ON blocks(page_id, sort_order);
      CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
    `);

    // Seed templates
    insertTemplate(db, "blank", "空白頁面", "從零開始建立頁面", [
      {
        blockType: "text_heading",
        defaultData: { text: "新頁面", level: "h1" },
      },
      {
        blockType: "text_body",
        defaultData: { html: "在這裡編輯內容..." },
      },
    ]);

    insertTemplate(db, "about", "關於我們", "介紹頁面模板", [
      {
        blockType: "hero_banner",
        defaultData: { title: "", subtitle: "", bgMode: "default", bgColor: "#44403c", bgImageKey: null },
      },
      {
        blockType: "text_heading",
        defaultData: { text: "事務所介紹", level: "h2" },
      },
      {
        blockType: "text_body",
        defaultData: { html: "" },
      },
      {
        blockType: "image",
        defaultData: { imageKey: "", alt: "", caption: "" },
      },
      {
        blockType: "list",
        defaultData: { title: "專業資格", style: "check", items: [] },
      },
    ]);

    insertTemplate(db, "services", "服務項目", "服務項目 + 收費 + 流程模板", [
      {
        blockType: "hero_banner",
        defaultData: { title: "", subtitle: "", bgMode: "default", bgColor: "#44403c", bgImageKey: null },
      },
      {
        blockType: "key_value_list",
        defaultData: { title: "服務項目", items: [] },
      },
      {
        blockType: "table",
        defaultData: {
          title: "收費標準",
          columns: [
            { key: "service", label: "服務項目" },
            { key: "fee", label: "收費" },
            { key: "payer", label: "付費方" },
            { key: "note", label: "備註" },
          ],
          rows: [],
          footerNotes: [],
        },
      },
      {
        blockType: "steps_flow",
        defaultData: { title: "服務流程", steps: [] },
      },
    ]);

    insertTemplate(db, "faq", "常見問題", "FAQ 頁面模板", [
      {
        blockType: "hero_banner",
        defaultData: { title: "", subtitle: "", bgMode: "default", bgColor: "#44403c", bgImageKey: null },
      },
      {
        blockType: "faq_accordion",
        defaultData: { title: "常見問題", items: [] },
      },
    ]);

    insertTemplate(db, "contact", "聯絡我們", "聯絡頁面模板", [
      {
        blockType: "hero_banner",
        defaultData: { title: "", subtitle: "", bgMode: "default", bgColor: "#44403c", bgImageKey: null },
      },
      {
        blockType: "contact_form",
        defaultData: { title: "諮詢表單" },
      },
      { blockType: "contact_info", defaultData: { title: "聯絡資訊" } },
      {
        blockType: "map_embed",
        defaultData: { title: "", address: "", embedUrl: "" },
      },
    ]);

    // ===== Migrate pages =====

    const heroCfg = (key: string) => {
      const c = heroConfigs[key];
      return {
        heroMode: c?.mode ?? "default",
        heroColor: c?.color ?? "#44403c",
      };
    };

    // Home page
    const homeId = uuid();
    insertPage(db, homeId, "home", "首頁", "", {
      ...heroCfg("hero_bg"),
      navOrder: 0,
    });
    insertBlocks(db, homeId, [
      {
        blockType: "hero_banner",
        data: {
          title: "合一地政士事務所",
          subtitle: "專業、誠信、效率",
          bgMode: heroConfigs["hero_bg"]?.mode ?? "default",
          bgColor: heroConfigs["hero_bg"]?.color ?? "#44403c",
          bgImageKey: "hero_bg",
        },
      },
      {
        blockType: "text_body",
        data: {
          html: about.introduction,
        },
        config: { bgVariant: "gray" },
      },
      {
        blockType: "list",
        data: {
          title: "事務所特色",
          style: "check",
          items: about.features,
        },
        config: { bgVariant: "gray" },
      },
      {
        blockType: "stats_strip",
        data: {
          items: [
            { value: "26+", label: "專業執業年資" },
            { value: "10+", label: "房仲品牌合作" },
            { value: "全台", label: "服務範圍涵蓋" },
          ],
        },
      },
      {
        blockType: "image_gallery",
        data: {
          title: "事務所環境",
          images: [
            { imageKey: "office_interior", alt: "內部環境" },
            { imageKey: "office_exterior", alt: "外觀" },
            { imageKey: "office_sign", alt: "招牌" },
          ],
        },
      },
      {
        blockType: "key_value_list",
        data: {
          title: "服務項目",
          items: services.map((s) => ({
            label: s.title,
            value: s.description,
          })),
        },
      },
      {
        blockType: "cta_section",
        data: {
          title: "需要不動產登記服務？",
          subtitle: "歡迎來電或填寫表單，我們將盡快與您聯繫",
          primaryLabel: "填寫諮詢表單",
          primaryHref: "/contact",
          secondaryLabel: "02-2282-6600",
          secondaryHref: "tel:02-2282-6600",
        },
      },
    ]);

    // About page
    const aboutId = uuid();
    const aboutHero = heroCfg("about_bg");
    insertPage(db, aboutId, "about", "關於我們", "認識合一地政士事務所", {
      templateId: "about",
      ...aboutHero,
      navOrder: 1,
    });
    insertBlocks(db, aboutId, [
      {
        blockType: "hero_banner",
        data: {
          title: "關於我們",
          subtitle: "認識合一地政士事務所",
          bgMode: aboutHero.heroMode,
          bgColor: aboutHero.heroColor,
          bgImageKey: "about_bg",
        },
      },
      {
        blockType: "text_heading",
        data: { text: "事務所介紹", level: "h2" },
      },
      {
        blockType: "text_body",
        data: { html: about.introduction },
      },
      {
        blockType: "text_heading",
        data: { text: "服務理念", level: "h2" },
      },
      {
        blockType: "text_body",
        data: { html: about.philosophy },
      },
      {
        blockType: "image",
        data: {
          imageKey: "scrivener_photo",
          alt: settings.scrivenerName ?? "代書照片",
          caption: settings.scrivenerName ?? "",
        },
      },
      {
        blockType: "list",
        data: { title: "事務所特色", style: "check", items: about.features },
      },
      {
        blockType: "list",
        data: {
          title: "現任資歷",
          style: "check",
          items: about.qualifications,
        },
      },
      {
        blockType: "list",
        data: {
          title: "過去工作經驗",
          style: "check",
          items: about.experience,
        },
      },
      {
        blockType: "list",
        data: { title: "專長領域", style: "tag", items: about.specialties },
      },
    ]);

    // Services page
    const servicesId = uuid();
    const servicesHero = heroCfg("services_bg");
    insertPage(
      db,
      servicesId,
      "services",
      "服務項目",
      "全方位不動產登記服務",
      { templateId: "services", ...servicesHero, navOrder: 2 }
    );
    insertBlocks(db, servicesId, [
      {
        blockType: "hero_banner",
        data: {
          title: "服務項目",
          subtitle: "全方位不動產登記服務",
          bgMode: servicesHero.heroMode,
          bgColor: servicesHero.heroColor,
          bgImageKey: "services_bg",
        },
      },
      {
        blockType: "key_value_list",
        data: {
          title: "服務項目",
          items: services.map((s) => ({
            label: s.title,
            value: s.description,
          })),
        },
      },
      {
        blockType: "table",
        data: {
          title: "收費標準",
          columns: [
            { key: "service", label: "服務項目" },
            { key: "fee", label: "收費" },
            { key: "payer", label: "付費方" },
            { key: "note", label: "備註" },
          ],
          rows: fees.map((f) => ({
            service: f.service,
            fee: f.fee,
            payer: f.payer,
            note: f.note,
          })),
          footerNotes: feeNotes,
        },
      },
      {
        blockType: "steps_flow",
        data: {
          title: "服務流程",
          steps: serviceFlow.map((f) => ({
            name: f.step_name,
            description: f.step_description,
          })),
        },
      },
      {
        blockType: "cta_section",
        data: {
          title: "還有其他問題？",
          subtitle: "歡迎隨時與我們聯繫，提供免費諮詢",
          primaryLabel: "立即諮詢",
          primaryHref: "/contact",
          secondaryLabel: "",
          secondaryHref: "",
        },
      },
    ]);

    // FAQ page
    const faqId = uuid();
    const faqHero = heroCfg("faq_bg");
    insertPage(db, faqId, "faq", "常見問題", "您想了解的常見問題", {
      templateId: "faq",
      ...faqHero,
      navOrder: 5,
    });
    insertBlocks(db, faqId, [
      {
        blockType: "hero_banner",
        data: {
          title: "常見問題",
          subtitle: "您想了解的常見問題",
          bgMode: faqHero.heroMode,
          bgColor: faqHero.heroColor,
          bgImageKey: "faq_bg",
        },
      },
      {
        blockType: "faq_accordion",
        data: {
          title: "常見問題",
          items: faqs.map((f) => ({
            question: f.question,
            answer: f.answer,
          })),
        },
      },
      {
        blockType: "cta_section",
        data: {
          title: "還有其他問題？",
          subtitle: "歡迎來電或透過 LINE 諮詢，我們會盡快回覆",
          primaryLabel: "聯絡我們",
          primaryHref: "/contact",
          secondaryLabel: "",
          secondaryHref: "",
        },
      },
    ]);

    // Contact page
    const contactId = uuid();
    const contactHero = heroCfg("contact_bg");
    insertPage(
      db,
      contactId,
      "contact",
      "聯絡我們",
      "歡迎來電、來訊或填寫表單，我們將盡快回覆",
      { templateId: "contact", ...contactHero, navOrder: 6 }
    );
    insertBlocks(db, contactId, [
      {
        blockType: "hero_banner",
        data: {
          title: "聯絡我們",
          subtitle: "歡迎來電、來訊或填寫表單，我們將盡快回覆",
          bgMode: contactHero.heroMode,
          bgColor: contactHero.heroColor,
          bgImageKey: "contact_bg",
        },
      },
      {
        blockType: "contact_form",
        data: { title: "諮詢表單" },
      },
      {
        blockType: "contact_info",
        data: { title: "聯絡資訊" },
      },
      {
        blockType: "map_embed",
        data: {
          title: "",
          address: settings.address ?? "",
          embedUrl: settings.googleMapEmbed ?? "",
        },
      },
    ]);

    // Tools page
    const toolsId = uuid();
    const toolsHero = heroCfg("tools_bg");
    insertPage(db, toolsId, "tools", "小工具", "實用的不動產計算工具", {
      ...toolsHero,
      navOrder: 4,
    });
    insertBlocks(db, toolsId, [
      {
        blockType: "hero_banner",
        data: {
          title: "小工具",
          subtitle: "實用的不動產計算工具",
          bgMode: toolsHero.heroMode,
          bgColor: toolsHero.heroColor,
          bgImageKey: "tools_bg",
        },
      },
      {
        blockType: "custom_html",
        data: { html: "__TOOLS_PAGE__" },
      },
    ]);
  });

  try {
    migrate();
    db.close();
    return { success: true, message: "Migration complete", migrated: true };
  } catch (err) {
    db.close();
    return {
      success: false,
      message: `Migration failed: ${err instanceof Error ? err.message : String(err)}`,
      migrated: false,
    };
  }
}
