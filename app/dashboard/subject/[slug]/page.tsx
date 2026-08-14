import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import Link from "next/link";
import { cookies } from "next/headers";
import { ChevronLeft, Lock, Unlock, CheckCircle, Crown, PlayCircle, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function SubjectDetailPage({ params }: { params: { slug: string } }) {
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
  
  const subject = await prisma.subject.findUnique({
    where: { slug: params.slug },
    include: {
      modules: {
        where: { gradeLevel: student.gradeLevel },
        orderBy: { title: 'asc' } // Orders "Modul 1", "Modul 2", etc.
      }
    }
  });

  if (!subject) notFound();

  // Fetch student progress for this subject's modules
  const progress = await prisma.studentProgress.findMany({
    where: {
      studentId: student.id,
      moduleId: { in: subject.modules.map(m => m.id) }
    }
  });

  const progressMap = progress.reduce((acc, curr) => {
    acc[curr.moduleId] = curr;
    return acc;
  }, {} as Record<string, any>);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 border border-gray-200 transition-colors">
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{subject.name}</h1>
            <span className={cn("px-3 py-1 rounded-full text-xs font-semibold text-white", subject.color || "bg-indigo-500")}>
              Kelas {student.gradeLevel}
            </span>
          </div>
          <p className="text-gray-500 mt-2">Selesaikan modul secara berurutan untuk membuka materi berikutnya.</p>
        </div>
      </div>

      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
        {subject.modules.map((module, index) => {
          const modProgress = progressMap[module.id];
          const isCompleted = modProgress?.isCompleted;
          
          // Logic: Module 1 is always unlocked. Others are unlocked if the PREVIOUS module is completed.
          const prevModule = index > 0 ? subject.modules[index - 1] : null;
          const prevModuleProgress = prevModule ? progressMap[prevModule.id] : null;
          
          let isUnlocked = index === 0 || !!prevModuleProgress?.isCompleted;
          const isLocked = !isUnlocked;
          const needsPayment = isUnlocked && module.isPremium; // e.g. Modul 3, 4, 5

          return (
            <div key={module.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className={cn(
                "flex items-center justify-center w-12 h-12 rounded-full border-4 border-white shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10",
                isCompleted ? "bg-green-500 text-white" : needsPayment ? "bg-amber-500 text-white" : isUnlocked ? "bg-indigo-500 text-white" : "bg-gray-200 text-gray-400"
              )}>
                {isCompleted ? <CheckCircle className="h-5 w-5" /> : needsPayment ? <Crown className="h-5 w-5" /> : isLocked ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5" />}
              </div>
              
              <div className={cn(
                "w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-4 rounded-xl border bg-white shadow-sm flex flex-col gap-3 transition-opacity",
                isLocked ? "opacity-75" : "opacity-100",
                needsPayment ? "border-amber-200 bg-amber-50/50" : ""
              )}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={cn("font-bold", isLocked ? "text-gray-500" : "text-gray-900")}>{module.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{module.description}</p>
                  </div>
                  {module.isPremium && (
                    <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-1 rounded-md">
                      <Crown className="h-3 w-3" /> Premium
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-100">
                  <div className="text-sm">
                    {isCompleted ? (
                      <span className="text-green-600 font-medium">Nilai: {modProgress.score}/100</span>
                    ) : needsPayment ? (
                      <span className="text-amber-600 font-medium">Akses Premium Dibutuhkan</span>
                    ) : isUnlocked ? (
                      <span className="text-indigo-600 font-medium">Siap dipelajari</span>
                    ) : (
                      <span className="text-gray-400">Selesaikan modul sebelumnya</span>
                    )}
                  </div>
                  
                  {isUnlocked && !needsPayment ? (
                    <Link href={`/dashboard/module/${module.slug}/play`}>
                      <Button 
                        disabled={isLocked}
                        variant={isCompleted ? "outline" : "default"}
                        className={cn(isCompleted ? "border-green-200 text-green-700 hover:bg-green-50" : "")}
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
                    <Button 
                      disabled={true}
                      variant="default"
                    >
                      <span className="cursor-not-allowed">Terkunci</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
