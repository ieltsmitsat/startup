import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isDbAvailable, markDbOffline } from "@/lib/dbCheck";

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

let MOCK_ADMIN_MATERIALS: AdminMaterialItem[] = [
  {
    id: "mat-mod-1",
    title: "Ma'lumotlar tuzilmasi va algoritmlar - 2026 Yakuniy imtihon testlari",
    subjectName: "Ma'lumotlar tuzilmasi",
    universityName: "TATU",
    teacherName: "Prof. S. Rahmatov",
    type: "TESTS",
    status: "PENDING",
    fileUrl: "/uploads/mock-exam.pdf",
    fileSizeMb: 4.2,
    uploaderName: "Jamshid Qodirov",
    academicYear: 2,
    rejectionReason: null,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: "mat-mod-2",
    title: "Kiberxavfsizlik asoslari bo'yicha laboratoriya ishlari to'plami (Lab 1-6)",
    subjectName: "Kiberxavfsizlik",
    universityName: "INHA",
    teacherName: "Dots. A. Karimov",
    type: "LAB_WORK",
    status: "PENDING",
    fileUrl: "/uploads/cyber-lab.zip",
    fileSizeMb: 12.8,
    uploaderName: "Rustam Aliyev",
    academicYear: 3,
    rejectionReason: null,
    createdAt: new Date(Date.now() - 3600000 * 7).toISOString(),
  },
  {
    id: "mat-mod-3",
    title: "Sun'iy intellekt va neyron tarmoqlar - Ma'ruzalar matni (PDF)",
    subjectName: "Sun'iy intellekt",
    universityName: "O'zMU",
    teacherName: "Akademik X. Nurmatov",
    type: "LECTURE",
    status: "PENDING",
    fileUrl: "/uploads/ai-lecture.pdf",
    fileSizeMb: 8.5,
    uploaderName: "Zuhra Yusupova",
    academicYear: 4,
    rejectionReason: null,
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: "mat-mod-4",
    title: "Web dasturlash (Fullstack Next.js + Django) namunaviy kurs ishi",
    subjectName: "Web dasturlash",
    universityName: "TATU",
    teacherName: "Katta o'qituvchi B. Saidov",
    type: "OTHER",
    status: "PENDING",
    fileUrl: "/uploads/web-coursework.zip",
    fileSizeMb: 24.1,
    uploaderName: "Farrux Muxtorov",
    academicYear: 3,
    rejectionReason: null,
    createdAt: new Date(Date.now() - 3600000 * 26).toISOString(),
  },
  {
    id: "mat-mod-5",
    title: "Oliy matematika 1-semestr to'liq yechimlari va formulalar",
    subjectName: "Oliy matematika",
    universityName: "ToshDTU",
    teacherName: "Dots. M. Saidov",
    type: "SLIDES",
    status: "APPROVED",
    fileUrl: "/uploads/math-solutions.pdf",
    fileSizeMb: 5.1,
    uploaderName: "Doniyor Yoqubov",
    academicYear: 1,
    rejectionReason: null,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "mat-mod-6",
    title: "Iqtisodiy tahlil va ekonometrika oraliq nazorat savollari",
    subjectName: "Iqtisodiy tahlil",
    universityName: "TDIU",
    teacherName: "Dots. F. Yo'ldoshev",
    type: "EXAM_QUESTIONS",
    status: "REJECTED",
    fileUrl: "/uploads/bad-scan.pdf",
    fileSizeMb: 1.8,
    uploaderName: "Madina Karimova",
    academicYear: 2,
    rejectionReason: "Fayl skaneri juda xira va o'qib bo'lmaydi. Iltimos, aniq nusxasini qayta yuklang.",
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.toLowerCase().trim() || "";
    const university = searchParams.get("university");
    const type = searchParams.get("type");

    let materials = [...MOCK_ADMIN_MATERIALS];

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
    return NextResponse.json({ materials: MOCK_ADMIN_MATERIALS });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      subjectName,
      universityName,
      teacherName,
      type,
      fileUrl,
      fileName,
      fileSizeMb,
      academicYear,
      description,
      status,
    } = body;

    if (!title || !subjectName || !universityName) {
      return NextResponse.json(
        { error: "Sarlavha, fan nomi va universitet talab qilinadi" },
        { status: 400 }
      );
    }

    const newMaterial: AdminMaterialItem = {
      id: "mat-mod-" + Date.now(),
      title,
      subjectName,
      universityName,
      teacherName: teacherName || "Kafedra o'qituvchisi",
      type: type || "LECTURE",
      status: status || "APPROVED",
      fileUrl: fileUrl || "/uploads/sample-material.pdf",
      fileSizeMb: fileSizeMb ? Number(fileSizeMb) : 3.5,
      uploaderName: "Admin (Rasmiy)",
      academicYear: academicYear ? Number(academicYear) : 1,
      rejectionReason: null,
      createdAt: new Date().toISOString(),
    };

    // Prepend to mock materials so it shows at the top immediately
    MOCK_ADMIN_MATERIALS.unshift(newMaterial);

    // Try saving to Prisma DB if accessible
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
      // In-memory fallback is active
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

    // In-memory update
    MOCK_ADMIN_MATERIALS = MOCK_ADMIN_MATERIALS.map((m) => {
      if (m.id !== id) return m;
      return {
        ...m,
        status: status || m.status,
        rejectionReason: rejectionReason !== undefined ? rejectionReason : m.rejectionReason,
        title: title || m.title,
        subjectName: subjectName || m.subjectName,
        teacherName: teacherName || m.teacherName,
        type: type || m.type,
      };
    });

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
      // ignore DB fallback
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

    MOCK_ADMIN_MATERIALS = MOCK_ADMIN_MATERIALS.filter((m) => m.id !== id);

    try {
      await prisma.studyMaterial.delete({
        where: { id },
      });
    } catch {
      // In-memory fallback
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Admin materials DELETE error:", error);
    return NextResponse.json({ error: "O'chirishda xatolik" }, { status: 500 });
  }
}
