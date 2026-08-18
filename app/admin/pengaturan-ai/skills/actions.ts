"use server";

import { requireSuperAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createOrUpdateSkill(formData: FormData) {
  try {
    const session = await requireSuperAdmin();
    
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const content = formData.get("content") as string;

    if (!name || !content) {
      return { ok: false, error: "Nama dan konten wajib diisi." };
    }

    let skillId = id;

    // Create new skill if it doesn't exist
    if (!id) {
      const existing = await prisma.aiSkill.findUnique({ where: { name } });
      if (existing) {
        return { ok: false, error: "Skill dengan nama ini sudah ada." };
      }
      
      const newSkill = await prisma.aiSkill.create({
        data: {
          name,
          description,
          isActive: true
        }
      });
      skillId = newSkill.id;
    } else {
      // Update existing skill
      await prisma.aiSkill.update({
        where: { id },
        data: { name, description }
      });
    }

    // Determine new version number
    const lastVersion = await prisma.aiSkillVersion.findFirst({
      where: { skillId },
      orderBy: { version: "desc" }
    });
    const newVersionNum = lastVersion ? lastVersion.version + 1 : 1;

    // Deactivate previous versions
    await prisma.aiSkillVersion.updateMany({
      where: { skillId },
      data: { isActive: false }
    });

    // Create new version
    await prisma.aiSkillVersion.create({
      data: {
        skillId,
        content,
        version: newVersionNum,
        isActive: true,
        createdBy: session.user.id
      }
    });

    revalidatePath("/admin/pengaturan-ai/skills");
    return { ok: true };
  } catch (e: any) {
    console.error(e);
    return { ok: false, error: "Terjadi kesalahan saat menyimpan Skill." };
  }
}

export async function toggleSkillStatus(id: string, isActive: boolean) {
  try {
    await requireSuperAdmin();
    await prisma.aiSkill.update({
      where: { id },
      data: { isActive }
    });
    revalidatePath("/admin/pengaturan-ai/skills");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: "Gagal mengubah status." };
  }
}

export async function rollbackSkillVersion(skillId: string, versionId: string) {
  try {
    await requireSuperAdmin();
    
    // Deactivate all versions for this skill
    await prisma.aiSkillVersion.updateMany({
      where: { skillId },
      data: { isActive: false }
    });

    // Activate the selected version
    await prisma.aiSkillVersion.update({
      where: { id: versionId },
      data: { isActive: true }
    });

    revalidatePath("/admin/pengaturan-ai/skills");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: "Gagal melakukan rollback." };
  }
}
