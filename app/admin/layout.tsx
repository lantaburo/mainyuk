import { requireAdmin } from "@/lib/session";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <AdminNav user={session.user} />
      <main className="flex-1 p-8 overflow-x-hidden max-w-7xl">
        {children}
      </main>
    </div>
  );
}
