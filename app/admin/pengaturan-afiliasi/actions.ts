"use server";

import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function updateAffiliateStatus(id: string, status: "active" | "suspended" | "pending_review") {
  await requireSuperAdmin();
  await prisma.affiliateCode.update({
    where: { id },
    data: { status, isActive: status === "active" },
  });
  revalidatePath("/admin/pengaturan-afiliasi");
  return { ok: true };
}

export async function deleteAffiliate(id: string) {
  await requireSuperAdmin();
  await prisma.affiliateCode.delete({
    where: { id },
  });
  revalidatePath("/admin/pengaturan-afiliasi");
  return { ok: true };
}

export async function updateWithdrawalStatus(id: string, affiliateId: string, status: "approved" | "rejected", amount: number) {
  await requireSuperAdmin();

  if (status === "rejected") {
    // Return pending balance to affiliate
    await prisma.$transaction([
      prisma.affiliateWithdrawal.update({
        where: { id },
        data: { status, processedAt: new Date() },
      }),
      prisma.affiliateCode.update({
        where: { id: affiliateId },
        data: { pendingBalance: { increment: amount } },
      }),
    ]);
  } else if (status === "approved") {
    // Increase paidOut
    await prisma.$transaction([
      prisma.affiliateWithdrawal.update({
        where: { id },
        data: { status, processedAt: new Date() },
      }),
      prisma.affiliateCode.update({
        where: { id: affiliateId },
        data: { paidOut: { increment: amount } },
      }),
    ]);
  }

  revalidatePath("/admin/pengaturan-afiliasi");
  return { ok: true };
}
