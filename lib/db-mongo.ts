import { MongoClient, Db, Collection } from 'mongodb';
import type { ProductRow, ServiceRow, OrderRow } from './db-types';

// Cached client across warm serverless invocations.
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function getDb(): Promise<Db> {
  if (cachedDb) return cachedDb;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');
  const dbName = process.env.MONGODB_DB || 'hesap_pay';
  const client = cachedClient ?? new MongoClient(uri);
  if (!cachedClient) {
    await client.connect();
    cachedClient = client;
  }
  cachedDb = client.db(dbName);
  return cachedDb;
}

function products(): Promise<Collection> { return getDb().then(d => d.collection('products')); }
function services(): Promise<Collection> { return getDb().then(d => d.collection('services')); }
function orders(): Promise<Collection>   { return getDb().then(d => d.collection('orders'));   }
function settings(): Promise<Collection> { return getDb().then(d => d.collection('settings')); }

let initialized = false;
export async function initDB() {
  if (initialized) return;
  // Ensure unique index on `id` for each collection so genId collisions surface early.
  const [p, s, o, st] = await Promise.all([products(), services(), orders(), settings()]);
  await Promise.all([
    p.createIndex({ id: 1 }, { unique: true }),
    s.createIndex({ id: 1 }, { unique: true }),
    o.createIndex({ id: 1 }, { unique: true }),
    st.createIndex({ key: 1 }, { unique: true }),
  ]);
  initialized = true;
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function stripId<T>(doc: any): T {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return rest as T;
}

// ── Products ──────────────────────────────────────────────────────────────────

export async function getProducts(activeOnly = false): Promise<ProductRow[]> {
  await initDB();
  const col = await products();
  const filter = activeOnly ? { active: 1 } : {};
  const docs = await col.find(filter).sort({ created_at: -1 }).toArray();
  return docs.map(d => stripId<ProductRow>(d));
}

export async function getProduct(id: string): Promise<ProductRow | null> {
  await initDB();
  const col = await products();
  const doc = await col.findOne({ id });
  return doc ? stripId<ProductRow>(doc) : null;
}

export async function createProduct(data: any) {
  await initDB();
  const col = await products();
  const id = genId();
  await col.insertOne({
    id,
    name: data.name,
    description: data.description ?? null,
    price: parseFloat(data.price) || 0,
    category: data.category ?? null,
    image_url: data.imageUrl ?? null,
    stock: data.stock ?? -1,
    active: data.active !== false ? 1 : 0,
    created_at: new Date().toISOString(),
  });
  return getProduct(id);
}

export async function updateProduct(id: string, data: any) {
  await initDB();
  const col = await products();
  await col.updateOne({ id }, { $set: {
    name: data.name,
    description: data.description ?? null,
    price: parseFloat(data.price) || 0,
    category: data.category ?? null,
    image_url: data.imageUrl ?? data.image_url ?? null,
    stock: data.stock ?? -1,
    active: data.active !== false && data.active !== 0 ? 1 : 0,
  }});
  return getProduct(id);
}

export async function deleteProduct(id: string) {
  await initDB();
  const col = await products();
  await col.deleteOne({ id });
}

// ── Services ──────────────────────────────────────────────────────────────────

export async function getServices(activeOnly = false): Promise<ServiceRow[]> {
  await initDB();
  const col = await services();
  const filter = activeOnly ? { active: 1 } : {};
  const docs = await col.find(filter).sort({ created_at: -1 }).toArray();
  return docs.map(d => stripId<ServiceRow>(d));
}

export async function getService(id: string): Promise<ServiceRow | null> {
  await initDB();
  const col = await services();
  const doc = await col.findOne({ id });
  return doc ? stripId<ServiceRow>(doc) : null;
}

export async function createService(data: any) {
  await initDB();
  const col = await services();
  const id = genId();
  await col.insertOne({
    id,
    name: data.name,
    description: data.description ?? null,
    price: parseFloat(data.price) || 0,
    service_type: data.serviceType ?? null,
    image_url: data.imageUrl ?? null,
    delivery_info: data.deliveryInfo ?? null,
    active: data.active !== false ? 1 : 0,
    created_at: new Date().toISOString(),
  });
  return getService(id);
}

export async function updateService(id: string, data: any) {
  await initDB();
  const col = await services();
  await col.updateOne({ id }, { $set: {
    name: data.name,
    description: data.description ?? null,
    price: parseFloat(data.price) || 0,
    service_type: data.serviceType ?? data.service_type ?? null,
    image_url: data.imageUrl ?? data.image_url ?? null,
    delivery_info: data.deliveryInfo ?? data.delivery_info ?? null,
    active: data.active !== false && data.active !== 0 ? 1 : 0,
  }});
  return getService(id);
}

export async function deleteService(id: string) {
  await initDB();
  const col = await services();
  await col.deleteOne({ id });
}

// ── Orders ────────────────────────────────────────────────────────────────────

export async function getOrders(): Promise<OrderRow[]> {
  await initDB();
  const col = await orders();
  const docs = await col.find({}).sort({ created_at: -1 }).toArray();
  return docs.map(d => stripId<OrderRow>(d));
}

export async function getOrder(id: string): Promise<OrderRow | null> {
  await initDB();
  const col = await orders();
  const doc = await col.findOne({ id });
  return doc ? stripId<OrderRow>(doc) : null;
}

export async function createOrder(data: any) {
  await initDB();
  const col = await orders();
  const id = genId();
  await col.insertOne({
    id,
    item_id: data.itemId,
    item_type: data.itemType,
    item_name: data.itemName,
    amount: parseFloat(data.amount) || 0,
    customer_email: data.customerEmail ?? null,
    customer_name: data.customerName ?? null,
    status: 'pending',
    hesabpay_txn_id: null,
    created_at: new Date().toISOString(),
    completed_at: null,
  });
  return getOrder(id);
}

export async function updateOrderStatus(id: string, status: string, hesabpayTxnId?: string) {
  await initDB();
  const col = await orders();
  const update: any = { status };
  if (status === 'completed') {
    update.hesabpay_txn_id = hesabpayTxnId ?? null;
    update.completed_at = new Date().toISOString();
  }
  await col.updateOne({ id }, { $set: update });
}

// ── Settings ──────────────────────────────────────────────────────────────────

export async function getSetting(key: string): Promise<string | null> {
  if (key === 'hesabpay_api_key' && process.env.HESABPAY_API_KEY) return process.env.HESABPAY_API_KEY;
  if (key === 'store_name' && process.env.NEXT_PUBLIC_STORE_NAME) return process.env.NEXT_PUBLIC_STORE_NAME;
  if (key === 'store_url' && process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  await initDB();
  const col = await settings();
  const doc = await col.findOne({ key });
  return (doc?.value as string | undefined) ?? null;
}

export async function setSetting(key: string, value: string) {
  await initDB();
  const col = await settings();
  await col.updateOne({ key }, { $set: { key, value } }, { upsert: true });
}

export async function getAllSettings(): Promise<Record<string, string>> {
  await initDB();
  const col = await settings();
  const docs = await col.find({}).toArray();
  return Object.fromEntries(docs.map(d => [d.key as string, d.value as string]));
}

// ── Lookup any item ───────────────────────────────────────────────────────────

export async function getItem(id: string): Promise<any> {
  const p = await getProduct(id);
  if (p) return { ...p, itemType: 'product' };
  const s = await getService(id);
  if (s) return { ...s, itemType: 'service' };
  return null;
}
