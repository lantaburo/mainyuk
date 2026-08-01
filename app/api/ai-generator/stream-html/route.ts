import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { streamAiProvider, stripCodeFence, AiClientError, type AiUsage } from "@/lib/ai-client";
import { getAiConfigs } from "@/lib/ai-actions";
import { buildHtmlFromBriefPrompt } from "@/lib/ai-html-prompt-generator";
import { designBriefSchema } from "@/lib/ai-html-schema";
import { sanitizeStoreHtml } from "@/lib/html-sanitize";
import { STREAM_DONE_MARKER, STREAM_RESET_MARKER } from "@/lib/streaming-protocol";

/**
 * Streams the "blueprint -> HTML" generation live, so the wizard can show
 * the code being written as it arrives instead of a blind wait. Raw deltas
 * are relayed as plain text (harmless — displayed as inert text client-side,
 * never rendered as HTML mid-stream); once the upstream stream ends, this
 * sanitizes the full accumulated result server-side and appends one final
 * marked chunk with the sanitized HTML + usage stats for the client to parse
 * out and use as the actual preview/save payload.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const storeId = body?.storeId;
  if (typeof storeId !== "string") {
    return new Response("Store ID wajib diisi", { status: 400 });
  }

  const role = (session.user as any).role;
  const sessionStoreId = (session.user as any).storeId;
  const isAdmin = role === "super_admin" || role === "operator";
  if (!isAdmin && (role !== "store_owner" || sessionStoreId !== storeId)) {
    return new Response("Akses ditolak", { status: 403 });
  }

  const validatedBrief = designBriefSchema.safeParse(body?.brief);
  if (!validatedBrief.success) {
    return new Response("Blueprint tidak valid.", { status: 400 });
  }

  const store = await prisma.store.findUniqueOrThrow({
    where: { id: storeId },
    include: { settings: true },
  });

  const configs = await getAiConfigs();
  if (configs.length === 0) {
    return new Response("Konfigurasi AI belum diatur.", { status: 400 });
  }

  const prompt = buildHtmlFromBriefPrompt(validatedBrief.data, {
    storeName: store.name,
    siteType: store.siteType,
    whatsappNumber: store.settings?.whatsappNumber,
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Sama seperti generateBriefAction: provider ini kadang mengembalikan
      // HTML yang korup/kosong secara acak — retry biasanya cukup untuk
      // dapat respons bersih. Setiap percobaan ulang mengirim STREAM_RESET_MARKER
      // supaya client membuang tampilan kode dari percobaan gagal sebelumnya.
      const MAX_ATTEMPTS = 3;
      let html = "";
      let usage: AiUsage | null = null;
      let lastError = "AI tidak menghasilkan HTML yang valid.";

      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        if (attempt > 1) {
          controller.enqueue(encoder.encode(STREAM_RESET_MARKER));
        }

        let full = "";
        let attemptUsage: AiUsage | null = null;
        try {
          for await (const event of streamAiProvider(configs, prompt)) {
            if (event.type === "delta") {
              full += event.text;
              controller.enqueue(encoder.encode(event.text));
            } else {
              attemptUsage = event.usage;
            }
          }
        } catch (err) {
          lastError = err instanceof AiClientError ? err.message : "Gagal menghubungi AI.";
          continue;
        }

        const candidate = sanitizeStoreHtml(stripCodeFence(full));
        if (candidate.trim()) {
          html = candidate;
          usage = attemptUsage;
          break;
        }
        lastError = "AI tidak menghasilkan HTML yang valid.";
      }

      if (!html.trim()) {
        controller.enqueue(encoder.encode(STREAM_DONE_MARKER + JSON.stringify({ error: lastError })));
      } else {
        controller.enqueue(encoder.encode(STREAM_DONE_MARKER + JSON.stringify({ html, usage })));
      }
      controller.close();
    },
  });

  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
