import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
const pdfParse = require("pdf-parse");
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const subjectId = formData.get("subjectId") as string; // can be empty for global

    if (!file || !title) {
      return NextResponse.json({ error: "File dan judul wajib diisi." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text using pdf-parse
    let extractedText = "";
    if (file.name.toLowerCase().endsWith(".pdf")) {
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text;
    } else if (file.name.toLowerCase().endsWith(".txt")) {
      extractedText = buffer.toString("utf-8");
    } else {
      return NextResponse.json({ error: "Format file tidak didukung. Gunakan PDF atau TXT." }, { status: 400 });
    }

    // Optional: Upload original file to R2
    const fileExtension = file.name.split('.').pop();
    const fileName = `ai-docs/${nanoid()}.${fileExtension}`;
    
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      })
    );

    const fileUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;

    // Save to database
    const doc = await prisma.aiDocument.create({
      data: {
        title,
        fileName: file.name,
        fileUrl,
        extractedText,
        subjectId: subjectId || null
      }
    });

    return NextResponse.json({ success: true, doc });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Gagal mengunggah dan memproses dokumen." }, { status: 500 });
  }
}
