"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Database, Loader2, CheckCircle } from "lucide-react";
import { seedCurriculum } from "@/app/admin/curriculum/actions";
import { toast } from "sonner";

export function SeedCurriculumButton() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isDone, setIsDone] = useState(false);

  async function handleSeed() {
    if (!confirm("Jalankan seed kurikulum? Proses ini akan men-generate ulang 1800 soal realistis dan MENGHAPUS/MENIMPA semua soal lama yang ada di database. Lanjutkan?")) return;

    setIsSeeding(true);
    setIsDone(false);
    try {
      const res = await seedCurriculum();
      if (res.ok) {
        toast.success(
          `Seed selesai! ${res.totalSubjects} mapel baru, ${res.totalModules} modul baru, ${res.totalQuestions} soal baru berhasil ditambahkan.`,
          { duration: 8000 }
        );
        setIsDone(true);
      } else {
        toast.error("Seed gagal, coba lagi.");
      }
    } catch (e) {
      toast.error("Terjadi kesalahan saat menjalankan seed.");
    } finally {
      setIsSeeding(false);
    }
  }

  return (
    <Button
      onClick={handleSeed}
      disabled={isSeeding}
      variant="outline"
      className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
    >
      {isSeeding ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isDone ? (
        <CheckCircle className="h-4 w-4 text-emerald-500" />
      ) : (
        <Database className="h-4 w-4" />
      )}
      {isSeeding ? "Seeding..." : isDone ? "Selesai!" : "Seed Kurikulum"}
    </Button>
  );
}
