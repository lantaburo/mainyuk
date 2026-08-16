import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-6 rounded-full bg-slate-100 text-slate-400">
            <SearchX className="h-16 w-16" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Halaman Tidak Ditemukan</h1>
          <p className="text-slate-500">
            Maaf, halaman yang Anda cari tidak ada atau URL yang Anda masukkan salah.
          </p>
        </div>
        <Link href="/" className="inline-block">
          <Button size="lg" className="rounded-full px-8 bg-indigo-600 hover:bg-indigo-700 font-bold">
            Kembali ke Beranda
          </Button>
        </Link>
      </div>
    </div>
  );
}
