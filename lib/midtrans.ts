import { createHash } from "crypto";

interface MidtransCredentials {
  serverKey: string;
  isProduction: boolean;
}

interface SnapTransactionInput {
  orderNumber: string;
  grossAmount: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
}

export class MidtransError extends Error {}

function snapBaseUrl(isProduction: boolean) {
  return isProduction
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";
}

export async function createSnapTransaction(
  credentials: MidtransCredentials,
  input: SnapTransactionInput
): Promise<{ token: string; redirectUrl: string }> {
  const auth = Buffer.from(`${credentials.serverKey}:`).toString("base64");

  let res: Response;
  try {
    res = await fetch(snapBaseUrl(credentials.isProduction), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: input.orderNumber,
          gross_amount: Math.round(input.grossAmount),
        },
        customer_details: {
          first_name: input.customerName,
          phone: input.customerPhone,
          email: input.customerEmail || undefined,
        },
      }),
    });
  } catch {
    throw new MidtransError("Gagal menghubungi Midtrans. Periksa koneksi.");
  }

  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.redirect_url) {
    const message = json?.error_messages?.[0] || json?.status_message || "Gagal membuat transaksi Midtrans";
    throw new MidtransError(message);
  }

  return { token: json.token, redirectUrl: json.redirect_url };
}

export function verifyMidtransSignature(payload: {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
}, serverKey: string): boolean {
  const expected = createHash("sha512")
    .update(`${payload.order_id}${payload.status_code}${payload.gross_amount}${serverKey}`)
    .digest("hex");

  return expected === payload.signature_key;
}

export function mapMidtransStatusToOrderStatus(
  transactionStatus: string
): "paid" | "pending" | "cancelled" {
  if (transactionStatus === "settlement" || transactionStatus === "capture") return "paid";
  if (["deny", "cancel", "expire", "failure"].includes(transactionStatus)) return "cancelled";
  return "pending";
}
