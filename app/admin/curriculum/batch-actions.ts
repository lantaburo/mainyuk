"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { generateQuestionsForModule } from "./actions";

export async function getAllModules() {
  await requireAdmin();

  const modules = await prisma.module.findMany({
    include: {
      subject: true,
      _count: {
        select: { questions: true }
      }
    },
    orderBy: [
      { gradeLevel: 'asc' },
      { subject: { name: 'asc' } },
      { createdAt: 'asc' }
    ]
  });

  return modules.map(m => ({
    id: m.id,
    title: m.title,
    gradeLevel: m.gradeLevel,
    subjectName: m.subject.name,
    questionCount: m._count.questions
  }));
}

export async function regenerateModuleQuestions(moduleId: string, count: number) {
  await requireAdmin();

  // 1. Delete all existing questions for this module
  await prisma.question.deleteMany({
    where: { moduleId }
  });

  // 2. Call the generator function (with targetLevel = "all")
  const result = await generateQuestionsForModule(moduleId, count, "all");

  if (!result.ok) {
    throw new Error(result.error);
  }

  return { ok: true };
}
