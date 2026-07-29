export function formatRupiah(value: number | string | { toString(): string }) {
  const num = typeof value === "number" ? value : Number(value.toString());
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
}

export function normalizePhone(phone: string) {
  const digits = phone.replace(/[^0-9]/g, "");
  return digits.startsWith("0") ? "62" + digits.slice(1) : digits;
}

export function toWhatsAppLink(phone: string, message: string) {
  return `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(message)}`;
}
