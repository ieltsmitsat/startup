import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";
import { isDbAvailable } from "@/lib/dbCheck";
import { getAllMaterials } from "@/lib/materialsStore";

export const dynamic = "force-dynamic";

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case ".pdf":
      return "application/pdf";
    case ".docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case ".pptx":
      return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    case ".zip":
      return "application/zip";
    default:
      return "application/octet-stream";
  }
}

function createDummyFileBuffer(filename: string): Buffer {
  const ext = path.extname(filename).toLowerCase();
  if (ext === ".pdf") {
    return Buffer.from(
      `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000101 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF\n`,
      "utf8"
    );
  }
  return Buffer.from([
    0x50, 0x4b, 0x05, 0x06, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00
  ]);
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    let material: any = null;

    if (await isDbAvailable()) {
      try {
        material = await prisma.studyMaterial.findUnique({
          where: { id },
        });
        if (material) {
          await prisma.studyMaterial.update({
            where: { id },
            data: { downloadsCount: { increment: 1 } },
          });
        }
      } catch (err) {
        // ignore
      }
    }

    if (!material) {
      const all = getAllMaterials();
      material = all.find((m) => m.id === id);
    }

    if (!material) {
      return NextResponse.json({ error: "Material topilmadi" }, { status: 404 });
    }

    const fileName = material.fileName || `${material.title.replace(/\s+/g, "_")}.pdf`;
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const rawUrlName = material.fileUrl?.replace(/^\/uploads\//, "") || fileName;
    let filePath = path.join(uploadsDir, rawUrlName);

    if (!fs.existsSync(filePath)) {
      filePath = path.join(uploadsDir, fileName);
    }

    if (!fs.existsSync(filePath)) {
      const dummy = createDummyFileBuffer(fileName);
      fs.writeFileSync(filePath, dummy);
    }

    const fileBuffer = fs.readFileSync(filePath);
    const mimeType = getMimeType(fileName);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
        "Content-Length": String(fileBuffer.length),
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "Yuklab olishda xatolik yuz berdi" }, { status: 500 });
  }
}
