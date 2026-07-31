"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStoreOwner } from "@/lib/session";
import { storeSettingsSchema } from "@/lib/validations";
import { SITE_TYPES } from "@/lib/site-types";
import { TEMPLATE_PRESETS } from "@/lib/templates";
import { ensureRequiredPages } from "@/lib/ensure-required-pages";

export async function updateStoreProfile(formData: FormData) {
  const session = await requireStoreOwner();

  const parsed = storeSettingsSchema
    .pick({ name: true, themeColor: true, logoUrl: true, bannerUrl: true })
    .extend({ siteType: z.enum(SITE_TYPES), templateId: z.enum(TEMPLATE_PRESETS) })
    .safeParse({
      name: formData.get("name"),
      themeColor: formData.get("themeColor"),
      logoUrl: formData.get("logoUrl") || "",
      bannerUrl: formData.get("bannerUrl") || "",
      siteType: formData.get("siteType"),
      templateId: formData.get("templateId"),
    });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Data tidak valid");

  const { name, themeColor, logoUrl, bannerUrl, siteType, templateId } = parsed.data;

  const store = await prisma.store.update({
    where: { id: session.user.storeId },
    data: {
      name,
      themeColor,
      logoUrl: logoUrl || null,
      bannerUrl: bannerUrl || null,
      siteType,
      templateId,
    },
  });

  await ensureRequiredPages(session.user.storeId, siteType, name, store.industry);

  revalidatePath("/dashboard/pengaturan");
  revalidatePath("/dashboard", "layout");
}

export async function updateStoreSettings(formData: FormData) {
  const session = await requireStoreOwner();

  const parsed = storeSettingsSchema
    .pick({ whatsappNumber: true, shippingOriginCity: true, shippingOriginProvince: true })
    .safeParse({
      whatsappNumber: formData.get("whatsappNumber") || "",
      shippingOriginCity: formData.get("shippingOriginCity") || "",
      shippingOriginProvince: formData.get("shippingOriginProvince") || "",
    });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Data tidak valid");

  const { whatsappNumber, shippingOriginCity, shippingOriginProvince } = parsed.data;

  await prisma.storeSettings.update({
    where: { storeId: session.user.storeId },
    data: {
      whatsappNumber: whatsappNumber || null,
      shippingOriginCity: shippingOriginCity || null,
      shippingOriginProvince: shippingOriginProvince || null,
    },
  });

  revalidatePath("/dashboard/pengaturan");
}

export async function updatePaymentSettings(formData: FormData) {
  const session = await requireStoreOwner();

  const parsed = storeSettingsSchema
    .pick({
      flatShippingCost: true,
      midtransServerKey: true,
      midtransClientKey: true,
      midtransIsProduction: true,
      qrisImageUrl: true,
    })
    .safeParse({
      flatShippingCost: formData.get("flatShippingCost") || 0,
      midtransServerKey: formData.get("midtransServerKey") || "",
      midtransClientKey: formData.get("midtransClientKey") || "",
      midtransIsProduction: formData.get("midtransIsProduction") === "on",
      qrisImageUrl: formData.get("qrisImageUrl") || "",
    });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Data tidak valid");

  const { flatShippingCost, midtransServerKey, midtransClientKey, midtransIsProduction, qrisImageUrl } =
    parsed.data;

  await prisma.storeSettings.update({
    where: { storeId: session.user.storeId },
    data: {
      flatShippingCost,
      midtransClientKey: midtransClientKey || null,
      midtransIsProduction,
      qrisImageUrl: qrisImageUrl || null,
      ...(midtransServerKey ? { midtransServerKey } : {}),
    },
  });

  revalidatePath("/dashboard/pengaturan");
}

export async function updateWhatsAppApiSettings(formData: FormData) {
  const session = await requireStoreOwner();

  const parsed = storeSettingsSchema
    .pick({
      whatsappApiUrl: true,
      whatsappApiKey: true,
      whatsappApiKeyHeader: true,
      whatsappApiKeyPrefix: true,
      whatsappTargetField: true,
      whatsappMessageField: true,
    })
    .safeParse({
      whatsappApiUrl: formData.get("whatsappApiUrl") || "",
      whatsappApiKey: formData.get("whatsappApiKey") || "",
      whatsappApiKeyHeader: formData.get("whatsappApiKeyHeader") || "Authorization",
      whatsappApiKeyPrefix: formData.get("whatsappApiKeyPrefix") || "",
      whatsappTargetField: formData.get("whatsappTargetField") || "target",
      whatsappMessageField: formData.get("whatsappMessageField") || "message",
    });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Data tidak valid");

  const {
    whatsappApiUrl,
    whatsappApiKey,
    whatsappApiKeyHeader,
    whatsappApiKeyPrefix,
    whatsappTargetField,
    whatsappMessageField,
  } = parsed.data;

  await prisma.storeSettings.update({
    where: { storeId: session.user.storeId },
    data: {
      whatsappApiUrl: whatsappApiUrl || null,
      whatsappApiKeyHeader: whatsappApiKeyHeader || "Authorization",
      whatsappApiKeyPrefix: whatsappApiKeyPrefix ?? "",
      whatsappTargetField: whatsappTargetField || "target",
      whatsappMessageField: whatsappMessageField || "message",
      ...(whatsappApiKey ? { whatsappApiKey } : {}),
    },
  });

  revalidatePath("/dashboard/pengaturan");
}

const bankAccountSchema = z.object({
  bank: z.string().min(1),
  accountNumber: z.string().min(1),
  accountName: z.string().min(1),
});

export async function updateBankAccounts(accounts: z.infer<typeof bankAccountSchema>[]) {
  const session = await requireStoreOwner();
  const parsed = z.array(bankAccountSchema).safeParse(accounts);
  if (!parsed.success) throw new Error("Data rekening tidak valid");

  await prisma.storeSettings.update({
    where: { storeId: session.user.storeId },
    data: { bankAccounts: JSON.parse(JSON.stringify(parsed.data)) },
  });

  revalidatePath("/dashboard/pengaturan");
}

export async function updateStoreSEO(formData: FormData) {
  const session = await requireStoreOwner();

  const parsed = storeSettingsSchema
    .pick({
      seoTitle: true,
      seoDescription: true,
      seoImage: true,
      googleSiteVerification: true,
    })
    .safeParse({
      seoTitle: formData.get("seoTitle") || "",
      seoDescription: formData.get("seoDescription") || "",
      seoImage: formData.get("seoImage") || "",
      googleSiteVerification: formData.get("googleSiteVerification") || "",
    });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Data tidak valid");

  const { seoTitle, seoDescription, seoImage, googleSiteVerification } = parsed.data;

  await prisma.store.update({
    where: { id: session.user.storeId },
    data: {
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
      seoImage: seoImage || null,
      googleSiteVerification: googleSiteVerification || null,
    },
  });

  revalidatePath("/dashboard/pengaturan");
  revalidatePath("/dashboard", "layout");
}

export async function updateBrandingSettings(formData: FormData) {
  const session = await requireStoreOwner();
  const useGlobalHeader = formData.get("useGlobalHeader") === "on";
  const useLogo = formData.get("useLogo") === "on";
  const useFavicon = formData.get("useFavicon") === "on";
  const faviconUrl = formData.get("faviconUrl")?.toString() || null;

  await prisma.store.update({
    where: { id: session.user.storeId },
    data: { faviconUrl },
  });

  await prisma.storeSettings.update({
    where: { storeId: session.user.storeId },
    data: { useGlobalHeader, useLogo, useFavicon },
  });

  revalidatePath("/dashboard/pengaturan");
  revalidatePath("/[store]", "layout");
}

const menuSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(["page", "url"]),
  target: z.string().optional(),
  isVisible: z.boolean(),
});

export async function updateMenusAction(menus: z.infer<typeof menuSchema>[]) {
  const session = await requireStoreOwner();
  await prisma.storeSettings.update({
    where: { storeId: session.user.storeId },
    data: { headerMenus: JSON.parse(JSON.stringify(menus)) },
  });
  revalidatePath("/dashboard/pengaturan");
  revalidatePath("/[store]", "layout");
}

export async function createCustomPageAction(title: string) {
  const session = await requireStoreOwner();
  let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  if (!slug) slug = "halaman-baru";

  // check if slug exists
  const existing = await prisma.storePage.findFirst({
    where: { storeId: session.user.storeId, slug }
  });
  if (existing) slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;

  const page = await prisma.storePage.create({
    data: {
      storeId: session.user.storeId,
      pageType: "custom",
      title,
      slug,
      html: `<div class="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center" data-klikweb-id="blank-hero"><h1 class="text-4xl font-bold" data-klikweb-id="blank-h1">${title}</h1><p class="mt-4 text-gray-500" data-klikweb-id="blank-p">Halaman ini belum memiliki konten. Gunakan tab AI di Editor untuk mengisinya.</p></div>`
    }
  });

  return { ok: true, pageId: page.id, slug: page.slug };
}

export async function deleteCustomPageAction(pageId: string) {
  const session = await requireStoreOwner();
  await prisma.storePage.deleteMany({
    where: { id: pageId, storeId: session.user.storeId, pageType: "custom" }
  });
  // We do not automatically remove it from settings here, MenuManager will save updated menus
}
