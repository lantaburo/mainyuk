/**
 * Script: create-superadmin.ts
 * Jalankan: npx tsx scripts/create-superadmin.ts
 *
 * Membuat akun super_admin di database (lokal maupun Railway).
 * Pastikan DATABASE_URL sudah di-set di .env sebelum menjalankan.
 */
import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";

const SUPERADMIN_EMAIL = "admin@mainyuk.my.id";
const SUPERADMIN_NAME = "Super Admin";
const SUPERADMIN_PASSWORD = "password123";

async function main() {
  console.log("🔐 Membuat akun super_admin...");
  console.log(`   Email    : ${SUPERADMIN_EMAIL}`);
  console.log(`   Password : ${SUPERADMIN_PASSWORD}`);

  const passwordHash = await bcrypt.hash(SUPERADMIN_PASSWORD, 12);

  const user = await prisma.user.upsert({
    where: { email: SUPERADMIN_EMAIL },
    update: {
      role: "super_admin",
      passwordHash,
    },
    create: {
      name: SUPERADMIN_NAME,
      email: SUPERADMIN_EMAIL,
      passwordHash,
      role: "super_admin",
    },
  });

  console.log(`\n✅ Super admin berhasil dibuat!`);
  console.log(`   ID   : ${user.id}`);
  console.log(`   Role : ${user.role}`);
  console.log(`\n🔑 Login dengan:`);
  console.log(`   Email    : ${SUPERADMIN_EMAIL}`);
  console.log(`   Password : ${SUPERADMIN_PASSWORD}`);
  console.log(`\n⚠️  Segera ganti password setelah login pertama!`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
