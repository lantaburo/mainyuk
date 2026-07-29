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
}

export interface AboutData {
  title: string;
  content: string;
}

export interface FeatureItem {
  title: string;
  description: string;
}

export interface FeaturesData {
  title?: string;
  items: FeatureItem[];
}

export interface CtaData {
  title: string;
  subtitle?: string;
  button_text: string;
  button_link: string;
}

export interface ContactData {
  address?: string;
  phone?: string;
  email?: string;
  hours?: string;
  map_embed_url?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqData {
  title?: string;
  items: FaqItem[];
}

export interface ProductHighlightData {
  product_id: string;
  headline?: string;
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
