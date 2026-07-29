import { requireStoreOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { updateOrderStatus } from "@/app/dashboard/pesanan/actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderStatusSelect } from "@/components/dashboard/OrderStatusSelect";
import { formatRupiah } from "@/lib/format";

const PAYMENT_LABELS: Record<string, string> = {
  midtrans: "Midtrans",
  qris: "QRIS",
  bank_transfer: "Transfer Bank",
};

export default async function PesananPage() {
  const session = await requireStoreOwner();

  const orders = await prisma.order.findMany({
    where: { storeId: session.user.storeId },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Pesanan</h1>
      <p className="mt-1 text-sm text-muted-foreground">{orders.length} pesanan</p>

      {orders.length === 0 ? (
        <p className="mt-10 text-center text-muted-foreground">Belum ada pesanan.</p>
      ) : (
        <Table className="mt-6">
          <TableHeader>
            <TableRow>
              <TableHead>No. Pesanan</TableHead>
              <TableHead>Pembeli</TableHead>
              <TableHead>Metode Bayar</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.orderNumber}</TableCell>
                <TableCell>
                  <div>{order.customer?.name ?? "-"}</div>
                  <div className="text-xs text-muted-foreground">{order.customer?.phone}</div>
                </TableCell>
                <TableCell>
                  {order.paymentMethod ? PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod : "-"}
                </TableCell>
                <TableCell>{formatRupiah(order.total)}</TableCell>
                <TableCell>
                  <OrderStatusSelect
                    action={updateOrderStatus.bind(null, order.id)}
                    defaultValue={order.status}
                  />
                </TableCell>
                <TableCell>{order.createdAt.toLocaleDateString("id-ID")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
