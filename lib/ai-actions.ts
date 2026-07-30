"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminOrOwner } from "@/lib/session";
import { callAiProvider, extractJson, stripCodeFence, AiClientError, type AiUsage } from "@/lib/ai-client";
import { buildBriefPrompt, buildElementEditPrompt } from "@/lib/ai-html-prompt-generator";
import { designBriefSchema, type DesignBrief } from "@/lib/ai-html-schema";
import { sanitizeStoreHtml } from "@/lib/html-sanitize";
import { isIndustry, DEFAULT_INDUSTRY } from "@/lib/industry-content";

export type BriefResult =
  | { ok: true; brief: DesignBrief; usage: AiUsage | null }
  | { ok: false; error: string };

export type HtmlResult =
  | { ok: true; html: string; usage: AiUsage | null }
  | { ok: false; error: string };

async function getAiConfig() {
  const aiSettings = await prisma.aiSettings.findFirst();
  if (!aiSettings?.apiKey || !aiSettings?.baseUrl || !aiSettings?.model) {
    return null;
  }
  return { baseUrl: aiSettings.baseUrl, apiKey: aiSettings.apiKey, model: aiSettings.model };
}

/** Tahap 2: deskripsi bebas -> blueprint desain terstruktur. */
export async function generateBriefAction(
  storeId: string,
  businessDescription: string,
  targetAudience: string
): Promise<BriefResult> {
  await requireAdminOrOwner(storeId);

  const store = await prisma.store.findUniqueOrThrow({ where: { id: storeId } });
  const config = await getAiConfig();
  if (!config) {
    return {
      ok: false,
      error: "Konfigurasi AI belum diatur. Hubungi admin untuk mengisi API Key, Base URL, dan Model AI.",
    };
  }

  const industry = store.industry && isIndustry(store.industry) ? store.industry : DEFAULT_INDUSTRY;
  const prompt = buildBriefPrompt({
    storeName: store.name,
    siteType: store.siteType,
    industry,
    businessDescription,
    targetAudience,
  });

  let result: Awaited<ReturnType<typeof callAiProvider>>;
  try {
    result = await callAiProvider(config, prompt);
  } catch (err) {
    return { ok: false, error: err instanceof AiClientError ? err.message : "Gagal menghubungi AI." };
  }

  let parsed: unknown;
  try {
    parsed = extractJson(result.content);
  } catch {
    return { ok: false, error: "Respons AI tidak bisa dibaca sebagai JSON." };
  }

  const validated = designBriefSchema.safeParse(parsed);
  if (!validated.success) {
    return { ok: false, error: "Blueprint yang di-generate tidak valid: " + validated.error.issues[0]?.message };
  }

  // Remember the target audience for next time, even before the site itself is generated.
  if (targetAudience.trim()) {
    await prisma.store.update({ where: { id: storeId }, data: { targetAudience: targetAudience.trim() } });
  }

  return { ok: true, brief: validated.data, usage: result.usage };
}

/** Terapkan hasil generate ke halaman Beranda toko. */
export async function applyGeneratedHtmlAction(
  storeId: string,
  pageId: string,
  html: string,
  brief: DesignBrief
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdminOrOwner(storeId);

  const page = await prisma.storePage.findFirst({
    where: { id: pageId, storeId },
  });
  if (!page) return { ok: false, error: "Halaman tidak ditemukan." };

  await prisma.storePage.update({
    where: { id: pageId },
    data: { html: sanitizeStoreHtml(html), briefJson: brief },
  });

  revalidatePath("/dashboard/ai-generator");
  revalidatePath("/[store]", "layout");

  return { ok: true };
}

/** Editor: save whatever's currently in the live-edited page (text/style/AI/code-tab edits). */
export async function saveEditedHtmlAction(
  storeId: string,
  pageId: string,
  html: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdminOrOwner(storeId);

  const page = await prisma.storePage.findFirst({
    where: { id: pageId, storeId },
  });
  if (!page) return { ok: false, error: "Halaman tidak ditemukan." };

  await prisma.storePage.update({
    where: { id: pageId },
    data: { html: sanitizeStoreHtml(html) },
  });

  revalidatePath("/dashboard/editor");
  revalidatePath("/[store]", "layout");

  return { ok: true };
}

/** Editor "AI" tab: rewrite one selected element per a free-text instruction. */
export async function generateElementEditAction(
  storeId: string,
  currentOuterHtml: string,
  instruction: string
): Promise<HtmlResult> {
  await requireAdminOrOwner(storeId);

  const store = await prisma.store.findUniqueOrThrow({ where: { id: storeId } });
  const config = await getAiConfig();
  if (!config) {
    return { ok: false, error: "Konfigurasi AI belum diatur." };
  }
  if (!instruction.trim()) {
    return { ok: false, error: "Isi instruksi perubahan dulu." };
  }

  const prompt = buildElementEditPrompt(currentOuterHtml, instruction, { storeName: store.name });

  let result: Awaited<ReturnType<typeof callAiProvider>>;
  try {
    result = await callAiProvider(config, prompt);
  } catch (err) {
    return { ok: false, error: err instanceof AiClientError ? err.message : "Gagal menghubungi AI." };
  }

  const html = sanitizeStoreHtml(stripCodeFence(result.content));
  if (!html.trim()) {
    return { ok: false, error: "AI tidak menghasilkan elemen yang valid." };
  }

  return { ok: true, html, usage: result.usage };
}
