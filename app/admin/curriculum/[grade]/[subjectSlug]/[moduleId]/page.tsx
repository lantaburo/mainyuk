import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { HelpCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AiQuestionGenerator } from "@/components/admin/AiQuestionGenerator";
import { ModuleSettingsPanel } from "@/components/admin/ModuleSettingsPanel";
import { AddQuestionDialog } from "@/components/admin/AddQuestionDialog";
import { EditQuestionDialog } from "@/components/admin/EditQuestionDialog";
import { DeleteQuestionButton } from "@/components/admin/DeleteQuestionButton";

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

        {moduleData.questions.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center bg-white/40 border border-white/60 rounded-3xl shadow-sm backdrop-blur-xl">
            <HelpCircle className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-900">Belum ada soal</h3>
            <p className="text-sm text-slate-500 max-w-sm mt-1">
              Gunakan AI Generator di atas untuk membuat soal secara otomatis, atau tambahkan soal secara manual.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {questionsByLevel.map(({ level, questions }) => questions.length > 0 && (
              <div key={level} className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
                  <div className="px-3 py-1 bg-indigo-100 text-indigo-700 font-bold rounded-lg text-sm">Level {level}</div>
                  <span className="text-sm font-medium text-slate-500">{questions.length} soal</span>
                </div>
                {questions.map((q, idx) => {
                  const options = (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) as string[];
                  return (
                    <div key={q.id} className="relative overflow-hidden rounded-3xl border border-white/50 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm">
                          {idx + 1}
                        </div>
                        <div className="flex-1 space-y-4">
                          <h3 className="font-bold text-lg text-slate-900">{q.questionText}</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {options.map((opt, optIdx) => (
                              <div 
                                key={optIdx} 
                                className={`p-3 rounded-xl border ${optIdx === q.correctIndex ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-white border-slate-200 text-slate-600'}`}
                              >
                                <span className="font-medium text-sm">{String.fromCharCode(65 + optIdx)}. {opt}</span>
                                {optIdx === q.correctIndex && <span className="ml-2 text-xs font-bold text-emerald-600">✓ Benar</span>}
                              </div>
                            ))}
                          </div>
                          {q.explanation && (
                            <p className="text-sm text-slate-500 bg-slate-50 rounded-xl p-3 border border-slate-100">
                              <span className="font-semibold text-slate-600">Penjelasan: </span>
                              {q.explanation}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-2">
                          <EditQuestionDialog
                            questionId={q.id}
                            initialText={q.questionText}
                            initialOptions={options}
                            initialCorrectIndex={q.correctIndex}
                            initialDifficultyLevel={q.difficultyLevel}
                            initialExplanation={q.explanation}
                          />
                          <DeleteQuestionButton questionId={q.id} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
