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

    let newLevel = 1;
    let newIsCompleted = false;

    const existingProgress = await prisma.studentProgress.findUnique({
      where: {
        studentId_moduleId: {
          studentId: studentId,
          moduleId: moduleId,
        }
      }
    });

    if (existingProgress) {
      newLevel = existingProgress.currentLevel;
    }

    const passedLevel = score >= 60; // 60% passing grade for module

    if (passedLevel) {
      newIsCompleted = true; // Passed the module
    } else {
      newIsCompleted = existingProgress?.isCompleted || false;
    }

    await prisma.studentProgress.upsert({
      where: {
        studentId_moduleId: {
          studentId: studentId,
          moduleId: moduleId,
        }
      },
      update: {
        score: Math.max(score, existingProgress?.score || 0),
        currentLevel: Math.max(newLevel, existingProgress?.currentLevel || 1),
        isCompleted: newIsCompleted || existingProgress?.isCompleted || false,
        completedAt: (!existingProgress?.isCompleted && newIsCompleted) ? new Date() : existingProgress?.completedAt,
      },
      create: {
        studentId: body.studentId,
        moduleId: moduleId,
        score: score,
        currentLevel: newLevel,
        isCompleted: newIsCompleted,
        completedAt: newIsCompleted ? new Date() : null,
      }
    });

    const scoreDiff = Math.max(0, score - (existingProgress?.score || 0));
    if (scoreDiff > 0) {
      await prisma.studentProfile.update({
        where: { id: studentId },
        data: { starsBalance: { increment: scoreDiff } }
      });
    }

    return NextResponse.json({ success: true, isCompleted: newIsCompleted, newLevel, passedLevel, starsEarned: scoreDiff });
  } catch (error) {
    console.error("[SUBMIT_QUIZ_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
