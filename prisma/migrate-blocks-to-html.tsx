import "dotenv/config";
import { prisma } from "../lib/prisma";
import { parseBlocks } from "../lib/blocks-types";
import { renderBlocksToHtml } from "../lib/render-blocks-to-html";

/**
 * One-time conversion of existing StorePage.blocks (fixed-block JSON) into
 * StorePage.html (raw HTML fragment), so the hard cutover to the AI HTML
 * generator doesn't blank out any already-live store.
 */
async function main() {
  const pages = await prisma.storePage.findMany({
    include: { store: { include: { settings: true } } },
  });
  console.log(`Migrating ${pages.length} store page(s)...`);

  for (const page of pages) {
    const blocks = parseBlocks(page.blocks);
    const html = renderBlocksToHtml(blocks, page.store.settings?.whatsappNumber);

    await prisma.storePage.update({
      where: { id: page.id },
      data: { html },
    });
    console.log(`  ${page.storeId} / ${page.pageType}: ${blocks.length} block(s) -> ${html.length} chars`);
  }

  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
