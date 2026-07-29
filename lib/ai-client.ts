interface AiProviderConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export class AiClientError extends Error {}

export async function callAiProvider(config: AiProviderConfig, prompt: string): Promise<string> {
  const url = `${config.baseUrl.replace(/\/+$/, "")}/chat/completions`;

  let res: Response;
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
    });
  } catch {
    throw new AiClientError(`Gagal menghubungi ${url}. Periksa Base URL.`);
  }

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

  return content;
}

export function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : text;

  try {
    return JSON.parse(raw.trim());
  } catch {
    throw new AiClientError("Balasan AI bukan JSON yang valid.");
  }
}
