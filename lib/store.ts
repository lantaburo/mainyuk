import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getStoreBySlug = cache(async (slug: string) => {
  const store = await prisma.store.findUnique({
    where: { slug },
    include: { settings: true },
  });
  if (!store || store.status === "suspended") return null;
  return store;
});

export const getStorePage = cache(
  async (storeId: string, pageType: "home" | "about" | "contact") => {
    return prisma.storePage.findFirst({
      where: { storeId, pageType },
    });
  }
);
