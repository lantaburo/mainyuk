"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { Role } from "@/lib/generated/prisma2/client";

// ── Delete User (Parent) ──────────────────────────────────────────────────────
export async function deleteUserAccount(userId: string) {
  const session = await requireAdmin();

  // Prevent self-deletion
  if (session.user.id === userId) {
    return { ok: false, error: "Anda tidak dapat menghapus akun Anda sendiri." };
  }

  // Prevent deleting super_admin unless you are super_admin (handled by requireAdmin, but extra safety)
  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) {
    return { ok: false, error: "Pengguna tidak ditemukan." };
  }

  if (targetUser.role === "super_admin" && (session.user as any).role !== "super_admin") {
    return { ok: false, error: "Hanya Super Admin yang dapat menghapus akun Super Admin lain." };
  }

  // Delete the user. Because of onDelete: Cascade in prisma schema, 
  // this will automatically delete StudentProfiles and StudentProgress related to this user.
  await prisma.user.delete({ where: { id: userId } });
  
  revalidatePath("/admin/pengguna");
  return { ok: true };
}

// ── Update User Role ──────────────────────────────────────────────────────────
export async function updateUserRole(userId: string, newRole: string) {
  const session = await requireAdmin();

  // Prevent self-demotion
  if (session.user.id === userId) {
    return { ok: false, error: "Anda tidak dapat mengubah peran Anda sendiri." };
  }

  // Only super_admin can assign/remove super_admin or operator roles
  if ((session.user as any).role !== "super_admin") {
    return { ok: false, error: "Hanya Super Admin yang dapat mengubah peran pengguna." };
  }

  const validRoles = ["customer", "operator", "super_admin", "store_owner"];
  if (!validRoles.includes(newRole)) {
    return { ok: false, error: "Peran tidak valid." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole as Role },
  });

  revalidatePath("/admin/pengguna");
  return { ok: true };
}

// ── Delete Child Profile ──────────────────────────────────────────────────────
export async function deleteChildProfile(profileId: string) {
  await requireAdmin();

  const profile = await prisma.studentProfile.findUnique({ where: { id: profileId } });
  if (!profile) {
    return { ok: false, error: "Profil anak tidak ditemukan." };
  }

  await prisma.studentProfile.delete({ where: { id: profileId } });
  
  revalidatePath("/admin/pengguna");
  return { ok: true };
}
