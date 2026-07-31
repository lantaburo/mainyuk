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
const AI_REQUEST_TIMEOUT_MS = 30_000;

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
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new AiClientError(
          `Provider AI mengembalikan error ${res.status}: ${body.slice(0, 300) || res.statusText}`
        );
      }

      const json = await res.json().catch(() => null);
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
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
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

export function extractJson(text: string): unknown {
  const raw = stripCodeFence(text);

  try {
    return JSON.parse(raw.trim());
  } catch {
    throw new AiClientError("Balasan AI bukan JSON yang valid.");
  }
}
