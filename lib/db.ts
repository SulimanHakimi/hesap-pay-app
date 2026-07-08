// Directly export database implementation from MongoDB backend
export {
  initDB,
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  getSetting,
  setSetting,
  getAllSettings,
  getItem
} from './db-mongo';

export type { ProductRow, ServiceRow, OrderRow } from './db-types';
