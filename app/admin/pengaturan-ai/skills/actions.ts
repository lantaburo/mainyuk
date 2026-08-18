"use server";

import { requireSuperAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
const pdfParse = require("pdf-parse");
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

export async function createOrUpdateSkill(formData: FormData) {
  try {
    const session = await requireSuperAdmin();
    
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const content = formData.get("content") as string;
    const attachment = formData.get("attachment") as File | null;

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

    // Process attachment if provided
    let attachedFileName = null;
    let attachedFileUrl = null;
    let attachedFileText = null;

    if (attachment && attachment.size > 0) {
      const arrayBuffer = await attachment.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      if (attachment.name.toLowerCase().endsWith(".pdf")) {
        const pdfData = await pdfParse(buffer);
        attachedFileText = pdfData.text;
      } else if (attachment.name.toLowerCase().endsWith(".txt")) {
        attachedFileText = buffer.toString("utf-8");
      } else {
        return { ok: false, error: "Format lampiran harus PDF atau TXT." };
      }

      const fileExtension = attachment.name.split('.').pop();
      const fileName = `ai-skills/${nanoid()}.${fileExtension}`;
      
      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: fileName,
          Body: buffer,
          ContentType: attachment.type,
        })
      );

      attachedFileName = attachment.name;
      attachedFileUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;
    } else if (id) {
      // If updating but no new file is uploaded, keep the old one
      const lastVersion = await prisma.aiSkillVersion.findFirst({
        where: { skillId: id, isActive: true }
      });
      if (lastVersion) {
        attachedFileName = lastVersion.attachedFileName;
        attachedFileUrl = lastVersion.attachedFileUrl;
        attachedFileText = lastVersion.attachedFileText;
      }
    }

    // Determine new version number
    const lastVersionData = await prisma.aiSkillVersion.findFirst({
      where: { skillId },
      orderBy: { version: "desc" }
    });
    const newVersionNum = lastVersionData ? lastVersionData.version + 1 : 1;

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
        createdBy: session.user.id,
        attachedFileName,
        attachedFileUrl,
        attachedFileText
      }
    });

    revalidatePath("/admin/pengaturan-ai/skills");
    return { ok: true };
  } catch (e: any) {
    console.error("DEBUG SKILL ERROR:", e);
    return { ok: false, error: `Terjadi kesalahan: ${e.message || String(e)}` };
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
