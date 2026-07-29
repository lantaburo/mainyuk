import type { AboutData } from "@/lib/blocks-types";

export function AboutBlock({ data }: { data: AboutData }) {
  const layout = data.layout ?? "split";

  // ── CENTERED layout ──────────────────────────────────────────────
  if (layout === "centered") {
    return (
      <section className="bg-muted/40 px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="sf-animate mb-4 flex flex-col items-center gap-3">
            <div className="h-1 w-12 rounded-full" style={{ background: "var(--store-primary)" }} />
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              {data.title}
            </h2>
          </div>
          <p className="sf-animate sf-delay-1 whitespace-pre-line text-base leading-relaxed text-muted-foreground">
            {data.content}
          </p>
        </div>
      </section>
    );
  }

  // ── SPLIT layout (default): heading left, content right ─────────
  return (
    <section className="bg-muted/40 px-4 py-20">
      <div className="mx-auto grid max-w-5xl gap-10 sm:grid-cols-[1fr_2fr] sm:gap-16">
        <div className="sf-animate flex flex-col gap-4">
          <div className="h-1 w-12 rounded-full" style={{ background: "var(--store-primary)" }} />
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            {data.title}
          </h2>
        </div>
        <p className="sf-animate sf-delay-1 whitespace-pre-line text-base leading-relaxed text-muted-foreground">
          {data.content}
        </p>
      </div>
    </section>
  );
}
