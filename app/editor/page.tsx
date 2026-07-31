import { redirect } from "next/navigation";
import { requireStoreOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageEditor } from "@/components/dashboard/PageEditor";

export default async function EditorPage({ searchParams }: { searchParams: { pageId?: string } }) {
  const session = await requireStoreOwner();
  const store = await prisma.store.findUniqueOrThrow({ where: { id: session.user.storeId } });
  
  const targetPage = await prisma.storePage.findFirst({
    where: searchParams.pageId 
      ? { storeId: store.id, id: searchParams.pageId }
      : { storeId: store.id, pageType: "home" },
  });

  if (!targetPage || !targetPage.html.trim()) {
    redirect("/dashboard/ai-generator");
  }

  return (
    <PageEditor
      pageId={targetPage.id}
      storeId={store.id}
      storeSlug={store.slug}
      storeName={store.name}
      themeColor={store.themeColor}
      templateId={store.templateId}
      initialHtml={targetPage.html}
    />
  );
}
