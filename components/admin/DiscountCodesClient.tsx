"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createDiscountCode, toggleDiscountCode, deleteDiscountCode } from "@/app/admin/pengaturan/actions";
import { Plus, Trash2, ToggleLeft, ToggleRight, Tag, Loader2, CheckCircle2, XCircle, Percent, DollarSign } from "lucide-react";

type DiscountCode = {
  id: string;
  code: string;
  description: string | null;
  type: "percentage" | "fixed";
  discountPct: string | number | null;
  discountAmt: string | number | null;
  minOrder: string | number | null;
  maxUses: number | null;
  usedCount: number;
  expiresAt: Date | null;
  isActive: boolean;
  createdAt: Date;
};

type Props = { initialCodes: DiscountCode[] };

export function DiscountCodesClient({ initialCodes }: Props) {
  const [codes, setCodes] = useState(initialCodes);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const [form, setForm] = useState({
    code: "", description: "", type: "percentage" as "percentage" | "fixed",
    discountPct: "", discountAmt: "", minOrder: "", maxUses: "", expiresAt: ""
  });

  const handleCreate = () => {
    setResult(null);
    startTransition(async () => {
      const res = await createDiscountCode({
        code: form.code,
        description: form.description,
        type: form.type,
        discountPct: form.discountPct ? parseFloat(form.discountPct) : undefined,
        discountAmt: form.discountAmt ? parseFloat(form.discountAmt) : undefined,
        minOrder: form.minOrder ? parseFloat(form.minOrder) : undefined,
        maxUses: form.maxUses ? parseInt(form.maxUses) : undefined,
        expiresAt: form.expiresAt || undefined,
      });
      if (res.ok) {
        setResult({ ok: true, message: "Kode diskon berhasil dibuat!" });
        setShowForm(false);
        setForm({ code: "", description: "", type: "percentage", discountPct: "", discountAmt: "", minOrder: "", maxUses: "", expiresAt: "" });
        window.location.reload();
      } else {
        setResult({ ok: false, message: "Gagal membuat kode. Pastikan kode belum ada." });
      }
    });
  };

  const handleToggle = (id: string, current: boolean) => {
    startTransition(async () => {
      await toggleDiscountCode(id, !current);
      setCodes(prev => prev.map(c => c.id === id ? { ...c, isActive: !current } : c));
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteDiscountCode(id);
      setCodes(prev => prev.filter(c => c.id !== id));
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" /> Buat Kode Baru
        </Button>
      </div>

      {showForm && (
        <div className="rounded-3xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50/80 to-teal-50/60 backdrop-blur-xl p-6 shadow-sm space-y-5">
          <h3 className="font-bold text-lg text-emerald-900">Buat Kode Diskon Baru</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-bold text-emerald-800">Kode Diskon*</Label>
              <Input value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} placeholder="HEMAT20" className="rounded-xl uppercase font-mono" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-emerald-800">Deskripsi</Label>
              <Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Diskon spesial Ramadan" className="rounded-xl" />
            </div>
          </div>

          <div>
            <Label className="font-bold text-emerald-800 mb-3 block">Tipe Diskon</Label>
            <div className="flex gap-3">
              <button onClick={() => setForm({...form, type: "percentage"})} className={`flex-1 flex items-center gap-2 p-3 rounded-2xl border-2 transition-all ${form.type === "percentage" ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white"}`}>
                <Percent className="h-5 w-5 text-emerald-600" /><span className="font-semibold text-sm">Persentase (%)</span>
              </button>
              <button onClick={() => setForm({...form, type: "fixed"})} className={`flex-1 flex items-center gap-2 p-3 rounded-2xl border-2 transition-all ${form.type === "fixed" ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white"}`}>
                <DollarSign className="h-5 w-5 text-emerald-600" /><span className="font-semibold text-sm">Nominal (Rp)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {form.type === "percentage" ? (
              <div className="space-y-2">
                <Label className="font-bold text-emerald-800">Besar Diskon (%)</Label>
                <Input type="number" min="0" max="100" value={form.discountPct} onChange={e => setForm({...form, discountPct: e.target.value})} placeholder="20" className="rounded-xl" />
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="font-bold text-emerald-800">Nominal Diskon (Rp)</Label>
                <Input type="number" min="0" value={form.discountAmt} onChange={e => setForm({...form, discountAmt: e.target.value})} placeholder="10000" className="rounded-xl" />
              </div>
            )}
            <div className="space-y-2">
              <Label className="font-bold text-emerald-800">Min. Order (Rp)</Label>
              <Input type="number" min="0" value={form.minOrder} onChange={e => setForm({...form, minOrder: e.target.value})} placeholder="Tidak ada batas" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-emerald-800">Maks. Pemakaian</Label>
              <Input type="number" min="0" value={form.maxUses} onChange={e => setForm({...form, maxUses: e.target.value})} placeholder="Unlimited" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-emerald-800">Berlaku Hingga</Label>
              <Input type="date" value={form.expiresAt} onChange={e => setForm({...form, expiresAt: e.target.value})} className="rounded-xl" />
            </div>
          </div>

          {result && (
            <div className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-medium border ${result.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
              {result.ok ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              {result.message}
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={handleCreate} disabled={isPending || !form.code} className="flex-1 bg-emerald-600 hover:bg-emerald-700 font-bold py-5 rounded-xl">
              {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</> : "Buat Kode Diskon"}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">Batal</Button>
          </div>
        </div>
      )}

      {codes.length === 0 ? (
        <div className="py-12 text-center rounded-3xl border border-white/60 bg-white/40 backdrop-blur-xl">
          <Tag className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="font-bold text-slate-900">Belum ada kode diskon</p>
          <p className="text-sm text-slate-500 mt-1">Buat kode diskon pertama Anda untuk menarik lebih banyak siswa.</p>
        </div>
      ) : (
        <div className="rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/60 border-b border-slate-200/60">
              <tr>
                {["Kode", "Tipe", "Nilai", "Min. Order", "Pemakaian", "Berlaku", "Status", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-slate-600 text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {codes.map(c => (
                <tr key={c.id} className="hover:bg-white/60 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-indigo-600">{c.code}</td>
                  <td className="px-4 py-3 text-slate-500">{c.type === "percentage" ? "%" : "Rp"}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    {c.type === "percentage" ? `${c.discountPct}%` : `Rp ${Number(c.discountAmt).toLocaleString("id-ID")}`}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{c.minOrder ? `Rp ${Number(c.minOrder).toLocaleString("id-ID")}` : "-"}</td>
                  <td className="px-4 py-3 text-slate-500">{c.usedCount}{c.maxUses ? `/${c.maxUses}` : ""}</td>
                  <td className="px-4 py-3 text-slate-500">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("id-ID") : "∞"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggle(c.id, c.isActive)}>
                      {c.isActive 
                        ? <ToggleRight className="h-6 w-6 text-emerald-500" /> 
                        : <ToggleLeft className="h-6 w-6 text-slate-300" />
                      }
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(c.id)} className="text-slate-400 hover:text-rose-500 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
