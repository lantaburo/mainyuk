import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Gift, Plus, Package } from "lucide-react";
import { createGlobalGift } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminGiftListClient, AdminClaimsListClient } from "@/components/admin/AdminGiftsClient";

export default async function AdminGiftsPage() {
  const session = await requireAdmin();

  // Admin melihat semua hadiah global
  const globalGifts = await prisma.marketplaceItem.findMany({
    where: { isGlobal: true },
    orderBy: { createdAt: "desc" }
  });

  // Admin melihat semua klaim untuk hadiah global
  const claims = await prisma.rewardClaim.findMany({
    where: { 
      item: { isGlobal: true }
    },
    include: {
      student: true,
      item: true
    },
    orderBy: { claimedAt: "desc" }
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Gift className="w-6 h-6 text-indigo-500" />
            Kelola Hadiah Global
          </h1>
          <p className="text-slate-500 mt-1">Buat hadiah yang akan tersedia untuk SEMUA anak di platform ini.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <form action={async (formData) => {
            "use server";
            await createGlobalGift(formData);
          }} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-lg border-b pb-3 mb-2 text-indigo-900">Buat Hadiah Global Baru</h3>
            
            <div className="space-y-1.5">
              <Label>Nama Hadiah</Label>
              <Input name="title" placeholder="Misal: Sertifikat Juara" required className="rounded-xl" />
            </div>

            <div className="space-y-1.5">
              <Label>Deskripsi (Opsional)</Label>
              <Input name="description" placeholder="Syarat / Keterangan" className="rounded-xl" />
            </div>

            <div className="space-y-1.5">
              <Label>Harga (Bintang)</Label>
              <Input name="price" type="number" min="1" placeholder="Misal: 500" required className="rounded-xl" />
            </div>

            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
              <Plus className="w-4 h-4 mr-2" /> Tambah Hadiah Global
            </Button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div>
            <h3 className="font-bold text-xl flex items-center gap-2 mb-4 text-slate-800">
              <Package className="w-5 h-5 text-indigo-500" /> Daftar Hadiah Global Sistem
            </h3>
            {globalGifts.length === 0 ? (
              <div className="text-center py-8 text-slate-400 bg-white rounded-3xl border border-slate-200">
                Belum ada hadiah global yang dibuat.
              </div>
            ) : (
              <AdminGiftListClient gifts={globalGifts} />
            )}
          </div>

          <div>
            <h3 className="font-bold text-xl flex items-center gap-2 mb-4 text-slate-800">
              <Gift className="w-5 h-5 text-emerald-500" /> Permintaan Penukaran Global
            </h3>
            {claims.length === 0 ? (
              <div className="text-center py-8 text-slate-400 bg-white rounded-3xl border border-slate-200">
                Belum ada anak yang menukar bintang dengan hadiah global.
              </div>
            ) : (
              <AdminClaimsListClient claims={claims} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
