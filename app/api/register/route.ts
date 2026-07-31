import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { isReservedSlug, SITE_TYPE_CONFIG } from "@/lib/site-types";
import {
  getDefaultAboutBlocks,
  getDefaultContactBlocks,
  getDefaultHomeBlocks,
} from "@/lib/default-blocks";
import { blocksToJson } from "@/lib/blocks-types";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      { status: 400 }
    );
  }

  const { name, email, password, storeName, storeSlug, siteType, industry, templateId } =
    parsed.data;

  if (isReservedSlug(storeSlug)) {
    return NextResponse.json(
      { error: "Slug ini tidak bisa dipakai, coba nama lain" },
      { status: 400 }
    );
  }

  const [existingUser, existingStore] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.store.findUnique({ where: { slug: storeSlug } }),
  ]);
  if (existingUser) {
    return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
  }
  if (existingStore) {
    return NextResponse.json({ error: "Slug toko sudah dipakai" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const config = SITE_TYPE_CONFIG[siteType];

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name, email, passwordHash, role: "store_owner" },
    });

    const store = await tx.store.create({
      data: {
        slug: storeSlug,
        name: storeName,
        siteType,
        industry,
        templateId,
        ownerId: user.id,
        status: "trial",
      },
    });

    await tx.storeSettings.create({ data: { storeId: store.id } });

    for (const page of config.pages) {
      const blocks =
        page.pageType === "home"
          ? getDefaultHomeBlocks(siteType, storeName, industry)
          : page.pageType === "about"
            ? getDefaultAboutBlocks(storeName, industry)
            : getDefaultContactBlocks();

      await tx.storePage.create({
        data: {
          storeId: store.id,
          pageType: page.pageType,
          blocks: blocksToJson(blocks),
          // html left empty — new stores start blank until the owner runs
          // the AI Website Generator (app/dashboard/ai-generator).
        },
      });
    }
  });

  return NextResponse.json({ ok: true });
}
