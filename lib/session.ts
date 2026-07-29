import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export function getSession() {
  return getServerSession(authOptions);
}

export async function requireStoreOwner() {
  const session = await getSession();
  if (!session || session.user.role !== "store_owner" || !session.user.storeId) {
    redirect("/login");
  }
  return session as typeof session & {
    user: { storeId: string };
  };
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session || (session.user.role !== "super_admin" && session.user.role !== "operator")) {
    redirect("/login");
  }
  return session;
}

export async function requireAdminOrOwner(storeId: string) {
  const session = await getSession();
  if (!session) redirect("/login");
  
  if (session.user.role === "super_admin" || session.user.role === "operator") {
    return session;
  }
  
  if (session.user.role === "store_owner" && session.user.storeId === storeId) {
    return session;
  }
  
  redirect("/login");
}

export async function requireSuperAdmin() {
  const session = await getSession();
  if (!session || session.user.role !== "super_admin") {
    redirect("/login");
  }
  return session;
}
