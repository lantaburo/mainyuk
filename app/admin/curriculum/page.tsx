import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { GraduationCap, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function AdminCurriculumGradeSelectionPage() {
  await requireAdmin();

  const grades = [1, 2, 3, 4, 5, 6];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Manajemen Kurikulum</h1>
          <p className="mt-2 text-sm text-gray-500">Pilih jenjang kelas untuk mengelola mata pelajaran, modul, dan soal.</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {grades.map((grade) => (
          <Link href={`/admin/curriculum/${grade}`} key={grade} className="block group">
            <div className="relative overflow-hidden rounded-3xl border border-white/50 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10 h-full flex flex-col justify-between">
              <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-indigo-500/5 blur-3xl group-hover:bg-indigo-500/10 transition-all pointer-events-none"></div>
              
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-white shadow-sm border border-indigo-100/50 text-indigo-600 group-hover:scale-110 transition-transform">
                    <GraduationCap className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-2xl text-slate-900">Kelas {grade}</h3>
                    <p className="text-sm text-slate-500 mt-1">Sekolah Dasar</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex items-center justify-between text-indigo-600 relative z-10">
                <span className="text-sm font-bold">Kelola Pelajaran</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
