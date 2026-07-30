import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { designBriefSchema } from "@/lib/ai-html-schema";
import { enrichHtmlWithImages } from "@/lib/html-image-enricher";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.PEXELS_API_KEY) {
    // Pexels belum dikonfigurasi — return HTML apa adanya tanpa error
    const body = await req.json().catch(() => null);
    return NextResponse.json({ html: body?.html ?? "", imagesInjected: 0, photos: [] });
  }

  let body: { html: string; brief: unknown; storeId: string } | null = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request body tidak valid." }, { status: 400 });
  }

  if (!body?.html || !body?.brief || !body?.storeId) {
    return NextResponse.json({ error: "Payload tidak lengkap." }, { status: 400 });
  }

  const role = (session.user as any).role;
  const sessionStoreId = (session.user as any).storeId;
  const isAdmin = role === "super_admin" || role === "operator";
  if (!isAdmin && (role !== "store_owner" || sessionStoreId !== body.storeId)) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  // Cek apakah store ada
  const store = await prisma.store.findUnique({
    where: { id: body.storeId },
    select: { name: true },
  });
  if (!store) {
    return NextResponse.json({ error: "Toko tidak ditemukan." }, { status: 404 });
  }

  const briefParsed = designBriefSchema.safeParse(body.brief);
  if (!briefParsed.success) {
    // Brief invalid → return HTML asli tanpa enrichment
    return NextResponse.json({ html: body.html, imagesInjected: 0, photos: [] });
  }

  const result = await enrichHtmlWithImages(body.html, briefParsed.data, store.name);

  return NextResponse.json({
    html: result.html,
    imagesInjected: result.imagesInjected,
    photos: result.photos,
  });
}
