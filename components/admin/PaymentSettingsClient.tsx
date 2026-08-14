"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { saveSettings } from "@/app/admin/pengaturan/actions";
import { CreditCard, QrCode, Landmark, Eye, EyeOff, CheckCircle2, XCircle, Loader2, Plus, Trash2 } from "lucide-react";

type Tab = "midtrans" | "qris" | "rekening";
type BankAccount = { bank: string; number: string; name: string };

type Props = {
  initialSettings: Record<string, string>;
};

export function PaymentSettingsClient({ initialSettings }: Props) {
  const [tab, setTab] = useState<Tab>("midtrans");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  // Midtrans
  const [serverKey, setServerKey] = useState(initialSettings["midtrans_server_key"] || "");
  const [clientKey, setClientKey] = useState(initialSettings["midtrans_client_key"] || "");
  const [isSandbox, setIsSandbox] = useState(initialSettings["midtrans_sandbox"] !== "false");
  const [showServerKey, setShowServerKey] = useState(false);

  // QRIS
  const [qrisMode, setQrisMode] = useState<"dynamic" | "static">(
    (initialSettings["qris_mode"] as "dynamic" | "static") || "dynamic"
  );
  const [qrisImageUrl, setQrisImageUrl] = useState(initialSettings["qris_static_image"] || "");
  const [merchantId, setMerchantId] = useState(initialSettings["qris_merchant_id"] || "");

  // Rekening
  const [accounts, setAccounts] = useState<BankAccount[]>(() => {
    try { return JSON.parse(initialSettings["bank_accounts"] || "[]"); } catch { return []; }
  });

  const addAccount = () => setAccounts([...accounts, { bank: "", number: "", name: "" }]);
  const removeAccount = (i: number) => setAccounts(accounts.filter((_, idx) => idx !== i));
  const updateAccount = (i: number, field: keyof BankAccount, value: string) => {
    setAccounts(accounts.map((a, idx) => idx === i ? { ...a, [field]: value } : a));
  };

  const handleSave = () => {
    setResult(null);
    const payload: Record<string, string> = {
      midtrans_server_key: serverKey,
      midtrans_client_key: clientKey,
      midtrans_sandbox: String(isSandbox),
      qris_mode: qrisMode,
      qris_static_image: qrisImageUrl,
      qris_merchant_id: merchantId,
      bank_accounts: JSON.stringify(accounts),
    };
    startTransition(async () => {
      const res = await saveSettings(payload);
      setResult({ ok: res.ok, message: res.ok ? "Pengaturan pembayaran berhasil disimpan!" : "Gagal menyimpan." });
    });
  };

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "midtrans", label: "Midtrans", icon: <CreditCard className="h-4 w-4" /> },
    { id: "qris", label: "QRIS", icon: <QrCode className="h-4 w-4" /> },
    { id: "rekening", label: "Nomor Rekening", icon: <Landmark className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100/80 p-1.5 rounded-2xl w-fit">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${tab === t.id
              ? "bg-white shadow-md text-slate-900"
              : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Midtrans */}
      {tab === "midtrans" && (
        <div className="rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-lg text-slate-900">Konfigurasi Midtrans</h3>
            <p className="text-sm text-slate-500 mt-1">Masukkan API key dari dashboard Midtrans Anda untuk mengaktifkan pembayaran online.</p>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <p className="font-bold text-slate-800">Mode Sandbox</p>
              <p className="text-xs text-slate-500 mt-0.5">Aktifkan untuk pengujian tanpa transaksi nyata</p>
            </div>
            <button onClick={() => setIsSandbox(!isSandbox)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isSandbox ? 'bg-amber-500' : 'bg-emerald-500'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isSandbox ? 'translate-x-1' : 'translate-x-6'}`} />
            </button>
          </div>
          <div className={`text-xs font-semibold text-center rounded-xl py-1.5 ${isSandbox ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
            {isSandbox ? "⚠️ Mode Sandbox (Testing)" : "✅ Mode Production (Live)"}
          </div>

          <div className="space-y-2">
            <Label className="font-bold text-slate-700">Server Key</Label>
            <div className="relative">
              <Input type={showServerKey ? "text" : "password"} value={serverKey} onChange={e => setServerKey(e.target.value)} placeholder="SB-Mid-server-..." className="rounded-xl pr-12 font-mono text-sm" />
              <button type="button" onClick={() => setShowServerKey(!showServerKey)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                {showServerKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="font-bold text-slate-700">Client Key</Label>
            <Input type="text" value={clientKey} onChange={e => setClientKey(e.target.value)} placeholder="SB-Mid-client-..." className="rounded-xl font-mono text-sm" />
          </div>
        </div>
      )}

      {/* Tab: QRIS */}
      {tab === "qris" && (
        <div className="rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-lg text-slate-900">Konfigurasi QRIS</h3>
            <p className="text-sm text-slate-500 mt-1">Pilih mode QRIS yang ingin Anda gunakan.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {([
              { id: "dynamic", title: "QRIS Dinamis", desc: "Otomatis via Midtrans, kode unik per transaksi" },
              { id: "static", title: "QRIS Statis", desc: "Upload gambar QRIS tetap, dikonfirmasi manual" },
            ] as const).map(opt => (
              <button key={opt.id} onClick={() => setQrisMode(opt.id)} className={`p-4 rounded-2xl border-2 text-left transition-all ${qrisMode === opt.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                <p className="font-bold text-slate-900 text-sm">{opt.title}</p>
                <p className="text-xs text-slate-500 mt-1">{opt.desc}</p>
              </button>
            ))}
          </div>

          {qrisMode === "dynamic" && (
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Merchant ID / NMID</Label>
              <Input value={merchantId} onChange={e => setMerchantId(e.target.value)} placeholder="ID.123456789..." className="rounded-xl font-mono text-sm" />
            </div>
          )}

          {qrisMode === "static" && (
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">URL Gambar QRIS Statis</Label>
              <Input value={qrisImageUrl} onChange={e => setQrisImageUrl(e.target.value)} placeholder="https://..." className="rounded-xl text-sm" />
              {qrisImageUrl && (
                <div className="mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-center">
                  <img src={qrisImageUrl} alt="QRIS Preview" className="max-h-48 object-contain rounded-xl" />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab: Rekening */}
      {tab === "rekening" && (
        <div className="rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-slate-900">Nomor Rekening Bank</h3>
              <p className="text-sm text-slate-500 mt-1">Rekening untuk transfer manual yang akan ditampilkan kepada pembeli.</p>
            </div>
            <Button onClick={addAccount} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="mr-1.5 h-4 w-4" /> Tambah
            </Button>
          </div>

          {accounts.length === 0 && (
            <div className="py-8 text-center text-slate-400">
              <Landmark className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Belum ada rekening. Klik tombol "Tambah" untuk menambahkan.</p>
            </div>
          )}

          <div className="space-y-4">
            {accounts.map((acc, i) => (
              <div key={i} className="grid grid-cols-1 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 relative">
                <button onClick={() => removeAccount(i)} className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="grid grid-cols-3 gap-3 pr-8">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-600">Nama Bank</Label>
                    <Input value={acc.bank} onChange={e => updateAccount(i, "bank", e.target.value)} placeholder="BCA, BRI, dll" className="rounded-xl text-sm h-9" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-600">Nomor Rekening</Label>
                    <Input value={acc.number} onChange={e => updateAccount(i, "number", e.target.value)} placeholder="1234567890" className="rounded-xl text-sm font-mono h-9" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-600">Atas Nama</Label>
                    <Input value={acc.name} onChange={e => updateAccount(i, "name", e.target.value)} placeholder="Nama pemilik" className="rounded-xl text-sm h-9" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Result */}
      {result && (
        <div className={`flex items-center gap-3 p-4 rounded-2xl border text-sm font-medium ${result.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
          {result.ok ? <CheckCircle2 className="h-5 w-5 flex-shrink-0" /> : <XCircle className="h-5 w-5 flex-shrink-0" />}
          {result.message}
        </div>
      )}

      <Button onClick={handleSave} disabled={isPending} className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-6 rounded-2xl shadow-lg shadow-indigo-300/30 text-base">
        {isPending ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Menyimpan...</> : "Simpan Semua Pengaturan Pembayaran"}
      </Button>
    </div>
  );
}
