import { sendWhatsAppMessage, isWhatsAppApiConfigured, type WhatsAppApiConfig } from "@/lib/whatsapp-api";
import { formatRupiah } from "@/lib/format";

export interface WhatsAppSettingsSource {
  whatsappApiUrl: string | null;
  whatsappApiKey: string | null;
  whatsappApiKeyHeader: string;
  whatsappApiKeyPrefix: string;
  whatsappTargetField: string;
  whatsappMessageField: string;
}

function toWaConfig(settings: WhatsAppSettingsSource): WhatsAppApiConfig {
  return {
    apiUrl: settings.whatsappApiUrl,
    apiKey: settings.whatsappApiKey,
    apiKeyHeader: settings.whatsappApiKeyHeader,
    apiKeyPrefix: settings.whatsappApiKeyPrefix,
    targetField: settings.whatsappTargetField,
    messageField: settings.whatsappMessageField,
  };
}

export async function notifyNewOrder(opts: {
  settings: WhatsAppSettingsSource;
  ownerPhone: string | null;
  buyerPhone: string;
  storeName: string;
  orderNumber: string;
  total: number;
}) {
  const waConfig = toWaConfig(opts.settings);
  if (!isWhatsAppApiConfigured(waConfig)) return;

  const tasks: Promise<void>[] = [];

  if (opts.ownerPhone) {
    tasks.push(
      sendWhatsAppMessage(
        waConfig,
        opts.ownerPhone,
        `Pesanan baru masuk di ${opts.storeName}!\nNo. Order: ${opts.orderNumber}\nTotal: ${formatRupiah(opts.total)}\nCek detailnya di dashboard klikweb.id kamu.`
      )
    );
  }

  tasks.push(
    sendWhatsAppMessage(
      waConfig,
      opts.buyerPhone,
      `Terima kasih! Pesananmu di ${opts.storeName} sudah kami terima.\nNo. Order: ${opts.orderNumber}\nTotal: ${formatRupiah(opts.total)}`
    )
  );

  await Promise.allSettled(tasks);
}

export async function notifyOrderPaid(opts: {
  settings: WhatsAppSettingsSource;
  buyerPhone: string;
  storeName: string;
  orderNumber: string;
}) {
  const waConfig = toWaConfig(opts.settings);
  if (!isWhatsAppApiConfigured(waConfig)) return;

  await sendWhatsAppMessage(
    waConfig,
    opts.buyerPhone,
    `Pembayaran untuk pesanan ${opts.orderNumber} di ${opts.storeName} sudah kami terima. Terima kasih!`
  ).catch(() => {});
}
