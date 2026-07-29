"use server";

import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/validations";
import { createSnapTransaction, MidtransError } from "@/lib/midtrans";
import { notifyNewOrder } from "@/lib/notifications";
import type { CartItem } from "@/lib/cart-types";

type CreateOrderResult =
  | { ok: true; orderNumber: string; redirectUrl?: string }
  | { ok: false; error: string };

export async function createOrder(
  storeSlug: string,
  items: CartItem[],
  buyer: unknown
): Promise<CreateOrderResult> {
  const parsedBuyer = checkoutSchema.safeParse(buyer);
  if (!parsedBuyer.success) {
    return { ok: false, error: parsedBuyer.error.issues[0]?.message ?? "Data tidak valid" };
  }
  if (items.length === 0) {
    return { ok: false, error: "Keranjang belanja kosong" };
  }

  const store = await prisma.store.findUnique({
    where: { slug: storeSlug },
    include: { settings: true },
  });
  if (!store || store.siteType !== "storefront") {
    return { ok: false, error: "Toko tidak ditemukan" };
  }

  const productIds = Array.from(new Set(items.map((i) => i.productId)));
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, storeId: store.id, status: "published" },
    include: { variants: true },
  });

  let subtotal = 0;
  const orderItemsData: { productId: string; variantId: string | null; qty: number; price: number }[] =
    [];

  for (const cartItem of items) {
    const product = products.find((p) => p.id === cartItem.productId);
    if (!product) {
      return { ok: false, error: `Produk "${cartItem.name}" sudah tidak tersedia` };
    }
    const variant = cartItem.variantId
      ? product.variants.find((v) => v.id === cartItem.variantId)
      : null;
    const availableStock = variant ? variant.stock : product.stock;
    if (availableStock < cartItem.qty) {
      return { ok: false, error: `Stok "${product.name}" tidak mencukupi` };
    }
    const price = variant?.priceOverride ? Number(variant.priceOverride) : Number(product.price);
    subtotal += price * cartItem.qty;
    orderItemsData.push({
      productId: product.id,
      variantId: variant?.id ?? null,
      qty: cartItem.qty,
      price,
    });
  }

  const shippingCost = Number(store.settings?.flatShippingCost ?? 0);
  const total = subtotal + shippingCost;
  const orderNumber = `ORD${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const customer = await prisma.customer.create({
    data: {
      storeId: store.id,
      name: parsedBuyer.data.name,
      phone: parsedBuyer.data.phone,
      email: parsedBuyer.data.email || null,
      address: { text: parsedBuyer.data.address },
    },
  });

  const order = await prisma.order.create({
    data: {
      storeId: store.id,
      customerId: customer.id,
      orderNumber,
      status: "pending",
      subtotal,
      shippingCost,
      total,
      shippingAddress: { text: parsedBuyer.data.address },
      paymentMethod: parsedBuyer.data.paymentMethod,
      items: { create: orderItemsData },
    },
  });

  if (store.settings) {
    await notifyNewOrder({
      settings: store.settings,
      ownerPhone: store.settings.whatsappNumber,
      buyerPhone: parsedBuyer.data.phone,
      storeName: store.name,
      orderNumber,
      total,
    }).catch(() => {});
  }

  if (parsedBuyer.data.paymentMethod === "midtrans") {
    if (!store.settings?.midtransServerKey) {
      return { ok: false, error: "Toko belum mengaktifkan pembayaran Midtrans" };
    }
    try {
      const { redirectUrl } = await createSnapTransaction(
        {
          serverKey: store.settings.midtransServerKey,
          isProduction: store.settings.midtransIsProduction,
        },
        {
          orderNumber,
          grossAmount: total,
          customerName: parsedBuyer.data.name,
          customerPhone: parsedBuyer.data.phone,
          customerEmail: parsedBuyer.data.email,
        }
      );
      await prisma.order.update({
        where: { id: order.id },
        data: { midtransTransactionId: orderNumber },
      });
      return { ok: true, orderNumber, redirectUrl };
    } catch (err) {
      const message = err instanceof MidtransError ? err.message : "Gagal membuat transaksi Midtrans";
      return { ok: false, error: message };
    }
  }

  return { ok: true, orderNumber };
}
