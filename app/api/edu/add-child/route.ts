import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { z } from "zod";

const addChildSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  gradeLevel: z.number().int().min(1).max(6)
});

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    
    const body = await req.json();
    const parsed = addChildSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
        { status: 400 }
      );
    }

    // Check limit (max 2 children for free version)
    const count = await prisma.studentProfile.count({
      where: { parentId: session.user.id }
    });

    if (count >= 3) {
      return NextResponse.json(
        { error: "Maksimal 3 anak untuk versi gratis. Silakan upgrade ke Premium untuk menambah anak ke-4." },
        { status: 403 }
      );
    }

    const { name, gradeLevel } = parsed.data;

    const child = await prisma.studentProfile.create({
      data: {
        parentId: session.user.id,
        name,
        gradeLevel
      }
    });

    return NextResponse.json({ ok: true, child });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
