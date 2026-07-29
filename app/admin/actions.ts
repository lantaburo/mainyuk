"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireSuperAdmin } from "@/lib/session";
import { callAiProvider, extractJson, AiClientError } from "@/lib/ai-client";
import { blockArraySchema } from "@/lib/block-schema";
import { blocksToJson, type Block } from "@/lib/blocks-types";

const statusSchema = z.enum(["active", "suspended", "trial"]);

export async function updateStoreStatus(storeId: string, formData: FormData) {
  await requireAdmin();

  const parsed = statusSchema.safeParse(formData.get("status"));
  if (!parsed.success) throw new Error("Status tidak valid");

  await prisma.store.update({
    where: { id: storeId },
    data: { status: parsed.data },
  });

  revalidatePath("/admin");
}

export async function deleteStore(storeId: string) {
  await requireAdmin();

  await prisma.store.delete({ where: { id: storeId } });

  revalidatePath("/admin");
}

type GenerateResult = { ok: true; blocks: Block[] } | { ok: false; error: string };

export async function generateContentWithAi(prompt: string): Promise<GenerateResult> {
  await requireAdmin();

  const settings = await prisma.aiSettings.findFirst();
  if (!settings) {
    return { ok: false, error: "Pengaturan AI belum diisi. Buka menu Pengaturan AI terlebih dahulu." };
  }

  try {
    const raw = await callAiProvider(
      { baseUrl: settings.baseUrl, apiKey: settings.apiKey, model: settings.model },
      prompt
    );
    const parsedJson = extractJson(raw);
    const validated = blockArraySchema.safeParse(parsedJson);
    if (!validated.success) {
      return {
        ok: false,
        error: `Hasil AI tidak sesuai skema block: ${validated.error.issues[0]?.message ?? "format tidak valid"}`,
      };
    }
    return { ok: true, blocks: validated.data as Block[] };
  } catch (err) {
    const message = err instanceof AiClientError ? err.message : "Gagal memanggil provider AI.";
    return { ok: false, error: message };
  }
}

export async function applyGeneratedBlocks(storeId: string, blocks: Block[]) {
  await requireAdmin();

  const validated = blockArraySchema.safeParse(blocks);
  if (!validated.success) throw new Error("Data block tidak valid");

  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) throw new Error("Toko tidak ditemukan");

  const existingPage = await prisma.storePage.findFirst({
    where: { storeId, pageType: "home" },
  });

  if (existingPage) {
    await prisma.storePage.update({
      where: { id: existingPage.id },
      data: { blocks: blocksToJson(validated.data as Block[]) },
    });
  } else {
    await prisma.storePage.create({
      data: { storeId, pageType: "home", blocks: blocksToJson(validated.data as Block[]) },
    });
  }

  revalidatePath(`/${store.slug}`);
  revalidatePath(`/admin/generator-ai/${storeId}`);
}
