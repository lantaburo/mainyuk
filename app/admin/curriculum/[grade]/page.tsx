import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { BookOpen, Plus, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function AdminCurriculumSubjectsPage({ params }: { params: { grade: string } }) {
  await requireAdmin();

  const gradeLevel = parseInt(params.grade, 10);
  if (isNaN(gradeLevel) || gradeLevel < 1 || gradeLevel > 6) {
    notFound();
  }

  // Fetch all subjects, but count modules specifically for this grade
  const subjects = await prisma.subject.findMany({
    include: {
      _count: { 
        select: { 
          modules: {
            where: { gradeLevel }
          } 
        } 
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/curriculum">
          <Button variant="ghost" size="icon" className="rounded-full bg-white/50 hover:bg-white/80">
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Mata Pelajaran (Kelas {gradeLevel})</h1>
          <p className="mt-2 text-sm text-gray-500">Pilih mata pelajaran untuk mengelola modul di kelas ini.</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.length === 0 ? (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-center bg-white/40 border border-white/60 rounded-3xl shadow-sm backdrop-blur-xl">
            <BookOpen className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-900">Belum ada mata pelajaran</h3>
            <p className="text-sm text-slate-500 max-w-sm mt-1">
              Tambahkan mata pelajaran pertama di database.
            </p>
          </div>
        ) : (
          subjects.map((subject) => (
            <Link key={subject.id} href={`/admin/curriculum/${gradeLevel}/${subject.slug}`} className="block group">
              <div className="relative overflow-hidden rounded-3xl border border-white/50 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10 group h-full flex flex-col justify-between">
                <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-blue-500/5 blur-3xl group-hover:bg-blue-500/10 transition-all pointer-events-none"></div>
                
                <div className="flex items-start gap-4 relative z-10">
                  <div 
                    className="p-4 rounded-2xl shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform border border-white/60"
                    style={{ backgroundColor: subject.color ? `${subject.color}15` : '#3b82f615', color: subject.color || '#3b82f6' }}
                  >
                    <BookOpen className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-slate-900">{subject.name}</h3>
                    <p className="text-sm font-medium text-blue-600 mt-1">{subject._count.modules} Modul</p>
                  </div>
                </div>
                
                <div className="mt-8 flex items-center justify-between text-blue-600 relative z-10">
                  <span className="text-sm font-bold">Kelola Modul</span>
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
