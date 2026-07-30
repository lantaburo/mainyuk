"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStoreOwner } from "@/lib/session";
import { articleSchema } from "@/lib/validations";
import { slugify } from "@/lib/slugify";

export async function createArticle(formData: FormData) {
  const session = await requireStoreOwner();

  const parsed = articleSchema.safeParse({
    title: formData.get("title"),
    slug: slugify(formData.get("slug") as string),
    content: formData.get("content"),
    excerpt: formData.get("excerpt") || "",
    thumbnail: formData.get("thumbnail") || "",
    seoTitle: formData.get("seoTitle") || "",
    seoDescription: formData.get("seoDescription") || "",
    status: formData.get("status"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Data tidak valid");

  const article = await prisma.article.create({
    data: { 
      ...parsed.data, 
      storeId: session.user.storeId,
      publishedAt: parsed.data.status === "published" ? new Date() : null,
    },
  });

  revalidatePath("/dashboard/artikel");
  redirect(`/dashboard/artikel/${article.id}`);
}

export async function updateArticle(id: string, formData: FormData) {
  const session = await requireStoreOwner();

  const parsed = articleSchema.safeParse({
    title: formData.get("title"),
    slug: slugify(formData.get("slug") as string),
    content: formData.get("content"),
    excerpt: formData.get("excerpt") || "",
    thumbnail: formData.get("thumbnail") || "",
    seoTitle: formData.get("seoTitle") || "",
    seoDescription: formData.get("seoDescription") || "",
    status: formData.get("status"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Data tidak valid");

  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing || existing.storeId !== session.user.storeId) {
    throw new Error("Artikel tidak ditemukan");
  }

  const isPublishingNow = existing.status === "draft" && parsed.data.status === "published";

  await prisma.article.update({
    where: { id },
    data: {
      ...parsed.data,
      publishedAt: isPublishingNow ? new Date() : existing.publishedAt,
    },
  });

  revalidatePath("/dashboard/artikel");
  revalidatePath(`/dashboard/artikel/${id}`);
}

export async function deleteArticle(id: string) {
  const session = await requireStoreOwner();
  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing || existing.storeId !== session.user.storeId) {
    throw new Error("Artikel tidak ditemukan");
  }

  await prisma.article.delete({ where: { id } });
  revalidatePath("/dashboard/artikel");
  redirect("/dashboard/artikel");
}
