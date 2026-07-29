"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/session";

const settingsSchema = z.object({
  provider: z.string().optional(),
  baseUrl: z.string().url("Base URL tidak valid"),
  apiKey: z.string().optional(),
  model: z.string().min(1, "Nama model wajib diisi"),
});

export async function updateAiSettings(formData: FormData) {
  await requireSuperAdmin();

  const parsed = settingsSchema.safeParse({
    provider: formData.get("provider") || undefined,
    baseUrl: formData.get("baseUrl"),
    apiKey: formData.get("apiKey") || undefined,
    model: formData.get("model"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Data tidak valid");

  const { provider, baseUrl, apiKey, model } = parsed.data;

  const existing = await prisma.aiSettings.findFirst();

  if (existing) {
    await prisma.aiSettings.update({
      where: { id: existing.id },
      data: {
        provider,
        baseUrl,
        model,
        ...(apiKey ? { apiKey } : {}),
      },
    });
  } else {
    if (!apiKey) throw new Error("API Key wajib diisi saat pertama kali menyimpan");
    await prisma.aiSettings.create({
      data: { provider, baseUrl, apiKey, model },
    });
  }

  revalidatePath("/admin/pengaturan-ai");
}
