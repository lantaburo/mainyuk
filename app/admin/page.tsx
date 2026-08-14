import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { AdminStudentListClient } from "@/components/admin/AdminStudentListClient";
import { GraduationCap, BookOpen, Library, Users } from "lucide-react";

export default async function AdminPage() {
  await requireAdmin();

  // Fetch educational data
  const students = await prisma.studentProfile.findMany({
    include: {
      parent: { select: { name: true, email: true } },
      _count: { select: { progress: { where: { isCompleted: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const staffCount = await prisma.user.count({
    where: {
      role: { in: ['super_admin', 'operator'] }
    }
  });

  const totalSubjects = await prisma.subject.count();
  const totalModules = await prisma.module.count();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard Super Admin</h1>
        <p className="mt-2 text-sm text-gray-500">Pantau pertumbuhan dan kelola semua data siswa di platform mainyuk.my.id.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <div className="relative overflow-hidden rounded-2xl border border-white/40 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between group">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-indigo-500/10 blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-medium text-gray-500/80">Total Siswa</p>
              <p className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900 drop-shadow-sm">{students.length}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-600 rounded-xl shadow-sm border border-indigo-100/50">
              <GraduationCap className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-6 relative z-10">
            <p className="text-xs font-medium text-gray-500">Total siswa terdaftar</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="relative overflow-hidden rounded-2xl border border-white/40 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between group">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-medium text-gray-500/80">Total Pelajaran</p>
              <p className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900 drop-shadow-sm">{totalSubjects}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 rounded-xl shadow-sm border border-blue-100/50">
              <BookOpen className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-6 relative z-10">
            <p className="text-xs font-medium text-gray-500">Mata pelajaran tersedia</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="relative overflow-hidden rounded-2xl border border-white/40 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between group">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-medium text-gray-500/80">Total Modul</p>
              <p className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900 drop-shadow-sm">{totalModules}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 rounded-xl shadow-sm border border-emerald-100/50">
              <Library className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-6 relative z-10">
            <p className="text-xs font-medium text-gray-500">Total modul pembelajaran</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="relative overflow-hidden rounded-2xl border border-white/40 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between group">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-purple-500/10 blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-medium text-gray-500/80">Admin Staf</p>
              <p className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900 drop-shadow-sm">{staffCount}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-50 text-purple-600 rounded-xl shadow-sm border border-purple-100/50">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-6 relative z-10">
            <p className="text-xs font-medium text-gray-500">Pengelola & Customer Support</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-gray-900">Daftar Siswa Terdaftar</h2>
        <AdminStudentListClient initialStudents={students} />
      </div>
    </div>
  );
}
