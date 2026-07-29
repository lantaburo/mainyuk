import type { BlockType } from "@/lib/site-types";
import type { Block } from "@/lib/blocks-types";

export function createEmptyBlock(type: BlockType, order: number): Block {
  const id = `block-${type}-${Date.now()}`;
  switch (type) {
    case "hero":
      return { id, type, order, data: { title: "" } };
    case "featured_products":
      return { id, type, order, data: { title: "", product_ids: [], layout: "grid-3" } };
    case "banner":
      return { id, type, order, data: { image_url: "" } };
    case "testimonial":
      return { id, type, order, data: { items: [] } };
    case "about":
      return { id, type, order, data: { title: "", content: "" } };
    case "features":
      return { id, type, order, data: { items: [] } };
    case "cta":
      return { id, type, order, data: { title: "", button_text: "", button_link: "#" } };
    case "contact":
      return { id, type, order, data: {} };
    case "faq":
      return { id, type, order, data: { items: [] } };
    case "product_highlight":
      return { id, type, order, data: { product_id: "" } };
  }
}

export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  hero: "Hero",
  featured_products: "Produk Pilihan",
  banner: "Banner",
  testimonial: "Testimoni",
  about: "Tentang",
  features: "Fitur / Layanan",
  cta: "Ajakan Bertindak (CTA)",
  contact: "Kontak",
  faq: "FAQ",
  product_highlight: "Sorotan Produk",
};
