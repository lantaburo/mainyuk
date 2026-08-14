"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAffiliateCode, toggleAffiliateCode, deleteAffiliateCode } from "@/app/admin/pengaturan/actions";
import { Plus, Trash2, ToggleLeft, ToggleRight, Users, Loader2, CheckCircle2, XCircle, TrendingUp } from "lucide-react";

type AffiliateCode = {
  id: string;
  code: string;
  ownerName: string;
  ownerEmail: string | null;
  commissionPct: string | number;
  totalConversions: number;
  totalEarnings: string | number;
  isActive: boolean;
  createdAt: Date;
};

type Props = { initialCodes: AffiliateCode[] };

export function AffiliateCodesClient({ initialCodes }: Props) {
  const [codes, setCodes] = useState(initialCodes);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const [form, setForm] = useState({ code: "", ownerName: "", ownerEmail: "", commissionPct: "" });

  const handleCreate = () => {
    setResult(null);
    startTransition(async () => {
      const res = await createAffiliateCode({
        code: form.code,
        ownerName: form.ownerName,
        ownerEmail: form.ownerEmail,
        commissionPct: parseFloat(form.commissionPct) || 0,
      });
      if (res.ok) {
        setResult({ ok: true, message: "Kode afiliasi berhasil dibuat!" });
        setShowForm(false);
        setForm({ code: "", ownerName: "", ownerEmail: "", commissionPct: "" });
        window.location.reload();
      } else {
        setResult({ ok: false, message: "Gagal membuat kode. Pastikan kode belum digunakan." });
      }
    });
  };

  const handleToggle = (id: string, current: boolean) => {
    startTransition(async () => {
      await toggleAffiliateCode(id, !current);
      setCodes(prev => prev.map(c => c.id === id ? { ...c, isActive: !current } : c));
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteAffiliateCode(id);
      setCodes(prev => prev.filter(c => c.id !== id));
    });
  };

  const totalConversions = codes.reduce((s, c) => s + c.totalConversions, 0);
  const totalEarnings = codes.reduce((s, c) => s + Number(c.totalEarnings), 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Afiliator", value: codes.length, color: "purple" },
          { label: "Total Konversi", value: totalConversions, color: "blue" },
          { label: "Total Komisi Terbayar", value: `Rp ${totalEarnings.toLocaleString("id-ID")}`, color: "emerald" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-white/50 bg-white/60 backdrop-blur-xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-extrabold mt-1 text-${s.color}-600`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="mr-2 h-4 w-4" /> Tambah Afiliator
        </Button>
      </div>

      {showForm && (
        <div className="rounded-3xl border border-purple-200/60 bg-gradient-to-br from-purple-50/80 to-pink-50/60 backdrop-blur-xl p-6 shadow-sm space-y-5">
          <h3 className="font-bold text-lg text-purple-900">Buat Kode Afiliasi Baru</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-bold text-purple-800">Kode Afiliasi*</Label>
              <Input value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} placeholder="BUDITOP" className="rounded-xl uppercase font-mono" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-purple-800">Komisi (%)*</Label>
              <Input type="number" min="0" max="100" value={form.commissionPct} onChange={e => setForm({...form, commissionPct: e.target.value})} placeholder="10" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-purple-800">Nama Afiliator*</Label>
              <Input value={form.ownerName} onChange={e => setForm({...form, ownerName: e.target.value})} placeholder="Budi Santoso" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-purple-800">Email Afiliator</Label>
              <Input type="email" value={form.ownerEmail} onChange={e => setForm({...form, ownerEmail: e.target.value})} placeholder="budi@email.com" className="rounded-xl" />
            </div>
          </div>

          {result && (
            <div className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-medium border ${result.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
              {result.ok ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              {result.message}
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={handleCreate} disabled={isPending || !form.code || !form.ownerName} className="flex-1 bg-purple-600 hover:bg-purple-700 font-bold py-5 rounded-xl">
              {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</> : "Tambah Afiliator"}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">Batal</Button>
          </div>
        </div>
      )}

      {codes.length === 0 ? (
        <div className="py-12 text-center rounded-3xl border border-white/60 bg-white/40 backdrop-blur-xl">
          <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="font-bold text-slate-900">Belum ada afiliator</p>
          <p className="text-sm text-slate-500 mt-1">Tambahkan afiliator pertama untuk memulai program referral Anda.</p>
        </div>
      ) : (
        <div className="rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/60 border-b border-slate-200/60">
              <tr>
                {["Kode", "Nama", "Email", "Komisi", "Konversi", "Total Komisi", "Status", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-slate-600 text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {codes.map(c => (
                <tr key={c.id} className="hover:bg-white/60 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-purple-600">{c.code}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{c.ownerName}</td>
                  <td className="px-4 py-3 text-slate-500">{c.ownerEmail || "-"}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-700">
                      <TrendingUp className="mr-1 h-3 w-3" />{String(c.commissionPct)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700">{c.totalConversions}x</td>
                  <td className="px-4 py-3 font-semibold text-emerald-600">Rp {Number(c.totalEarnings).toLocaleString("id-ID")}</td>
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
