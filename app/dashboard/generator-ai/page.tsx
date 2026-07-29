import { requireStoreOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PromptGeneratorForm } from "@/components/dashboard/PromptGeneratorForm";
import { DEFAULT_INDUSTRY, isIndustry } from "@/lib/industry-content";

export default async function GeneratorAiPage() {
  const session = await requireStoreOwner();
  const store = await prisma.store.findUniqueOrThrow({
    where: { id: session.user.storeId },
    include: { settings: true },
  });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold">Generator Prompt AI</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Buat prompt siap pakai untuk Gemini/ChatGPT supaya hasilnya sudah sesuai format konten
        klikweb.id — tinggal salin ke editor Halaman.
      </p>
      <PromptGeneratorForm
        storeName={store.name}
        siteType={store.siteType}
        industry={store.industry && isIndustry(store.industry) ? store.industry : DEFAULT_INDUSTRY}
        whatsappNumber={store.settings?.whatsappNumber ?? null}
      />
    </div>
  );
}
