import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { ShieldCheck } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return (
    <div className="min-h-screen bg-slate-50/50">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b bg-white shadow-sm px-8 py-4 gap-4 sticky top-0 z-10">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-md">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 tracking-tight text-lg">klikweb.id<span className="text-indigo-600">Admin</span></span>
          </div>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/admin" className="text-gray-600 hover:text-indigo-600 transition-colors">
              Daftar Tenant
            </Link>
            {session.user.role === "super_admin" && (
              <>
                <Link href="/admin/operator" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Manajemen Operator
                </Link>
                <Link href="/admin/pengaturan-ai" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Pengaturan AI
                </Link>
              </>
            )}
          </nav>
        </div>
        <SignOutButton />
      </header>
      <main className="p-8 max-w-7xl mx-auto">{children}</main>
    </div>
  );
}
