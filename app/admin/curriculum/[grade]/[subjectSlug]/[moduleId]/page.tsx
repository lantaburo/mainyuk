import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { HelpCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AiQuestionGenerator } from "@/components/admin/AiQuestionGenerator";
import { ModuleSettingsPanel } from "@/components/admin/ModuleSettingsPanel";
import { AddQuestionDialog } from "@/components/admin/AddQuestionDialog";
import { ModuleQuestionsClient } from "@/components/admin/ModuleQuestionsClient";

export default async function AdminCurriculumQuestionsPage({ 
  params 
}: { 
  params: { grade: string, subjectSlug: string, moduleId: string } 
}) {
  await requireAdmin();

  const gradeLevel = parseInt(params.grade, 10);
  if (isNaN(gradeLevel) || gradeLevel < 1 || gradeLevel > 6) {
    notFound();
  }

  const moduleData = await prisma.module.findUnique({
    where: { id: params.moduleId },
    include: {
      subject: true,
      questions: {
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (!moduleData || moduleData.subject.slug !== params.subjectSlug) {
    notFound();
  }

  const questionsByLevel = [1, 2, 3, 4, 5].map(level => ({
    level,
    questions: moduleData.questions.filter(q => q.difficultyLevel === level)
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/admin/curriculum/${gradeLevel}/${params.subjectSlug}`}>
          <Button variant="ghost" size="icon" className="rounded-full bg-white/50 hover:bg-white/80">
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{moduleData.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {moduleData.subject.name} · Kelas {gradeLevel}
            {" · "}
            <span className={`font-semibold ${moduleData.isPublished ? 'text-emerald-600' : 'text-slate-400'}`}>
              {moduleData.isPublished ? 'Diterbitkan' : 'Draft'}
            </span>
            {moduleData.isPremium && (
              <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 border border-amber-200">
                👑 Premium
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Module Settings Panel */}
      <ModuleSettingsPanel
        moduleId={moduleData.id}
        initialData={{
          title: moduleData.title,
          slug: moduleData.slug,
          description: moduleData.description,
          isPremium: moduleData.isPremium,
          price: moduleData.price ? String(moduleData.price) : null,
          isPublished: moduleData.isPublished,
        }}
      />

      {/* AI Generator Panel */}
      <AiQuestionGenerator
        moduleId={moduleData.id}
        moduleTitle={moduleData.title}
        subjectName={moduleData.subject.name}
        gradeLevel={gradeLevel}
      />

      {/* Questions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-gray-900">
            Daftar Soal 
            <span className="ml-2 text-base font-medium text-slate-400">({moduleData.questions.length} soal)</span>
          </h2>
          <AddQuestionDialog
            moduleId={moduleData.id}
            moduleTitle={moduleData.title}
          />
        </div>

        <ModuleQuestionsClient questions={moduleData.questions} />
      </div>
    </div>
  );
}
