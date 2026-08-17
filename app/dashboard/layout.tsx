import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();
  
  const cookieStore = cookies();
  const selectedStudentId = cookieStore.get("selectedStudentId")?.value;

  if (!selectedStudentId) {
    redirect("/select-profile");
  }

  const student = await prisma.studentProfile.findFirst({ 
    where: { 
      id: selectedStudentId,
      parentId: session.user.id
    } 
  });

  if (!student) {
    redirect("/select-profile");
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50/50 lg:flex-row overflow-hidden">
      <DashboardNav user={{ name: student.name, classLevel: student.gradeLevel }} />
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
