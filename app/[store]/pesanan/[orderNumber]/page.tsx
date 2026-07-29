import { notFound } from "next/navigation";
import { getStoreBySlug } from "@/lib/store";
import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

const STATUS_LABELS: Record<string, string> = {
  pending: "Menunggu Pembayaran",
  paid: "Sudah Dibayar",
  processing: "Diproses",
  shipped: "Dikirim",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

export default async function OrderStatusPage({
  params,
}: {
  params: { store: string; orderNumber: string };
}) {
  const store = await getStoreBySlug(params.store);
  if (!store) notFound();

  const order = await prisma.order.findFirst({
    where: { storeId: store.id, orderNumber: params.orderNumber },
    include: { items: { include: { product: true, variant: true } } },
  });
  if (!order) notFound();

  const bankAccounts = Array.isArray(store.settings?.bankAccounts)
    ? (store.settings!.bankAccounts as unknown as {
        bank: string;
        accountNumber: string;
        accountName: string;
      }[])
    : [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Pesanan {order.orderNumber}</h1>
      <Badge className="mt-2" variant={order.status === "paid" ? "default" : "secondary"}>
        {STATUS_LABELS[order.status] ?? order.status}
      </Badge>

      <div className="mt-6 space-y-2 rounded-lg border p-4">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>
              {item.product.name}
              {item.variant ? ` (${item.variant.name})` : ""} × {item.qty}
            </span>
            <span>{formatRupiah(Number(item.price) * item.qty)}</span>
          </div>
        ))}
        <div className="flex justify-between border-t pt-2 text-sm text-muted-foreground">
          <span>Subtotal</span>
          <span>{formatRupiah(order.subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Ongkos Kirim</span>
          <span>{formatRupiah(order.shippingCost)}</span>
        </div>
        <div className="flex justify-between border-t pt-2 font-semibold">
          <span>Total</span>
          <span>{formatRupiah(order.total)}</span>
        </div>
      </div>

      {order.status === "pending" && (
        <div className="mt-6 rounded-lg border p-4">
          <h2 className="font-medium">Instruksi Pembayaran</h2>

          {order.paymentMethod === "qris" && store.settings?.qrisImageUrl && (
            <div className="mt-3 space-y-2 text-sm">
              <p className="text-muted-foreground">
                Scan QRIS berikut untuk membayar {formatRupiah(order.total)}, lalu tunggu
                konfirmasi dari toko.
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={store.settings.qrisImageUrl}
                alt="QRIS"
                className="mx-auto h-64 w-64 object-contain"
              />
            </div>
          )}

          {order.paymentMethod === "bank_transfer" && bankAccounts.length > 0 && (
            <div className="mt-3 space-y-3 text-sm">
              <p className="text-muted-foreground">
                Transfer {formatRupiah(order.total)} ke salah satu rekening berikut, lalu tunggu
                konfirmasi dari toko.
              </p>
              {bankAccounts.map((acc, i) => (
                <div key={i} className="rounded border p-2">
                  <p className="font-medium">{acc.bank}</p>
                  <p>{acc.accountNumber}</p>
                  <p className="text-muted-foreground">a.n. {acc.accountName}</p>
                </div>
              ))}
            </div>
          )}

          {order.paymentMethod === "midtrans" && (
            <p className="mt-3 text-sm text-muted-foreground">
              Selesaikan pembayaran lewat halaman Midtrans. Status pesanan ini akan otomatis
              berubah setelah pembayaran dikonfirmasi.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
