"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/session";

const addOperatorSchema = z.object({
  name: z.string().min(1, "Nama tidak boleh kosong"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export async function addOperator(formData: FormData) {
  await requireSuperAdmin();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const parsed = addOperatorSchema.safeParse({ name, email, password });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Input tidak valid");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (existingUser) {
    throw new Error("Email sudah terdaftar");
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: "operator",
    },
  });

  revalidatePath("/admin/operator");
}

export async function deleteOperator(userId: string) {
  await requireSuperAdmin();

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.role !== "operator") {
    throw new Error("Operator tidak ditemukan atau tidak valid");
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  revalidatePath("/admin/operator");
}
