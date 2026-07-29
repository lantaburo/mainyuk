import type { FaqData } from "@/lib/blocks-types";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export function FaqBlock({ data }: { data: FaqData }) {
  if (!data.items?.length) return null;

  return (
    <section className="mx-auto max-w-2xl px-4 py-14">
      {data.title && <h2 className="mb-6 text-2xl font-semibold">{data.title}</h2>}
      <Accordion>
        {data.items.map((item, i) => (
          <AccordionItem key={i} value={String(i)}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
