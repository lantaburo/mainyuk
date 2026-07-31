import { PrismaClient } from "./lib/generated/prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.aiProvider.updateMany({
    where: { baseUrl: "https://openagentic.id/api/v1" },
    data: { model: "claude-sonnet-4.6" },
  });
  console.log("Model updated back to claude-sonnet-4.6");
}

main().catch(console.error).finally(() => prisma.$disconnect());
