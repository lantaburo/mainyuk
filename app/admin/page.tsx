import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { SITE_TYPE_CONFIG } from "@/lib/site-types";
import { updateStoreStatus, deleteStore } from "@/app/admin/actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { StoreStatusSelect } from "@/components/admin/StoreStatusSelect";
import { AdminTenantListClient } from "@/components/admin/AdminTenantListClient";
import { Store, TrendingUp, Users, ShoppingCart } from "lucide-react";

export default async function AdminPage() {
  const session = await requireAdmin();

  const stores = await prisma.store.findMany({
    include: {
      owner: { select: { name: true, email: true } },
      _count: { select: { products: true, orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const staffCount = await prisma.user.count({
    where: {
      role: { in: ['admin', 'operator', 'superadmin'] }
    }
  });

  const totalProducts = stores.reduce((sum, store) => sum + store._count.products, 0);
  const totalOrders = stores.reduce((sum, store) => sum + store._count.orders, 0);
  const activeStores = stores.filter(s => s.status === 'active').length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard Super Admin</h1>
        <p className="mt-2 text-sm text-gray-500">Pantau pertumbuhan dan kelola semua tenant di platform klikweb.id.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Tenant</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stores.length}</p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <Store className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-green-600 font-medium mt-4">{activeStores} aktif</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Produk</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{totalProducts}</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-gray-500 font-medium mt-4">Seluruh platform</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Pesanan</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{totalOrders}</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <ShoppingCart className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-gray-500 font-medium mt-4">Seluruh platform</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Admin Staf</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{staffCount}</p>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-gray-500 font-medium mt-4">Pengelola web</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-gray-900">Daftar Tenant</h2>
        <AdminTenantListClient initialStores={stores} />
      </div>
    </div>
  );
}
