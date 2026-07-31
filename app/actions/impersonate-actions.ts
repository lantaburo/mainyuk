"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export async function startImpersonation(storeId: string) {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  
  // Hanya super_admin dan operator yang boleh melakukan impersonate
  // Perlu cek originalRole juga jika sedang impersonate dan ingin pindah tenant lain
  const role = session.user.originalRole || session.user.role;
  if (role !== "super_admin" && role !== "operator") {
    throw new Error("Akses ditolak");
  }

  // Set cookie impersonate_store_id
  cookies().set("impersonate_store_id", storeId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    // secure: process.env.NODE_ENV === "production",
  });

  // Redirect ke dashboard tenant
  redirect("/dashboard");
}

export async function stopImpersonation() {
  const session = await getSession();
  if (!session || !session.user.originalRole) {
    redirect("/admin/stores");
  }

  // Hapus cookie
  cookies().delete("impersonate_store_id");

  redirect("/admin/stores");
}
