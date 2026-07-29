import type { HeroData } from "@/lib/blocks-types";

export function HeroBlock({ data }: { data: HeroData }) {
  return (
    <section
      className="relative flex min-h-[420px] flex-col items-center justify-center gap-4 bg-muted px-6 py-20 text-center"
      style={
        data.image_url
          ? {
              backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url(${data.image_url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      <h1
        className={
          "max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl " +
          (data.image_url ? "text-white" : "text-foreground")
        }
      >
        {data.title}
      </h1>
      {data.subtitle && (
        <p
          className={
            "max-w-xl text-base sm:text-lg " +
            (data.image_url ? "text-white/90" : "text-muted-foreground")
          }
        >
          {data.subtitle}
        </p>
      )}
      {data.cta_text && (
        <a
          href={data.cta_link || "#"}
          className="mt-2 inline-flex h-11 items-center rounded-[var(--store-radius)] bg-[var(--store-primary)] px-6 text-sm font-medium text-white shadow-[var(--store-shadow)]"
        >
          {data.cta_text}
        </a>
      )}
    </section>
  );
}
