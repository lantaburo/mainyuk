"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";

function generateAffiliateCode(name: string): string {
  const prefix = name
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 3)
    .padEnd(3, "X");
  return prefix + nanoid(5).toUpperCase();
}

export async function registerAffiliate(data: {
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
}) {
  const session = await requireAuth();
  const userId = session.user.id;

  // Check if already registered
  const existing = await prisma.affiliateCode.findUnique({ where: { userId } });
  if (existing) {
    return { ok: false, error: "Anda sudah terdaftar sebagai afiliator." };
  }

  const code = generateAffiliateCode(data.ownerName);

  await prisma.affiliateCode.create({
    data: {
      userId,
      ownerName: data.ownerName,
      ownerEmail: data.ownerEmail,
      ownerPhone: data.ownerPhone,
      bankName: data.bankName,
      bankAccountNumber: data.bankAccountNumber,
      bankAccountName: data.bankAccountName,
      code,
      commissionPct: 10, // Default 10%
      status: "pending_review",
    },
  });

  revalidatePath("/affiliate/dashboard");
  return { ok: true };
}

export async function updateAffiliateBank(data: {
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
}) {
  const session = await requireAuth();

  const affiliate = await prisma.affiliateCode.findUnique({
    where: { userId: session.user.id },
  });

  if (!affiliate) {
    return { ok: false, error: "Data afiliasi tidak ditemukan." };
  }

  await prisma.affiliateCode.update({
    where: { id: affiliate.id },
    data: {
      bankName: data.bankName,
      bankAccountNumber: data.bankAccountNumber,
      bankAccountName: data.bankAccountName,
    },
  });

  revalidatePath("/affiliate/dashboard");
  return { ok: true };
}

export async function requestWithdrawal(amount: number) {
  const session = await requireAuth();

  const affiliate = await prisma.affiliateCode.findUnique({
    where: { userId: session.user.id },
  });

  if (!affiliate) return { ok: false, error: "Data afiliasi tidak ditemukan." };
  if (affiliate.status !== "active") return { ok: false, error: "Akun afiliasi Anda belum aktif." };
  if (!affiliate.bankAccountNumber) return { ok: false, error: "Harap isi data rekening bank terlebih dahulu." };

  const pending = Number(affiliate.pendingBalance);
  if (amount < 50000) return { ok: false, error: "Minimum withdrawal adalah Rp 50.000." };
  if (amount > pending) return { ok: false, error: "Saldo tidak mencukupi." };

  await prisma.$transaction([
    prisma.affiliateWithdrawal.create({
      data: { affiliateId: affiliate.id, amount },
    }),
    prisma.affiliateCode.update({
      where: { id: affiliate.id },
      data: { pendingBalance: { decrement: amount } },
    }),
  ]);

  revalidatePath("/affiliate/dashboard");
  return { ok: true };
}

export async function getMyAffiliate() {
  const session = await requireAuth();
  
  let aff = await prisma.affiliateCode.findUnique({
    where: { userId: session.user.id },
    include: { withdrawals: { orderBy: { createdAt: "desc" }, take: 10 } },
  });

  // Jika tidak ketemu berdasarkan userId, coba cari berdasarkan email login
  if (!aff && session.user.email) {
    const affByEmail = await prisma.affiliateCode.findFirst({
      where: { ownerEmail: session.user.email },
      include: { withdrawals: { orderBy: { createdAt: "desc" }, take: 10 } },
    });

    if (affByEmail) {
      // Link akun afiliasi ke userId yang baru ini (berguna jika user login via Google/Email yang berbeda ID tapi email sama)
      aff = await prisma.affiliateCode.update({
        where: { id: affByEmail.id },
        data: { userId: session.user.id },
        include: { withdrawals: { orderBy: { createdAt: "desc" }, take: 10 } },
      });
    }
  }

  if (!aff) return null;

  return {
    ...aff,
    commissionPct: aff.commissionPct.toString(),
    totalEarnings: aff.totalEarnings.toString(),
    pendingBalance: aff.pendingBalance.toString(),
    paidOut: aff.paidOut.toString(),
    withdrawals: aff.withdrawals.map((w) => ({
      ...w,
      amount: w.amount.toString(),
    })),
  };
}
