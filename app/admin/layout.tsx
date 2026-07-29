import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { SignOutButton } from "@/components/admin/SignOutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-6">
          <span className="font-semibold">klikweb.id — Panel Operator</span>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/admin" className="hover:underline">
              Daftar Tenant
            </Link>
            {session.user.role === "super_admin" && (
              <>
                <Link href="/admin/operator" className="hover:underline">
                  Manajemen Operator
                </Link>
                <Link href="/admin/pengaturan-ai" className="hover:underline">
                  Pengaturan AI
                </Link>
              </>
            )}
          </nav>
        </div>
        <SignOutButton />
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
