import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";

export async function DELETE(req: Request) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get("id");

    if (!profileId) {
      return NextResponse.json({ error: "ID profil diperlukan" }, { status: 400 });
    }

    // Verify ownership
    const profile = await prisma.studentProfile.findFirst({
      where: {
        id: profileId,
        parentId: session.user.id
      }
    });

    if (!profile) {
      return NextResponse.json({ error: "Profil tidak ditemukan atau bukan milik Anda" }, { status: 403 });
    }

    // Delete profile (StudentProgress is deleted via Cascade in Prisma schema)
    await prisma.studentProfile.delete({
      where: { id: profileId }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal menghapus profil" }, { status: 500 });
  }
}
