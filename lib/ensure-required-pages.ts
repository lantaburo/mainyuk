import { prisma } from "@/lib/prisma";
import { SITE_TYPE_CONFIG, type SiteType } from "@/lib/site-types";
import {
  getDefaultAboutBlocks,
  getDefaultContactBlocks,
  getDefaultHomeBlocks,
} from "@/lib/default-blocks";
import { blocksToJson } from "@/lib/blocks-types";
import { DEFAULT_INDUSTRY, isIndustry, type Industry } from "@/lib/industry-content";

export async function ensureRequiredPages(
  storeId: string,
  siteType: SiteType,
  storeName: string,
  industry?: string | null
) {
  const resolvedIndustry: Industry =
    industry && isIndustry(industry) ? industry : DEFAULT_INDUSTRY;
  const config = SITE_TYPE_CONFIG[siteType];
  const existing = await prisma.storePage.findMany({
    where: { storeId },
    select: { pageType: true },
  });
  const existingTypes = new Set(existing.map((p) => p.pageType));

  for (const page of config.pages) {
    if (existingTypes.has(page.pageType)) continue;

    const blocks =
      page.pageType === "home"
        ? getDefaultHomeBlocks(siteType, storeName, resolvedIndustry)
        : page.pageType === "about"
          ? getDefaultAboutBlocks(storeName, resolvedIndustry)
          : getDefaultContactBlocks();

    await prisma.storePage.create({
      data: {
        storeId,
        pageType: page.pageType,
        blocks: blocksToJson(blocks),
        // html left empty — new pages start blank until generated via AI.
      },
    });
  }
}
