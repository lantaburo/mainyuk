import { redirect } from "next/navigation";
import { requireStoreOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageEditor } from "@/components/dashboard/PageEditor";

export default async function EditorPage() {
  const session = await requireStoreOwner();
  const store = await prisma.store.findUniqueOrThrow({ where: { id: session.user.storeId } });
  const homePage = await prisma.storePage.findFirst({
    where: { storeId: store.id, pageType: "home" },
  });

  if (!homePage || !homePage.html.trim()) {
    redirect("/dashboard/ai-generator");
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
    />
  );
}
