import type { FaqData } from "@/lib/blocks-types";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export function FaqBlock({ data }: { data: FaqData }) {
  if (!data.items?.length) return null;

  const variant = data.variant ?? "accordion";

  const SectionHeader = () =>
    data.title ? (
      <div className="sf-animate mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{data.title}</h2>
        <div className="mx-auto mt-3 h-1 w-16 rounded-full" style={{ background: "var(--store-primary)" }} />
      </div>
    ) : null;

  // ── LIST variant: all visible at once, 2-column grid ────────────
  if (variant === "list") {
    return (
      <section className="bg-muted/40 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <SectionHeader />
          <div className="grid gap-6 sm:grid-cols-2">
            {data.items.map((item, i) => (
              <div
                key={i}
                className={`sf-animate sf-delay-${Math.min(i + 1, 6)} rounded-[var(--store-radius)] border bg-white p-6 shadow-[var(--store-shadow)]`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ background: "var(--store-primary)" }}
                  >
                    {i + 1}
                  </span>
                  <h3 className="text-sm font-semibold leading-snug">{item.question}</h3>
                </div>
                <p className="mt-3 pl-9 text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── ACCORDION variant (default) ──────────────────────────────────
  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-3xl">
        <SectionHeader />
        <Accordion>
          {data.items.map((item, i) => (
            <AccordionItem
              key={i}
              value={String(i)}
              className={`sf-animate sf-delay-${Math.min(i + 1, 6)}`}
            >
              <AccordionTrigger className="flex items-center gap-4 text-left text-sm font-semibold sm:text-base">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: "var(--store-primary)" }}
                >
                  {i + 1}
                </span>
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="pl-11 text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
