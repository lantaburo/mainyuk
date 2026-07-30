import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { streamAiProvider, stripCodeFence, AiClientError, type AiUsage } from "@/lib/ai-client";
import { buildHtmlFromBriefPrompt } from "@/lib/ai-html-prompt-generator";
import { designBriefSchema } from "@/lib/ai-html-schema";
import { sanitizeStoreHtml } from "@/lib/html-sanitize";
import { STREAM_DONE_MARKER } from "@/lib/streaming-protocol";

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
  if (!session?.user || session.user.role !== "store_owner" || !session.user.storeId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const storeId = body?.storeId;
  if (typeof storeId !== "string" || session.user.storeId !== storeId) {
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

  const aiSettings = await prisma.aiSettings.findFirst();
  if (!aiSettings?.apiKey || !aiSettings?.baseUrl || !aiSettings?.model) {
    return new Response("Konfigurasi AI belum diatur.", { status: 400 });
  }
  const config = { baseUrl: aiSettings.baseUrl, apiKey: aiSettings.apiKey, model: aiSettings.model };

  const prompt = buildHtmlFromBriefPrompt(validatedBrief.data, {
    storeName: store.name,
    siteType: store.siteType,
    whatsappNumber: store.settings?.whatsappNumber,
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let full = "";
      let usage: AiUsage | null = null;
      try {
        for await (const event of streamAiProvider(config, prompt)) {
          if (event.type === "delta") {
            full += event.text;
            controller.enqueue(encoder.encode(event.text));
          } else {
            usage = event.usage;
          }
        }
      } catch (err) {
        const message = err instanceof AiClientError ? err.message : "Gagal menghubungi AI.";
        controller.enqueue(encoder.encode(STREAM_DONE_MARKER + JSON.stringify({ error: message })));
        controller.close();
        return;
      }

      const html = sanitizeStoreHtml(stripCodeFence(full));
      if (!html.trim()) {
        controller.enqueue(
          encoder.encode(
            STREAM_DONE_MARKER + JSON.stringify({ error: "AI tidak menghasilkan HTML yang valid." })
          )
        );
      } else {
        controller.enqueue(encoder.encode(STREAM_DONE_MARKER + JSON.stringify({ html, usage })));
      }
      controller.close();
    },
  });

  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
