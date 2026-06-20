// Multi-backend db router. Picks at module load in this order of preference:
//   MONGODB_URI set  → MongoDB Atlas (recommended for Vercel)
//   POSTGRES_URL set → Vercel Postgres
//   else             → better-sqlite3 against data/store.db (local dev only)
//
// better-sqlite3 is a native module that can't run on Vercel's serverless
// runtime, so we use `require` (not `import`) to gate the load. When a hosted
// backend is selected, the sqlite module is never required.

import type * as PgBackend from './db-postgres';
export type { ProductRow, ServiceRow, OrderRow } from './db-types';

function pickBackend(): typeof PgBackend {
  if (process.env.MONGODB_URI)  return require('./db-mongo');
  if (process.env.POSTGRES_URL) return require('./db-postgres');
  return require('./db-sqlite');
}

const impl: typeof PgBackend = pickBackend();

export const initDB             = impl.initDB;
export const getProducts        = impl.getProducts;
export const getProduct         = impl.getProduct;
export const createProduct      = impl.createProduct;
export const updateProduct      = impl.updateProduct;
export const deleteProduct      = impl.deleteProduct;
export const getServices        = impl.getServices;
export const getService         = impl.getService;
export const createService      = impl.createService;
export const updateService      = impl.updateService;
export const deleteService      = impl.deleteService;
export const getOrders          = impl.getOrders;
export const getOrder           = impl.getOrder;
export const createOrder        = impl.createOrder;
export const updateOrderStatus  = impl.updateOrderStatus;
export const getSetting         = impl.getSetting;
export const setSetting         = impl.setSetting;
export const getAllSettings     = impl.getAllSettings;
export const getItem            = impl.getItem;
