import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { r2Client } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export const runtime = "nodejs";
export const maxDuration = 60;

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;   // 5 MB
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;  // 50 MB

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!r2Client || !process.env.R2_BUCKET_NAME || !process.env.R2_PUBLIC_URL) {
    return NextResponse.json({ error: "R2 storage belum dikonfigurasi." }, { status: 500 });
  }

  const formData = await req.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Form data tidak valid." }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const storeIdFromBody = formData.get("storeId") as string | null;

  if (!file) {
    return NextResponse.json({ error: "File tidak ditemukan dalam request." }, { status: 400 });
  }

  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Format tidak didukung. Gunakan: JPEG, PNG, WebP, GIF, MP4, WebM, atau OGG." },
      { status: 400 }
    );
  }

  const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > maxBytes) {
    return NextResponse.json(
      { error: `Ukuran file maksimal ${isVideo ? "50MB untuk video" : "5MB untuk gambar"}.` },
      { status: 400 }
    );
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? (isVideo ? "mp4" : "jpg");
  const storeId = storeIdFromBody || (session.user as { storeId?: string }).storeId || "general";
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  const folder = isVideo ? "videos" : "blocks";
  const key = `stores/${storeId}/${folder}/${timestamp}-${random}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await r2Client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        ContentLength: buffer.length,
      })
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload ke R2 gagal.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const publicBaseUrl = process.env.R2_PUBLIC_URL.replace(/\/$/, "");
  const publicUrl = `${publicBaseUrl}/${key}`;

  return NextResponse.json({ publicUrl, isVideo });
}
