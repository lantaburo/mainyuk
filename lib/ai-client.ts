interface AiProviderConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export interface AiUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AiCallResult {
  content: string;
  usage: AiUsage | null;
}

export class AiClientError extends Error {}

// Hard cap per provider attempt so a hanging/unresponsive provider can't
// block the whole request indefinitely — a fetch() with no signal will wait
// forever, which is what surfaced as the generic "Server Timeout" toast
// (the real cause was never a timeout, it was an unbounded hang).
const AI_REQUEST_TIMEOUT_MS = 120_000;

export async function callAiProvider(configs: AiProviderConfig | AiProviderConfig[], prompt: string): Promise<AiCallResult> {
  const configArray = Array.isArray(configs) ? configs : [configs];
  let lastError: Error | unknown;

  for (const config of configArray) {
    const url = `${config.baseUrl.replace(/\/+$/, "")}/chat/completions`;
    let res: Response;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);
    try {
      res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 8192,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new AiClientError(
          `Provider AI mengembalikan error ${res.status}: ${body.slice(0, 300) || res.statusText}`
        );
      }

      const rawText = await res.text().catch(() => "");
      let sanitizedText = rawText.trim();
      
      // Handle OpenAgentic bug where it appends data: [DONE] to non-streaming responses
      if (sanitizedText.endsWith("data: [DONE]")) {
        sanitizedText = sanitizedText.replace(/data:\s*\[DONE\]$/, "").trim();
      }

      let json = null;
      try {
        if (sanitizedText) json = JSON.parse(sanitizedText);
      } catch (e) {
        console.error("[DEBUG AI PARSE ERROR] Raw text:", sanitizedText);
      }

      const content = json?.choices?.[0]?.message?.content;
      if (typeof content !== "string" || !content.trim()) {
        throw new AiClientError("Respons AI kosong atau formatnya tidak dikenali.");
      }

      const rawUsage = json?.usage;
      const usage: AiUsage | null = rawUsage
        ? {
            promptTokens: rawUsage.prompt_tokens ?? 0,
            completionTokens: rawUsage.completion_tokens ?? 0,
            totalTokens: rawUsage.total_tokens ?? (rawUsage.prompt_tokens ?? 0) + (rawUsage.completion_tokens ?? 0),
          }
        : null;

      return { content, usage };
    } catch (e) {
      const isTimeout = e instanceof Error && e.name === "AbortError";
      lastError = isTimeout
        ? new AiClientError(`Provider tidak merespon dalam ${AI_REQUEST_TIMEOUT_MS / 1000}s (timeout).`)
        : e;
      console.warn(`[AI] Provider ${config.baseUrl} failed, falling back...`, (lastError as Error).message || lastError);
      continue;
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError || new AiClientError("Semua konfigurasi AI gagal.");
}

export type AiStreamEvent = { type: "delta"; text: string } | { type: "usage"; usage: AiUsage };

/**
 * Streaming variant of callAiProvider — yields incremental content deltas as
 * they arrive (OpenAI-compatible SSE `data: {...}` chunks), so callers can
 * show the response being written live instead of a blind wait. Usage stats
 * aren't requested here (stream_options support varies by provider and a
 * hard failure on it would break the primary streaming feature); a caller
 * that needs guaranteed usage numbers should use callAiProvider instead.
 */
export async function* streamAiProvider(
  configs: AiProviderConfig | AiProviderConfig[],
  prompt: string
): AsyncGenerator<AiStreamEvent> {
  const configArray = Array.isArray(configs) ? configs : [configs];
  let lastError: Error | unknown;

  for (const config of configArray) {
    const url = `${config.baseUrl.replace(/\/+$/, "")}/chat/completions`;
    let res: Response;
    const controller = new AbortController();
    const connectTimer = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);
    try {
      res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages,
          temperature: 0.7,
          max_tokens: 8192,
          stream: true,
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const body = await res.text().catch(() => "");
        throw new AiClientError(
          `Provider AI mengembalikan error ${res.status}: ${body.slice(0, 300) || res.statusText}`
        );
      }
    } catch (e) {
      const isTimeout = e instanceof Error && e.name === "AbortError";
      lastError = isTimeout
        ? new AiClientError(`Provider tidak merespon dalam ${AI_REQUEST_TIMEOUT_MS / 1000}s (timeout).`)
        : e;
      console.warn(`[AI] Provider ${config.baseUrl} stream failed, falling back...`, (lastError as Error).message || lastError);
      continue;
    } finally {
      clearTimeout(connectTimer);
    }

    // If we reach here, we are successfully connected to the stream.
    // Guard each individual chunk read too — a provider that opens the
    // stream then goes silent mid-response would otherwise hang forever
    // here as well, past the point where a plain connect timeout helps.
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const readTimeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new AiClientError(`Provider berhenti merespon (stall > ${AI_REQUEST_TIMEOUT_MS / 1000}s).`)), AI_REQUEST_TIMEOUT_MS)
        );
        const { done, value } = await Promise.race([reader.read(), readTimeout]);
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === "[DONE]") continue;

          let json: {
            choices?: { delta?: { content?: string } }[];
            usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
          } | null;
          try {
            json = JSON.parse(payload);
          } catch {
            continue;
          }

          const delta = json?.choices?.[0]?.delta?.content;
          if (typeof delta === "string" && delta.length > 0) {
            yield { type: "delta", text: delta };
          }

          if (json?.usage) {
            yield {
              type: "usage",
              usage: {
                promptTokens: json.usage.prompt_tokens ?? 0,
                completionTokens: json.usage.completion_tokens ?? 0,
                totalTokens:
                  json.usage.total_tokens ?? (json.usage.prompt_tokens ?? 0) + (json.usage.completion_tokens ?? 0),
              },
            };
          }
        }
      }
      return; // Successfully finished streaming, break the config loop
    } catch (e) {
      // If reading the stream fails midway, we just throw, because falling back midway is too messy.
      throw e;
    }
  }

  throw lastError || new AiClientError("Semua konfigurasi AI gagal.");
}

/** Strips <think>...</think> reasoning blocks some models prepend before their actual answer. */
export function stripThinking(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

/** Strips a leading reasoning block, then unwraps a ```/```html/```json fence if present. */
export function stripCodeFence(text: string): string {
  const withoutThinking = stripThinking(text);
  const fenced = withoutThinking.match(/```(?:html|json)?\s*([\s\S]*?)```/i);
  return (fenced ? fenced[1] : withoutThinking).trim();
}

/**
 * Best-effort JSON extraction from an AI response. The model often wraps the
 * JSON in prose ("Berikut hasilnya:\n[...]\nSemoga membantu!") or a code fence
 * — a plain JSON.parse over the whole string dies on either. We try, in order:
 *   1. Parse the whole thing as-is (fast path when the model behaves).
 *   2. Unwrap a ```json ... ``` fence (the common well-behaved wrapping).
 *   3. Locate the outermost balanced [] or {} in the raw text and parse that.
 *      String-aware brace scan, so braces inside quoted values don't confuse us.
 */
export function extractJson(text: string): unknown {
  const raw = stripThinking(text).trim();

  // 1. straight parse
  try { return JSON.parse(raw); } catch {}

  // 2. fenced block
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    try { return JSON.parse(fenced[1].trim()); } catch {}
  }

  // 3. balanced-brace scan — find ALL valid JSON objects/arrays and pick the largest one.
  const openers: Record<string, string> = { "{": "}", "[": "]" };
  let largestJsonStr = "";
  let largestJsonObj: unknown = null;

  for (let i = 0; i < raw.length; i++) {
    const opener = raw[i];
    if (!(opener in openers)) continue;
    const closer = openers[opener];
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let j = i; j < raw.length; j++) {
      const c = raw[j];
      if (escaped) { escaped = false; continue; }
      if (c === "\\") { escaped = true; continue; }
      if (c === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (c === opener) depth++;
      else if (c === closer) {
        depth--;
        if (depth === 0) {
          const candidateStr = raw.slice(i, j + 1);
          if (candidateStr.length > largestJsonStr.length) {
            try {
              const parsed = JSON.parse(candidateStr);
              largestJsonStr = candidateStr;
              largestJsonObj = parsed;
            } catch {}
          }
          break;
        }
      }
    }
  }

  if (largestJsonObj !== null) {
    return largestJsonObj;
  }

  throw new AiClientError("Balasan AI bukan JSON yang valid.");
}
