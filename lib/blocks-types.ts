import type { BlockType } from "@/lib/site-types";

interface BlockBase<T extends BlockType, D> {
  id: string;
  type: T;
  order: number;
  data: D;
}

export interface HeroData {
  title: string;
  subtitle?: string;
  image_url?: string;
  cta_text?: string;
  cta_link?: string;
  /** "center" (default) = teks di tengah | "split" = teks kiri, gambar kanan */
  align?: "center" | "split";
  /** "gradient" (default) = bg gradient brand | "dark" = bg gelap solid | "light" = bg terang */
  style?: "gradient" | "dark" | "light";
}

export interface FeaturedProductsData {
  title: string;
  product_ids: string[];
  layout: "grid-2" | "grid-3" | "grid-4";
}

export interface BannerData {
  image_url: string;
  link?: string;
}

export interface TestimonialItem {
  name: string;
  text: string;
  rating: number;
}

export interface TestimonialData {
  title?: string;
  items: TestimonialItem[];
  /** "grid" (default) = kartu sejajar | "highlight" = kartu besar + 2 kecil */
  layout?: "grid" | "highlight";
}

export interface AboutData {
  title: string;
  content: string;
  /** "split" (default) = heading kiri, konten kanan | "centered" = teks tengah */
  layout?: "split" | "centered";
}

export interface FeatureItem {
  title: string;
  description: string;
}

export interface FeaturesData {
  title?: string;
  items: FeatureItem[];
  /** "cards" (default) = kotak card | "numbered" = list bernomor | "icon_left" = ikon kiri teks */
  variant?: "cards" | "numbered" | "icon_left";
  /** "muted" (default) = bg abu muda | "white" = bg putih | "primary" = bg brand berwarna */
  bg?: "muted" | "white" | "primary";
}

export interface CtaData {
  title: string;
  subtitle?: string;
  button_text: string;
  button_link: string;
  /** "solid" (default) = bg brand solid | "gradient" = gradient brand ke gelap | "outline" = border saja */
  variant?: "solid" | "gradient" | "outline";
}

export interface ContactData {
  address?: string;
  phone?: string;
  email?: string;
  hours?: string;
  map_embed_url?: string;
}

export interface FaqData {
  title?: string;
  items: FaqItem[];
  /** "accordion" (default) = lipat/buka | "list" = tampil semua sekaligus */
  variant?: "accordion" | "list";
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ProductHighlightData {
  product_id: string;
  headline?: string;
  /** "default" = gambar kiri teks kanan | "reversed" = teks kiri gambar kanan */
  layout?: "default" | "reversed";
}

export type Block =
  | BlockBase<"hero", HeroData>
  | BlockBase<"featured_products", FeaturedProductsData>
  | BlockBase<"banner", BannerData>
  | BlockBase<"testimonial", TestimonialData>
  | BlockBase<"about", AboutData>
  | BlockBase<"features", FeaturesData>
  | BlockBase<"cta", CtaData>
  | BlockBase<"contact", ContactData>
  | BlockBase<"faq", FaqData>
  | BlockBase<"product_highlight", ProductHighlightData>;

export function parseBlocks(json: unknown): Block[] {
  if (!Array.isArray(json)) return [];
  return json as Block[];
}

export function blocksToJson(blocks: Block[]) {
  return JSON.parse(JSON.stringify(blocks));
}
