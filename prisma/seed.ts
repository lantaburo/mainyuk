import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import { blocksToJson, type Block } from "../lib/blocks-types";
import type { SiteType } from "../lib/site-types";
import type { Industry } from "../lib/industry-content";
import type { TemplatePreset } from "../lib/templates";
import type { Product } from "../lib/generated/prisma/client";

type PageInput = { pageType: "home" | "about" | "contact"; blocks: Block[] };

async function seedStore(opts: {
  ownerEmail: string;
  ownerName: string;
  storeSlug: string;
  storeName: string;
  siteType: SiteType;
  industry: Industry;
  templateId: TemplatePreset;
  themeColor?: string;
  whatsappNumber: string;
  flatShippingCost?: number;
  qrisImageUrl?: string;
  bankAccounts?: { bank: string; accountNumber: string; accountName: string }[];
  pages: PageInput[] | ((products: Product[]) => PageInput[]);
  products?: {
    name: string;
    slug: string;
    description: string;
    price: number;
    stock: number;
    imageUrl?: string;
  }[];
}) {
  const passwordHash = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: opts.ownerEmail },
    update: {},
    create: { name: opts.ownerName, email: opts.ownerEmail, passwordHash, role: "store_owner" },
  });

  const store = await prisma.store.upsert({
    where: { slug: opts.storeSlug },
    update: {
      siteType: opts.siteType,
      name: opts.storeName,
      industry: opts.industry,
      templateId: opts.templateId,
    },
    create: {
      slug: opts.storeSlug,
      name: opts.storeName,
      siteType: opts.siteType,
      industry: opts.industry,
      templateId: opts.templateId,
      ownerId: user.id,
      status: "active",
      themeColor: opts.themeColor ?? "#16a34a",
    },
  });

  await prisma.storeSettings.upsert({
    where: { storeId: store.id },
    update: {
      whatsappNumber: opts.whatsappNumber,
      flatShippingCost: opts.flatShippingCost ?? 0,
      qrisImageUrl: opts.qrisImageUrl,
      bankAccounts: opts.bankAccounts ? JSON.parse(JSON.stringify(opts.bankAccounts)) : undefined,
    },
    create: {
      storeId: store.id,
      whatsappNumber: opts.whatsappNumber,
      shippingOriginCity: "Jakarta Selatan",
      shippingOriginProvince: "DKI Jakarta",
      flatShippingCost: opts.flatShippingCost ?? 0,
      qrisImageUrl: opts.qrisImageUrl,
      bankAccounts: opts.bankAccounts ? JSON.parse(JSON.stringify(opts.bankAccounts)) : undefined,
    },
  });

  const products = [];
  for (const p of opts.products ?? []) {
    const product = await prisma.product.upsert({
      where: { storeId_slug: { storeId: store.id, slug: p.slug } },
      update: {},
      create: {
        storeId: store.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        stock: p.stock,
        status: "published",
        images: p.imageUrl
          ? { create: [{ url: p.imageUrl, order: 0 }] }
          : undefined,
      },
    });
    products.push(product);
  }

  const pages = typeof opts.pages === "function" ? opts.pages(products) : opts.pages;

  for (const page of pages) {
    const existing = await prisma.storePage.findFirst({
      where: { storeId: store.id, pageType: page.pageType },
    });
    if (existing) {
      await prisma.storePage.update({
        where: { id: existing.id },
        data: { blocks: blocksToJson(page.blocks) },
      });
    } else {
      await prisma.storePage.create({
        data: { storeId: store.id, pageType: page.pageType, blocks: blocksToJson(page.blocks) },
      });
    }
  }

  return { store, products };
}

async function main() {
  // 0. Super admin (panel operator)
  const adminPasswordHash = await bcrypt.hash("password123", 10);
  await prisma.user.upsert({
    where: { email: "admin@mainyuk.my.id" },
    update: {},
    create: {
      name: "Operator mainyuk.my.id",
      email: "admin@mainyuk.my.id",
      passwordHash: adminPasswordHash,
      role: "super_admin",
    },
  });

  // 1. Storefront demo
  const { products: storefrontProducts } = await seedStore({
    ownerEmail: "owner-storefront@mainyuk.my.id",
    ownerName: "Budi (Storefront Demo)",
    storeSlug: "toko-demo",
    storeName: "Toko Demo Kaos",
    siteType: "storefront",
    industry: "fashion",
    templateId: "modern",
    whatsappNumber: "081234567890",
    flatShippingCost: 15000,
    qrisImageUrl: "https://images.unsplash.com/photo-1622037022824-0c71d511ad81?w=400",
    bankAccounts: [
      { bank: "BCA", accountNumber: "1234567890", accountName: "Budi Storefront Demo" },
    ],
    products: [
      {
        name: "Kaos Polos Hitam",
        slug: "kaos-polos-hitam",
        description: "Kaos cotton combed 24s, nyaman dipakai harian.",
        price: 85000,
        stock: 50,
        imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
      },
      {
        name: "Kaos Polos Putih",
        slug: "kaos-polos-putih",
        description: "Kaos cotton combed 24s warna putih.",
        price: 85000,
        stock: 40,
        imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800",
      },
      {
        name: "Hoodie Abu-abu",
        slug: "hoodie-abu-abu",
        description: "Hoodie fleece tebal, cocok untuk cuaca dingin.",
        price: 175000,
        stock: 20,
        imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800",
      },
    ],
    pages: [
      {
        pageType: "home",
        blocks: [
          {
            id: "block-hero",
            type: "hero",
            order: 1,
            data: {
              title: "Toko Demo Kaos",
              subtitle: "Kaos & hoodie berkualitas, langsung dari produsen",
              cta_text: "Belanja Sekarang",
              cta_link: "/toko-demo/produk",
            },
          },
          {
            id: "block-featured",
            type: "featured_products",
            order: 2,
            data: { title: "Produk Terlaris", product_ids: [], layout: "grid-3" },
          },
          {
            id: "block-testimonial",
            type: "testimonial",
            order: 3,
            data: {
              title: "Kata Pelanggan",
              items: [
                { name: "Sari", text: "Bahannya adem, jahitannya rapi!", rating: 5 },
                { name: "Andi", text: "Pengiriman cepat, sesuai deskripsi.", rating: 4 },
              ],
            },
          },
        ],
      },
    ],
  });

  // 2. Sales page demo
  const { products: salesProducts } = await seedStore({
    ownerEmail: "owner-sales@mainyuk.my.id",
    ownerName: "Sinta (Sales Page Demo)",
    storeSlug: "sales-demo",
    storeName: "Skincare Glow Serum",
    siteType: "sales_page",
    industry: "kecantikan",
    templateId: "classic",
    whatsappNumber: "081298765432",
    products: [
      {
        name: "Glow Serum 30ml",
        slug: "glow-serum-30ml",
        description: "Serum wajah dengan niacinamide 5% + vitamin C, mencerahkan kulit dalam 14 hari.",
        price: 149000,
        stock: 100,
        imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800",
      },
    ],
    pages: (products) => [
      {
        pageType: "home",
        blocks: [
          {
            id: "block-hero",
            type: "hero",
            order: 1,
            data: {
              title: "Glow Serum - Kulit Cerah Alami dalam 14 Hari",
              subtitle: "Diformulasikan dengan Niacinamide 5% & Vitamin C",
            },
          },
          {
            id: "block-highlight",
            type: "product_highlight",
            order: 2,
            data: {
              product_id: products[0]?.id ?? "",
              headline: "Best Seller Bulan Ini",
            },
          },
          {
            id: "block-features",
            type: "features",
            order: 3,
            data: {
              title: "Kenapa Pilih Glow Serum?",
              items: [
                { title: "BPOM Terdaftar", description: "Aman dan teruji secara klinis." },
                { title: "Cocok Semua Jenis Kulit", description: "Termasuk kulit sensitif." },
                { title: "Hasil Terlihat 14 Hari", description: "Kulit lebih cerah & merata." },
              ],
            },
          },
          {
            id: "block-cta",
            type: "cta",
            order: 4,
            data: {
              title: "Yuk, Mulai Rutinitas Glow-mu",
              button_text: "Pesan via WhatsApp",
              button_link: "#",
            },
          },
        ],
      },
    ],
  });

  // 3. Landing page demo
  await seedStore({
    ownerEmail: "owner-landing@mainyuk.my.id",
    ownerName: "Rudi (Landing Page Demo)",
    storeSlug: "landing-demo",
    storeName: "Kursus Digital Marketing",
    siteType: "landing_page",
    industry: "jasa",
    templateId: "minimalist",
    whatsappNumber: "081211122233",
    pages: [
      {
        pageType: "home",
        blocks: [
          {
            id: "block-hero",
            type: "hero",
            order: 1,
            data: {
              title: "Kuasai Digital Marketing dalam 30 Hari",
              subtitle: "Kelas online untuk UMKM & pemula, bimbingan langsung praktisi.",
              cta_text: "Daftar Sekarang",
              cta_link: "#",
            },
          },
          {
            id: "block-features",
            type: "features",
            order: 2,
            data: {
              title: "Yang Akan Kamu Pelajari",
              items: [
                { title: "Strategi Iklan", description: "Meta Ads & Google Ads dari nol." },
                { title: "Copywriting", description: "Menulis konten yang menjual." },
                { title: "Analitik", description: "Membaca data untuk keputusan bisnis." },
              ],
            },
          },
          {
            id: "block-faq",
            type: "faq",
            order: 3,
            data: {
              title: "Pertanyaan Umum",
              items: [
                { question: "Berapa lama akses materi?", answer: "Akses seumur hidup." },
                { question: "Apakah ada sertifikat?", answer: "Ya, setelah menyelesaikan semua modul." },
              ],
            },
          },
          {
            id: "block-cta",
            type: "cta",
            order: 4,
            data: {
              title: "Kelas Dimulai Minggu Depan",
              button_text: "Hubungi Kami",
              button_link: "#",
            },
          },
        ],
      },
    ],
  });

  // 4. Company profile demo
  await seedStore({
    ownerEmail: "owner-profile@mainyuk.my.id",
    ownerName: "Dewi (Company Profile Demo)",
    storeSlug: "profile-demo",
    storeName: "CV Maju Bersama",
    siteType: "company_profile",
    industry: "jasa",
    templateId: "classic",
    whatsappNumber: "081255566677",
    pages: [
      {
        pageType: "home",
        blocks: [
          {
            id: "block-hero",
            type: "hero",
            order: 1,
            data: {
              title: "CV Maju Bersama",
              subtitle: "Jasa konstruksi & renovasi terpercaya sejak 2015",
            },
          },
          {
            id: "block-features",
            type: "features",
            order: 2,
            data: {
              title: "Layanan Kami",
              items: [
                { title: "Renovasi Rumah", description: "Renovasi total maupun sebagian." },
                { title: "Bangun Baru", description: "Dari perencanaan hingga serah terima." },
                { title: "Konsultasi Desain", description: "Bersama arsitek berpengalaman." },
              ],
            },
          },
        ],
      },
      {
        pageType: "about",
        blocks: [
          {
            id: "block-about",
            type: "about",
            order: 1,
            data: {
              title: "Tentang CV Maju Bersama",
              content:
                "Kami adalah perusahaan konstruksi yang telah melayani lebih dari 200 klien di Jabodetabek sejak 2015. Berkomitmen pada kualitas dan ketepatan waktu.",
            },
          },
        ],
      },
      {
        pageType: "contact",
        blocks: [
          {
            id: "block-contact",
            type: "contact",
            order: 1,
            data: {
              address: "Jl. Merdeka No. 10, Jakarta Selatan",
              phone: "081255566677",
              email: "info@majubersama.co.id",
              hours: "Senin - Sabtu, 08.00 - 17.00",
            },
          },
        ],
      },
    ],
  });

  console.log("Seed selesai:");
  console.log("- mainyuk.my.id/toko-demo (storefront)", storefrontProducts.length, "produk");
  console.log("- mainyuk.my.id/sales-demo (sales_page)");
  console.log("- mainyuk.my.id/landing-demo (landing_page)");
  console.log("- mainyuk.my.id/profile-demo (company_profile)");
  console.log("Login owner: <email di atas> / password123");
  console.log("Login operator (/admin): admin@mainyuk.my.id / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
