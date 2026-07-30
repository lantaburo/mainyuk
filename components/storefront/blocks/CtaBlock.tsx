import type { CtaData } from "@/lib/blocks-types";
import { toWhatsAppLink } from "@/lib/format";

export function CtaBlock({
  data,
  whatsappNumber,
}: {
  data: CtaData;
  whatsappNumber?: string | null;
}) {
  const variant = data.variant ?? "solid";
  const isWaButton = data.button_link === "#" && whatsappNumber;
  const href = isWaButton
    ? toWhatsAppLink(whatsappNumber, `Halo, saya tertarik dengan ${data.title}`)
    : data.button_link || "#";

  const WaIcon = () => (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.073.528 4.017 1.463 5.716L.072 23.928l6.339-1.34A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.806 9.806 0 01-5.012-1.373l-.36-.213-3.761.795.845-3.646-.234-.374A9.77 9.77 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182S21.818 6.58 21.818 12 17.42 21.818 12 21.818z" />
    </svg>
  );

  const ArrowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );

  // ── OUTLINE variant: light bg, bordered button ───────────────────
  if (variant === "outline") {
    return (
      <section className="border-y bg-white px-6 py-24 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="sf-animate text-3xl font-extrabold tracking-tight sm:text-4xl">
            {data.title}
          </h2>
          {data.subtitle && (
            <p className="sf-animate sf-delay-1 mt-4 text-base text-muted-foreground sm:text-lg">
              {data.subtitle}
            </p>
          )}
          <a
            href={href}
            target={isWaButton ? "_blank" : undefined}
            rel={isWaButton ? "noopener noreferrer" : undefined}
            className="sf-animate sf-delay-2 group mt-8 inline-flex h-12 items-center gap-2 rounded-[var(--store-radius)] border-2 px-8 text-sm font-bold transition-all duration-200 hover:scale-105"
            style={{ 
              borderColor: "var(--sf-btn-bg, var(--store-primary))", 
              color: "var(--sf-btn-text, var(--store-primary))",
              background: "var(--sf-btn-bg, transparent)"
            }}
          >
            {isWaButton && <WaIcon />}
            {data.button_text}
            <ArrowIcon />
          </a>
        </div>
      </section>
    );
  }

  // ── GRADIENT variant ─────────────────────────────────────────────
  if (variant === "gradient") {
    return (
      <section
        className="relative overflow-hidden px-6 py-24 text-center text-white"
        style={{
          background: `linear-gradient(135deg, var(--store-primary) 0%, color-mix(in srgb, var(--store-primary) 50%, #000) 100%)`,
        }}
      >
        <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute top-1/2 left-1/4 h-32 w-32 -translate-y-1/2 rounded-full bg-white/5" />
        <div className="relative z-10 mx-auto max-w-2xl">
          <h2 className="sf-animate text-3xl font-extrabold tracking-tight sm:text-4xl">{data.title}</h2>
          {data.subtitle && (
            <p className="sf-animate sf-delay-1 mt-4 text-base text-white/80 sm:text-lg">{data.subtitle}</p>
          )}
          <a
            href={href}
            target={isWaButton ? "_blank" : undefined}
            rel={isWaButton ? "noopener noreferrer" : undefined}
            className="sf-animate sf-delay-2 group mt-8 inline-flex h-12 items-center gap-2 rounded-[var(--store-radius)] bg-white px-8 text-sm font-bold shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
            style={{ 
              background: "var(--sf-btn-bg, white)",
              color: "var(--sf-btn-text, var(--store-primary))" 
            }}
          >
            {isWaButton && <WaIcon />}
            {data.button_text}
            <ArrowIcon />
          </a>
        </div>
      </section>
    );
  }

  // ── SOLID variant (default) ──────────────────────────────────────
  return (
    <section
      className="relative overflow-hidden px-6 py-24 text-center text-white"
      style={{ background: "var(--store-primary)" }}
    >
      <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute top-1/2 left-1/4 h-32 w-32 -translate-y-1/2 rounded-full bg-white/5" />
      <div className="relative z-10 mx-auto max-w-2xl">
        <h2 className="sf-animate text-3xl font-extrabold tracking-tight sm:text-4xl">{data.title}</h2>
        {data.subtitle && (
          <p className="sf-animate sf-delay-1 mt-4 text-base text-white/80 sm:text-lg">{data.subtitle}</p>
        )}
        <a
          href={href}
          target={isWaButton ? "_blank" : undefined}
          rel={isWaButton ? "noopener noreferrer" : undefined}
          className="sf-animate sf-delay-2 group mt-8 inline-flex h-12 items-center gap-2 rounded-[var(--store-radius)] bg-white px-8 text-sm font-bold shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
          style={{ 
            background: "var(--sf-btn-bg, white)",
            color: "var(--sf-btn-text, var(--store-primary))" 
          }}
        >
          {isWaButton && <WaIcon />}
          {data.button_text}
          <ArrowIcon />
        </a>
      </div>
    </section>
  );
}
