"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/session";

const providerSchema = z.object({
  id: z.string().optional(),
  provider: z.string().min(1, "Nama provider wajib diisi"),
  baseUrl: z.string().url("Base URL tidak valid"),
  apiKey: z.string().optional(),
  model: z.string().min(1, "Nama model wajib diisi"),
});

export async function saveProviderAction(formData: FormData) {
  await requireSuperAdmin();

  const parsed = providerSchema.safeParse({
    id: formData.get("id") || undefined,
    provider: formData.get("provider"),
    baseUrl: formData.get("baseUrl"),
    apiKey: formData.get("apiKey") || undefined,
    model: formData.get("model"),
  });

  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Data tidak valid");

  const { id, provider, baseUrl, apiKey, model } = parsed.data;

  if (id) {
    // Update
    await prisma.aiProvider.update({
      where: { id },
      data: {
        provider,
        baseUrl,
        model,
        ...(apiKey ? { apiKey } : {}), // Hanya update apiKey jika diisi
      },
    });
  } else {
    // Create
    if (!apiKey) throw new Error("API Key wajib diisi untuk provider baru");
    
    // Set priority to be at the bottom by default
    const count = await prisma.aiProvider.count();
    
    await prisma.aiProvider.create({
      data: { 
        provider, 
        baseUrl, 
        apiKey, 
        model,
        priority: count // Next priority
      },
    });
  }

  revalidatePath("/admin/pengaturan-ai");
}

export async function deleteProviderAction(id: string) {
  await requireSuperAdmin();
  await prisma.aiProvider.delete({ where: { id } });
  revalidatePath("/admin/pengaturan-ai");
}

export async function toggleProviderAction(id: string, currentStatus: boolean) {
  await requireSuperAdmin();
  await prisma.aiProvider.update({
    where: { id },
    data: { isActive: !currentStatus },
  });
  revalidatePath("/admin/pengaturan-ai");
}

export async function moveProviderAction(id: string, direction: "up" | "down") {
  await requireSuperAdmin();
  const current = await prisma.aiProvider.findUniqueOrThrow({ where: { id } });
  
  // Find the target to swap with
  const target = await prisma.aiProvider.findFirst({
    where: {
      priority: direction === "up" ? { lt: current.priority } : { gt: current.priority }
    },
    orderBy: { priority: direction === "up" ? "desc" : "asc" }
  });

  if (target) {
    // Swap priorities
    await prisma.$transaction([
      prisma.aiProvider.update({
        where: { id: current.id },
        data: { priority: target.priority }
      }),
      prisma.aiProvider.update({
        where: { id: target.id },
        data: { priority: current.priority }
      })
    ]);
    revalidatePath("/admin/pengaturan-ai");
  }
}
