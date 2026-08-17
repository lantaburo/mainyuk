import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Gift, Plus, Package } from "lucide-react";
import { createGift } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GiftListClient, ClaimsListClient } from "@/components/parents/GiftsClient";

export default async function ParentsGiftsPage() {
  const session = await requireAuth();

  const myGifts = await prisma.marketplaceItem.findMany({
    where: { creatorId: session.user.id },
    orderBy: { createdAt: "desc" }
  });

  const studentIds = (await prisma.studentProfile.findMany({
    where: { parentId: session.user.id },
    select: { id: true }
  })).map(s => s.id);

  const claims = await prisma.rewardClaim.findMany({
    where: { 
      studentId: { in: studentIds },
      item: { creatorId: session.user.id }
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
            <Gift className="w-6 h-6 text-amber-500" />
            Kelola Hadiah Anak
          </h1>
          <p className="text-slate-500 mt-1">Buat hadiah kustom yang bisa ditukar anak menggunakan Bintang mereka.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <form action={async (formData) => {
            "use server";
            await createGift(formData);
          }} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-lg border-b pb-3 mb-2">Buat Hadiah Baru</h3>
            
            <div className="space-y-1.5">
              <Label>Nama Hadiah</Label>
              <Input name="title" placeholder="Misal: Mainan Mobil" required className="rounded-xl" />
            </div>

            <div className="space-y-1.5">
              <Label>Deskripsi (Opsional)</Label>
              <Input name="description" placeholder="Syarat / Keterangan" className="rounded-xl" />
            </div>

            <div className="space-y-1.5">
              <Label>Harga (Bintang)</Label>
              <Input name="price" type="number" min="1" placeholder="Misal: 500" required className="rounded-xl" />
            </div>

            <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl">
              <Plus className="w-4 h-4 mr-2" /> Tambah Hadiah
            </Button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div>
            <h3 className="font-bold text-xl flex items-center gap-2 mb-4 text-slate-800">
              <Package className="w-5 h-5 text-indigo-500" /> Daftar Hadiah Saya
            </h3>
            {myGifts.length === 0 ? (
              <div className="text-center py-8 text-slate-400 bg-white rounded-3xl border border-slate-200">
                Anda belum membuat hadiah apapun.
              </div>
            ) : (
              <GiftListClient gifts={myGifts} />
            )}
          </div>

          <div>
            <h3 className="font-bold text-xl flex items-center gap-2 mb-4 text-slate-800">
              <Gift className="w-5 h-5 text-emerald-500" /> Permintaan Penukaran
            </h3>
            {claims.length === 0 ? (
              <div className="text-center py-8 text-slate-400 bg-white rounded-3xl border border-slate-200">
                Belum ada anak yang menukar bintang dengan hadiah Anda.
              </div>
            ) : (
              <ClaimsListClient claims={claims} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
