export type ProductRow = {
  id: string; name: string; description: string | null; price: number;
  category: string | null; image_url: string | null; stock: number;
  active: number; created_at: string;
};
export type ServiceRow = {
  id: string; name: string; description: string | null; price: number;
  service_type: string | null; image_url: string | null;
  delivery_info: string | null; active: number; created_at: string;
};
export type OrderRow = {
  id: string; item_id: string; item_type: string; item_name: string;
  amount: number; customer_email: string | null; customer_name: string | null;
  status: string; hesabpay_txn_id: string | null;
  created_at: string; completed_at: string | null;
};
