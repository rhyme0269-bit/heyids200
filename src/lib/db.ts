import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { initCmsTables, seedCmsPages } from "./cms-db";
import { initCalcTables, seedCalculators } from "./calc-db";
import {
  defaultSiteSettings,
  defaultAbout,
  defaultServices,
  defaultServiceFlow,
  defaultFaqs,
  defaultFeeSchedule,
  defaultFeeNotes,
  type SiteSettings,
  type About,
  type Service,
} from "./default-data";

// DB file location
const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "oneness.db");

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (_db) return _db;

  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");

  initTables(_db);
  seedIfEmpty(_db);
  migrateSettings(_db);
  seedImageLibrary(_db);
  initCmsTables(_db);
  seedCmsPages(_db);
  initCalcTables(_db);
  seedCalculators(_db);

  return _db;
}

// ===== Schema =====

function initTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS about (
      id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      introduction TEXT NOT NULL DEFAULT '',
      philosophy TEXT NOT NULL DEFAULT '',
      features TEXT NOT NULL DEFAULT '[]',
      qualifications TEXT NOT NULL DEFAULT '[]',
      experience TEXT NOT NULL DEFAULT '[]',
      specialties TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS service_flow (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      step_name TEXT NOT NULL,
      step_description TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS faqs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS fees (
      id INTEGER PRIMARY KEY,
      service TEXT NOT NULL,
      fee TEXT NOT NULL DEFAULT '',
      payer TEXT NOT NULL DEFAULT '',
      note TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS fee_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      note TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS images (
      key TEXT PRIMARY KEY,
      data BLOB NOT NULL,
      mime_type TEXT NOT NULL DEFAULT 'image/png',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      username TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS image_groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS image_slots (
      key TEXT PRIMARY KEY,
      group_id TEXT NOT NULL REFERENCES image_groups(id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      hint TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_system INTEGER NOT NULL DEFAULT 0,
      aspect_ratio TEXT NOT NULL DEFAULT '3:4',
      slot_type TEXT NOT NULL DEFAULT 'general'
    );
  `);
}

// ===== Migrations =====

// Settings are only seeded into an empty table, so an existing database keeps the
// value it was first seeded with. Replace the superseded LINE URL, but only where
// it is still the old default — a value the client has since customised is left
// alone. Self-limiting: once replaced the condition no longer matches.
const SUPERSEDED_LINE_URLS = ["https://line.me/R/ti/p/@240mvtlq"];

function migrateSettings(db: Database.Database) {
  const update = db.prepare("UPDATE settings SET value = ? WHERE key = 'lineUrl' AND value = ?");
  for (const old of SUPERSEDED_LINE_URLS) {
    update.run(defaultSiteSettings.lineUrl, old);
  }
}

// ===== Seed =====

function seedIfEmpty(db: Database.Database) {
  const count = db.prepare("SELECT COUNT(*) as c FROM settings").get() as {
    c: number;
  };
  if (count.c > 0) return; // Already seeded

  const insertSetting = db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?)"
  );
  const seedSettings = db.transaction(() => {
    for (const [key, value] of Object.entries(defaultSiteSettings)) {
      insertSetting.run(key, value);
    }
  });
  seedSettings();

  // About
  db.prepare(
    `INSERT INTO about (id, introduction, philosophy, features, qualifications, experience, specialties)
     VALUES (1, ?, ?, ?, ?, ?, ?)`
  ).run(
    defaultAbout.introduction,
    defaultAbout.philosophy,
    JSON.stringify(defaultAbout.features),
    JSON.stringify(defaultAbout.qualifications),
    JSON.stringify(defaultAbout.experience),
    JSON.stringify(defaultAbout.specialties)
  );

  // Services
  const insertService = db.prepare(
    "INSERT INTO services (title, description, sort_order) VALUES (?, ?, ?)"
  );
  const seedServices = db.transaction(() => {
    defaultServices.forEach((s, i) => {
      insertService.run(s.title, s.description, i);
    });
  });
  seedServices();

  // Service Flow
  const insertFlow = db.prepare(
    "INSERT INTO service_flow (step_name, step_description, sort_order) VALUES (?, ?, ?)"
  );
  const seedFlow = db.transaction(() => {
    defaultServiceFlow.forEach((f, i) => {
      insertFlow.run(f.stepName, f.stepDescription, i);
    });
  });
  seedFlow();

  // FAQs
  const insertFaq = db.prepare(
    "INSERT INTO faqs (question, answer, sort_order) VALUES (?, ?, ?)"
  );
  const seedFaqs = db.transaction(() => {
    defaultFaqs.forEach((f, i) => {
      insertFaq.run(f.question, f.answer, i);
    });
  });
  seedFaqs();

  // Fees
  const insertFee = db.prepare(
    "INSERT INTO fees (id, service, fee, payer, note) VALUES (?, ?, ?, ?, ?)"
  );
  const seedFees = db.transaction(() => {
    defaultFeeSchedule.forEach((f) => {
      insertFee.run(f.id, f.service, f.fee, f.payer, f.note);
    });
  });
  seedFees();

  // Fee Notes
  const insertFeeNote = db.prepare(
    "INSERT INTO fee_notes (note, sort_order) VALUES (?, ?)"
  );
  const seedFeeNotes = db.transaction(() => {
    defaultFeeNotes.forEach((n, i) => {
      insertFeeNote.run(n, i);
    });
  });
  seedFeeNotes();

  // Seed default admin user from env
  seedAdminUser(db);
}

function seedAdminUser(db: Database.Database) {
  const count = db.prepare("SELECT COUNT(*) as c FROM admin_users").get() as { c: number };
  if (count.c > 0) return;

  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) {
    console.warn("WARNING: ADMIN_USERNAME/ADMIN_PASSWORD not set. Admin account not created.");
    return;
  }
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");

  db.prepare(
    "INSERT INTO admin_users (username, password_hash, salt) VALUES (?, ?, ?)"
  ).run(username, hash, salt);
}

// ===== Auth Functions =====

export function verifyLogin(username: string, password: string): { token: string; username: string } | null {
  const db = getDb();
  const user = db.prepare("SELECT id, username, password_hash, salt FROM admin_users WHERE username = ?").get(username) as {
    id: number; username: string; password_hash: string; salt: string;
  } | undefined;

  if (!user) return null;

  const hash = crypto.scryptSync(password, user.salt, 64).toString("hex");
  if (!crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(user.password_hash, "hex"))) return null;

  // Create session (expires in 24 hours)
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  // Clean up expired sessions
  db.prepare("DELETE FROM sessions WHERE expires_at < datetime('now')").run();

  db.prepare(
    "INSERT INTO sessions (token, user_id, username, expires_at) VALUES (?, ?, ?, ?)"
  ).run(token, user.id, user.username, expiresAt);

  return { token, username: user.username };
}

export function verifySession(token: string): { userId: number; username: string } | null {
  const db = getDb();
  const session = db.prepare(
    "SELECT user_id, username FROM sessions WHERE token = ? AND expires_at > datetime('now')"
  ).get(token) as { user_id: number; username: string } | undefined;

  if (!session) return null;
  return { userId: session.user_id, username: session.username };
}

export function deleteSession(token: string) {
  const db = getDb();
  db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

// ===== Read Functions (for frontend pages) =====

export function getSettings(): SiteSettings {
  const db = getDb();
  const rows = db.prepare("SELECT key, value FROM settings").all() as {
    key: string;
    value: string;
  }[];
  const settings: Record<string, string> = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  return { ...defaultSiteSettings, ...settings } as SiteSettings;
}

export function getAbout(): About {
  const db = getDb();
  const row = db.prepare("SELECT * FROM about WHERE id = 1").get() as {
    introduction: string;
    philosophy: string;
    features: string;
    qualifications: string;
    experience: string;
    specialties: string;
  } | undefined;
  if (!row) return defaultAbout;
  return {
    introduction: row.introduction,
    philosophy: row.philosophy,
    features: JSON.parse(row.features),
    qualifications: JSON.parse(row.qualifications),
    experience: JSON.parse(row.experience),
    specialties: JSON.parse(row.specialties),
  };
}

export function getServices(): Service[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT id, title, description FROM services ORDER BY sort_order")
    .all() as { id: number; title: string; description: string }[];
  return rows.map((r) => ({
    _id: `service-${r.id}`,
    title: r.title,
    description: r.description,
  }));
}

export function getImage(
  key: string
): { data: Buffer; mime_type: string; updated_at: string } | null {
  const db = getDb();
  return db.prepare("SELECT data, mime_type, updated_at FROM images WHERE key = ?").get(key) as {
    data: Buffer;
    mime_type: string;
    updated_at: string;
  } | null;
}

export function hasImage(key: string): boolean {
  const db = getDb();
  const row = db.prepare("SELECT 1 FROM images WHERE key = ?").get(key);
  return !!row;
}

export type HeroMode = "default" | "image" | "color";

export interface HeroConfig {
  mode: HeroMode;
  color: string;
}

export function getHeroConfigs(): Record<string, HeroConfig> {
  const db = getDb();
  const row = db.prepare("SELECT value FROM settings WHERE key = 'hero_configs'").get() as { value: string } | undefined;
  if (!row) return {};
  try { return JSON.parse(row.value); } catch { return {}; }
}

export function updateHeroConfigs(configs: Record<string, HeroConfig>) {
  const db = getDb();
  db.prepare(
    "INSERT INTO settings (key, value) VALUES ('hero_configs', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  ).run(JSON.stringify(configs));
}

export function getHeroConfigsPreview(): Record<string, HeroConfig> {
  const db = getDb();
  const row = db.prepare("SELECT value FROM settings WHERE key = 'hero_configs_preview'").get() as { value: string } | undefined;
  if (!row) return {};
  try { return JSON.parse(row.value); } catch { return {}; }
}

export function updateHeroConfigsPreview(configs: Record<string, HeroConfig>) {
  const db = getDb();
  db.prepare(
    "INSERT INTO settings (key, value) VALUES ('hero_configs_preview', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  ).run(JSON.stringify(configs));
}

export function applyHeroConfigsPreview() {
  const preview = getHeroConfigsPreview();
  updateHeroConfigs(preview);
}

// ===== Write Functions (for admin API) =====

export function updateSettings(data: Partial<SiteSettings>) {
  const db = getDb();
  const upsert = db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  );
  const update = db.transaction(() => {
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) upsert.run(key, value);
    }
  });
  update();
}

export function upsertImage(key: string, data: Buffer, mimeType: string) {
  const db = getDb();
  db.prepare(
    `INSERT INTO images (key, data, mime_type, updated_at) VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET data = excluded.data, mime_type = excluded.mime_type, updated_at = datetime('now')`
  ).run(key, data, mimeType);
}

export function deleteImage(key: string) {
  const db = getDb();
  db.prepare("DELETE FROM images WHERE key = ?").run(key);
}

export function listImages(): { key: string; mime_type: string; updated_at: string }[] {
  const db = getDb();
  return db
    .prepare("SELECT key, mime_type, updated_at FROM images ORDER BY key")
    .all() as { key: string; mime_type: string; updated_at: string }[];
}

// ===== Image Library Types =====

export interface ImageGroup {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
}

export interface ImageSlot {
  key: string;
  groupId: string;
  label: string;
  hint: string;
  sortOrder: number;
  isSystem: boolean;
  aspectRatio: string;
  slotType: string;
}

// ===== Image Library Seed =====

function seedImageLibrary(db: Database.Database) {
  const count = db.prepare("SELECT COUNT(*) as c FROM image_groups").get() as { c: number };
  if (count.c > 0) return;

  const gGeneral = crypto.randomUUID();
  const gOffice = crypto.randomUUID();
  const gBackground = crypto.randomUUID();

  const insertGroup = db.prepare(
    "INSERT INTO image_groups (id, name, description, sort_order) VALUES (?, ?, ?, ?)"
  );
  const insertSlot = db.prepare(
    "INSERT INTO image_slots (key, group_id, label, hint, sort_order, is_system, aspect_ratio, slot_type) VALUES (?, ?, ?, ?, ?, 1, ?, ?)"
  );

  const seed = db.transaction(() => {
    insertGroup.run(gGeneral, "網站通用", "", 0);
    insertGroup.run(gOffice, "首頁事務所照片", "首頁「事務所環境」區塊展示的照片。留空則使用預設照片。", 1);
    insertGroup.run(gBackground, "頁面背景圖", "各頁面頂部橫幅背景，建議尺寸 1920×600 以上。留空則使用預設圖片。", 2);

    insertSlot.run("logo", gGeneral, "Logo", "顯示於網站左上角", 0, "3:4", "general");
    insertSlot.run("scrivener_photo", gGeneral, "代書照片", "顯示於關於我們頁面", 1, "3:4", "general");

    insertSlot.run("office_interior", gOffice, "內部環境", "事務所內部環境照", 0, "4:3", "general");
    insertSlot.run("office_exterior", gOffice, "外觀", "事務所外觀照", 1, "4:3", "general");
    insertSlot.run("office_sign", gOffice, "招牌", "事務所招牌照", 2, "4:3", "general");

    insertSlot.run("hero_bg", gBackground, "首頁", "首頁大圖橫幅背景", 0, "16:6", "background");
    insertSlot.run("about_bg", gBackground, "關於我們", "關於我們頁面頂部背景", 1, "16:6", "background");
    insertSlot.run("services_bg", gBackground, "服務項目", "服務項目頁面頂部背景", 2, "16:6", "background");
    insertSlot.run("contact_bg", gBackground, "聯絡我們", "聯絡我們頁面頂部背景", 3, "16:6", "background");
    insertSlot.run("faq_bg", gBackground, "常見問題", "常見問題頁面頂部背景", 4, "16:6", "background");
    insertSlot.run("tools_bg", gBackground, "小工具", "小工具頁面頂部背景", 5, "16:6", "background");
  });
  seed();
}

// ===== Image Library CRUD =====

function rowToGroup(row: { id: string; name: string; description: string; sort_order: number }): ImageGroup {
  return { id: row.id, name: row.name, description: row.description, sortOrder: row.sort_order };
}

function rowToSlot(row: { key: string; group_id: string; label: string; hint: string; sort_order: number; is_system: number; aspect_ratio: string; slot_type: string }): ImageSlot {
  return { key: row.key, groupId: row.group_id, label: row.label, hint: row.hint, sortOrder: row.sort_order, isSystem: row.is_system === 1, aspectRatio: row.aspect_ratio, slotType: row.slot_type };
}

export function listImageGroups(): ImageGroup[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM image_groups ORDER BY sort_order, name").all() as { id: string; name: string; description: string; sort_order: number }[];
  return rows.map(rowToGroup);
}

export function createImageGroup(name: string, description = ""): ImageGroup {
  const db = getDb();
  const id = crypto.randomUUID();
  const maxOrder = db.prepare("SELECT COALESCE(MAX(sort_order), -1) as m FROM image_groups").get() as { m: number };
  db.prepare("INSERT INTO image_groups (id, name, description, sort_order) VALUES (?, ?, ?, ?)").run(id, name, description, maxOrder.m + 1);
  return { id, name, description, sortOrder: maxOrder.m + 1 };
}

export function updateImageGroup(id: string, data: { name?: string; description?: string; sortOrder?: number }): boolean {
  const db = getDb();
  const sets: string[] = [];
  const vals: unknown[] = [];
  if (data.name !== undefined) { sets.push("name = ?"); vals.push(data.name); }
  if (data.description !== undefined) { sets.push("description = ?"); vals.push(data.description); }
  if (data.sortOrder !== undefined) { sets.push("sort_order = ?"); vals.push(data.sortOrder); }
  if (sets.length === 0) return false;
  vals.push(id);
  const result = db.prepare(`UPDATE image_groups SET ${sets.join(", ")} WHERE id = ?`).run(...vals);
  return result.changes > 0;
}

export function deleteImageGroup(id: string): { success: boolean; error?: string } {
  const db = getDb();
  const hasSystem = db.prepare("SELECT 1 FROM image_slots WHERE group_id = ? AND is_system = 1 LIMIT 1").get(id);
  if (hasSystem) return { success: false, error: "無法刪除含有系統圖片的群組" };
  const slotKeys = db.prepare("SELECT key FROM image_slots WHERE group_id = ?").all(id) as { key: string }[];
  const del = db.transaction(() => {
    for (const { key } of slotKeys) {
      db.prepare("DELETE FROM images WHERE key = ?").run(key);
    }
    db.prepare("DELETE FROM image_groups WHERE id = ?").run(id);
  });
  del();
  return { success: true };
}

export function reorderImageGroups(ids: string[]) {
  const db = getDb();
  const update = db.prepare("UPDATE image_groups SET sort_order = ? WHERE id = ?");
  const reorder = db.transaction(() => {
    ids.forEach((id, i) => update.run(i, id));
  });
  reorder();
}

export function listImageSlots(): ImageSlot[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM image_slots ORDER BY sort_order").all() as { key: string; group_id: string; label: string; hint: string; sort_order: number; is_system: number; aspect_ratio: string; slot_type: string }[];
  return rows.map(rowToSlot);
}

export function getImageSlotsByGroup(groupId: string): ImageSlot[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM image_slots WHERE group_id = ? ORDER BY sort_order").all(groupId) as { key: string; group_id: string; label: string; hint: string; sort_order: number; is_system: number; aspect_ratio: string; slot_type: string }[];
  return rows.map(rowToSlot);
}

export function createImageSlot(data: { key: string; groupId: string; label: string; hint?: string; aspectRatio?: string; slotType?: string }): { success: boolean; slot?: ImageSlot; error?: string } {
  const db = getDb();
  if (!/^[a-z0-9_]+$/.test(data.key)) return { success: false, error: "Key 只能包含小寫英文、數字和底線" };
  const exists = db.prepare("SELECT 1 FROM image_slots WHERE key = ?").get(data.key);
  if (exists) return { success: false, error: "此 Key 已存在" };
  const groupExists = db.prepare("SELECT 1 FROM image_groups WHERE id = ?").get(data.groupId);
  if (!groupExists) return { success: false, error: "群組不存在" };
  const maxOrder = db.prepare("SELECT COALESCE(MAX(sort_order), -1) as m FROM image_slots WHERE group_id = ?").get(data.groupId) as { m: number };
  const sortOrder = maxOrder.m + 1;
  const aspectRatio = data.aspectRatio || "3:4";
  const slotType = data.slotType || "general";
  db.prepare("INSERT INTO image_slots (key, group_id, label, hint, sort_order, is_system, aspect_ratio, slot_type) VALUES (?, ?, ?, ?, ?, 0, ?, ?)").run(data.key, data.groupId, data.label, data.hint || "", sortOrder, aspectRatio, slotType);
  return { success: true, slot: { key: data.key, groupId: data.groupId, label: data.label, hint: data.hint || "", sortOrder, isSystem: false, aspectRatio, slotType } };
}

export function updateImageSlot(key: string, data: { label?: string; hint?: string; aspectRatio?: string; slotType?: string }): boolean {
  const db = getDb();
  const sets: string[] = [];
  const vals: unknown[] = [];
  if (data.label !== undefined) { sets.push("label = ?"); vals.push(data.label); }
  if (data.hint !== undefined) { sets.push("hint = ?"); vals.push(data.hint); }
  if (data.aspectRatio !== undefined) { sets.push("aspect_ratio = ?"); vals.push(data.aspectRatio); }
  if (data.slotType !== undefined) { sets.push("slot_type = ?"); vals.push(data.slotType); }
  if (sets.length === 0) return false;
  vals.push(key);
  const result = db.prepare(`UPDATE image_slots SET ${sets.join(", ")} WHERE key = ?`).run(...vals);
  return result.changes > 0;
}

export function deleteImageSlot(key: string): { success: boolean; error?: string } {
  const db = getDb();
  const slot = db.prepare("SELECT is_system FROM image_slots WHERE key = ?").get(key) as { is_system: number } | undefined;
  if (!slot) return { success: false, error: "找不到此圖片欄位" };
  if (slot.is_system === 1) return { success: false, error: "無法刪除系統圖片欄位" };
  const del = db.transaction(() => {
    db.prepare("DELETE FROM images WHERE key = ?").run(key);
    db.prepare("DELETE FROM image_slots WHERE key = ?").run(key);
  });
  del();
  return { success: true };
}

export function isValidImageKey(key: string): boolean {
  const db = getDb();
  const row = db.prepare("SELECT 1 FROM image_slots WHERE key = ?").get(key);
  return !!row;
}

export function getBackgroundSlotKeys(): string[] {
  const db = getDb();
  const rows = db.prepare("SELECT key FROM image_slots WHERE slot_type = 'background' ORDER BY sort_order").all() as { key: string }[];
  return rows.map(r => r.key);
}
