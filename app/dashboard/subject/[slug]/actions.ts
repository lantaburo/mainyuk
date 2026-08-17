"use server";

import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function unlockModuleWithStars(studentId: string, moduleId: string, cost: number) {
  try {
    const session = await requireAuth();

    const student = await prisma.studentProfile.findFirst({
      where: {
        id: studentId,
        parentId: session.user.id
      }
    });

    if (!student) {
      return { ok: false, error: "Unauthorized" };
    }

    if (student.starsBalance < cost) {
      return { ok: false, error: "Bintang tidak cukup" };
    }

    // Check if already unlocked
    const existing = await prisma.moduleAccess.findUnique({
      where: {
        studentId_moduleId: { studentId, moduleId }
      }
    });

    if (existing) {
      return { ok: true, message: "Modul sudah terbuka." };
    }

    await prisma.$transaction([
      prisma.studentProfile.update({
        where: { id: studentId },
        data: { starsBalance: { decrement: cost } }
      }),
      prisma.moduleAccess.create({
        data: {
          studentId,
          moduleId,
          unlockMethod: "stars"
        }
      })
    ]);

    revalidatePath(`/dashboard/subject`);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Gagal membuka modul." };
  }
}
