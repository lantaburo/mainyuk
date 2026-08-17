"use server";

import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createGift(formData: FormData) {
  try {
    const session = await requireAuth();
    
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
        isGlobal: false // Parent-created gifts are not global
      }
    });

    revalidatePath("/dashboard/parents/gifts");
    revalidatePath("/dashboard/marketplace");
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Gagal menyimpan hadiah." };
  }
}

export async function deleteGift(id: string) {
  try {
    const session = await requireAuth();
    
    await prisma.marketplaceItem.deleteMany({
      where: {
        id,
        creatorId: session.user.id
      }
    });

    revalidatePath("/dashboard/parents/gifts");
    revalidatePath("/dashboard/marketplace");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: "Gagal menghapus hadiah." };
  }
}

export async function markClaimFulfilled(claimId: string) {
  try {
    const session = await requireAuth();
    
    // Ensure the claim belongs to an item created by this parent
    const claim = await prisma.rewardClaim.findUnique({
      where: { id: claimId },
      include: { item: true }
    });

    if (!claim || claim.item.creatorId !== session.user.id) {
      return { ok: false, error: "Unauthorized" };
    }

    await prisma.rewardClaim.update({
      where: { id: claimId },
      data: { 
        status: "fulfilled",
        fulfilledAt: new Date()
      }
    });

    revalidatePath("/dashboard/parents/gifts");
    revalidatePath("/dashboard/marketplace");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: "Gagal update status." };
  }
}
