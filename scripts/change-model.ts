/**
 * One-off maintenance script — bring the OpenAgentic provider's model back to
 * claude-sonnet-4.6 in the ai_providers table. Run manually with:
 *   npx tsx scripts/change-model.ts
 * (Not part of the Next.js build — scripts/ is excluded via tsconfig.)
 */
import { prisma } from "../lib/prisma";

async function main() {
  await prisma.aiProvider.updateMany({
    where: { baseUrl: "https://openagentic.id/api/v1" },
    data: { model: "claude-sonnet-4.6" },
  });
  console.log("Model updated back to claude-sonnet-4.6");
}

main().catch(console.error).finally(() => prisma.$disconnect());
