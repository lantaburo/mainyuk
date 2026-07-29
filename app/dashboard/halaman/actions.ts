"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStoreOwner } from "@/lib/session";
import { blocksToJson, type Block } from "@/lib/blocks-types";

export async function updatePageBlocks(pageId: string, blocks: Block[]) {
  const session = await requireStoreOwner();

  const page = await prisma.storePage.findFirst({
    where: { id: pageId, storeId: session.user.storeId },
  });
  if (!page) throw new Error("Halaman tidak ditemukan");

  await prisma.storePage.update({
    where: { id: pageId },
    data: { blocks: blocksToJson(blocks) },
  });

  revalidatePath("/dashboard/halaman");
  revalidatePath("/[store]", "layout");
}
