import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileSelector } from "./ProfileSelector";

export const metadata = {
  title: "Pilih Profil | MainYuk",
};

export default async function SelectProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  const profiles = await prisma.studentProfile.findMany({
    where: { parentId: session.user.id },
    orderBy: { createdAt: 'asc' }
  });

  return (
    <div className="min-h-screen bg-[#0B2B26] flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <h1 className="text-3xl md:text-5xl font-black text-center text-white mb-12 drop-shadow-md flex flex-col items-center gap-4">
          <span className="text-6xl animate-bounce">👋</span>
          Siapa yang mau belajar?
        </h1>
        <ProfileSelector profiles={profiles} />
      </div>
    </div>
  );
}
