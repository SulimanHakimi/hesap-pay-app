import { sql } from '@vercel/postgres';
import type { ProductRow, ServiceRow, OrderRow } from './db-types';

let initialized = false;
export async function initDB() {
  if (initialized) return;
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      description TEXT,
      price       NUMERIC NOT NULL,
      category    TEXT,
      image_url   TEXT,
      stock       INTEGER DEFAULT -1,
      active      INTEGER DEFAULT 1,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS services (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      description   TEXT,
      price         NUMERIC NOT NULL,
      service_type  TEXT,
      image_url     TEXT,
      delivery_info TEXT,
      active        INTEGER DEFAULT 1,
      created_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id              TEXT PRIMARY KEY,
      item_id         TEXT NOT NULL,
      item_type       TEXT NOT NULL,
      item_name       TEXT NOT NULL,
      amount          NUMERIC NOT NULL,
      customer_email  TEXT,
      customer_name   TEXT,
      status          TEXT DEFAULT 'pending',
      hesabpay_txn_id TEXT,
      created_at      TIMESTAMPTZ DEFAULT NOW(),
      completed_at    TIMESTAMPTZ
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT
    )
  `;
  initialized = true;
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export async function getProducts(activeOnly = false): Promise<ProductRow[]> {
  await initDB();
  const { rows } = activeOnly
    ? await sql`SELECT * FROM products WHERE active = 1 ORDER BY created_at DESC`
    : await sql`SELECT * FROM products ORDER BY created_at DESC`;
  return rows as ProductRow[];
}

export async function getProduct(id: string): Promise<ProductRow | null> {
  await initDB();
  const { rows } = await sql`SELECT * FROM products WHERE id = ${id}`;
  return (rows[0] as ProductRow | undefined) ?? null;
}

export async function createProduct(data: any) {
  await initDB();
  const id = genId();
  await sql`
    INSERT INTO products (id, name, description, price, category, image_url, stock, active)
    VALUES (
      ${id}, ${data.name}, ${data.description ?? null},
      ${parseFloat(data.price)}, ${data.category ?? null},
      ${data.imageUrl ?? null}, ${data.stock ?? -1},
      ${data.active !== false ? 1 : 0}
    )
  `;
  return getProduct(id);
}

export async function updateProduct(id: string, data: any) {
  await initDB();
  await sql`
    UPDATE products SET
      name = ${data.name},
      description = ${data.description ?? null},
      price = ${parseFloat(data.price)},
      category = ${data.category ?? null},
      image_url = ${data.imageUrl ?? data.image_url ?? null},
      stock = ${data.stock ?? -1},
      active = ${data.active !== false && data.active !== 0 ? 1 : 0}
    WHERE id = ${id}
  `;
  return getProduct(id);
}

export async function deleteProduct(id: string) {
  await initDB();
  await sql`DELETE FROM products WHERE id = ${id}`;
}

export async function getServices(activeOnly = false): Promise<ServiceRow[]> {
  await initDB();
  const { rows } = activeOnly
    ? await sql`SELECT * FROM services WHERE active = 1 ORDER BY created_at DESC`
    : await sql`SELECT * FROM services ORDER BY created_at DESC`;
  return rows as ServiceRow[];
}

export async function getService(id: string): Promise<ServiceRow | null> {
  await initDB();
  const { rows } = await sql`SELECT * FROM services WHERE id = ${id}`;
  return (rows[0] as ServiceRow | undefined) ?? null;
}

export async function createService(data: any) {
  await initDB();
  const id = genId();
  await sql`
    INSERT INTO services (id, name, description, price, service_type, image_url, delivery_info, active)
    VALUES (
      ${id}, ${data.name}, ${data.description ?? null},
      ${parseFloat(data.price)}, ${data.serviceType ?? null},
      ${data.imageUrl ?? null}, ${data.deliveryInfo ?? null},
      ${data.active !== false ? 1 : 0}
    )
  `;
  return getService(id);
}

export async function updateService(id: string, data: any) {
  await initDB();
  await sql`
    UPDATE services SET
      name = ${data.name},
      description = ${data.description ?? null},
      price = ${parseFloat(data.price)},
      service_type = ${data.serviceType ?? data.service_type ?? null},
      image_url = ${data.imageUrl ?? data.image_url ?? null},
      delivery_info = ${data.deliveryInfo ?? data.delivery_info ?? null},
      active = ${data.active !== false && data.active !== 0 ? 1 : 0}
    WHERE id = ${id}
  `;
  return getService(id);
}

export async function deleteService(id: string) {
  await initDB();
  await sql`DELETE FROM services WHERE id = ${id}`;
}

export async function getOrders(): Promise<OrderRow[]> {
  await initDB();
  const { rows } = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
  return rows as OrderRow[];
}

export async function getOrder(id: string): Promise<OrderRow | null> {
  await initDB();
  const { rows } = await sql`SELECT * FROM orders WHERE id = ${id}`;
  return (rows[0] as OrderRow | undefined) ?? null;
}

export async function createOrder(data: any) {
  await initDB();
  const id = genId();
  await sql`
    INSERT INTO orders (id, item_id, item_type, item_name, amount, customer_email, customer_name, status)
    VALUES (
      ${id}, ${data.itemId}, ${data.itemType}, ${data.itemName},
      ${parseFloat(data.amount)}, ${data.customerEmail ?? null},
      ${data.customerName ?? null}, 'pending'
    )
  `;
  return getOrder(id);
}

export async function updateOrderStatus(id: string, status: string, hesabpayTxnId?: string) {
  await initDB();
  if (status === 'completed') {
    await sql`
      UPDATE orders SET status = ${status}, hesabpay_txn_id = ${hesabpayTxnId ?? null}, completed_at = NOW()
      WHERE id = ${id}
    `;
  } else {
    await sql`UPDATE orders SET status = ${status} WHERE id = ${id}`;
  }
}

export async function getSetting(key: string): Promise<string | null> {
  if (key === 'hesabpay_api_key' && process.env.HESABPAY_API_KEY) return process.env.HESABPAY_API_KEY;
  if (key === 'store_name' && process.env.NEXT_PUBLIC_STORE_NAME) return process.env.NEXT_PUBLIC_STORE_NAME;
  if (key === 'store_url' && process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  await initDB();
  const { rows } = await sql`SELECT value FROM settings WHERE key = ${key}`;
  return (rows[0] as { value?: string } | undefined)?.value ?? null;
}

export async function setSetting(key: string, value: string) {
  await initDB();
  await sql`
    INSERT INTO settings (key, value) VALUES (${key}, ${value})
    ON CONFLICT (key) DO UPDATE SET value = ${value}
  `;
}

export async function getAllSettings(): Promise<Record<string, string>> {
  await initDB();
  const { rows } = await sql`SELECT key, value FROM settings`;
  return Object.fromEntries((rows as { key: string; value: string }[]).map(r => [r.key, r.value]));
}

export async function getItem(id: string): Promise<any> {
  const p = await getProduct(id);
  if (p) return { ...p, itemType: 'product' };
  const s = await getService(id);
  if (s) return { ...s, itemType: 'service' };
  return null;
}
