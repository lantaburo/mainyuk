import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { cookies } from "next/headers";
import QuizPlayerContainer from "./QuizPlayerContainer";

export default async function ModulePlayPage({ params }: { params: { slug: string } }) {
  const session = await requireAuth();
  const cookieStore = cookies();
  const selectedStudentId = cookieStore.get("selectedStudentId")?.value;

  if (!selectedStudentId) {
    redirect("/select-profile");
  }
  
  const moduleData = await prisma.module.findFirst({
    where: { slug: params.slug },
    include: {
      subject: true,
      questions: {
        orderBy: { id: 'asc' }
      }
    }
  });

  if (!moduleData) notFound();

  const progress = await prisma.studentProgress.findUnique({
    where: {
      studentId_moduleId: {
        studentId: selectedStudentId,
        moduleId: moduleData.id
      }
    }
  });

  const currentLevel = progress ? progress.currentLevel : 1;
  const isCompleted = progress ? progress.isCompleted : false;

  // Filter questions for the current level
  const levelQuestions = moduleData.questions.filter(q => q.difficultyLevel === currentLevel);

  const formattedQuestions = levelQuestions.map(q => ({
    id: q.id,
    question: q.questionText,
    options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
    correctIndex: q.correctIndex,
    explanation: q.explanation || "",
  }));

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-4 text-center">
        <h2 className="text-xl font-bold text-indigo-900">Level {currentLevel}</h2>
        {isCompleted && (
          <p className="text-sm text-emerald-600 font-bold mt-1">Kamu sudah menyelesaikan semua level di modul ini! 🎉</p>
        )}
      </div>
      <QuizPlayerContainer 
        moduleId={moduleData.id} 
        title={moduleData.title} 
        subjectSlug={moduleData.subject.slug}
        questions={formattedQuestions} 
        studentId={selectedStudentId}
        currentLevel={currentLevel}
      />
    </div>
  );
}
