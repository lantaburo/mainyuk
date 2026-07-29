import { requireStoreOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/dashboard/StatCard";
import { Package, Tags, ShoppingCart, TrendingUp } from "lucide-react";

export default async function DashboardOverviewPage() {
  const session = await requireStoreOwner();
  const storeId = session.user.storeId;

  const [productCount, orderCount, categoryCount] = await Promise.all([
    prisma.product.count({ where: { storeId } }),
    prisma.order.count({ where: { storeId } }),
    prisma.category.count({ where: { storeId } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Ringkasan</h1>
        <p className="text-gray-500 mt-2">Pantau performa dan metrik toko Anda hari ini.</p>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Produk" value={productCount} icon={Package} trend="+Baru" />
        <StatCard label="Kategori" value={categoryCount} icon={Tags} />
        <StatCard label="Total Pesanan" value={orderCount} icon={ShoppingCart} trend="+0 minggu ini" />
      </div>
      
      <div className="rounded-xl border border-dashed border-gray-300 p-8 flex flex-col items-center justify-center text-center bg-white/50">
        <TrendingUp className="h-10 w-10 text-gray-400 mb-4" />
        <h3 className="font-semibold text-gray-900 mb-1">Laporan Penjualan Belum Tersedia</h3>
        <p className="text-sm text-gray-500 max-w-md">
          Grafik omzet dan laporan analitik mendalam akan otomatis tersedia di sini setelah fitur checkout/keranjang diaktifkan (Fase 2).
        </p>
      </div>
    </div>
  );
}
