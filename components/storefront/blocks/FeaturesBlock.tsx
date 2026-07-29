import type { FeaturesData } from "@/lib/blocks-types";

const FEATURE_ICONS = ["✦", "◈", "⬡", "◉", "⬢", "◆"];

export function FeaturesBlock({ data }: { data: FeaturesData }) {
  if (!data.items?.length) return null;

  const variant = data.variant ?? "cards";
  const bg = data.bg ?? "muted";

  const bgClass =
    bg === "white"
      ? "bg-white"
      : bg === "primary"
      ? "" // inline style for brand
      : "bg-muted/40";

  const primaryBg = bg === "primary";

  const SectionHeader = () =>
    data.title ? (
      <div className="sf-animate mb-12 text-center">
        <h2
          className={`text-3xl font-bold tracking-tight sm:text-4xl ${
            primaryBg ? "text-white" : ""
          }`}
        >
          {data.title}
        </h2>
        <div
          className="mx-auto mt-3 h-1 w-16 rounded-full"
          style={{ background: primaryBg ? "rgba(255,255,255,0.5)" : "var(--store-primary)" }}
        />
      </div>
    ) : null;

  // ── CARDS variant (default) ──────────────────────────────────────
  if (variant === "cards") {
    return (
      <section
        className={`px-4 py-20 ${bgClass}`}
        style={primaryBg ? { background: "var(--store-primary)" } : undefined}
      >
        <div className="mx-auto max-w-6xl">
          <SectionHeader />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((item, i) => (
              <div
                key={i}
                className={`sf-animate sf-delay-${Math.min(i + 1, 6)} group flex flex-col gap-3 rounded-[var(--store-radius)] border p-7 shadow-[var(--store-shadow)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg ${
                  primaryBg ? "border-white/20 bg-white/10 text-white" : "bg-white"
                }`}
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold text-white"
                  style={{ background: primaryBg ? "rgba(255,255,255,0.25)" : "var(--store-primary)" }}
                >
                  {FEATURE_ICONS[i % FEATURE_ICONS.length]}
                </div>
                <h3 className="text-base font-semibold leading-snug">{item.title}</h3>
                <p className={`text-sm leading-relaxed ${primaryBg ? "text-white/80" : "text-muted-foreground"}`}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── NUMBERED variant ─────────────────────────────────────────────
  if (variant === "numbered") {
    return (
      <section className={`px-4 py-20 ${bgClass}`}>
        <div className="mx-auto max-w-4xl">
          <SectionHeader />
          <div className="space-y-6">
            {data.items.map((item, i) => (
              <div
                key={i}
                className={`sf-animate sf-delay-${Math.min(i + 1, 6)} flex gap-6 rounded-[var(--store-radius)] border bg-white p-6 shadow-[var(--store-shadow)]`}
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl font-extrabold text-white shadow"
                  style={{ background: "var(--store-primary)" }}
                >
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-base font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── ICON_LEFT variant ────────────────────────────────────────────
  return (
    <section className={`px-4 py-20 ${bgClass}`}>
      <div className="mx-auto max-w-5xl">
        <SectionHeader />
        <div className="grid gap-8 sm:grid-cols-2">
          {data.items.map((item, i) => (
            <div
              key={i}
              className={`sf-animate sf-delay-${Math.min(i + 1, 6)} flex items-start gap-5`}
            >
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-[var(--store-shadow)]"
                style={{ background: "var(--store-primary)" }}
              >
                {FEATURE_ICONS[i % FEATURE_ICONS.length]}
              </div>
              <div>
                <h3 className="text-base font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
