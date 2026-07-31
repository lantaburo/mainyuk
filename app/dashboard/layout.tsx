import { redirect } from "next/navigation";
import { requireStoreOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { stopImpersonation } from "@/app/actions/impersonate-actions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStoreOwner();
  const store = await prisma.store.findUnique({ where: { id: session.user.storeId } });
  if (!store) redirect("/login");

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      {session.user.originalRole && (
        <div className="bg-red-600 text-white p-2 px-6 flex justify-between items-center text-sm font-medium z-50 shadow-md">
          <div className="flex items-center gap-2">
            <span className="animate-pulse">🔴</span>
            <span>Anda sedang dalam mode Impersonate. Segala perubahan akan disimpan ke toko ini.</span>
          </div>
          <form action={stopImpersonation}>
            <button type="submit" className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded transition-colors border border-white/30">
              Berhenti Impersonate
            </button>
          </form>
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
        <DashboardNav store={{ name: store.name, slug: store.slug, siteType: store.siteType }} />
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
