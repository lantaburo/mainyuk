import { redirect } from "next/navigation";
import { requireStoreOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStoreOwner();
  const store = await prisma.store.findUnique({ where: { id: session.user.storeId } });
  if (!store) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <DashboardNav store={{ name: store.name, slug: store.slug, siteType: store.siteType }} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
