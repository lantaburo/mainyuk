"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStoreOwner } from "@/lib/session";
import { categorySchema } from "@/lib/validations";

export async function createCategory(formData: FormData) {
  const session = await requireStoreOwner();
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Data tidak valid");

  await prisma.category.create({ data: { ...parsed.data, storeId: session.user.storeId } });

  revalidatePath("/dashboard/kategori");
}

export async function deleteCategory(categoryId: string) {
  const session = await requireStoreOwner();
  const category = await prisma.category.findFirst({
    where: { id: categoryId, storeId: session.user.storeId },
  });
  if (!category) throw new Error("Kategori tidak ditemukan");

  await prisma.category.delete({ where: { id: categoryId } });

  revalidatePath("/dashboard/kategori");
}
