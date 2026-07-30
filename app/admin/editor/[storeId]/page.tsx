import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageEditor } from "@/components/dashboard/PageEditor";

export default async function AdminEditorPage({ params }: { params: { storeId: string } }) {
  await requireAdmin();
  const store = await prisma.store.findUnique({ where: { id: params.storeId } });
  if (!store) {
    redirect("/admin/generator-ai");
  }

  const homePage = await prisma.storePage.findFirst({
    where: { storeId: store.id, pageType: "home" },
  });

  if (!homePage || !homePage.html.trim()) {
    redirect(`/admin/generator-ai/${store.id}`);
  }

  return (
    <PageEditor
      pageId={homePage.id}
      storeId={store.id}
      storeSlug={store.slug}
      storeName={store.name}
      themeColor={store.themeColor}
      templateId={store.templateId}
      initialHtml={homePage.html}
      backUrl={`/admin/generator-ai/${store.id}`}
    />
  );
}
