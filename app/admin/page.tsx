import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { AdminTenantListClient } from "@/components/admin/AdminTenantListClient";
import { Store, TrendingUp, Users, ShoppingCart } from "lucide-react";

export default async function AdminPage() {
  await requireAdmin();

  const stores = await prisma.store.findMany({
    include: {
      owner: { select: { name: true, email: true } },
      _count: { select: { products: true, orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const staffCount = await prisma.user.count({
    where: {
      role: { in: ['super_admin', 'operator'] }
    }
  });

  const totalProducts = stores.reduce((sum, store) => sum + store._count.products, 0);
  const totalOrders = stores.reduce((sum, store) => sum + store._count.orders, 0);
  const activeStores = stores.filter(s => s.status === 'active').length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard Super Admin</h1>
        <p className="mt-2 text-sm text-gray-500">Pantau pertumbuhan dan kelola semua tenant di platform mainyuk.my.id.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <div className="relative overflow-hidden rounded-2xl border border-white/40 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between group">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-indigo-500/10 blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-medium text-gray-500/80">Total Tenant</p>
              <p className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900 drop-shadow-sm">{stores.length}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-600 rounded-xl shadow-sm border border-indigo-100/50">
              <Store className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2 relative z-10">
            <span className="flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse"></span>
            <p className="text-xs font-medium text-green-600">{activeStores} aktif</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="relative overflow-hidden rounded-2xl border border-white/40 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between group">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-medium text-gray-500/80">Total Produk</p>
              <p className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900 drop-shadow-sm">{totalProducts}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 rounded-xl shadow-sm border border-blue-100/50">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-6 relative z-10">
            <p className="text-xs font-medium text-gray-500">Tersebar di seluruh platform</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="relative overflow-hidden rounded-2xl border border-white/40 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between group">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-medium text-gray-500/80">Total Pesanan</p>
              <p className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900 drop-shadow-sm">{totalOrders}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 rounded-xl shadow-sm border border-emerald-100/50">
              <ShoppingCart className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-6 relative z-10">
            <p className="text-xs font-medium text-gray-500">Dari seluruh toko aktif</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="relative overflow-hidden rounded-2xl border border-white/40 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between group">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-purple-500/10 blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-medium text-gray-500/80">Admin Staf</p>
              <p className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900 drop-shadow-sm">{staffCount}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-50 text-purple-600 rounded-xl shadow-sm border border-purple-100/50">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-6 relative z-10">
            <p className="text-xs font-medium text-gray-500">Pengelola & Customer Support</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-gray-900">Daftar Tenant</h2>
        <AdminTenantListClient initialStores={stores} />
      </div>
    </div>
  );
}
