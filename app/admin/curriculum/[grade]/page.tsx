import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { BookOpen, ArrowLeft, ArrowRight, Library, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddSubjectDialog } from "@/components/admin/AddSubjectDialog";

const GRADE_COLORS = [
  { bg: "from-rose-400 to-pink-500",     light: "bg-rose-50",    text: "text-rose-600",    border: "border-rose-200",    badge: "bg-rose-100 text-rose-700" },
  { bg: "from-orange-400 to-amber-500",  light: "bg-orange-50",  text: "text-orange-600",  border: "border-orange-200",  badge: "bg-orange-100 text-orange-700" },
  { bg: "from-yellow-400 to-lime-500",   light: "bg-yellow-50",  text: "text-yellow-600",  border: "border-yellow-200",  badge: "bg-yellow-100 text-yellow-700" },
  { bg: "from-emerald-400 to-teal-500",  light: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700" },
  { bg: "from-cyan-400 to-sky-500",      light: "bg-cyan-50",    text: "text-cyan-600",    border: "border-cyan-200",    badge: "bg-cyan-100 text-cyan-700" },
  { bg: "from-blue-400 to-indigo-500",   light: "bg-blue-50",    text: "text-blue-600",    border: "border-blue-200",    badge: "bg-blue-100 text-blue-700" },
];

export default async function AdminCurriculumSubjectsPage({ params }: { params: { grade: string } }) {
  await requireAdmin();

  const gradeLevel = parseInt(params.grade, 10);
  if (isNaN(gradeLevel) || gradeLevel < 1 || gradeLevel > 6) {
    notFound();
  }

  const color = GRADE_COLORS[gradeLevel - 1] ?? GRADE_COLORS[5];

  // Hanya ambil mapel yang memiliki modul di kelas ini
  const subjects = await prisma.subject.findMany({
    where: {
      modules: {
        some: { gradeLevel },
      },
    },
    include: {
      _count: {
        select: {
          modules: {
            where: { gradeLevel },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  // Semua mapel (termasuk yang belum punya modul di kelas ini) untuk referensi
  const allSubjects = await prisma.subject.findMany({ orderBy: { name: "asc" } });
  const subjectsWithoutModules = allSubjects.filter(
    (s) => !subjects.find((existing) => existing.id === s.id)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/curriculum">
          <Button variant="ghost" size="icon" className="rounded-full bg-white/50 hover:bg-white/80">
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Button>
        </Link>
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
            <Link href="/admin/curriculum" className="hover:text-gray-600 transition-colors">
              Kurikulum
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className={`font-semibold ${color.text}`}>Kelas {gradeLevel}</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-gray-500">Mata Pelajaran</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Mata Pelajaran — Kelas {gradeLevel}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {subjects.length} mata pelajaran aktif di kelas ini.
          </p>
        </div>
      </div>

      {/* Button tambah */}
      <div className="flex justify-end">
        <AddSubjectDialog />
      </div>

      {/* Active subjects grid */}
      {subjects.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-center bg-white/40 border border-white/60 rounded-3xl shadow-sm backdrop-blur-xl">
          <BookOpen className="h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-900">Belum ada mata pelajaran</h3>
          <p className="text-sm text-slate-500 max-w-sm mt-1">
            Tambahkan modul untuk mata pelajaran tertentu agar muncul di sini.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <Link
              key={subject.id}
              href={`/admin/curriculum/${gradeLevel}/${subject.slug}`}
              className="block group"
            >
              <div className={`relative overflow-hidden rounded-3xl border-2 ${color.border} bg-white/70 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg h-full flex flex-col justify-between`}>
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${color.bg} rounded-t-3xl`} />
                <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-3xl pointer-events-none" />

                <div className="flex items-start gap-4 relative z-10 mt-2">
                  <div
                    className={`p-4 rounded-2xl ${color.light} border ${color.border} flex-shrink-0 group-hover:scale-110 transition-transform`}
                    style={subject.color ? { backgroundColor: `${subject.color}15`, borderColor: `${subject.color}30` } : {}}
                  >
                    <BookOpen className="h-7 w-7" style={subject.color ? { color: subject.color } : {}} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-slate-900">{subject.name}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${color.badge}`}>
                        <Library className="h-3 w-3" />
                        {subject._count.modules} Modul
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`mt-6 flex items-center justify-between ${color.text} relative z-10`}>
                  <span className="text-sm font-bold">Kelola Modul</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Mapel tanpa modul di kelas ini (referensi) */}
      {subjectsWithoutModules.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">
              Mapel belum punya modul di Kelas {gradeLevel}
            </span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {subjectsWithoutModules.map((subject) => (
              <div
                key={subject.id}
                className="relative overflow-hidden rounded-2xl border border-dashed border-gray-200 bg-white/40 p-4 backdrop-blur-xl flex items-center gap-3 opacity-60"
              >
                <div className="p-2.5 rounded-xl bg-gray-100">
                  <BookOpen className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-600">{subject.name}</p>
                  <p className="text-xs text-gray-400">Belum ada modul</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
