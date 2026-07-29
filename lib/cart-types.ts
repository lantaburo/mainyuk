export interface CartItem {
  productId: string;
  variantId: string | null;
  name: string;
  variantName: string | null;
  price: number;
  imageUrl: string | null;
  qty: number;
}
