"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStoreOwner } from "@/lib/session";
import { notifyOrderPaid } from "@/lib/notifications";

const statusSchema = z.enum(["pending", "paid", "processing", "shipped", "completed", "cancelled"]);

export async function updateOrderStatus(orderId: string, formData: FormData) {
  const session = await requireStoreOwner();

  const parsed = statusSchema.safeParse(formData.get("status"));
  if (!parsed.success) throw new Error("Status tidak valid");

  const order = await prisma.order.findFirst({
    where: { id: orderId, storeId: session.user.storeId },
    include: { customer: true, store: { include: { settings: true } } },
  });
  if (!order) throw new Error("Pesanan tidak ditemukan");

  await prisma.order.update({
    where: { id: orderId },
    data: { status: parsed.data },
  });

  if (parsed.data === "paid" && order.status !== "paid" && order.customer && order.store.settings) {
    await notifyOrderPaid({
      settings: order.store.settings,
      buyerPhone: order.customer.phone,
      storeName: order.store.name,
      orderNumber: order.orderNumber,
    }).catch(() => {});
  }

  revalidatePath("/dashboard/pesanan");
}
