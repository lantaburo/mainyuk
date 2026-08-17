import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PenggunaClient } from "@/components/admin/PenggunaClient";
import { Users } from "lucide-react";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Manajemen Pengguna | Admin MainYuk",
};

export default async function PenggunaPage() {
  const session = await requireAdmin();
  const role = (session.user as any).role;

  // Only super admin or operator can access this
  if (role !== "super_admin" && role !== "operator") {
    redirect("/admin");
  }

  // Fetch all users and their children
  const users = await prisma.user.findMany({
    include: {
      children: {
        orderBy: { createdAt: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-600" />
            Pengguna & Siswa
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola akun orang tua, peran akses, dan profil anak yang terdaftar di platform.
          </p>
        </div>
      </div>

      <PenggunaClient users={users} currentUserId={session.user.id} />
    </div>
  );
}
