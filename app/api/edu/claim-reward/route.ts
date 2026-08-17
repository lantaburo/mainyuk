import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const { studentId, itemId } = body;

    if (!studentId || !itemId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const student = await prisma.studentProfile.findFirst({
      where: {
        id: studentId,
        parentId: session.user.id
      }
    });

    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const item = await prisma.marketplaceItem.findUnique({
      where: { id: itemId }
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (student.starsBalance < item.price) {
      return NextResponse.json({ error: "Bintang tidak cukup" }, { status: 400 });
    }

    // Process transaction
    await prisma.$transaction([
      prisma.studentProfile.update({
        where: { id: studentId },
        data: { starsBalance: { decrement: item.price } }
      }),
      prisma.rewardClaim.create({
        data: {
          studentId: studentId,
          itemId: itemId,
          status: "pending"
        }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CLAIM_REWARD_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
