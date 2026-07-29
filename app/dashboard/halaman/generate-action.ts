"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { SITE_TYPE_CONFIG } from "@/lib/site-types";
import { callAiProvider, extractJson, AiClientError } from "@/lib/ai-client";
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

  // Get AI settings (global)
  const aiSettings = await prisma.aiSettings.findFirst();
  if (!aiSettings?.apiKey || !aiSettings?.baseUrl || !aiSettings?.model) {
    return {
      ok: false,
      error:
        "Konfigurasi AI belum diatur. Hubungi admin untuk mengisi API Key, Base URL, dan Model AI.",
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

  let rawText: string;
  try {
    rawText = await callAiProvider(
      { baseUrl: aiSettings.baseUrl, apiKey: aiSettings.apiKey, model: aiSettings.model },
      prompt
    );
  } catch (err) {
    const msg = err instanceof AiClientError ? err.message : "Gagal menghubungi AI.";
    return { ok: false, error: msg };
  }

  let parsed: unknown;
  try {
    parsed = extractJson(rawText);
  } catch {
    return { ok: false, error: "Respons AI tidak bisa dibaca sebagai JSON." };
  }

  const validated = blockArraySchema.safeParse(parsed);
  if (!validated.success) {
    return {
      ok: false,
      error: "Blok yang di-generate tidak valid: " + validated.error.issues[0]?.message,
    };
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
): Promise<{ ok: true; data: any } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Not logged in" };

  if (session.user.role === "store_owner" && session.user.storeId !== storeId) {
    return { ok: false, error: "Akses ditolak" };
  }

  const store = await prisma.store.findUnique({
    where: { id: storeId },
  });
  if (!store) return { ok: false, error: "Toko tidak ditemukan." };

  const aiSettings = await prisma.aiSettings.findFirst();
  if (!aiSettings?.apiKey || !aiSettings?.baseUrl || !aiSettings?.model) {
    return { ok: false, error: "Konfigurasi AI belum diatur." };
  }

  const industry = store.industry && isIndustry(store.industry) ? store.industry : DEFAULT_INDUSTRY;

  const prompt = buildSingleBlockPrompt({
    storeName: store.name,
    industry,
    businessDescription: userPrompt.trim(),
    blockType: blockType as any,
  });

  let rawText: string;
  try {
    rawText = await callAiProvider(
      { baseUrl: aiSettings.baseUrl, apiKey: aiSettings.apiKey, model: aiSettings.model },
      prompt
    );
  } catch (err) {
    const msg = err instanceof AiClientError ? err.message : "Gagal menghubungi AI.";
    return { ok: false, error: msg };
  }

  let parsed: any;
  try {
    parsed = extractJson(rawText);
  } catch {
    return { ok: false, error: "Respons AI tidak valid JSON." };
  }

  return { ok: true, data: parsed };
}

