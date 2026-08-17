import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { GraduationCap, ArrowRight, BookOpen, Library } from "lucide-react";
import Link from "next/link";
import { SeedCurriculumButton } from "@/components/admin/SeedCurriculumButton";

const GRADE_COLORS = [
  { bg: "from-rose-400 to-pink-500",     light: "bg-rose-50",    text: "text-rose-600",    border: "border-rose-100" },
  { bg: "from-orange-400 to-amber-500",  light: "bg-orange-50",  text: "text-orange-600",  border: "border-orange-100" },
  { bg: "from-yellow-400 to-lime-500",   light: "bg-yellow-50",  text: "text-yellow-600",  border: "border-yellow-100" },
  { bg: "from-emerald-400 to-teal-500",  light: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
  { bg: "from-cyan-400 to-sky-500",      light: "bg-cyan-50",    text: "text-cyan-600",    border: "border-cyan-100" },
  { bg: "from-blue-400 to-indigo-500",   light: "bg-blue-50",    text: "text-blue-600",    border: "border-blue-100" },
  { bg: "from-violet-400 to-purple-500", light: "bg-violet-50",  text: "text-violet-600",  border: "border-violet-100" },
  { bg: "from-fuchsia-400 to-pink-600",  light: "bg-fuchsia-50", text: "text-fuchsia-600", border: "border-fuchsia-100" },
  { bg: "from-slate-400 to-gray-600",    light: "bg-slate-50",   text: "text-slate-600",   border: "border-slate-100" },
];

export default async function AdminCurriculumGradeSelectionPage() {
  await requireAdmin();

  const grades = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  // Ambil statistik per kelas: jumlah mapel (subject dengan modul) & jumlah modul
  const statsPerGrade = await Promise.all(
    grades.map(async (grade) => {
      const [subjectCount, moduleCount] = await Promise.all([
        prisma.subject.count({
          where: { modules: { some: { gradeLevel: grade } } },
        }),
        prisma.module.count({ where: { gradeLevel: grade } }),
      ]);
      return { grade, subjectCount, moduleCount };
    })
  );

  const statsMap = Object.fromEntries(statsPerGrade.map((s) => [s.grade, s]));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Manajemen Kurikulum</h1>
          <p className="mt-2 text-sm text-gray-500">
            Pilih jenjang kelas untuk mengelola mata pelajaran, modul, dan soal.
          </p>
        </div>
        <SeedCurriculumButton />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {grades.map((grade) => {
          const color = GRADE_COLORS[grade - 1] ?? GRADE_COLORS[5];
          const stats = statsMap[grade];

          return (
            <Link href={`/admin/curriculum/${grade}`} key={grade} className="block group">
              <div className="relative overflow-hidden rounded-3xl border border-white/50 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg h-full flex flex-col justify-between">
                {/* Gradient accent top strip */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${color.bg} rounded-t-3xl`} />
                <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-3xl pointer-events-none" />

                <div className="flex items-start justify-between relative z-10 mt-2">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl ${color.light} border ${color.border} ${color.text} group-hover:scale-110 transition-transform`}>
                      <GraduationCap className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="font-bold text-2xl text-slate-900">Kelas {grade}</h3>
                      <p className="text-sm text-slate-500 mt-0.5">Sekolah Dasar</p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-5 grid grid-cols-2 gap-3 relative z-10">
                  <div className={`rounded-xl p-3 ${color.light} border ${color.border}`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <BookOpen className={`h-3.5 w-3.5 ${color.text}`} />
                      <span className={`text-xs font-semibold ${color.text}`}>Mapel</span>
                    </div>
                    <p className="text-2xl font-extrabold text-slate-900">{stats.subjectCount}</p>
                  </div>
                  <div className={`rounded-xl p-3 ${color.light} border ${color.border}`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Library className={`h-3.5 w-3.5 ${color.text}`} />
                      <span className={`text-xs font-semibold ${color.text}`}>Modul</span>
                    </div>
                    <p className="text-2xl font-extrabold text-slate-900">{stats.moduleCount}</p>
                  </div>
                </div>

                <div className={`mt-5 flex items-center justify-between ${color.text} relative z-10`}>
                  <span className="text-sm font-bold">Kelola Pelajaran</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
