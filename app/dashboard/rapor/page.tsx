import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { cookies } from "next/headers";
import { GraduationCap, Award, CheckCircle, BookOpen, Star, Trophy, Target } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function RaporPage() {
  const session = await requireAuth();
  const cookieStore = cookies();
  const selectedStudentId = cookieStore.get("selectedStudentId")?.value;

  if (!selectedStudentId) {
    redirect("/select-profile");
  }

  const student = await prisma.studentProfile.findFirst({
    where: { id: selectedStudentId, parentId: session.user.id }
  });

  if (!student) {
    redirect("/select-profile");
  }

  // Fetch all subjects and their modules for the student's grade level
  const subjects = await prisma.subject.findMany({
    include: {
      modules: {
        where: { gradeLevel: student.gradeLevel }
      }
    }
  });

  // Fetch completed progress
  const progress = await prisma.studentProgress.findMany({
    where: { studentId: student.id, isCompleted: true },
    include: { module: { include: { subject: true } } },
    orderBy: { completedAt: 'asc' }
  });

  // Overall Stats
  const totalCompleted = progress.length;
  const averageScore = totalCompleted > 0 
    ? Math.round(progress.reduce((acc, p) => acc + p.score, 0) / totalCompleted) 
    : 0;

  // Recent progress for chart
  const recentProgress = progress.slice(-8); // Last 8 quizzes

  // Compute stats per subject
  const subjectStats = subjects.map(subject => {
    const subjectModules = subject.modules;
    const totalModules = subjectModules.length;
    
    const subjectProgress = progress.filter(p => p.module.subjectId === subject.id);
    const completedModules = subjectProgress.length;
    
    const avgScore = completedModules > 0 
      ? Math.round(subjectProgress.reduce((acc, p) => acc + p.score, 0) / completedModules) 
      : 0;
      
    const isMastered = totalModules > 0 && completedModules === totalModules;
    const progressPercent = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

    return {
      ...subject,
      totalModules,
      completedModules,
      avgScore,
      isMastered,
      progressPercent
    };
  });

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-8">
      {/* Header Profile & Overall Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="lg:col-span-1 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm font-semibold mb-4 backdrop-blur-sm">
                <GraduationCap className="w-4 h-4" />
                Rapor Anak
              </div>
              <h1 className="text-3xl font-black mb-1">{student.name}</h1>
              <p className="text-indigo-100 font-medium">Siswa Kelas {student.gradeLevel} SD</p>
            </div>
            
            <div className="mt-8 bg-white/10 p-4 rounded-2xl backdrop-blur-md">
              <div className="text-sm text-indigo-100 mb-1">Predikat Saat Ini</div>
              <div className="text-2xl font-bold flex items-center gap-2">
                {averageScore >= 90 ? (
                  <><Award className="w-6 h-6 text-yellow-300" /> Bintang Kelas</>
                ) : averageScore >= 75 ? (
                  <><Star className="w-6 h-6 text-yellow-300" /> Pelajar Rajin</>
                ) : (
                  <><Target className="w-6 h-6 text-blue-200" /> Penjelajah Ilmu</>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <BookOpen className="w-24 h-24 text-blue-500" />
            </div>
            <div className="relative z-10">
              <p className="text-slate-500 font-semibold mb-2">Modul Diselesaikan</p>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black text-slate-800">{totalCompleted}</span>
                <span className="text-slate-400 font-medium mb-1">modul</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Star className="w-24 h-24 text-yellow-500" />
            </div>
            <div className="relative z-10">
              <p className="text-slate-500 font-semibold mb-2">Rata-rata Nilai</p>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black text-slate-800">{averageScore}</span>
                <span className="text-slate-400 font-medium mb-1">/ 100</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Growth Chart */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              Grafik Pertumbuhan Nilai
            </h2>
            <p className="text-slate-500 mt-1">Nilai dari 8 kuis terakhir yang dikerjakan.</p>
          </div>
        </div>

        {recentProgress.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
            Belum ada data nilai kuis untuk ditampilkan.
          </div>
        ) : (
          <div className="h-64 flex items-end justify-between gap-2 lg:gap-4 px-2 lg:px-8">
            {recentProgress.map((p, idx) => {
              // Ensure height is minimum 10% to be visible, max 100%
              const heightPercent = Math.max(10, p.score);
              return (
                <div key={p.id} className="flex flex-col items-center justify-end h-full flex-1 group">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs py-1 px-2 rounded mb-2 whitespace-nowrap z-10 absolute -translate-y-full pointer-events-none">
                    {p.module.title}: {p.score}
                  </div>
                  
                  {/* Bar */}
                  <div className="w-full relative flex items-end justify-center h-full">
                    <div 
                      className={cn(
                        "w-full lg:w-16 rounded-t-xl transition-all duration-700 hover:opacity-80 group-hover:scale-105",
                        p.score >= 80 ? "bg-gradient-to-t from-emerald-400 to-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : 
                        p.score >= 60 ? "bg-gradient-to-t from-indigo-400 to-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]" : 
                        "bg-gradient-to-t from-amber-400 to-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                      )}
                      style={{ height: `${heightPercent}%` }}
                    >
                      <div className="absolute -top-6 w-full text-center font-bold text-sm text-slate-600">
                        {p.score}
                      </div>
                    </div>
                  </div>
                  
                  {/* Label */}
                  <div className="mt-4 text-[10px] lg:text-xs font-semibold text-slate-500 text-center truncate w-full px-1">
                    {p.module.subject.name}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Subject List */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-indigo-500" />
          Rincian Mata Pelajaran
        </h2>

        {subjectStats.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700">Belum ada mata pelajaran</h3>
            <p className="text-slate-500 mt-2">Belum ada modul yang tersedia untuk kelas {student.gradeLevel}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subjectStats.map((subject) => (
              <div key={subject.id} className={cn(
                "rounded-3xl p-6 border transition-all duration-300 relative overflow-hidden",
                subject.isMastered 
                  ? "bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200" 
                  : "bg-white border-slate-200 hover:border-indigo-200 hover:shadow-md"
              )}>
                {/* Background Mastery Icon */}
                {subject.isMastered && (
                  <div className="absolute -right-6 -top-6 opacity-10">
                    <Trophy className="w-48 h-48 text-emerald-600" />
                  </div>
                )}

                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl text-white shadow-sm",
                      subject.color || "bg-indigo-500"
                    )}>
                      {subject.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">{subject.name}</h3>
                      <p className="text-sm text-slate-500 font-medium">
                        {subject.completedModules} dari {subject.totalModules} Modul Selesai
                      </p>
                    </div>
                  </div>
                  {subject.isMastered && (
                    <div className="bg-emerald-500 text-white p-2 rounded-full shadow-sm animate-bounce">
                      <Trophy className="w-5 h-5" />
                    </div>
                  )}
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-semibold text-slate-600">Progress Belajar</span>
                    <span className="text-sm font-bold text-slate-800">{subject.progressPercent}%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-1000 ease-out",
                        subject.isMastered ? "bg-emerald-500" : "bg-indigo-500"
                      )}
                      style={{ width: `${subject.progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/60 flex justify-between items-center relative z-10">
                  <span className="text-sm font-medium text-slate-500">Rata-rata Nilai</span>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-xl font-black",
                      subject.avgScore >= 80 ? "text-emerald-600" : 
                      subject.avgScore >= 60 ? "text-indigo-600" : "text-amber-600"
                    )}>
                      {subject.avgScore}
                    </span>
                    <span className="text-sm text-slate-400 font-medium">/ 100</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
