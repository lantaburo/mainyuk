"use client";

import { useState, useTransition } from "react";
import { Settings, Loader2, CheckCircle2, XCircle, ChevronDown, ChevronUp, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateModuleSettings } from "@/app/admin/curriculum/actions";

type Props = {
  moduleId: string;
  initialData: {
    title: string;
    slug: string;
    description: string | null;
    isPremium: boolean;
    price: string | null; // Decimal comes as string from Prisma
    isPublished: boolean;
  };
};

export function ModuleSettingsPanel({ moduleId, initialData }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(initialData.title);
  const [slug, setSlug] = useState(initialData.slug);
  const [description, setDescription] = useState(initialData.description || "");
  const [isPremium, setIsPremium] = useState(initialData.isPremium);
  const [price, setPrice] = useState(initialData.price ? String(initialData.price) : "");
  const [isPublished, setIsPublished] = useState(initialData.isPublished);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    setResult(null);
    startTransition(async () => {
      const res = await updateModuleSettings(moduleId, {
        title,
        slug,
        description,
        isPremium,
        price: isPremium && price ? parseFloat(price) : null,
        isPublished,
      });
      if (res.ok) {
        setResult({ ok: true, message: "Pengaturan modul berhasil disimpan!" });
      } else {
        setResult({ ok: false, message: "Gagal menyimpan pengaturan." });
      }
    });
  };

  return (
    <div className="rounded-3xl border border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-orange-50/60 backdrop-blur-xl shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-amber-900">Pengaturan Modul</h3>
            <p className="text-sm text-amber-700">
              Status: <span className={`font-semibold ${isPublished ? 'text-emerald-600' : 'text-slate-500'}`}>{isPublished ? 'Diterbitkan' : 'Draft'}</span>
              {" · "}
              Tipe: <span className={`font-semibold ${isPremium ? 'text-amber-600' : 'text-slate-500'}`}>
                {isPremium ? `Premium (Rp ${parseFloat(price || "0").toLocaleString('id-ID')})` : 'Gratis'}
              </span>
            </p>
          </div>
        </div>
        {open ? <ChevronUp className="h-5 w-5 text-amber-400" /> : <ChevronDown className="h-5 w-5 text-amber-400" />}
      </button>

      {open && (
        <div className="px-6 pb-6 space-y-5">
          <div className="h-px bg-amber-200/60" />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-1">
              <Label className="font-bold text-amber-900">Judul Modul</Label>
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="rounded-xl border-amber-200 focus-visible:ring-amber-500 bg-white"
              />
            </div>

            <div className="space-y-2 sm:col-span-1">
              <Label className="font-bold text-amber-900">Slug (URL)</Label>
              <Input
                value={slug}
                onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'))}
                placeholder="contoh: modul-1"
                className="rounded-xl border-amber-200 focus-visible:ring-amber-500 bg-white"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label className="font-bold text-amber-900">Deskripsi (Opsional)</Label>
              <Input
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Deskripsi singkat tentang isi modul ini..."
                className="rounded-xl border-amber-200 focus-visible:ring-amber-500 bg-white"
              />
            </div>
          </div>

          {/* Published Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-amber-100">
            <div>
              <p className="font-bold text-slate-800">Terbitkan Modul</p>
              <p className="text-xs text-slate-500 mt-0.5">Siswa hanya bisa melihat modul yang sudah diterbitkan</p>
            </div>
            <button
              onClick={() => setIsPublished(!isPublished)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPublished ? 'bg-emerald-500' : 'bg-slate-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${isPublished ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* Premium Toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-amber-100">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="font-bold text-slate-800">Modul Premium</p>
                  <p className="text-xs text-slate-500 mt-0.5">Siswa perlu berlangganan atau membayar untuk mengakses</p>
                </div>
              </div>
              <button
                onClick={() => setIsPremium(!isPremium)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPremium ? 'bg-amber-500' : 'bg-slate-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${isPremium ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {isPremium && (
              <div className="space-y-2 pl-1">
                <Label className="font-bold text-amber-900">Harga Modul (Rp)</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">Rp</span>
                  <Input
                    type="number"
                    min={0}
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="Contoh: 15000"
                    className="pl-10 rounded-xl border-amber-200 focus-visible:ring-amber-500 bg-white"
                  />
                </div>
                <p className="text-xs text-amber-600">Isi 0 jika modul ini termasuk dalam paket berlangganan umum.</p>
              </div>
            )}
          </div>

          {result && (
            <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm font-medium ${result.ok
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              {result.ok ? <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />}
              <span>{result.message}</span>
            </div>
          )}

          <Button
            onClick={handleSave}
            disabled={isPending}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-6 rounded-xl shadow-lg shadow-amber-400/30 text-base"
          >
            {isPending ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Menyimpan...</>
            ) : (
              "Simpan Pengaturan Modul"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
