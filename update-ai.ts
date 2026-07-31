import "dotenv/config";
import { prisma } from "./lib/prisma";

async function main() {
  const existing = await prisma.aiSettings.findFirst();
  if (existing) {
    await prisma.aiSettings.update({
      where: { id: existing.id },
      data: {
        baseUrl: "https://api.openai.com/v1",
        apiKey: "sk-cadangan-anda",
        model: "gpt-4o-mini"
      }
    });
    console.log("Pengaturan AI cadangan berhasil diperbarui!");
  } else {
    await prisma.aiSettings.create({
      data: {
        baseUrl: "https://api.openai.com/v1",
        apiKey: "sk-cadangan-anda",
        model: "gpt-4o-mini"
      }
    });
    console.log("Pengaturan AI cadangan berhasil dibuat!");
  }
}

main().catch(console.error).finally(() => process.exit(0));
