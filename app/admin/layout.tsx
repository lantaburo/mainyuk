import { requireAdmin } from "@/lib/session";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-slate-50/50 relative overflow-hidden">
      {/* Premium Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-indigo-50/50 via-purple-50/20 to-transparent -z-10 blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-blue-50/40 via-cyan-50/20 to-transparent -z-10 blur-3xl opacity-50 pointer-events-none" />

      <AdminNav user={session.user} />
      <main className="flex-1 p-8 overflow-x-hidden max-w-7xl relative z-0">
        {children}
      </main>
    </div>
  );
}
