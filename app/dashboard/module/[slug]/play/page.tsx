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

  // Make sure to parse options correctly
  const formattedQuestions = moduleData.questions.map(q => ({
    id: q.id,
    question: q.questionText,
    options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
    correctIndex: q.correctIndex,
    explanation: q.explanation || "",
  }));

  return (
    <div className="max-w-4xl mx-auto py-8">
      <QuizPlayerContainer 
        moduleId={moduleData.id} 
        title={moduleData.title} 
        subjectSlug={moduleData.subject.slug}
        questions={formattedQuestions} 
        studentId={selectedStudentId}
      />
    </div>
  );
}
