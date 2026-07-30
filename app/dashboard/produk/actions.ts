"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStoreOwner } from "@/lib/session";
import { productSchema } from "@/lib/validations";

async function assertProductOwnership(productId: string, storeId: string) {
  const product = await prisma.product.findFirst({ where: { id: productId, storeId } });
  if (!product) throw new Error("Produk tidak ditemukan");
  return product;
}

export async function createProduct(formData: FormData) {
  const session = await requireStoreOwner();
  
  const slugInput = formData.get("slug")?.toString() || "";
  const slug = slugInput.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    slug: slug,
    description: formData.get("description") || undefined,
    price: formData.get("price"),
    stock: formData.get("stock"),
    categoryId: formData.get("categoryId") || null,
    status: formData.get("status"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Data tidak valid");

  const imageUrl = formData.get("imageUrl")?.toString();

  const product = await prisma.product.create({
    data: { 
      ...parsed.data, 
      storeId: session.user.storeId,
      images: imageUrl ? { create: { url: imageUrl, order: 0 } } : undefined
    },
  });

  revalidatePath("/dashboard/produk");
  redirect(`/dashboard/produk/${product.id}`);
}

export async function updateProduct(productId: string, formData: FormData) {
  const session = await requireStoreOwner();
  await assertProductOwnership(productId, session.user.storeId);

  const slugInput = formData.get("slug")?.toString() || "";
  const slug = slugInput.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    slug: slug,
    description: formData.get("description") || undefined,
    price: formData.get("price"),
    stock: formData.get("stock"),
    categoryId: formData.get("categoryId") || null,
    status: formData.get("status"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Data tidak valid");

  await prisma.product.update({ where: { id: productId }, data: parsed.data });

  revalidatePath("/dashboard/produk");
  revalidatePath(`/dashboard/produk/${productId}`);
}

export async function deleteProduct(productId: string) {
  const session = await requireStoreOwner();
  await assertProductOwnership(productId, session.user.storeId);

  await prisma.product.delete({ where: { id: productId } });

  revalidatePath("/dashboard/produk");
  redirect("/dashboard/produk");
}

const variantSchema = z.object({
  name: z.string().min(1, "Nama varian wajib diisi"),
  priceOverride: z.coerce.number().min(0).optional().nullable(),
  stock: z.coerce.number().int().min(0),
});

export async function addVariant(productId: string, formData: FormData) {
  const session = await requireStoreOwner();
  await assertProductOwnership(productId, session.user.storeId);

  const priceOverrideRaw = formData.get("priceOverride");
  const parsed = variantSchema.safeParse({
    name: formData.get("name"),
    priceOverride: priceOverrideRaw ? priceOverrideRaw : null,
    stock: formData.get("stock"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Data tidak valid");

  await prisma.productVariant.create({
    data: { productId, ...parsed.data },
  });

  revalidatePath(`/dashboard/produk/${productId}`);
}

export async function deleteVariant(variantId: string, productId: string) {
  const session = await requireStoreOwner();
  await assertProductOwnership(productId, session.user.storeId);

  await prisma.productVariant.delete({ where: { id: variantId } });

  revalidatePath(`/dashboard/produk/${productId}`);
}

const imageSchema = z.object({
  url: z.string().url("URL gambar tidak valid"),
  order: z.coerce.number().int().min(0).default(0),
});

export async function addImage(productId: string, formData: FormData) {
  const session = await requireStoreOwner();
  await assertProductOwnership(productId, session.user.storeId);

  const parsed = imageSchema.safeParse({
    url: formData.get("url"),
    order: formData.get("order") || 0,
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Data tidak valid");

  await prisma.productImage.create({ data: { productId, ...parsed.data } });

  revalidatePath(`/dashboard/produk/${productId}`);
}

export async function deleteImage(imageId: string, productId: string) {
  const session = await requireStoreOwner();
  await assertProductOwnership(productId, session.user.storeId);

  await prisma.productImage.delete({ where: { id: imageId } });

  revalidatePath(`/dashboard/produk/${productId}`);
}
