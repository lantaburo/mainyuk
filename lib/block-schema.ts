import { z } from "zod";
import { BLOCK_TYPES } from "@/lib/site-types";

const heroData = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  image_url: z.string().optional(),
  cta_text: z.string().optional(),
  cta_link: z.string().optional(),
});

const featuredProductsData = z.object({
  title: z.string(),
  product_ids: z.array(z.string()).default([]),
  layout: z.enum(["grid-2", "grid-3", "grid-4"]),
});

const bannerData = z.object({
  image_url: z.string(),
  link: z.string().optional(),
});

const testimonialData = z.object({
  title: z.string().optional(),
  items: z.array(
    z.object({
      name: z.string(),
      text: z.string(),
      rating: z.coerce.number().int().min(1).max(5),
    })
  ),
});

const aboutData = z.object({
  title: z.string(),
  content: z.string(),
});

const featuresData = z.object({
  title: z.string().optional(),
  items: z.array(z.object({ title: z.string(), description: z.string() })),
});

const ctaData = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  button_text: z.string(),
  button_link: z.string(),
});

const contactData = z.object({
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  hours: z.string().optional(),
  map_embed_url: z.string().optional(),
});

const faqData = z.object({
  title: z.string().optional(),
  items: z.array(z.object({ question: z.string(), answer: z.string() })),
});

const productHighlightData = z.object({
  product_id: z.string().default(""),
  headline: z.string().optional(),
});

const blockSchema = z.discriminatedUnion("type", [
  z.object({ id: z.string(), type: z.literal("hero"), order: z.coerce.number(), data: heroData }),
  z.object({
    id: z.string(),
    type: z.literal("featured_products"),
    order: z.coerce.number(),
    data: featuredProductsData,
  }),
  z.object({
    id: z.string(),
    type: z.literal("banner"),
    order: z.coerce.number(),
    data: bannerData,
  }),
  z.object({
    id: z.string(),
    type: z.literal("testimonial"),
    order: z.coerce.number(),
    data: testimonialData,
  }),
  z.object({ id: z.string(), type: z.literal("about"), order: z.coerce.number(), data: aboutData }),
  z.object({
    id: z.string(),
    type: z.literal("features"),
    order: z.coerce.number(),
    data: featuresData,
  }),
  z.object({ id: z.string(), type: z.literal("cta"), order: z.coerce.number(), data: ctaData }),
  z.object({
    id: z.string(),
    type: z.literal("contact"),
    order: z.coerce.number(),
    data: contactData,
  }),
  z.object({ id: z.string(), type: z.literal("faq"), order: z.coerce.number(), data: faqData }),
  z.object({
    id: z.string(),
    type: z.literal("product_highlight"),
    order: z.coerce.number(),
    data: productHighlightData,
  }),
]);

export const blockArraySchema = z.array(blockSchema).min(1);

export function isAllowedBlockType(type: string): type is (typeof BLOCK_TYPES)[number] {
  return (BLOCK_TYPES as readonly string[]).includes(type);
}
