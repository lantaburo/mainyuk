import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyMidtransSignature, mapMidtransStatusToOrderStatus } from "@/lib/midtrans";
import { notifyOrderPaid } from "@/lib/notifications";

export async function POST(req: Request) {
  const payload = await req.json().catch(() => null);
  if (
    !payload?.order_id ||
    !payload?.status_code ||
    !payload?.gross_amount ||
    !payload?.signature_key ||
    !payload?.transaction_status
  ) {
    return NextResponse.json({ error: "Payload tidak lengkap" }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: { orderNumber: payload.order_id },
    include: { store: { include: { settings: true } }, customer: true },
  });
  if (!order) {
    return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
  }

  const serverKey = order.store.settings?.midtransServerKey;
  if (!serverKey) {
    return NextResponse.json({ error: "Toko belum mengaktifkan Midtrans" }, { status: 400 });
  }

  const validSignature = verifyMidtransSignature(
    {
      order_id: payload.order_id,
      status_code: payload.status_code,
      gross_amount: payload.gross_amount,
      signature_key: payload.signature_key,
    },
    serverKey
  );
  if (!validSignature) {
    return NextResponse.json({ error: "Signature tidak valid" }, { status: 403 });
  }

  const newStatus = mapMidtransStatusToOrderStatus(payload.transaction_status);

  await prisma.payment.create({
    data: {
      orderId: order.id,
      provider: "midtrans",
      status: payload.transaction_status,
      rawPayload: payload,
      paidAt: newStatus === "paid" ? new Date() : null,
    },
  });

  const previousStatus = order.status;

  await prisma.order.update({
    where: { id: order.id },
    data: { status: newStatus },
  });

  if (newStatus === "paid" && previousStatus !== "paid" && order.customer && order.store.settings) {
    await notifyOrderPaid({
      settings: order.store.settings,
      buyerPhone: order.customer.phone,
      storeName: order.store.name,
      orderNumber: order.orderNumber,
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
