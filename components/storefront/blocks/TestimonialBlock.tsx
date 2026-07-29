import type { TestimonialData } from "@/lib/blocks-types";

function StarRating({ rating }: { rating: number }) {
  const clamped = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`h-4 w-4 ${i < clamped ? "text-amber-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function TestimonialCard({ item, i, large = false }: { item: TestimonialData["items"][number]; i: number; large?: boolean }) {
  return (
    <div className={`sf-animate sf-delay-${Math.min(i + 1, 6)} relative flex flex-col gap-4 overflow-hidden rounded-[var(--store-radius)] border bg-white p-7 shadow-[var(--store-shadow)] ${large ? "row-span-2" : ""}`}>
      <span className="pointer-events-none absolute right-5 top-2 select-none text-7xl font-serif leading-none opacity-[0.06]" style={{ color: "var(--store-primary)" }}>"</span>
      <StarRating rating={item.rating} />
      <p className="relative z-10 flex-1 text-sm leading-relaxed text-foreground/80">&ldquo;{item.text}&rdquo;</p>
      <div className="mt-auto flex items-center gap-3 border-t pt-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: "var(--store-primary)" }}>
          {getInitials(item.name)}
        </div>
        <span className="text-sm font-semibold">{item.name}</span>
      </div>
    </div>
  );
}

export function TestimonialBlock({ data }: { data: TestimonialData }) {
  if (!data.items?.length) return null;

  const layout = data.layout ?? "grid";

  const SectionHeader = () =>
    data.title ? (
      <div className="sf-animate mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{data.title}</h2>
        <div className="mx-auto mt-3 h-1 w-16 rounded-full" style={{ background: "var(--store-primary)" }} />
      </div>
    ) : null;

  // ── HIGHLIGHT layout: first card large, rest small ───────────────
  if (layout === "highlight" && data.items.length >= 2) {
    const [first, ...rest] = data.items;
    return (
      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeader />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Large featured card */}
            <div className="sf-animate relative flex flex-col gap-4 overflow-hidden rounded-[var(--store-radius)] border bg-white p-8 shadow-[var(--store-shadow)] sm:row-span-2 lg:col-span-1">
              <span className="pointer-events-none absolute right-6 top-4 select-none text-8xl font-serif leading-none opacity-[0.06]" style={{ color: "var(--store-primary)" }}>"</span>
              <StarRating rating={first.rating} />
              <p className="relative z-10 flex-1 text-base leading-relaxed text-foreground/80">&ldquo;{first.text}&rdquo;</p>
              <div className="mt-auto flex items-center gap-3 border-t pt-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: "var(--store-primary)" }}>
                  {getInitials(first.name)}
                </div>
                <span className="font-semibold">{first.name}</span>
              </div>
            </div>
            {/* Smaller cards */}
            {rest.map((item, i) => (
              <TestimonialCard key={i} item={item} i={i + 1} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── GRID layout (default) ────────────────────────────────────────
  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeader />
        <div className="grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((item, i) => (
            <TestimonialCard key={i} item={item} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
