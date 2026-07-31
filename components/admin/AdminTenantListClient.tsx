"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SITE_TYPE_CONFIG } from "@/lib/site-types";
import { updateStoreStatus, deleteStore } from "@/app/admin/actions";
import { startImpersonation } from "@/app/actions/impersonate-actions";
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
import { ShoppingBag, ExternalLink, PenSquare, Sparkles, Search, MoreHorizontal, LayoutTemplate, UserCircle } from "lucide-react";
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
  siteType: string;
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

      <div className="rounded-2xl border border-white/60 bg-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-white/20 pointer-events-none" />
        <div className="relative z-10">
          <Table>
            <TableHeader className="bg-slate-50/50 backdrop-blur-md border-b border-white/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-slate-700">Toko</TableHead>
                <TableHead className="font-semibold text-slate-700">Jenis Situs</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="font-semibold text-slate-700">Pemilik</TableHead>
                <TableHead className="font-semibold text-slate-700">Dibuat</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-24">
                    <div className="flex flex-col items-center justify-center text-slate-500 relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
                      <LayoutTemplate className="h-12 w-12 text-slate-300 mb-4 relative z-10" />
                      <p className="font-bold text-slate-700 text-lg relative z-10">Tidak ada tenant ditemukan</p>
                      <p className="text-sm text-slate-500 mt-1 relative z-10">Coba gunakan kata kunci pencarian yang berbeda.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStores.map((store) => (
                  <TableRow key={store.id} className="hover:bg-white/60 transition-colors border-b border-white/40">
                    <TableCell>
                      <div className="flex flex-col">
                        <a
                          href={`/${store.slug}`}
                          target="_blank"
                          className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 group drop-shadow-sm"
                          rel="noreferrer"
                        >
                          {store.name}
                          <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-all -translate-y-1 group-hover:translate-y-0" />
                        </a>
                        <span className="text-xs text-slate-400 mt-0.5 font-medium">/{store.slug}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-sm font-semibold text-slate-700">{SITE_TYPE_CONFIG[store.siteType as keyof typeof SITE_TYPE_CONFIG].label}</span>
                        <span className="inline-flex items-center rounded-full bg-slate-100/80 px-2 py-0.5 text-[10px] font-bold text-slate-600 w-fit uppercase tracking-wider shadow-sm border border-white">
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
                      <div className="text-sm font-semibold text-slate-800">{store.owner.name}</div>
                      <div className="text-xs text-slate-500">{store.owner.email}</div>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-slate-500 whitespace-nowrap">
                      {mounted 
                        ? new Date(store.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })
                        : "..."
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={<Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white shadow-sm border border-transparent hover:border-slate-200 transition-all" />}
                        >
                          <span className="sr-only">Buka menu</span>
                          <MoreHorizontal className="h-4 w-4 text-slate-600" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px] bg-white/90 backdrop-blur-xl border-white/50 shadow-xl">
                          <DropdownMenuLabel className="font-bold text-slate-700">Aksi Tenant</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-slate-100" />
                          <DropdownMenuItem className="cursor-pointer font-medium w-full" onSelect={() => startImpersonation(store.id)}>
                            <UserCircle className="mr-2 h-4 w-4 text-emerald-600" />
                            <span className="text-emerald-700">Impersonate</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem render={<Link href={`/admin/generator-ai/${store.id}`} className="cursor-pointer font-medium w-full" />}>
                            <Sparkles className="mr-2 h-4 w-4 text-indigo-600" />
                            <span className="text-indigo-900">AI Generator</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem render={<Link href={`/admin-editor/${store.id}`} className="cursor-pointer font-medium w-full" />}>
                            <PenSquare className="mr-2 h-4 w-4 text-slate-500" />
                            <span className="text-slate-700">Edit Halaman</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-slate-100" />
                          <DropdownMenuItem className="p-0" onSelect={(e) => e.preventDefault()}>
                            <ConfirmDeleteButton
                              action={deleteStore.bind(null, store.id)}
                              confirmText={`Hapus toko "${store.name}"? Semua produk, halaman, dan datanya akan ikut terhapus. Tindakan ini tidak bisa dibatalkan.`}
                              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 p-2 text-sm rounded-sm font-medium"
                              variant="ghost"
                            />
                          </DropdownMenuItem>
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
    </div>
  );
}
