"use client";

import { useState, useTransition } from "react";
import { Plus, Loader2, CheckCircle2, XCircle, X, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSubject } from "@/app/admin/curriculum/actions";
import { useRouter } from "next/navigation";

const PRESET_COLORS = [
  { label: "Merah", value: "#ef4444" },
  { label: "Oranye", value: "#f97316" },
  { label: "Kuning", value: "#eab308" },
  { label: "Hijau", value: "#22c55e" },
  { label: "Biru", value: "#3b82f6" },
  { label: "Ungu", value: "#8b5cf6" },
  { label: "Pink", value: "#ec4899" },
  { label: "Teal", value: "#14b8a6" },
];

function toSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function AddSubjectDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [color, setColor] = useState(PRESET_COLORS[4].value);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slugManual) setSlug(toSlug(val));
  };

  const handleSlugChange = (val: string) => {
    setSlugManual(true);
    setSlug(toSlug(val));
  };

  const handleSubmit = () => {
    setResult(null);
    startTransition(async () => {
      const res = await createSubject({ name, slug, color });
      if (res.ok) {
        setResult({ ok: true, message: "Mata pelajaran berhasil ditambahkan!" });
        setTimeout(() => {
          setOpen(false);
          setName("");
          setSlug("");
          setSlugManual(false);
          setColor(PRESET_COLORS[4].value);
          setResult(null);
          router.refresh();
        }, 1200);
      } else {
        setResult({ ok: false, message: res.error || "Gagal menambahkan mata pelajaran." });
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
        Tambah Mata Pelajaran
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-5">
            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-gray-900">Tambah Mata Pelajaran</h2>
                <p className="text-xs text-gray-400">Mapel akan tersedia untuk semua kelas</p>
              </div>
            </div>

            <div className="h-px bg-gray-100" />

            {/* Form */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="font-semibold text-gray-700">Nama Mata Pelajaran</Label>
                <Input
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Contoh: Matematika"
                  className="rounded-xl"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold text-gray-700">Slug (URL)</Label>
                <Input
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="Contoh: matematika"
                  className="rounded-xl font-mono text-sm"
                />
                <p className="text-xs text-gray-400">
                  URL: /dashboard/subject/<span className="font-mono text-gray-600">{slug || "..."}</span>
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold text-gray-700">Warna Ikon</Label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      title={c.label}
                      className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color === c.value ? "border-gray-900 scale-110" : "border-transparent"}`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
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
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button
                className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700"
                onClick={handleSubmit}
                disabled={isPending || !name.trim() || !slug.trim()}
              >
                {isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</>
                ) : (
                  "Tambah Mapel"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
