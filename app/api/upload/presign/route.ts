import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getUploadPresignedUrl,
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGE_SIZE_MB,
} from "@/lib/r2";

export async function POST(req: NextRequest) {
  // Auth check
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { filename: string; contentType: string; size: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request tidak valid" }, { status: 400 });
  }

  const { filename, contentType, size } = body;

  // Validate content type
  if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
    return NextResponse.json(
      { error: `Tipe file tidak didukung. Gunakan: JPEG, PNG, WebP, atau GIF.` },
      { status: 400 }
    );
  }

  // Validate file size
  if (size > MAX_IMAGE_SIZE_BYTES) {
    return NextResponse.json(
      { error: `Ukuran file maksimal ${MAX_IMAGE_SIZE_MB}MB.` },
      { status: 400 }
    );
  }

  // Build a safe unique key
  const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
  const storeId = (session.user as { storeId?: string }).storeId ?? "unknown";
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  const key = `stores/${storeId}/blocks/${timestamp}-${random}.${safeExt}`;

  try {
    const { uploadUrl, publicUrl } = await getUploadPresignedUrl({ key, contentType });
    return NextResponse.json({ uploadUrl, publicUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal membuat upload URL.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
