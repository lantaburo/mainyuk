import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  BookOpen,
  Calculator,
  FlaskConical,
  Globe,
  Music,
  Palette,
  Dumbbell,
  ChevronRight,
  Star,
} from "lucide-react";

// Map icon names to components (fallback by subject name keywords)
const subjectIconMap: Record<string, React.ElementType> = {
  matematika: Calculator,
  ipa: FlaskConical,
  ips: Globe,
  bahasa: BookOpen,
  seni: Palette,
  musik: Music,
  olahraga: Dumbbell,
  pjok: Dumbbell,
};

function getSubjectIcon(name: string): React.ElementType {
  const lower = name.toLowerCase();
  for (const [key, Icon] of Object.entries(subjectIconMap)) {
    if (lower.includes(key)) return Icon;
  }
  return BookOpen;
}

const CLASS_LABELS: Record<number, string> = {
  1: "Satu", 2: "Dua", 3: "Tiga", 4: "Empat",
  5: "Lima", 6: "Enam", 7: "Tujuh", 8: "Delapan",
  9: "Sembilan", 10: "Sepuluh", 11: "Sebelas", 12: "Dua Belas",
};

const CLASS_COLORS: Record<number, { bg: string; accent: string; text: string; border: string; badge: string }> = {
  1:  { bg: "from-rose-400 to-pink-500",    accent: "bg-rose-500",    text: "text-rose-600",    border: "border-rose-200",    badge: "bg-rose-100 text-rose-700" },
  2:  { bg: "from-orange-400 to-amber-500", accent: "bg-orange-500",  text: "text-orange-600",  border: "border-orange-200",  badge: "bg-orange-100 text-orange-700" },
  3:  { bg: "from-yellow-400 to-lime-500",  accent: "bg-yellow-500",  text: "text-yellow-600",  border: "border-yellow-200",  badge: "bg-yellow-100 text-yellow-700" },
  4:  { bg: "from-emerald-400 to-teal-500", accent: "bg-emerald-500", text: "text-emerald-600", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700" },
  5:  { bg: "from-cyan-400 to-sky-500",     accent: "bg-cyan-500",    text: "text-cyan-600",    border: "border-cyan-200",    badge: "bg-cyan-100 text-cyan-700" },
  6:  { bg: "from-blue-400 to-indigo-500",  accent: "bg-blue-500",    text: "text-blue-600",    border: "border-blue-200",    badge: "bg-blue-100 text-blue-700" },
  7:  { bg: "from-violet-400 to-purple-500",accent: "bg-violet-500",  text: "text-violet-600",  border: "border-violet-200",  badge: "bg-violet-100 text-violet-700" },
  8:  { bg: "from-purple-400 to-fuchsia-500",accent:"bg-purple-500",  text: "text-purple-600",  border: "border-purple-200",  badge: "bg-purple-100 text-purple-700" },
  9:  { bg: "from-fuchsia-400 to-pink-500", accent: "bg-fuchsia-500", text: "text-fuchsia-600", border: "border-fuchsia-200", badge: "bg-fuchsia-100 text-fuchsia-700" },
  10: { bg: "from-sky-400 to-blue-600",     accent: "bg-sky-500",     text: "text-sky-600",     border: "border-sky-200",     badge: "bg-sky-100 text-sky-700" },
  11: { bg: "from-indigo-400 to-blue-600",  accent: "bg-indigo-500",  text: "text-indigo-600",  border: "border-indigo-200",  badge: "bg-indigo-100 text-indigo-700" },
  12: { bg: "from-slate-500 to-gray-700",   accent: "bg-slate-600",   text: "text-slate-600",   border: "border-slate-200",   badge: "bg-slate-100 text-slate-700" },
};

export default async function DashboardOverviewPage() {
  const session = await requireAuth();
  const cookieStore = cookies();
  const selectedStudentId = cookieStore.get("selectedStudentId")?.value;

  if (!selectedStudentId) {
    redirect("/select-profile");
  }

  const student = await prisma.studentProfile.findFirst({
    where: { id: selectedStudentId, parentId: session.user.id },
  });

  if (!student) {
    redirect("/select-profile");
  }

  // Get all subjects that have modules for this student's grade level
  const subjects = await prisma.subject.findMany({
    where: {
      modules: {
        some: { gradeLevel: student.gradeLevel },
      },
    },
    include: {
      _count: {
        select: {
          modules: {
            where: { gradeLevel: student.gradeLevel },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  // Get completed modules count per subject for progress
  const allModuleIds = await prisma.module.findMany({
    where: {
      gradeLevel: student.gradeLevel,
      subject: { slug: { in: subjects.map((s) => s.slug) } },
    },
    select: { id: true, subjectId: true },
  });

  const completedProgress = allModuleIds.length > 0
    ? await prisma.studentProgress.findMany({
        where: {
          studentId: student.id,
          moduleId: { in: allModuleIds.map((m) => m.id) },
          isCompleted: true,
        },
        select: { moduleId: true },
      })
    : [];

  const completedModuleIds = new Set(completedProgress.map((p) => p.moduleId));
  const completedBySubject: Record<string, number> = {};
  for (const m of allModuleIds) {
    if (!completedBySubject[m.subjectId]) completedBySubject[m.subjectId] = 0;
    if (completedModuleIds.has(m.id)) completedBySubject[m.subjectId]++;
  }

  const colors = CLASS_COLORS[student.gradeLevel] ?? CLASS_COLORS[6];
  const classLabel = CLASS_LABELS[student.gradeLevel] ?? String(student.gradeLevel);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* ── Kelas Banner ─────────────────────────────────────── */}
      <div className={`relative rounded-2xl bg-gradient-to-br ${colors.bg} p-6 md:p-8 text-white overflow-hidden shadow-lg`}>
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-10 -left-6 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute top-4 right-24 w-16 h-16 bg-white/10 rounded-full" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-4 w-4 text-white/70 fill-white/70" />
            <span className="text-white/80 text-sm font-medium uppercase tracking-widest">Ruang Belajar</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-1">
            Kelas {classLabel}
          </h1>
          <p className="text-white/80 text-base md:text-lg font-medium">
            Halo, <span className="text-white font-bold">{student.name}</span>! Pilih mata pelajaran untuk mulai belajar.
          </p>

          {/* Progress summary */}
          <div className="mt-5 flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-sm font-semibold">
              📚 {subjects.length} Mata Pelajaran
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-sm font-semibold">
              ✅ {completedProgress.length} Modul Selesai
            </div>
          </div>
        </div>
      </div>

      {/* ── Breadcrumb ───────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className={`font-semibold ${colors.text}`}>Kelas {student.gradeLevel}</span>
        <ChevronRight className="h-4 w-4 text-gray-300" />
        <span className="text-gray-400">Pilih Mata Pelajaran</span>
      </div>

      {/* ── Subject Grid ─────────────────────────────────────── */}
      {subjects.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium">Belum ada mata pelajaran untuk Kelas {student.gradeLevel}.</p>
          <p className="text-sm mt-1">Hubungi admin untuk menambahkan konten.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => {
            const SubjectIcon = getSubjectIcon(subject.name);
            const total = subject._count.modules;
            const done = completedBySubject[subject.id] ?? 0;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;

            return (
              <Link key={subject.id} href={`/dashboard/subject/${subject.slug}`}>
                <div className={`group relative rounded-2xl border-2 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer overflow-hidden ${colors.border} hover:${colors.border}`}>
                  {/* Top accent strip */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.bg}`} />

                  <div className="flex items-start gap-4 mt-1">
                    <div className={`p-3 rounded-xl ${colors.badge} shrink-0`}>
                      <SubjectIcon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base text-gray-900 group-hover:text-gray-700 truncate">
                        {subject.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {total} Modul Pembelajaran
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs text-gray-400 font-medium">Progress</span>
                      <span className={`text-xs font-bold ${colors.text}`}>{done}/{total} selesai</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${colors.bg} rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* CTA */}
                  <div className={`mt-4 pt-3 border-t ${colors.border} flex items-center justify-between`}>
                    <span className={`text-sm font-semibold ${colors.text} flex items-center gap-1`}>
                      {pct === 100 ? "Ulangi" : pct > 0 ? "Lanjutkan" : "Mulai Belajar"}
                    </span>
                    <ChevronRight className={`h-4 w-4 ${colors.text} transition-transform group-hover:translate-x-1`} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
