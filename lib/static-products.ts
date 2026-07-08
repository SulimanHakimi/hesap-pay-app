// Static product catalog. Edit this file to add / change products — no database needed.
// `price` is the SUGGESTED amount shown to buyers; they can edit it on the store page.

export type StaticProduct = {
  id: string;
  name: string;
  description: string;
  price?: number;          // optional suggested amount in AFN
  category?: string;
  image_url?: string;
  active: boolean;
};

export const STATIC_PRODUCTS: StaticProduct[] = [
  {
    id: 'mptqbhjkvc87u',                    // keep the existing link working
    name: 'Suliman Hakimi',
    description: 'Pay any amount to Suliman Hakimi via HesabPay',
    category: 'General',
    active: true,
  },
];

export function findStaticProduct(id: string): StaticProduct | null {
  return STATIC_PRODUCTS.find(p => p.id === id) ?? null;
}
