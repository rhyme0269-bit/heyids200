import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import type { Calculator, CalcDefinition } from "./calc-types";
import { defaultCalculators } from "./calc-seed";

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
  initCalcTables(_db);
  seedCalculators(_db);
  return _db;
}

const EMPTY_DEF: CalcDefinition = { inputs: [], formulas: [], results: [], total: { id: "", label: "", suffix: "" } };

type CalcRow = {
  id: string; slug: string; title: string; icon: string; description: string;
  sort_order: number; is_system: number; is_visible: number;
  definition: string; created_at: string; updated_at: string;
};

function rowToCalc(row: CalcRow): Calculator {
  let definition: CalcDefinition;
  try { definition = JSON.parse(row.definition); } catch { definition = EMPTY_DEF; }
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    icon: row.icon,
    description: row.description,
    sortOrder: row.sort_order,
    isSystem: row.is_system === 1,
    isVisible: row.is_visible === 1,
    definition,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function initCalcTables(db?: Database.Database) {
  const d = db ?? getDb();
  d.exec(`
    CREATE TABLE IF NOT EXISTS calculators (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT '🔢',
      description TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_system INTEGER NOT NULL DEFAULT 0,
      is_visible INTEGER NOT NULL DEFAULT 1,
      definition TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

export function seedCalculators(db?: Database.Database) {
  const d = db ?? getDb();

  const existingSlugs = new Map(
    (d.prepare("SELECT slug, definition FROM calculators WHERE is_system = 1").all() as { slug: string; definition: string }[])
      .map((r) => [r.slug, r.definition])
  );

  const insert = d.prepare(
    `INSERT INTO calculators (id, slug, title, icon, description, sort_order, is_system, is_visible, definition)
     VALUES (?, ?, ?, ?, ?, ?, 1, 1, ?)`
  );

  d.transaction(() => {
    defaultCalculators.forEach((calc, i) => {
      const defJson = JSON.stringify(calc.definition);
      if (!existingSlugs.has(calc.slug)) {
        insert.run(crypto.randomUUID(), calc.slug, calc.title, calc.icon, calc.description, i, defJson);
      }
    });
  })();
}

export function listCalculators(visibleOnly = false): Calculator[] {
  const db = getDb();
  const where = visibleOnly ? "WHERE is_visible = 1" : "";
  const rows = db.prepare(`SELECT * FROM calculators ${where} ORDER BY sort_order, title`).all() as CalcRow[];
  return rows.map(rowToCalc);
}

export function getCalculator(id: string): Calculator | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM calculators WHERE id = ?").get(id) as CalcRow | undefined;
  return row ? rowToCalc(row) : null;
}

export function createCalculator(data: {
  title: string; icon?: string; description?: string; definition?: CalcDefinition;
}): Calculator {
  const db = getDb();
  const id = crypto.randomUUID();
  const slug = `custom_${id.slice(0, 8)}`;
  const maxOrder = db.prepare("SELECT COALESCE(MAX(sort_order), -1) as m FROM calculators").get() as { m: number };

  db.prepare(
    `INSERT INTO calculators (id, slug, title, icon, description, sort_order, is_system, is_visible, definition)
     VALUES (?, ?, ?, ?, ?, ?, 0, 1, ?)`
  ).run(id, slug, data.title, data.icon ?? "🔢", data.description ?? "", maxOrder.m + 1, JSON.stringify(data.definition ?? EMPTY_DEF));

  return getCalculator(id)!;
}

export function updateCalculator(id: string, data: {
  title?: string; icon?: string; description?: string;
  isVisible?: boolean; sortOrder?: number; definition?: CalcDefinition;
}): Calculator | null {
  const db = getDb();
  const sets: string[] = [];
  const vals: unknown[] = [];

  if (data.title !== undefined) { sets.push("title = ?"); vals.push(data.title); }
  if (data.icon !== undefined) { sets.push("icon = ?"); vals.push(data.icon); }
  if (data.description !== undefined) { sets.push("description = ?"); vals.push(data.description); }
  if (data.isVisible !== undefined) { sets.push("is_visible = ?"); vals.push(data.isVisible ? 1 : 0); }
  if (data.sortOrder !== undefined) { sets.push("sort_order = ?"); vals.push(data.sortOrder); }
  if (data.definition !== undefined) { sets.push("definition = ?"); vals.push(JSON.stringify(data.definition)); }

  if (sets.length === 0) return getCalculator(id);

  sets.push("updated_at = datetime('now')");
  vals.push(id);
  db.prepare(`UPDATE calculators SET ${sets.join(", ")} WHERE id = ?`).run(...vals);
  return getCalculator(id);
}

export function deleteCalculator(id: string): { success: boolean; error?: string } {
  const db = getDb();
  const calc = getCalculator(id);
  if (!calc) return { success: false, error: "計算器不存在" };
  if (calc.isSystem) return { success: false, error: "無法刪除系統預設計算器" };
  db.prepare("DELETE FROM calculators WHERE id = ?").run(id);
  return { success: true };
}

export function reorderCalculators(ids: string[]) {
  const db = getDb();
  const update = db.prepare("UPDATE calculators SET sort_order = ? WHERE id = ?");
  const reorder = db.transaction(() => {
    ids.forEach((id, i) => update.run(i, id));
  });
  reorder();
}
