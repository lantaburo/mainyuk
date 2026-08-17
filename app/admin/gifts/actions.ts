"use server";

import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createGlobalGift(formData: FormData) {
  try {
    const session = await requireAdmin();
    
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const priceStr = formData.get("price") as string;
    const price = parseInt(priceStr, 10);

    if (!title || !price || isNaN(price)) {
      return { ok: false, error: "Judul dan Harga Bintang wajib diisi dengan benar." };
    }

    await prisma.marketplaceItem.create({
      data: {
        title,
        description,
        price,
        creatorId: session.user.id,
        isGlobal: true // Global gift available to all
      }
    });

    revalidatePath("/admin/gifts");
    revalidatePath("/dashboard/marketplace");
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Gagal menyimpan hadiah global." };
  }
}

export async function deleteGlobalGift(id: string) {
  try {
    await requireAdmin();
    
    await prisma.marketplaceItem.deleteMany({
      where: {
        id,
        isGlobal: true
      }
    });

    revalidatePath("/admin/gifts");
    revalidatePath("/dashboard/marketplace");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: "Gagal menghapus hadiah global." };
  }
}

export async function markGlobalClaimFulfilled(claimId: string) {
  try {
    await requireAdmin();
    
    const claim = await prisma.rewardClaim.findUnique({
      where: { id: claimId },
      include: { item: true }
    });

    if (!claim || !claim.item.isGlobal) {
      return { ok: false, error: "Unauthorized" };
    }

    await prisma.rewardClaim.update({
      where: { id: claimId },
      data: { 
        status: "fulfilled",
        fulfilledAt: new Date()
      }
    });

    revalidatePath("/admin/gifts");
    revalidatePath("/dashboard/marketplace");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: "Gagal update status." };
  }
}
