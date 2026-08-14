import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // 1. Create Parent User
  await prisma.user.create({
    data: { 
      name, 
      email, 
      passwordHash, 
      role: "customer"
    },
  });

  return NextResponse.json({ ok: true });
}
