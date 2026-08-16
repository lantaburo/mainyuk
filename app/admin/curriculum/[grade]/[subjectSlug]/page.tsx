import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { Library, ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddModuleDialog } from "@/components/admin/AddModuleDialog";

export default async function AdminCurriculumModulesPage({ params }: { params: { grade: string, subjectSlug: string } }) {
  await requireAdmin();

  const gradeLevel = parseInt(params.grade, 10);
  if (isNaN(gradeLevel) || gradeLevel < 1 || gradeLevel > 6) {
    notFound();
  }

  const subject = await prisma.subject.findUnique({
    where: { slug: params.subjectSlug },
  });

  if (!subject) {
    notFound();
  }

  const modules = await prisma.module.findMany({
    where: {
      subjectId: subject.id,
      gradeLevel,
    },
    include: {
      _count: { select: { questions: true } }
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
            <Link href="/admin/curriculum" className="hover:text-gray-600 transition-colors">Kurikulum</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href={`/admin/curriculum/${gradeLevel}`} className="hover:text-gray-600 transition-colors">Kelas {gradeLevel}</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-gray-500">{subject.name}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Modul {subject.name} (Kelas {gradeLevel})</h1>
          <p className="mt-2 text-sm text-gray-500">Kelola semua modul pembelajaran untuk kelas dan mata pelajaran ini.</p>
        </div>
        <AddModuleDialog
          subjectId={subject.id}
          subjectName={subject.name}
          gradeLevel={gradeLevel}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {modules.length === 0 ? (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-center bg-white/40 border border-white/60 rounded-3xl shadow-sm backdrop-blur-xl">
            <Library className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-900">Belum ada modul</h3>
            <p className="text-sm text-slate-500 max-w-sm mt-1">
              Tambahkan modul pertama untuk mulai membuat soal-soal pembelajaran.
            </p>
          </div>
        ) : (
          modules.map((mod) => (
            <Link key={mod.id} href={`/admin/curriculum/${gradeLevel}/${subject.slug}/${mod.id}`} className="block group">
              <div className="relative overflow-hidden rounded-3xl border border-white/50 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10 group h-full flex flex-col justify-between">
                <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-emerald-500/5 blur-3xl group-hover:bg-emerald-500/10 transition-all pointer-events-none"></div>
                
                <div className="flex items-start gap-4 relative z-10">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-white shadow-sm border border-emerald-100/50 text-emerald-600 flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Library className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-slate-900">{mod.title}</h3>
                    <p className="text-sm font-medium text-emerald-600 mt-1">{mod._count.questions} Soal Tersedia</p>
                    <div className="mt-2 flex gap-2">
                      {mod.isPremium && (
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 border border-amber-200">
                          Premium
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex items-center justify-between text-emerald-600 relative z-10">
                  <span className="text-sm font-bold">Kelola Soal</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
