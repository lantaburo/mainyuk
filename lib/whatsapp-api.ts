import { normalizePhone } from "@/lib/format";

export interface WhatsAppApiConfig {
  apiUrl: string | null;
  apiKey: string | null;
  apiKeyHeader: string;
  apiKeyPrefix: string;
  targetField: string;
  messageField: string;
}

export class WhatsAppApiError extends Error {}

export function isWhatsAppApiConfigured(config: WhatsAppApiConfig): boolean {
  return Boolean(config.apiUrl && config.apiKey);
}

export async function sendWhatsAppMessage(
  config: WhatsAppApiConfig,
  target: string,
  message: string
): Promise<void> {
  if (!isWhatsAppApiConfigured(config)) {
    throw new WhatsAppApiError("API WhatsApp belum dikonfigurasi");
  }

  let res: Response;
  try {
    res = await fetch(config.apiUrl!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [config.apiKeyHeader]: `${config.apiKeyPrefix}${config.apiKey}`,
      },
      body: JSON.stringify({
        [config.targetField]: normalizePhone(target),
        [config.messageField]: message,
      }),
    });
  } catch {
    throw new WhatsAppApiError(`Gagal menghubungi ${config.apiUrl}`);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new WhatsAppApiError(`API WhatsApp mengembalikan error ${res.status}: ${body.slice(0, 200)}`);
  }
}
