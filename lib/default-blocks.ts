import type { SiteType } from "@/lib/site-types";
import type { Block } from "@/lib/blocks-types";
import { INDUSTRY_CONTENT, type Industry } from "@/lib/industry-content";

export function getDefaultHomeBlocks(
  siteType: SiteType,
  storeName: string,
  industry: Industry
): Block[] {
  const content = INDUSTRY_CONTENT[industry];

  const hero: Block = {
    id: "block-hero",
    type: "hero",
    order: 1,
    data: {
      title: storeName,
      subtitle: content.heroSubtitle(storeName),
      cta_text: "Selengkapnya",
      cta_link: "#",
    },
  };

  switch (siteType) {
    case "storefront":
      return [
        hero,
        {
          id: "block-featured",
          type: "featured_products",
          order: 2,
          data: { title: content.featuredProductsTitle, product_ids: [], layout: "grid-3" },
        },
      ];
    case "sales_page":
      return [
        hero,
        {
          id: "block-features",
          type: "features",
          order: 2,
          data: { title: content.featuresTitle, items: content.featureItems },
        },
        {
          id: "block-cta",
          type: "cta",
          order: 3,
          data: {
            title: "Tertarik dengan produk ini?",
            button_text: "Pesan via WhatsApp",
            button_link: "#",
          },
        },
      ];
    case "landing_page":
      return [
        hero,
        {
          id: "block-features",
          type: "features",
          order: 2,
          data: { title: content.featuresTitle, items: content.featureItems },
        },
        {
          id: "block-cta",
          type: "cta",
          order: 3,
          data: { title: "Mulai Sekarang", button_text: "Hubungi Kami", button_link: "#" },
        },
      ];
    case "company_profile":
      return [
        hero,
        {
          id: "block-features",
          type: "features",
          order: 2,
          data: { title: content.featuresTitle, items: content.featureItems },
        },
      ];
  }
}

export function getDefaultAboutBlocks(storeName: string, industry: Industry): Block[] {
  const content = INDUSTRY_CONTENT[industry];
  return [
    {
      id: "block-about",
      type: "about",
      order: 1,
      data: {
        title: "Tentang " + storeName,
        content: content.aboutContent(storeName),
      },
    },
  ];
}

export function getDefaultContactBlocks(): Block[] {
  return [
    {
      id: "block-contact",
      type: "contact",
      order: 1,
      data: {},
    },
  ];
}
