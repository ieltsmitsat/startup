import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { MaterialType } from "@prisma/client";
import { isDbAvailable, markDbOffline } from "@/lib/dbCheck";
import {
  getPublicApprovedMaterials,
  addMaterialToStore,
  getAllMaterials,
  INITIAL_MATERIALS,
} from "@/lib/materialsStore";

export const MOCK_STUDY_MATERIALS = INITIAL_MATERIALS;

export const dynamic = "force-dynamic";

const createMaterialSchema = z.object({
  title: z.string().min(3, "Material sarlavhasi kamida 3 ta belgidan iborat bo'lishi kerak"),
  description: z.string().optional(),
  materialType: z.nativeEnum(MaterialType),
  fileUrl: z.string().min(1, "Fayl manzili ko'rsatilishi shart"),
  fileName: z.string().min(1, "Fayl nomi ko'rsatilishi shart"),
  fileSize: z.number().max(52428800, "Fayl hajmi 50 MB dan oshmasligi kerak"),
  fileType: z.string().regex(/^(pdf|docx|pptx|zip)$/i, "Faqat PDF, DOCX, PPTX yoki ZIP fayllar ruxsat etiladi"),
  teacherName: z.string().optional(),
  academicYear: z.number().int().min(1).max(6).optional(),
  subjectId: z.string().min(1, "Fan tanlanishi shart"),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase().trim() || "";
    const subjectId = searchParams.get("subjectId");
    const facultyId = searchParams.get("facultyId");
    const universityId = searchParams.get("universityId");
    const materialType = searchParams.get("materialType") as MaterialType | null;
    const sortBy = searchParams.get("sortBy") || "newest";

    const dbOk = await isDbAvailable();

    if (dbOk) {
      try {
        const where: any = { status: "APPROVED" };

        if (search) {
          where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { teacherName: { contains: search, mode: "insensitive" } },
          ];
        }

        if (materialType && Object.values(MaterialType).includes(materialType)) {
          where.materialType = materialType;
        }

        if (subjectId) {
          where.subjectId = subjectId;
        } else if (facultyId) {
          where.subject = { facultyId: facultyId };
        } else if (universityId) {
          where.subject = { faculty: { universityId: universityId } };
        }

        let orderBy: any = { createdAt: "desc" };
        if (sortBy === "popular") {
          orderBy = { viewsCount: "desc" };
        } else if (sortBy === "downloads") {
          orderBy = { downloadsCount: "desc" };
        }

        const dbMaterials = await prisma.studyMaterial.findMany({
          where,
          orderBy,
          include: {
            subject: {
              include: {
                faculty: {
                  include: {
                    university: { select: { id: true, name: true } },
                  },
                },
              },
            },
            author: {
              select: { id: true, name: true, isVerified: true, avatarUrl: true },
            },
            reviews: { select: { rating: true } },
          },
        });

        if (dbMaterials && dbMaterials.length > 0) {
          const materialsWithRating = dbMaterials.map((m) => {
            const avgRating =
              m.reviews.length > 0
                ? m.reviews.reduce((acc, r) => acc + r.rating, 0) / m.reviews.length
                : 0;
            return {
              ...m,
              avgRating: Number(avgRating.toFixed(1)),
              reviewsCount: m.reviews.length,
            };
          });

          return NextResponse.json({ materials: materialsWithRating });
        }
      } catch (err) {
        markDbOffline();
      }
    }

    // Yagona Unified Store dan tasdiqlangan (APPROVED) barcha materiallarni olish (Admin qo'shganlari bilan birga!)
    const approvedMaterials = getPublicApprovedMaterials({
      search,
      materialType,
      universityId,
      sortBy,
    });

    return NextResponse.json({ materials: approvedMaterials });
  } catch (error) {
    console.error("Study materials fetch error:", error);
    return NextResponse.json({
      materials: getPublicApprovedMaterials({}),
    });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "MODERATOR")) {
      return NextResponse.json(
        { error: "Material yuklash faqat Administratorlar uchun ruxsat etilgan. Admin panel orqali yuklang." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = createMaterialSchema.parse(body);

    const dbOk = await isDbAvailable();
    if (dbOk) {
      try {
        const material = await prisma.studyMaterial.create({
          data: {
            title: validatedData.title,
            description: validatedData.description || null,
            materialType: validatedData.materialType,
            fileUrl: validatedData.fileUrl,
            fileName: validatedData.fileName,
            fileSize: validatedData.fileSize,
            fileType: validatedData.fileType.toLowerCase(),
            teacherName: validatedData.teacherName || null,
            academicYear: validatedData.academicYear || null,
            subjectId: validatedData.subjectId,
            authorId: user.id,
            status: "APPROVED",
          },
          include: {
            subject: true,
            author: {
              select: { id: true, name: true, isVerified: true },
            },
          },
        });

        return NextResponse.json({
          success: true,
          message: "Material muvaffaqiyatli yuklandi",
          material,
        });
      } catch (err) {
        markDbOffline();
      }
    }

    // Store ga qo'shish
    const newMaterial = addMaterialToStore({
      title: validatedData.title,
      description: validatedData.description,
      type: validatedData.materialType,
      fileUrl: validatedData.fileUrl,
      fileName: validatedData.fileName,
      fileSizeMb: Number((validatedData.fileSize / (1024 * 1024)).toFixed(1)),
      teacherName: validatedData.teacherName,
      academicYear: validatedData.academicYear,
      subjectName: "Tanlangan Fan",
      universityName: "TATU",
      status: "APPROVED",
      uploaderName: user.name || "Administrator",
    });

    return NextResponse.json({
      success: true,
      message: "Material muvaffaqiyatli yuklandi va ommaga chiqarildi",
      material: newMaterial,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Validatsiya xatosi" },
        { status: 400 }
      );
    }
    console.error("Create material error:", error);
    return NextResponse.json(
      { error: "Materialni saqlashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
