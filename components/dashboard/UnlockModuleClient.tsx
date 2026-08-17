"use client";

import { useState } from "react";
import { Star, Unlock, Loader2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { unlockModuleWithStars } from "@/app/dashboard/subject/[slug]/actions";
import { useRouter } from "next/navigation";

export function UnlockModuleClient({
  studentId,
  moduleId,
  starsCost,
  starsBalance
}: {
  studentId: string;
  moduleId: string;
  starsCost: number;
  starsBalance: number;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUnlockStars = async () => {
    if (starsBalance < starsCost) {
      alert("Bintang kamu tidak cukup!");
      return;
    }
    if (!confirm(`Tukar ${starsCost} Bintang untuk membuka modul ini permanen?`)) return;
    
    setLoading(true);
    const res = await unlockModuleWithStars(studentId, moduleId, starsCost);
    if (res.ok) {
      alert("Modul berhasil dibuka!");
      router.refresh();
    } else {
      alert(res.error || "Gagal membuka modul.");
      setLoading(false);
    }
  };

  const handleUnlockRp = () => {
    alert("Simulasi: Pembayaran Rp sedang diproses... Modul berhasil dibuka! (Note: Hubungkan dengan Midtrans untuk live).");
    // In real app, this redirects to Midtrans or triggers snap popup.
  };

  return (
    <div className="flex gap-2 w-full mt-3 border-t border-amber-100 pt-3">
      <Button 
        onClick={handleUnlockStars}
        disabled={loading || starsBalance < starsCost}
        className={`flex-1 flex flex-col h-auto py-2 px-2 gap-1 rounded-xl ${starsBalance >= starsCost ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-slate-100 text-slate-400'}`}
      >
        <div className="flex items-center gap-1 font-bold">
          <Star className="w-4 h-4 fill-current" /> {starsCost}
        </div>
        <span className="text-[10px] uppercase font-semibold">Tukar Bintang</span>
      </Button>
      
      <Button 
        onClick={handleUnlockRp}
        disabled={loading}
        variant="outline"
        className="flex-1 flex flex-col h-auto py-2 px-2 gap-1 rounded-xl border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100"
      >
        <div className="flex items-center gap-1 font-bold">
          <CreditCard className="w-4 h-4" /> Rp25rb
        </div>
        <span className="text-[10px] uppercase font-semibold">Beli Akses</span>
      </Button>
    </div>
  );
}
