"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireSuperAdmin } from "@/lib/session";
import { blocksToJson, type Block } from "@/lib/blocks-types";

const statusSchema = z.enum(["active", "suspended", "trial"]);

export async function updateStoreStatus(storeId: string, formData: FormData) {
  await requireAdmin();

  const parsed = statusSchema.safeParse(formData.get("status"));
  if (!parsed.success) throw new Error("Status tidak valid");

  await prisma.store.update({
    where: { id: storeId },
    data: { status: parsed.data },
  });

  revalidatePath("/admin");
}

export async function deleteStore(storeId: string) {
  await requireAdmin();

  await prisma.store.delete({ where: { id: storeId } });

  revalidatePath("/admin");
}




export async function updateAdminPageBlocks(pageId: string, blocks: Block[]) {
  await requireAdmin();

  const page = await prisma.storePage.findUnique({
    where: { id: pageId },
    include: { store: true }
  });
  if (!page) throw new Error("Halaman tidak ditemukan");

  await prisma.storePage.update({
    where: { id: pageId },
    data: { blocks: blocksToJson(blocks) },
  });

  revalidatePath("/admin/generator-ai");
  revalidatePath(`/${page.store.slug}`, "layout");
}
