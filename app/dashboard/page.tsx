import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardOverviewPage() {
  const session = await requireAuth();
  const cookieStore = cookies();
  const selectedStudentId = cookieStore.get("selectedStudentId")?.value;

  if (!selectedStudentId) {
    redirect("/select-profile");
  }

  const student = await prisma.studentProfile.findFirst({
    where: { id: selectedStudentId, parentId: session.user.id }
  });

  if (!student) {
    redirect("/select-profile");
  }
  
  // Get all subjects that have modules for this student's grade level
  const subjects = await prisma.subject.findMany({
    where: {
      modules: {
        some: { gradeLevel: student.gradeLevel }
      }
    },
    include: {
      _count: {
        select: { 
          modules: {
            where: { gradeLevel: student.gradeLevel }
          } 
        }
      }
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Ruang Belajar {student.name}</h1>
        <p className="text-gray-500 mt-2">Pilih mata pelajaran Kelas {student.gradeLevel} untuk mulai belajar hari ini.</p>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => (
          <Link key={subject.id} href={`/dashboard/subject/${subject.slug}`}>
            <div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-indigo-200 flex flex-col h-full cursor-pointer relative overflow-hidden">
              {subject.color && (
                <div className={`absolute top-0 left-0 w-full h-2 ${subject.color}`} />
              )}
              <div className="flex items-center gap-4 mb-4 mt-2">
                <div className={`p-3 rounded-lg ${subject.color ? subject.color + ' text-white' : 'bg-indigo-100 text-indigo-600'}`}>
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {subject.name}
                  </h3>
                  <p className="text-sm text-gray-500">{subject._count.modules} Modul Pembelajaran</p>
                </div>
              </div>
              <div className="mt-auto pt-4 border-t border-gray-100">
                <span className="text-sm font-medium text-indigo-600 group-hover:text-indigo-700 flex items-center">
                  Mulai Belajar &rarr;
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
