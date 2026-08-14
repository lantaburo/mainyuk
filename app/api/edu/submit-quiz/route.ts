import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const { moduleId, score, studentId } = body;

    if (!moduleId) {
      return NextResponse.json({ error: "Module ID is required" }, { status: 400 });
    }

    const student = await prisma.studentProfile.findFirst({
      where: {
        id: studentId,
        parentId: session.user.id
      }
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found or unauthorized" }, { status: 403 });
    }

    const isCompleted = score >= 50; // Passing grade is 50% for dummy

    await prisma.studentProgress.upsert({
      where: {
        studentId_moduleId: {
          studentId: studentId,
          moduleId: moduleId,
        }
      },
      update: {
        score: Math.max(score, 0), // Ideally we only update if higher, but for now just update
        isCompleted: isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
      create: {
        studentId: body.studentId,
        moduleId: moduleId,
        score: score,
        isCompleted: isCompleted,
        completedAt: isCompleted ? new Date() : null,
      }
    });

    return NextResponse.json({ success: true, isCompleted });
  } catch (error) {
    console.error("[SUBMIT_QUIZ_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
