import { requireAdmin } from "@/lib/session";
import { getAllModules } from "../batch-actions";
import { BatchRegenerateClient } from "@/components/admin/BatchRegenerateClient";
import { ArrowLeft, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Auto Regenerate Soal - Admin",
};

export default async function BatchRegeneratePage() {
  await requireAdmin();
  const modules = await getAllModules();

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/curriculum">
            <Button variant="ghost" size="icon" className="rounded-full bg-white/50 hover:bg-white/80">
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
              <RefreshCcw className="w-8 h-8 text-indigo-600" />
              Auto Regenerate Soal
            </h1>
            <p className="mt-1 text-sm text-gray-500 max-w-2xl">
              Gunakan fitur ini untuk membuat ulang (regenerate) seluruh soal pada semua modul sekaligus. Proses ini akan menimpa soal-soal lama dengan soal baru hasil generasi AI berdasarkan aturan (rules) terbaru.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-800 shadow-sm">
        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
          ⚠️ Peringatan Penting
        </h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Proses ini akan <strong>menghapus permanen</strong> soal yang sudah ada di setiap modul.</li>
          <li>Sistem akan menggunakan kuota API AI Anda. Pemrosesan puluhan modul bisa menghabiskan waktu dan biaya.</li>
          <li>Biarkan halaman ini tetap terbuka selama proses berlangsung. Jika ditutup, proses yang belum selesai akan terhenti.</li>
        </ul>
      </div>

      <BatchRegenerateClient modules={modules} />
    </div>
  );
}
