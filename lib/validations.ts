import { z } from "zod";
import { SITE_TYPES } from "@/lib/site-types";
import { INDUSTRIES } from "@/lib/industry-content";
import { TEMPLATE_PRESETS } from "@/lib/templates";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const slugSchema = z
  .string()
  .min(3, "Minimal 3 karakter")
  .max(60, "Maksimal 60 karakter")
  .regex(slugRegex, "Hanya huruf kecil, angka, dan tanda hubung (-)");

export const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  storeName: z.string().min(2, "Nama toko minimal 2 karakter"),
  storeSlug: slugSchema,
  siteType: z.enum(SITE_TYPES),
  industry: z.enum(INDUSTRIES),
  templateId: z.enum(TEMPLATE_PRESETS),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password wajib diisi"),
});

export const productSchema = z.object({
  name: z.string().min(2, "Nama produk minimal 2 karakter"),
  slug: slugSchema,
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Harga tidak boleh negatif"),
  stock: z.coerce.number().int().min(0, "Stok tidak boleh negatif"),
  categoryId: z.string().optional().nullable(),
  status: z.enum(["draft", "published"]),
});
export type ProductInput = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().min(2, "Nama kategori minimal 2 karakter"),
  slug: slugSchema,
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const articleSchema = z.object({
  title: z.string().min(2, "Judul artikel minimal 2 karakter"),
  slug: slugSchema,
  content: z.string().min(5, "Konten wajib diisi"),
  excerpt: z.string().optional().or(z.literal("")),
  thumbnail: z.string().url().optional().or(z.literal("")),
  seoTitle: z.string().optional().or(z.literal("")),
  seoDescription: z.string().optional().or(z.literal("")),
  status: z.enum(["draft", "published"]),
});
export type ArticleInput = z.infer<typeof articleSchema>;

export const storeSettingsSchema = z.object({
  name: z.string().min(2),
  themeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Format warna harus HEX, contoh #16a34a"),
  logoUrl: z.string().url().optional().or(z.literal("")),
  bannerUrl: z.string().url().optional().or(z.literal("")),
  whatsappNumber: z.string().optional().or(z.literal("")),
  shippingOriginCity: z.string().optional().or(z.literal("")),
  shippingOriginProvince: z.string().optional().or(z.literal("")),
  flatShippingCost: z.coerce.number().min(0).optional(),
  midtransServerKey: z.string().optional().or(z.literal("")),
  midtransClientKey: z.string().optional().or(z.literal("")),
  midtransIsProduction: z.coerce.boolean().optional(),
  qrisImageUrl: z.string().url().optional().or(z.literal("")),
  whatsappApiUrl: z.string().url().optional().or(z.literal("")),
  whatsappApiKey: z.string().optional().or(z.literal("")),
  whatsappApiKeyHeader: z.string().min(1).optional(),
  whatsappApiKeyPrefix: z.string().optional(),
  whatsappTargetField: z.string().min(1).optional(),
  whatsappMessageField: z.string().min(1).optional(),
  seoTitle: z.string().optional().or(z.literal("")),
  seoDescription: z.string().optional().or(z.literal("")),
  seoImage: z.string().url().optional().or(z.literal("")),
  googleSiteVerification: z.string().optional().or(z.literal("")),
});
export type StoreSettingsInput = z.infer<typeof storeSettingsSchema>;

export const checkoutSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  phone: z.string().min(6, "Nomor telepon tidak valid"),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  address: z.string().min(5, "Alamat minimal 5 karakter"),
  paymentMethod: z.enum(["midtrans", "qris", "bank_transfer"]),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;
