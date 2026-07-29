import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { initCmsTables } from "./cms-db";
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
  type ServiceFlow,
  type Faq,
  type FeeItem,
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
  initCmsTables(_db);

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
  `);
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

export function getServiceFlow(): ServiceFlow[] {
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT id, step_name, step_description FROM service_flow ORDER BY sort_order"
    )
    .all() as { id: number; step_name: string; step_description: string }[];
  return rows.map((r) => ({
    _id: `flow-${r.id}`,
    stepName: r.step_name,
    stepDescription: r.step_description,
  }));
}

export function getFaqs(): Faq[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT id, question, answer FROM faqs ORDER BY sort_order")
    .all() as { id: number; question: string; answer: string }[];
  return rows.map((r) => ({
    _id: `faq-${r.id}`,
    question: r.question,
    answer: r.answer,
  }));
}

export function getFees(): FeeItem[] {
  const db = getDb();
  return db
    .prepare("SELECT id, service, fee, payer, note FROM fees ORDER BY id")
    .all() as FeeItem[];
}

export function getFeeNotes(): string[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT note FROM fee_notes ORDER BY sort_order")
    .all() as { note: string }[];
  return rows.map((r) => r.note);
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

export function updateAbout(data: Partial<About>) {
  const db = getDb();
  const current = getAbout();
  db.prepare(
    `UPDATE about SET introduction = ?, philosophy = ?, features = ?,
     qualifications = ?, experience = ?, specialties = ? WHERE id = 1`
  ).run(
    data.introduction ?? current.introduction,
    data.philosophy ?? current.philosophy,
    JSON.stringify(data.features ?? current.features),
    JSON.stringify(data.qualifications ?? current.qualifications),
    JSON.stringify(data.experience ?? current.experience),
    JSON.stringify(data.specialties ?? current.specialties)
  );
}

export function replaceServices(services: { title: string; description: string }[]) {
  const db = getDb();
  const replace = db.transaction(() => {
    db.prepare("DELETE FROM services").run();
    const insert = db.prepare(
      "INSERT INTO services (title, description, sort_order) VALUES (?, ?, ?)"
    );
    services.forEach((s, i) => insert.run(s.title, s.description, i));
  });
  replace();
}

export function replaceServiceFlow(
  flow: { stepName: string; stepDescription: string }[]
) {
  const db = getDb();
  const replace = db.transaction(() => {
    db.prepare("DELETE FROM service_flow").run();
    const insert = db.prepare(
      "INSERT INTO service_flow (step_name, step_description, sort_order) VALUES (?, ?, ?)"
    );
    flow.forEach((f, i) => insert.run(f.stepName, f.stepDescription, i));
  });
  replace();
}

export function replaceFaqs(faqs: { question: string; answer: string }[]) {
  const db = getDb();
  const replace = db.transaction(() => {
    db.prepare("DELETE FROM faqs").run();
    const insert = db.prepare(
      "INSERT INTO faqs (question, answer, sort_order) VALUES (?, ?, ?)"
    );
    faqs.forEach((f, i) => insert.run(f.question, f.answer, i));
  });
  replace();
}

export function replaceFees(fees: Omit<FeeItem, "id">[], ids?: number[]) {
  const db = getDb();
  const replace = db.transaction(() => {
    db.prepare("DELETE FROM fees").run();
    const insert = db.prepare(
      "INSERT INTO fees (id, service, fee, payer, note) VALUES (?, ?, ?, ?, ?)"
    );
    fees.forEach((f, i) => insert.run(ids?.[i] ?? i + 1, f.service, f.fee, f.payer, f.note));
  });
  replace();
}

export function replaceFeeNotes(notes: string[]) {
  const db = getDb();
  const replace = db.transaction(() => {
    db.prepare("DELETE FROM fee_notes").run();
    const insert = db.prepare(
      "INSERT INTO fee_notes (note, sort_order) VALUES (?, ?)"
    );
    notes.forEach((n, i) => insert.run(n, i));
  });
  replace();
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
