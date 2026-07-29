import { requireStoreOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/dashboard/StatCard";

export default async function DashboardOverviewPage() {
  const session = await requireStoreOwner();
  const storeId = session.user.storeId;

  const [productCount, orderCount, categoryCount] = await Promise.all([
    prisma.product.count({ where: { storeId } }),
    prisma.order.count({ where: { storeId } }),
    prisma.category.count({ where: { storeId } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Ringkasan</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Produk" value={productCount} />
        <StatCard label="Kategori" value={categoryCount} />
        <StatCard label="Pesanan" value={orderCount} />
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        Laporan penjualan & grafik omzet akan tersedia setelah fitur checkout aktif (Fase 2).
      </p>
    </div>
  );
}
