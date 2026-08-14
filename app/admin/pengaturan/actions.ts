"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/session";

// ─── System Settings helpers ──────────────────────────────────────────────────

export async function getSettings(keys: string[]) {
  const rows = await prisma.systemSetting.findMany({ where: { key: { in: keys } } });
  return Object.fromEntries(rows.map(r => [r.key, r.value]));
}

export async function saveSettings(data: Record<string, string>) {
  await requireSuperAdmin();
  await prisma.$transaction(
    Object.entries(data).map(([key, value]) =>
      prisma.systemSetting.upsert({ where: { key }, update: { value }, create: { key, value } })
    )
  );
  revalidatePath("/admin/pengaturan-pembayaran");
  return { ok: true };
}

// ─── Discount Codes ───────────────────────────────────────────────────────────

export async function createDiscountCode(data: {
  code: string;
  description: string;
  type: "percentage" | "fixed";
  discountPct?: number;
  discountAmt?: number;
  minOrder?: number;
  maxUses?: number;
  expiresAt?: string;
}) {
  await requireSuperAdmin();
  const code = await prisma.discountCode.create({
    data: {
      code: data.code.toUpperCase().trim(),
      description: data.description,
      type: data.type,
      discountPct: data.type === "percentage" && data.discountPct ? data.discountPct : null,
      discountAmt: data.type === "fixed" && data.discountAmt ? data.discountAmt : null,
      minOrder: data.minOrder ?? null,
      maxUses: data.maxUses ?? null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    }
  });
  revalidatePath("/admin/pengaturan-diskon");
  return { ok: true, id: code.id };
}

export async function toggleDiscountCode(id: string, isActive: boolean) {
  await requireSuperAdmin();
  await prisma.discountCode.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/pengaturan-diskon");
  return { ok: true };
}

export async function deleteDiscountCode(id: string) {
  await requireSuperAdmin();
  await prisma.discountCode.delete({ where: { id } });
  revalidatePath("/admin/pengaturan-diskon");
  return { ok: true };
}

// ─── Affiliate Codes ──────────────────────────────────────────────────────────

export async function createAffiliateCode(data: {
  code: string;
  ownerName: string;
  ownerEmail: string;
  commissionPct: number;
}) {
  await requireSuperAdmin();
  const affiliate = await prisma.affiliateCode.create({
    data: {
      code: data.code.toUpperCase().trim(),
      ownerName: data.ownerName,
      ownerEmail: data.ownerEmail || null,
      commissionPct: data.commissionPct,
    }
  });
  revalidatePath("/admin/pengaturan-afiliasi");
  return { ok: true, id: affiliate.id };
}

export async function toggleAffiliateCode(id: string, isActive: boolean) {
  await requireSuperAdmin();
  await prisma.affiliateCode.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/pengaturan-afiliasi");
  return { ok: true };
}

export async function deleteAffiliateCode(id: string) {
  await requireSuperAdmin();
  await prisma.affiliateCode.delete({ where: { id } });
  revalidatePath("/admin/pengaturan-afiliasi");
  return { ok: true };
}
