export const SITE_TYPES = [
  "storefront",
  "sales_page",
  "landing_page",
  "company_profile",
] as const;

export type SiteType = (typeof SITE_TYPES)[number];

export const BLOCK_TYPES = [
  "hero",
  "featured_products",
  "banner",
  "testimonial",
  "about",
  "features",
  "cta",
  "contact",
  "faq",
  "product_highlight",
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

export const PAGE_TYPES = ["home", "about", "contact", "custom"] as const;
export type SitePageType = (typeof PAGE_TYPES)[number];

interface SiteTypePageConfig {
  pageType: Extract<SitePageType, "home" | "about" | "contact">;
  label: string;
  required: boolean;
}

export interface SiteTypeConfig {
  label: string;
  description: string;
  multiPage: boolean;
  pages: SiteTypePageConfig[];
  allowedBlocks: BlockType[];
  showProductsMenu: boolean;
  showCategoriesMenu: boolean;
  maxActiveProducts?: number;
}

export const SITE_TYPE_CONFIG: Record<SiteType, SiteTypeConfig> = {
  storefront: {
    label: "Storefront",
    description:
      "Toko online lengkap dengan katalog multi-produk, kategori, dan halaman detail produk.",
    multiPage: true,
    pages: [
      { pageType: "home", label: "Beranda", required: true },
      { pageType: "about", label: "Tentang", required: false },
      { pageType: "contact", label: "Kontak", required: false },
    ],
    allowedBlocks: [
      "hero",
      "featured_products",
      "banner",
      "testimonial",
      "about",
      "features",
      "cta",
    ],
    showProductsMenu: true,
    showCategoriesMenu: true,
  },
  sales_page: {
    label: "Sales Page",
    description:
      "Satu halaman fokus menjual 1 produk, dengan tombol pesan langsung lewat WhatsApp.",
    multiPage: false,
    pages: [{ pageType: "home", label: "Halaman Jualan", required: true }],
    allowedBlocks: [
      "hero",
      "product_highlight",
      "features",
      "testimonial",
      "faq",
      "cta",
    ],
    showProductsMenu: true,
    showCategoriesMenu: false,
    maxActiveProducts: 1,
  },
  landing_page: {
    label: "Landing Page",
    description:
      "Satu halaman panjang untuk promosi kampanye, jasa, atau produk tanpa katalog.",
    multiPage: false,
    pages: [{ pageType: "home", label: "Halaman Utama", required: true }],
    allowedBlocks: ["hero", "features", "banner", "testimonial", "faq", "cta"],
    showProductsMenu: false,
    showCategoriesMenu: false,
  },
  company_profile: {
    label: "Company Profile",
    description:
      "Situs informasi multi-halaman: beranda, tentang kami, kontak. Tanpa modul jual-beli.",
    multiPage: true,
    pages: [
      { pageType: "home", label: "Beranda", required: true },
      { pageType: "about", label: "Tentang Kami", required: true },
      { pageType: "contact", label: "Kontak", required: true },
    ],
    allowedBlocks: ["hero", "about", "features", "testimonial", "contact", "banner"],
    showProductsMenu: false,
    showCategoriesMenu: false,
  },
};

export const RESERVED_SLUGS = [
  "admin",
  "dashboard",
  "api",
  "login",
  "register",
  "produk",
  "tentang",
  "kontak",
  "checkout",
  "keranjang",
  "_next",
  "favicon.ico",
];

export function isReservedSlug(slug: string) {
  return RESERVED_SLUGS.includes(slug.toLowerCase());
}
