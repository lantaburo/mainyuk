"use server";

import { requireSuperAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteAiDocument(id: string) {
  try {
    await requireSuperAdmin();
    
    // Optional: delete from R2 as well, but for now we just delete from DB
    await prisma.aiDocument.delete({
      where: { id }
    });

    revalidatePath("/admin/pengaturan-ai/documents");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: "Gagal menghapus dokumen." };
  }
}
