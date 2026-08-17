"use client";

import { useState } from "react";
import { deleteGift, markClaimFulfilled } from "@/app/dashboard/parents/gifts/actions";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, CheckCircle } from "lucide-react";

export function GiftListClient({ gifts }: { gifts: any[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus hadiah ini?")) return;
    setDeletingId(id);
    const res = await deleteGift(id);
    if (!res.ok) alert(res.error);
    setDeletingId(null);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {gifts.map((g) => (
        <div key={g.id} className="bg-white border rounded-2xl p-4 flex justify-between items-center">
          <div>
            <h4 className="font-bold">{g.title}</h4>
            <p className="text-sm text-amber-600">{g.price} Bintang</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => handleDelete(g.id)}
            disabled={deletingId === g.id}
          >
            {deletingId === g.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </Button>
        </div>
      ))}
    </div>
  );
}

export function ClaimsListClient({ claims }: { claims: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleFulfill = async (id: string) => {
    if (!confirm("Tandai hadiah ini sudah diberikan ke anak?")) return;
    setLoadingId(id);
    const res = await markClaimFulfilled(id);
    if (!res.ok) alert(res.error);
    setLoadingId(null);
  };

  return (
    <div className="space-y-3">
      {claims.map((c) => (
        <div key={c.id} className="bg-white border rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h4 className="font-bold text-slate-800">{c.item.title}</h4>
            <p className="text-sm text-slate-500">
              Diklaim oleh <span className="font-semibold text-slate-700">{c.student.name}</span> pada {new Date(c.claimedAt).toLocaleDateString("id-ID")}
            </p>
          </div>
          {c.status === "pending" ? (
            <Button
              onClick={() => handleFulfill(c.id)}
              disabled={loadingId === c.id}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
            >
              {loadingId === c.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              Tandai Sudah Diberikan
            </Button>
          ) : (
            <div className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-emerald-100">
              <CheckCircle className="w-4 h-4" /> Selesai
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
