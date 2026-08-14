import { PrismaClient } from "./lib/generated/prisma2/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE student_progress CASCADE;`);
  console.log("Truncated");
}

run().catch(console.error).finally(() => process.exit(0));
