import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isDbAvailable, markDbOffline } from "@/lib/dbCheck";
import {
  getAdminMaterialsFormatted,
  addMaterialToStore,
  updateMaterialStatusInStore,
  updateMaterialDataInStore,
  deleteMaterialFromStore,
} from "@/lib/materialsStore";

export interface AdminMaterialItem {
  id: string;
  title: string;
  subjectName: string;
  universityName: string;
  teacherName: string;
  type: string; // LECTURE, SLIDES, EXAM_QUESTIONS, LAB_WORK, TESTS, OTHER
  status: "PENDING" | "APPROVED" | "REJECTED";
  fileUrl: string;
  fileSizeMb: number;
  uploaderName: string;
  academicYear?: number;
  rejectionReason?: string | null;
  createdAt: string;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.toLowerCase().trim() || "";
    const university = searchParams.get("university");
    const type = searchParams.get("type");

    let materials = getAdminMaterialsFormatted();

    if (await isDbAvailable()) {
      try {
        const where: any = {};
        if (status && status !== "ALL") {
          where.status = status;
        }
        if (search) {
          where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { teacherName: { contains: search, mode: "insensitive" } },
          ];
        }

        const dbMaterials = await prisma.studyMaterial.findMany({
          where,
          include: {
            subject: {
              include: {
                faculty: {
                  include: {
                    university: { select: { name: true } },
                  },
                },
              },
            },
            author: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
        });

        if (dbMaterials.length > 0) {
          materials = dbMaterials.map((m: any) => ({
            id: m.id,
            title: m.title,
            subjectName: m.subject?.name || "Fan",
            universityName: m.subject?.faculty?.university?.name || "Universitet",
            teacherName: m.teacherName || "Noma'lum",
            type: m.materialType || "LECTURE",
            status: m.status as any,
            fileUrl: m.fileUrl,
            fileSizeMb: Number(((m.fileSize || 2000000) / (1024 * 1024)).toFixed(1)),
            uploaderName: m.author?.name || "Talaba",
            academicYear: m.academicYear || 1,
            rejectionReason: null,
            createdAt: m.createdAt.toISOString(),
          }));
        }
      } catch {
        markDbOffline();
      }
    }

    // In-memory filter
    if (status && status !== "ALL") {
      materials = materials.filter((m) => m.status === status);
    }
    if (university && university !== "ALL") {
      materials = materials.filter((m) => m.universityName === university);
    }
    if (type && type !== "ALL") {
      materials = materials.filter((m) => m.type === type);
    }
    if (search) {
      materials = materials.filter(
        (m) =>
          m.title.toLowerCase().includes(search) ||
          m.subjectName.toLowerCase().includes(search) ||
          m.teacherName.toLowerCase().includes(search) ||
          m.uploaderName.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      materials,
      totalCount: materials.length,
      pendingCount: materials.filter((m) => m.status === "PENDING").length,
      approvedCount: materials.filter((m) => m.status === "APPROVED").length,
      rejectedCount: materials.filter((m) => m.status === "REJECTED").length,
    });
  } catch (error) {
    console.error("Admin materials GET error:", error);
    return NextResponse.json({ materials: getAdminMaterialsFormatted() });
  }
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let title = "";
    let subjectName = "";
    let universityName = "";
    let teacherName = "Kafedra o'qituvchisi";
    let type = "LECTURE";
    let fileUrl = "/uploads/sample-material.pdf";
    let fileName = "";
    let fileSizeMb = 3.5;
    let academicYear = 1;
    let description = "";
    let status = "APPROVED";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      title = (formData.get("title") as string) || "";
      subjectName = (formData.get("subjectName") as string) || (formData.get("subject") as string) || "";
      universityName = (formData.get("universityName") as string) || (formData.get("university") as string) || "";
      teacherName = (formData.get("teacherName") as string) || (formData.get("author") as string) || "Kafedra o'qituvchisi";
      type = (formData.get("type") as string) || (formData.get("materialType") as string) || "LECTURE";
      academicYear = Number(formData.get("academicYear")) || 1;
      description = (formData.get("description") as string) || "";
      status = (formData.get("status") as string) || "APPROVED";

      const file = formData.get("file") as File | null;
      if (file && typeof file === "object" && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        fileName = file.name;
        fileSizeMb = Number((file.size / (1024 * 1024)).toFixed(1));
        const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const filePath = path.join(uploadDir, safeName);
        fs.writeFileSync(filePath, buffer);
        fileUrl = `/uploads/${safeName}`;
      } else {
        fileName = (formData.get("fileName") as string) || (title ? `${String(title).replace(/\s+/g, "_")}.pdf` : "material.pdf");
        fileUrl = (formData.get("fileUrl") as string) || "/uploads/sample-material.pdf";
        fileSizeMb = Number(formData.get("fileSizeMb")) || 3.5;
      }
    } else {
      const body = await req.json();
      title = body.title;
      subjectName = body.subjectName || body.subject;
      universityName = body.universityName || body.university;
      teacherName = body.teacherName || body.author || "Kafedra o'qituvchisi";
      type = body.type || body.materialType || "LECTURE";
      fileUrl = body.fileUrl || "/uploads/sample-material.pdf";
      fileName = body.fileName || (title ? `${String(title).replace(/\s+/g, "_")}.pdf` : "material.pdf");
      fileSizeMb = body.fileSizeMb ? Number(body.fileSizeMb) : 3.5;
      academicYear = body.academicYear ? Number(body.academicYear) : 1;
      description = body.description || "";
      status = body.status || "APPROVED";
    }

    if (!title || !subjectName || !universityName) {
      return NextResponse.json(
        { error: "Sarlavha, fan nomi va universitet talab qilinadi" },
        { status: 400 }
      );
    }

    // 1. Unified store ga qo'shish (bu orqali material BIR VAQTDA ham Admin panelda, ham /study da paydo bo'ladi!)
    const unified = addMaterialToStore({
      title,
      subjectName,
      universityName,
      teacherName: teacherName || "Kafedra o'qituvchisi",
      type: type || "LECTURE",
      fileUrl: fileUrl || "/uploads/sample-material.pdf",
      fileName: fileName || `${title.replace(/\s+/g, "_")}.pdf`,
      fileSizeMb: fileSizeMb ? Number(fileSizeMb) : 3.5,
      academicYear: academicYear ? Number(academicYear) : 1,
      description,
      status: (status as "APPROVED" | "PENDING") || "APPROVED",
      uploaderName: "Admin (Rasmiy)",
    });

    const newMaterial: AdminMaterialItem = {
      id: unified.id,
      title: unified.title,
      subjectName: unified.subject.name,
      universityName: unified.subject.faculty.university.name,
      teacherName: unified.teacherName,
      type: unified.materialType,
      status: unified.status,
      fileUrl: unified.fileUrl,
      fileSizeMb: unified.fileSizeMb,
      uploaderName: unified.author.name,
      academicYear: unified.academicYear,
      rejectionReason: null,
      createdAt: unified.createdAt,
    };

    // 2. Agar DB mavjud bo'lsa, PostgreSQL ga ham saqlash
    if (await isDbAvailable()) {
      try {
        let university = await prisma.university.findFirst({
          where: { name: { contains: universityName, mode: "insensitive" } },
        });
        if (!university) {
          university = await prisma.university.findFirst();
        }

        if (university) {
          let faculty = await prisma.faculty.findFirst({
            where: { universityId: university.id },
          });

          if (faculty) {
            let subject = await prisma.subject.findFirst({
              where: { facultyId: faculty.id, name: { contains: subjectName, mode: "insensitive" } },
            });

            if (!subject) {
              subject = await prisma.subject.create({
                data: {
                  name: subjectName,
                  facultyId: faculty.id,
                },
              });
            }

            let adminUser = await prisma.user.findFirst({
              where: { role: "ADMIN" },
            });
            if (!adminUser) {
              adminUser = await prisma.user.findFirst();
            }

            if (adminUser) {
              await prisma.studyMaterial.create({
                data: {
                  title,
                  description: description || null,
                  materialType: (type as any) || "LECTURE",
                  fileUrl: fileUrl || "/uploads/sample-material.pdf",
                  fileName: fileName || `${title.replace(/\s+/g, "_")}.pdf`,
                  fileSize: Math.round((fileSizeMb || 3.5) * 1024 * 1024),
                  fileType: "pdf",
                  teacherName: teacherName || null,
                  academicYear: academicYear ? Number(academicYear) : 1,
                  subjectId: subject.id,
                  authorId: adminUser.id,
                  status: (status as any) || "APPROVED",
                },
              });
            }
          }
        }
      } catch {
        markDbOffline();
      }
    }

    return NextResponse.json({ success: true, material: newMaterial }, { status: 201 });
  } catch (error) {
    console.error("Admin material creation POST error:", error);
    return NextResponse.json({ error: "Material yuklashda xatolik" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, rejectionReason, title, subjectName, teacherName, type } = body;

    // Unified store da yangilash
    if (status) {
      updateMaterialStatusInStore(id, status, rejectionReason);
    }
    if (title || subjectName || teacherName || type) {
      updateMaterialDataInStore(id, { title, subjectName, teacherName, type });
    }

    if (await isDbAvailable()) {
      try {
        const data: any = {};
        if (status) data.status = status;
        if (title) data.title = title;
        if (teacherName) data.teacherName = teacherName;
        if (type) data.materialType = type;

        await prisma.studyMaterial.update({
          where: { id },
          data,
        });
      } catch {
        markDbOffline();
      }
    }

    return NextResponse.json({ success: true, id, status, rejectionReason });
  } catch (error) {
    console.error("Admin materials PATCH error:", error);
    return NextResponse.json({ error: "Holatni yangilashda xatolik" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID talab qilinadi" }, { status: 400 });

    deleteMaterialFromStore(id);

    if (await isDbAvailable()) {
      try {
        await prisma.studyMaterial.delete({
          where: { id },
        });
      } catch {
        markDbOffline();
      }
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Admin materials DELETE error:", error);
    return NextResponse.json({ error: "O'chirishda xatolik" }, { status: 500 });
  }
}
