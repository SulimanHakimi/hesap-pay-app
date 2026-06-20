// Static product catalog. Edit this file to add / change products — no database needed.
// `price` is the SUGGESTED amount shown to buyers; they can edit it on the store page.

export type StaticProduct = {
  id: string;
  name: string;
  description: string;
  price: number;          // suggested amount in AFN
  category?: string;
  image_url?: string;
  active: boolean;
};

export const STATIC_PRODUCTS: StaticProduct[] = [
  {
    id: 'mptqbhjkvc87u',                    // keep the existing link working
    name: 'Sheen Store Payment',
    description: 'Pay any amount to Sheen Store via HesabPay.',
    price: 10,
    category: 'General',
    active: true,
  },
];

export function findStaticProduct(id: string): StaticProduct | null {
  return STATIC_PRODUCTS.find(p => p.id === id) ?? null;
}
