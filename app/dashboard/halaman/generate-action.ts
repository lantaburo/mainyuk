"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { SITE_TYPE_CONFIG } from "@/lib/site-types";
import { callAiProvider, extractJson, AiClientError, sleep } from "@/lib/ai-client";
import { buildContentPrompt, buildSingleBlockPrompt } from "@/lib/ai-prompt-generator";
import { blockArraySchema } from "@/lib/block-schema";
import { isIndustry, DEFAULT_INDUSTRY } from "@/lib/industry-content";
import type { Block } from "@/lib/blocks-types";

export type GenerateResult =
  | { ok: true; blocks: Block[] }
  | { ok: false; error: string };

/**
 * Generate blocks for a single page (by pageId).
 * The pageType is resolved from the stored page record so the prompt
 * can be tailored for home/about/contact pages on multi-page sites.
 */
export async function generatePageBlocksAction(
  pageId: string,
  userPrompt: string
): Promise<GenerateResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Not logged in" };

  const page = await prisma.storePage.findUnique({
    where: { id: pageId },
  });
  if (!page) return { ok: false, error: "Halaman tidak ditemukan." };

  if (session.user.role === "store_owner" && session.user.storeId !== page.storeId) {
    return { ok: false, error: "Akses ditolak" };
  }

  // Get store info for prompt context
  const store = await prisma.store.findUniqueOrThrow({
    where: { id: page.storeId },
    include: { settings: true },
  });

  const { getAiConfigs } = await import("@/lib/ai-actions");
  const configs = await getAiConfigs();
  if (configs.length === 0) {
    return {
      ok: false,
      error:
        "Konfigurasi AI belum diatur. Hubungi admin untuk mengisi konfigurasi AI.",
    };
  }

  const industry =
    store.industry && isIndustry(store.industry) ? store.industry : DEFAULT_INDUSTRY;

  // pageType from DB — "home" | "about" | "contact" | "custom"
  const pageType = page.pageType as string;

  const prompt = buildContentPrompt({
    storeName: store.name,
    siteType: store.siteType,
    industry,
    businessDescription: userPrompt.trim(),
    whatsappNumber: store.settings?.whatsappNumber ?? null,
    pageType,
  });

  // Creative-direction step (block selection + design variants) — needs
  // variety across generations, not the low-temp determinism used for
  // purely schema-bound calls. Retry a few times since higher temperature
  // means a higher chance of a malformed JSON attempt.
  const MAX_ATTEMPTS = 3;
  let validated: ReturnType<typeof blockArraySchema.safeParse> | null = null;
  let lastError = "Gagal menghubungi AI.";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    if (attempt > 1) {
      await sleep(Math.min(1000 * attempt, 4000) + Math.random() * 500);
    }

    let rawText: string;
    try {
      rawText = (await callAiProvider(configs, prompt, { temperature: 0.85 })).content;
    } catch (err) {
      lastError = err instanceof AiClientError ? err.message : "Gagal menghubungi AI.";
      continue;
    }

    let parsed: unknown;
    try {
      parsed = extractJson(rawText);
    } catch (err) {
      console.error(`[DEBUG EXTRACT JSON FAILED] percobaan ${attempt}/${MAX_ATTEMPTS} — Raw Text dari AI:\n`, rawText);
      lastError = "Respons AI tidak bisa dibaca sebagai JSON. Cek log terminal.";
      continue;
    }

    const attemptResult = blockArraySchema.safeParse(parsed);
    if (!attemptResult.success) {
      lastError = "Blok yang di-generate tidak valid: " + attemptResult.error.issues[0]?.message;
      continue;
    }

    validated = attemptResult;
    break;
  }

  if (!validated || !validated.success) {
    return { ok: false, error: lastError };
  }

  // Filter to only allowed blocks for this site type
  const config = SITE_TYPE_CONFIG[store.siteType];
  const allowedSet = new Set(config.allowedBlocks as string[]);
  const filtered = validated.data.filter((b) => allowedSet.has(b.type)) as Block[];

  if (filtered.length === 0) {
    return {
      ok: false,
      error: "AI tidak menghasilkan blok yang sesuai dengan jenis situs ini.",
    };
  }

  // Re-sequence order from 1
  const reordered = filtered.map((b, i) => ({ ...b, order: i + 1 })) as Block[];

  return { ok: true, blocks: reordered };
}

export async function generateSingleBlockAction(
  storeId: string,
  blockType: string,
  userPrompt: string
): Promise<{ ok: true; data: unknown } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Not logged in" };

  if (session.user.role === "store_owner" && session.user.storeId !== storeId) {
    return { ok: false, error: "Akses ditolak" };
  }

  const store = await prisma.store.findUnique({
    where: { id: storeId },
  });
  if (!store) return { ok: false, error: "Toko tidak ditemukan." };

  const { getAiConfigs } = await import("@/lib/ai-actions");
  const configs = await getAiConfigs();
  if (configs.length === 0) {
    return { ok: false, error: "Konfigurasi AI belum diatur." };
  }

  const industry = store.industry && isIndustry(store.industry) ? store.industry : DEFAULT_INDUSTRY;

  const prompt = buildSingleBlockPrompt({
    storeName: store.name,
    industry,
    businessDescription: userPrompt.trim(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    blockType: blockType as any,
  });

  let rawText: string;
  try {
    rawText = (
      await callAiProvider(configs, prompt)
    ).content;
  } catch (err) {
    const msg = err instanceof AiClientError ? err.message : "Gagal menghubungi AI.";
    return { ok: false, error: msg };
  }

  let parsed: unknown;
  try {
    parsed = extractJson(rawText);
  } catch (err) {
    console.error("[DEBUG EXTRACT JSON FAILED] Raw Text dari AI:\n", rawText);
    return { ok: false, error: "Respons AI tidak valid JSON. Cek log terminal." };
  }

  return { ok: true, data: parsed };
}

