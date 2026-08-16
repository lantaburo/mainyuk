"use client";

import { useState, useTransition } from "react";
import { Plus, Loader2, CheckCircle2, XCircle, X, Library, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createModule } from "@/app/admin/curriculum/actions";
import { useRouter } from "next/navigation";

function toSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

type Props = {
  subjectId: string;
  subjectName: string;
  gradeLevel: number;
};

export function AddModuleDialog({ subjectId, subjectName, gradeLevel }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [description, setDescription] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [price, setPrice] = useState("");
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugManual) setSlug(toSlug(val));
  };

  const handleSlugChange = (val: string) => {
    setSlugManual(true);
    setSlug(toSlug(val));
  };

  const handleClose = () => {
    setOpen(false);
    setTitle("");
    setSlug("");
    setSlugManual(false);
    setDescription("");
    setIsPremium(false);
    setPrice("");
    setResult(null);
  };

  const handleSubmit = () => {
    setResult(null);
    startTransition(async () => {
      const res = await createModule({
        subjectId,
        gradeLevel,
        title,
        slug,
        description,
        isPremium,
        price: isPremium && price ? parseFloat(price) : null,
      });
      if (res.ok) {
        setResult({ ok: true, message: "Modul berhasil ditambahkan!" });
        setTimeout(() => {
          handleClose();
          router.refresh();
        }, 1000);
      } else {
        setResult({ ok: false, message: res.error || "Gagal menambahkan modul." });
      }
    });
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-emerald-600 hover:bg-emerald-700 shadow-md"
      >
        <Plus className="mr-2 h-4 w-4" />
        Tambah Modul Baru
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Close */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600">
                <Library className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-gray-900">Tambah Modul Baru</h2>
                <p className="text-xs text-gray-400">
                  {subjectName} · Kelas {gradeLevel}
                </p>
              </div>
            </div>

            <div className="h-px bg-gray-100" />

            {/* Form */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="font-semibold text-gray-700">Judul Modul</Label>
                <Input
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Contoh: Operasi Penjumlahan"
                  className="rounded-xl"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold text-gray-700">Slug (URL)</Label>
                <Input
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="Contoh: operasi-penjumlahan"
                  className="rounded-xl font-mono text-sm"
                />
                <p className="text-xs text-gray-400">
                  URL: /dashboard/module/<span className="font-mono text-gray-600">{slug || "..."}</span>/play
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold text-gray-700">Deskripsi (Opsional)</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deskripsi singkat isi modul ini..."
                  className="rounded-xl"
                />
              </div>

              {/* Published info */}
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-600 font-medium">
                💡 Modul baru akan disimpan sebagai <strong>Draft</strong>. Terbitkan melalui halaman pengaturan modul setelah soal ditambahkan.
              </div>

              {/* Premium toggle */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-200">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-500" />
                    <div>
                      <p className="font-semibold text-sm text-gray-800">Modul Premium</p>
                      <p className="text-xs text-gray-500">Siswa perlu membayar untuk akses</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPremium(!isPremium)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPremium ? "bg-amber-500" : "bg-gray-200"}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${isPremium ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>

                {isPremium && (
                  <div className="space-y-1.5 pl-1">
                    <Label className="font-semibold text-gray-700">Harga (Rp)</Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500 text-sm">Rp</span>
                      <Input
                        type="number"
                        min={0}
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="Contoh: 15000"
                        className="pl-10 rounded-xl"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {result && (
              <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${result.ok ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-rose-50 border border-rose-200 text-rose-800"}`}>
                {result.ok ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
                {result.message}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={handleClose}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button
                className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700"
                onClick={handleSubmit}
                disabled={isPending || !title.trim() || !slug.trim()}
              >
                {isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</>
                ) : (
                  "Tambah Modul"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
