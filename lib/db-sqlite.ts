import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import type { ProductRow, ServiceRow, OrderRow } from './db-types';

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'store.db'));
db.pragma('journal_mode = WAL');

let initialized = false;
function init() {
  if (initialized) return;
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      description TEXT,
      price       REAL NOT NULL,
      category    TEXT,
      image_url   TEXT,
      stock       INTEGER DEFAULT -1,
      active      INTEGER DEFAULT 1,
      created_at  TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS services (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      description   TEXT,
      price         REAL NOT NULL,
      service_type  TEXT,
      image_url     TEXT,
      delivery_info TEXT,
      active        INTEGER DEFAULT 1,
      created_at    TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS orders (
      id              TEXT PRIMARY KEY,
      item_id         TEXT NOT NULL,
      item_type       TEXT NOT NULL,
      item_name       TEXT NOT NULL,
      amount          REAL NOT NULL,
      customer_email  TEXT,
      customer_name   TEXT,
      status          TEXT DEFAULT 'pending',
      hesabpay_txn_id TEXT,
      created_at      TEXT DEFAULT (datetime('now')),
      completed_at    TEXT
    );
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT
    );
  `);
  initialized = true;
}
init();

export async function initDB() { init(); }

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export async function getProducts(activeOnly = false): Promise<ProductRow[]> {
  const rows = activeOnly
    ? db.prepare(`SELECT * FROM products WHERE active = 1 ORDER BY created_at DESC`).all()
    : db.prepare(`SELECT * FROM products ORDER BY created_at DESC`).all();
  return rows as ProductRow[];
}

export async function getProduct(id: string): Promise<ProductRow | null> {
  return (db.prepare(`SELECT * FROM products WHERE id = ?`).get(id) as ProductRow | undefined) ?? null;
}

export async function createProduct(data: any) {
  const id = genId();
  db.prepare(`
    INSERT INTO products (id, name, description, price, category, image_url, stock, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, data.name, data.description ?? null, parseFloat(data.price),
    data.category ?? null, data.imageUrl ?? null, data.stock ?? -1,
    data.active !== false ? 1 : 0,
  );
  return getProduct(id);
}

export async function updateProduct(id: string, data: any) {
  db.prepare(`
    UPDATE products SET name = ?, description = ?, price = ?, category = ?, image_url = ?, stock = ?, active = ?
    WHERE id = ?
  `).run(
    data.name, data.description ?? null, parseFloat(data.price),
    data.category ?? null, data.imageUrl ?? data.image_url ?? null,
    data.stock ?? -1, data.active !== false && data.active !== 0 ? 1 : 0, id,
  );
  return getProduct(id);
}

export async function deleteProduct(id: string) {
  db.prepare(`DELETE FROM products WHERE id = ?`).run(id);
}

export async function getServices(activeOnly = false): Promise<ServiceRow[]> {
  const rows = activeOnly
    ? db.prepare(`SELECT * FROM services WHERE active = 1 ORDER BY created_at DESC`).all()
    : db.prepare(`SELECT * FROM services ORDER BY created_at DESC`).all();
  return rows as ServiceRow[];
}

export async function getService(id: string): Promise<ServiceRow | null> {
  return (db.prepare(`SELECT * FROM services WHERE id = ?`).get(id) as ServiceRow | undefined) ?? null;
}

export async function createService(data: any) {
  const id = genId();
  db.prepare(`
    INSERT INTO services (id, name, description, price, service_type, image_url, delivery_info, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, data.name, data.description ?? null, parseFloat(data.price),
    data.serviceType ?? null, data.imageUrl ?? null, data.deliveryInfo ?? null,
    data.active !== false ? 1 : 0,
  );
  return getService(id);
}

export async function updateService(id: string, data: any) {
  db.prepare(`
    UPDATE services SET name = ?, description = ?, price = ?, service_type = ?, image_url = ?, delivery_info = ?, active = ?
    WHERE id = ?
  `).run(
    data.name, data.description ?? null, parseFloat(data.price),
    data.serviceType ?? data.service_type ?? null,
    data.imageUrl ?? data.image_url ?? null,
    data.deliveryInfo ?? data.delivery_info ?? null,
    data.active !== false && data.active !== 0 ? 1 : 0, id,
  );
  return getService(id);
}

export async function deleteService(id: string) {
  db.prepare(`DELETE FROM services WHERE id = ?`).run(id);
}

export async function getOrders(): Promise<OrderRow[]> {
  return db.prepare(`SELECT * FROM orders ORDER BY created_at DESC`).all() as OrderRow[];
}

export async function getOrder(id: string): Promise<OrderRow | null> {
  return (db.prepare(`SELECT * FROM orders WHERE id = ?`).get(id) as OrderRow | undefined) ?? null;
}

export async function createOrder(data: any) {
  const id = genId();
  db.prepare(`
    INSERT INTO orders (id, item_id, item_type, item_name, amount, customer_email, customer_name, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
  `).run(
    id, data.itemId, data.itemType, data.itemName,
    parseFloat(data.amount), data.customerEmail ?? null, data.customerName ?? null,
  );
  return getOrder(id);
}

export async function updateOrderStatus(id: string, status: string, hesabpayTxnId?: string) {
  if (status === 'completed') {
    db.prepare(`UPDATE orders SET status = ?, hesabpay_txn_id = ?, completed_at = datetime('now') WHERE id = ?`)
      .run(status, hesabpayTxnId ?? null, id);
  } else {
    db.prepare(`UPDATE orders SET status = ? WHERE id = ?`).run(status, id);
  }
}

export async function getSetting(key: string): Promise<string | null> {
  if (key === 'hesabpay_api_key' && process.env.HESABPAY_API_KEY) return process.env.HESABPAY_API_KEY;
  if (key === 'store_name' && process.env.NEXT_PUBLIC_STORE_NAME) return process.env.NEXT_PUBLIC_STORE_NAME;
  if (key === 'store_url' && process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  const row = db.prepare(`SELECT value FROM settings WHERE key = ?`).get(key) as { value?: string } | undefined;
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string) {
  db.prepare(`INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value`)
    .run(key, value);
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const rows = db.prepare(`SELECT key, value FROM settings`).all() as { key: string; value: string }[];
  return Object.fromEntries(rows.map(r => [r.key, r.value]));
}

export async function getItem(id: string): Promise<any> {
  const p = await getProduct(id);
  if (p) return { ...p, itemType: 'product' };
  const s = await getService(id);
  if (s) return { ...s, itemType: 'service' };
  return null;
}
