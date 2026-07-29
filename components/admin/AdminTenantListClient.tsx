"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
import { Input } from "@/components/ui/input";
import { StoreStatusSelect } from "@/components/admin/StoreStatusSelect";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { ShoppingBag, ExternalLink, PenSquare, Sparkles, Search, MoreHorizontal, LayoutTemplate } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type StoreData = {
  id: string;
  name: string;
  slug: string;
  siteType: any;
  planType: string;
  status: string;
  createdAt: Date;
  owner: {
    name: string | null;
    email: string | null;
  };
  _count: {
    products: number;
    orders: number;
  };
};

export function AdminTenantListClient({ initialStores }: { initialStores: StoreData[] }) {
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredStores = initialStores.filter(store => {
    const q = search.toLowerCase();
    return (
      store.name.toLowerCase().includes(q) ||
      store.slug.toLowerCase().includes(q) ||
      (store.owner.email && store.owner.email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Cari tenant, domain, atau email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
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
            {filteredStores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <LayoutTemplate className="h-10 w-10 text-gray-300 mb-3" />
                    <p className="font-medium text-gray-900">Tidak ada tenant ditemukan.</p>
                    <p className="text-sm">Coba gunakan kata kunci pencarian yang berbeda.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredStores.map((store) => (
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
                      <span className="text-sm font-medium text-gray-700">{SITE_TYPE_CONFIG[store.siteType as keyof typeof SITE_TYPE_CONFIG].label}</span>
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
                      <div className="flex flex-col items-center gap-1 bg-gray-50 px-2 py-1 rounded-md" title={`${store._count.products} Produk`}>
                        <ShoppingBag className="h-3.5 w-3.5 text-gray-400" />
                        <span className="font-semibold text-gray-700">{store._count.products}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                    {mounted 
                      ? new Date(store.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })
                      : "..."
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Buka menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuLabel>Aksi Tenant</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          render={
                            <Link href={`/admin/generator-ai/${store.id}`} className="cursor-pointer flex items-center">
                              <Sparkles className="mr-2 h-4 w-4 text-indigo-600" />
                              <span>AI Generator</span>
                            </Link>
                          }
                        />
                        <DropdownMenuItem
                          render={
                            <Link href={`/admin/halaman/${store.id}`} className="cursor-pointer flex items-center">
                              <PenSquare className="mr-2 h-4 w-4" />
                              <span>Edit Halaman</span>
                            </Link>
                          }
                        />
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          render={
                            <ConfirmDeleteButton
                              action={deleteStore.bind(null, store.id)}
                              confirmText={`Hapus toko "${store.name}"? Semua produk, halaman, dan datanya akan ikut terhapus. Tindakan ini tidak bisa dibatalkan.`}
                              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 p-2 text-sm rounded-sm"
                            />
                          }
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
