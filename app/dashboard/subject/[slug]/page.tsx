import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import Link from "next/link";
import { cookies } from "next/headers";
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  Unlock,
  CheckCircle,
  Crown,
  PlayCircle,
  ShoppingCart,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CLASS_COLORS: Record<number, { accent: string; text: string; border: string; badge: string; bg: string }> = {
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

export default async function SubjectDetailPage({ params }: { params: { slug: string } }) {
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

  const subject = await prisma.subject.findUnique({
    where: { slug: params.slug },
    include: {
      modules: {
        where: { gradeLevel: student.gradeLevel },
        orderBy: { title: "asc" }, // Orders "Modul 1", "Modul 2", etc.
      },
    },
  });

  if (!subject) notFound();

  // Fetch student progress for this subject's modules
  const progress = await prisma.studentProgress.findMany({
    where: {
      studentId: student.id,
      moduleId: { in: subject.modules.map((m) => m.id) },
    },
  });

  const progressMap = progress.reduce((acc, curr) => {
    acc[curr.moduleId] = curr;
    return acc;
  }, {} as Record<string, any>);

  const completedCount = progress.filter((p) => p.isCompleted).length;
  const totalCount = subject.modules.length;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const colors = CLASS_COLORS[student.gradeLevel] ?? CLASS_COLORS[6];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* ── Breadcrumb ───────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className={`font-semibold ${colors.text}`}>Kelas {student.gradeLevel}</span>
        </Link>
        <ChevronRight className="h-4 w-4 text-gray-300" />
        <span className="text-gray-400 font-medium">{subject.name}</span>
        <ChevronRight className="h-4 w-4 text-gray-300" />
        <span className="text-gray-500 font-medium">Daftar Modul</span>
      </div>

      {/* ── Subject Header ───────────────────────────────────── */}
      <div className={`relative rounded-2xl bg-gradient-to-br ${colors.bg} p-6 md:p-8 text-white overflow-hidden shadow-md`}>
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute -bottom-8 -left-4 w-24 h-24 bg-white/10 rounded-full" />

        <div className="relative z-10">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold uppercase tracking-widest mb-3`}>
            <BookOpen className="h-3.5 w-3.5" />
            Kelas {student.gradeLevel}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{subject.name}</h1>
          <p className="text-white/80 mt-2 text-sm md:text-base">
            Selesaikan modul secara berurutan untuk membuka materi berikutnya.
          </p>

          {/* Progress bar */}
          <div className="mt-5">
            <div className="flex justify-between items-center mb-2 text-sm">
              <span className="text-white/80 font-medium">Progress keseluruhan</span>
              <span className="font-bold text-white">{completedCount}/{totalCount} modul ({pct}%)</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Module List ──────────────────────────────────────── */}
      {subject.modules.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium">Belum ada modul untuk mata pelajaran ini.</p>
        </div>
      ) : (
        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
          {subject.modules.map((module, index) => {
            const modProgress = progressMap[module.id];
            const isCompleted = modProgress?.isCompleted;

            // Logic: Module 1 is always unlocked. Others are unlocked if the PREVIOUS module is completed.
            const prevModule = index > 0 ? subject.modules[index - 1] : null;
            const prevModuleProgress = prevModule ? progressMap[prevModule.id] : null;

            let isUnlocked = index === 0 || !!prevModuleProgress?.isCompleted;
            const isLocked = !isUnlocked;
            const needsPayment = isUnlocked && module.isPremium;

            return (
              <div
                key={module.id}
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
              >
                {/* Timeline dot */}
                <div
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-full border-4 border-white shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10",
                    isCompleted
                      ? "bg-green-500 text-white"
                      : needsPayment
                      ? "bg-amber-500 text-white"
                      : isUnlocked
                      ? colors.accent + " text-white"
                      : "bg-gray-200 text-gray-400"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : needsPayment ? (
                    <Crown className="h-5 w-5" />
                  ) : isLocked ? (
                    <Lock className="h-5 w-5" />
                  ) : (
                    <Unlock className="h-5 w-5" />
                  )}
                </div>

                {/* Module card */}
                <div
                  className={cn(
                    "w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-4 rounded-2xl border-2 bg-white shadow-sm flex flex-col gap-3 transition-all",
                    isLocked ? "opacity-70" : "opacity-100",
                    isCompleted
                      ? "border-green-200 bg-green-50/30"
                      : needsPayment
                      ? "border-amber-200 bg-amber-50/50"
                      : isUnlocked
                      ? colors.border + " bg-white"
                      : "border-gray-100"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Modul {index + 1}
                        </span>
                        {isCompleted && (
                          <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                            Selesai
                          </span>
                        )}
                      </div>
                      <h3
                        className={cn(
                          "font-bold text-base",
                          isLocked ? "text-gray-500" : "text-gray-900"
                        )}
                      >
                        {module.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">{module.description}</p>
                    </div>
                    {module.isPremium && (
                      <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-1 rounded-md shrink-0 ml-2">
                        <Crown className="h-3 w-3" /> Premium
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="text-sm">
                      {isCompleted ? (
                        <span className="text-green-600 font-medium">
                          Nilai: {modProgress.score}/100
                        </span>
                      ) : needsPayment ? (
                        <span className="text-amber-600 font-medium">Akses Premium Dibutuhkan</span>
                      ) : isUnlocked ? (
                        <span className={`font-medium ${colors.text}`}>Siap dipelajari</span>
                      ) : (
                        <span className="text-gray-400">Selesaikan modul sebelumnya</span>
                      )}
                    </div>

                    {isUnlocked && !needsPayment ? (
                      <Link href={`/dashboard/module/${module.slug}/play`}>
                        <Button
                          disabled={isLocked}
                          variant={isCompleted ? "outline" : "default"}
                          className={cn(
                            isCompleted
                              ? "border-green-200 text-green-700 hover:bg-green-50"
                              : colors.accent + " hover:opacity-90 text-white border-0"
                          )}
                        >
                          <PlayCircle className="w-4 h-4 mr-2" />
                          {isCompleted ? "Ulangi" : "Mulai"}
                        </Button>
                      </Link>
                    ) : needsPayment ? (
                      <Button
                        variant="default"
                        className="bg-amber-500 hover:bg-amber-600 text-white"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Buka Akses
                      </Button>
                    ) : (
                      <Button disabled={true} variant="default">
                        <span className="cursor-not-allowed">Terkunci</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
