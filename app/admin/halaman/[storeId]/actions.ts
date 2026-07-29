"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { blocksToJson, type Block } from "@/lib/blocks-types";

export async function updatePageBlocksByAdmin(pageId: string, blocks: Block[]) {
  await requireAdmin();

  const page = await prisma.storePage.findUnique({
    where: { id: pageId },
  });
  if (!page) throw new Error("Halaman tidak ditemukan");

  await prisma.storePage.update({
    where: { id: pageId },
    data: { blocks: blocksToJson(blocks) },
  });

  revalidatePath(`/admin/halaman/${page.storeId}`);
  revalidatePath("/[store]", "layout");
}
