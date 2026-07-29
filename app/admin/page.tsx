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
import { Store, ShoppingBag, ExternalLink, PenSquare, Sparkles } from "lucide-react";

export default async function AdminPage() {
  const session = await requireAdmin();

  const stores = await prisma.store.findMany({
    include: {
      owner: { select: { name: true, email: true } },
      _count: { select: { products: true, orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Daftar Tenant</h1>
          <p className="mt-2 text-sm text-gray-500">Kelola semua toko dan tenant yang terdaftar di platform.</p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-medium text-sm">
          <Store className="h-4 w-4" />
          {stores.length} Total Tenant
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow>
              <TableHead className="font-semibold text-gray-700">Toko</TableHead>
              <TableHead className="font-semibold text-gray-700">Jenis Situs</TableHead>
              <TableHead className="font-semibold text-gray-700">Status</TableHead>
              <TableHead className="font-semibold text-gray-700">Pemilik</TableHead>
              <TableHead className="font-semibold text-gray-700 text-center">Metrik</TableHead>
              <TableHead className="font-semibold text-gray-700">Dibuat</TableHead>
              <TableHead className="font-semibold text-gray-700 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                  Belum ada tenant yang terdaftar.
                </TableCell>
              </TableRow>
            )}
            {stores.map((store) => (
              <TableRow key={store.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell>
                  <div className="flex flex-col">
                    <a
                      href={`/${store.slug}`}
                      target="_blank"
                      className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group"
                      rel="noreferrer"
                    >
                      {store.name}
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                    <span className="text-xs text-gray-400 mt-0.5">/{store.slug}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-700">{SITE_TYPE_CONFIG[store.siteType].label}</span>
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 w-fit uppercase tracking-wider">
                      {store.planType}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <StoreStatusSelect
                    action={updateStoreStatus.bind(null, store.id)}
                    defaultValue={store.status}
                  />
                </TableCell>
                <TableCell>
                  <div className="text-sm font-medium text-gray-900">{store.owner.name}</div>
                  <div className="text-xs text-gray-500">{store.owner.email}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                    <div className="flex flex-col items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                      <ShoppingBag className="h-3.5 w-3.5 text-gray-400" />
                      <span className="font-semibold text-gray-700">{store._count.products}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                  {store.createdAt.toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1 border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
                      nativeButton={false}
                      render={<Link href={`/admin/generator-ai/${store.id}`} />}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span className="hidden xl:inline">AI Gen</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1"
                      nativeButton={false}
                      render={<Link href={`/admin/halaman/${store.id}`} />}
                    >
                      <PenSquare className="h-3.5 w-3.5" />
                      <span className="hidden xl:inline">Edit</span>
                    </Button>
                    <ConfirmDeleteButton
                      action={deleteStore.bind(null, store.id)}
                      confirmText={`Hapus toko "${store.name}"? Semua produk, halaman, dan datanya akan ikut terhapus. Tindakan ini tidak bisa dibatalkan.`}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
