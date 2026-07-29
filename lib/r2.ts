import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME;

export const r2Client =
  accountId && accessKeyId && secretAccessKey
    ? new S3Client({
        region: "auto",
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId, secretAccessKey },
      })
    : null;

/**
 * Generate a presigned PUT URL for uploading to R2.
 * Returns { uploadUrl, publicUrl } or throws if R2 is not configured.
 */
export async function getUploadPresignedUrl(opts: {
  key: string;
  contentType: string;
  expiresIn?: number;
}): Promise<{ uploadUrl: string; publicUrl: string }> {
  if (!r2Client || !bucketName) {
    throw new Error("R2 storage belum dikonfigurasi. Isi R2_* di environment variables.");
  }

  const publicBaseUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
  if (!publicBaseUrl) {
    throw new Error("R2_PUBLIC_URL belum dikonfigurasi di environment variables.");
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: opts.key,
    ContentType: opts.contentType,
  });

  const uploadUrl = await getSignedUrl(r2Client, command, {
    expiresIn: opts.expiresIn ?? 300, // 5 minutes
  });

  const publicUrl = `${publicBaseUrl}/${opts.key}`;

  return { uploadUrl, publicUrl };
}

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
export const MAX_IMAGE_SIZE_MB = 5;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
