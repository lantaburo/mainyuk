import type { CtaData } from "@/lib/blocks-types";
import { toWhatsAppLink } from "@/lib/format";

export function CtaBlock({
  data,
  whatsappNumber,
}: {
  data: CtaData;
  whatsappNumber?: string | null;
}) {
  const isWaButton = data.button_link === "#" && whatsappNumber;
  const href = isWaButton
    ? toWhatsAppLink(whatsappNumber, `Halo, saya tertarik dengan ${data.title}`)
    : data.button_link || "#";

  return (
    <section className="bg-[var(--store-primary)]/10 px-4 py-16 text-center">
      <h2 className="text-2xl font-semibold">{data.title}</h2>
      {data.subtitle && <p className="mt-2 text-muted-foreground">{data.subtitle}</p>}
      <a
        href={href}
        target={isWaButton ? "_blank" : undefined}
        rel={isWaButton ? "noopener noreferrer" : undefined}
        className="mt-6 inline-flex h-11 items-center rounded-[var(--store-radius)] bg-[var(--store-primary)] px-6 text-sm font-medium text-white shadow-[var(--store-shadow)]"
      >
        {data.button_text}
      </a>
    </section>
  );
}
