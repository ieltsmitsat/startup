import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isDbAvailable, markDbOffline } from "@/lib/dbCheck";

export interface ExtendedAdminUserItem {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "EMPLOYER" | "MODERATOR" | "ADMIN";
  isVerified: boolean;
  status: "ACTIVE" | "SUSPENDED";
  universityName: string | null;
  facultyName?: string | null;
  major: string | null;
  academicYear?: number | null;
  phone?: string | null;
  telegramUsername?: string | null;
  skills: string[];
  materialsCount: number;
  createdAt: string;
}

let MOCK_USERS: ExtendedAdminUserItem[] = [
  {
    id: "usr-admin-1",
    name: "Diyorbek (Bosh Admin)",
    email: "admin@studenthub.uz",
    role: "ADMIN",
    isVerified: true,
    status: "ACTIVE",
    universityName: "TATU",
    facultyName: "Dasturiy injiniring",
    major: "Dasturiy injiniring",
    academicYear: 4,
    phone: "+998 90 123 45 67",
    telegramUsername: "@admin_diyorbek",
    skills: ["Next.js", "TypeScript", "PostgreSQL", "System Architecture", "DevOps"],
    materialsCount: 14,
    createdAt: "2026-09-01T00:00:00Z",
  },
  {
    id: "usr-2",
    name: "Uzum HR Partner",
    email: "careers@uzum.com",
    role: "EMPLOYER",
    isVerified: true,
    status: "ACTIVE",
    universityName: null,
    facultyName: null,
    major: "IT Recruiter & Talent Acquisition",
    academicYear: null,
    phone: "+998 78 777 07 07",
    telegramUsername: "@uzum_talent",
    skills: ["Talent Sourcing", "Tech Recruitment", "Interviewing"],
    materialsCount: 0,
    createdAt: "2026-09-15T00:00:00Z",
  },
  {
    id: "usr-3",
    name: "Sardorbek Rahimov",
    email: "sardor@gmail.com",
    role: "MODERATOR",
    isVerified: true,
    status: "ACTIVE",
    universityName: "TATU",
    facultyName: "Kiberxavfsizlik",
    major: "Axborot xavfsizligi",
    academicYear: 3,
    phone: "+998 93 456 78 90",
    telegramUsername: "@sardor_sec",
    skills: ["Python", "Linux", "Ethical Hacking", "Content Moderation"],
    materialsCount: 8,
    createdAt: "2026-10-01T00:00:00Z",
  },
  {
    id: "usr-4",
    name: "Madina Karimova",
    email: "madina.k@edu.uz",
    role: "STUDENT",
    isVerified: false,
    status: "ACTIVE",
    universityName: "O'zMU",
    facultyName: "Matematika",
    major: "Amaliy matematika",
    academicYear: 2,
    phone: "+998 94 987 65 43",
    telegramUsername: "@madina_k",
    skills: ["Matematik analiz", "Python", "Data Science"],
    materialsCount: 3,
    createdAt: "2026-10-10T00:00:00Z",
  },
  {
    id: "usr-5",
    name: "Temur Aliyev",
    email: "temur.ali@gmail.com",
    role: "STUDENT",
    isVerified: false,
    status: "ACTIVE",
    universityName: "INHA",
    facultyName: "SOCIE",
    major: "Computer Science",
    academicYear: 1,
    phone: "+998 97 111 22 33",
    telegramUsername: "@temur_inho",
    skills: ["C++", "Java", "Algorithms"],
    materialsCount: 2,
    createdAt: "2026-10-18T00:00:00Z",
  },
  {
    id: "usr-6",
    name: "BotAccount_77 (Spam)",
    email: "spam.bot77@mail.ru",
    role: "STUDENT",
    isVerified: false,
    status: "SUSPENDED",
    universityName: "Noma'lum",
    facultyName: null,
    major: "Spammer",
    academicYear: 1,
    phone: null,
    telegramUsername: "@free_money_bot",
    skills: [],
    materialsCount: 0,
    createdAt: "2026-10-22T00:00:00Z",
  },
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase().trim() || "";
    const role = searchParams.get("role");
    const status = searchParams.get("status");

    let users = [...MOCK_USERS];

    if (await isDbAvailable()) {
      try {
        const where: any = {};
        if (search) {
          where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ];
        }
        if (role && role !== "ALL") {
          where.role = role;
        }

        const dbUsers = await prisma.user.findMany({
          where,
          include: {
            university: { select: { name: true } },
            faculty: { select: { name: true } },
            _count: { select: { materials: true } },
          },
          orderBy: { createdAt: "desc" },
        });

        if (dbUsers.length > 0) {
          users = dbUsers.map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            isVerified: u.isVerified,
            status: "ACTIVE",
            universityName: u.university?.name || null,
            facultyName: u.faculty?.name || null,
            major: u.major || null,
            academicYear: u.academicYear || 1,
            phone: u.phone || null,
            telegramUsername: u.telegramUsername || null,
            skills: u.skills || [],
            materialsCount: u._count?.materials || 0,
            createdAt: u.createdAt.toISOString(),
          }));
        }
      } catch {
        markDbOffline();
      }
    }

    if (search) {
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search) ||
          u.universityName?.toLowerCase().includes(search) ||
          u.telegramUsername?.toLowerCase().includes(search)
      );
    }

    if (role && role !== "ALL") {
      users = users.filter((u) => u.role === role);
    }

    if (status && status !== "ALL") {
      users = users.filter((u) => u.status === status);
    }

    return NextResponse.json({
      users,
      totalCount: users.length,
      studentCount: users.filter((u) => u.role === "STUDENT").length,
      employerCount: users.filter((u) => u.role === "EMPLOYER").length,
      moderatorCount: users.filter((u) => u.role === "MODERATOR").length,
      verifiedCount: users.filter((u) => u.isVerified).length,
    });
  } catch (error) {
    console.error("Admin users GET error:", error);
    return NextResponse.json({ users: MOCK_USERS });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, role, universityName, major, academicYear, phone, telegramUsername } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Ism va email talab qilinadi" }, { status: 400 });
    }

    const newUser: ExtendedAdminUserItem = {
      id: "usr-" + Date.now(),
      name,
      email,
      role: role || "STUDENT",
      isVerified: false,
      status: "ACTIVE",
      universityName: universityName || "TATU",
      major: major || "Axborot Texnologiyalari",
      academicYear: academicYear ? Number(academicYear) : 1,
      phone: phone || null,
      telegramUsername: telegramUsername || null,
      skills: ["Talaba"],
      materialsCount: 0,
      createdAt: new Date().toISOString(),
    };

    MOCK_USERS.unshift(newUser);

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (error) {
    console.error("Admin user POST error:", error);
    return NextResponse.json({ error: "Foydalanuvchi yaratishda xatolik" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, role, isVerified, status, name, universityName, major } = body;

    MOCK_USERS = MOCK_USERS.map((u) => {
      if (u.id !== id) return u;
      return {
        ...u,
        role: role !== undefined ? role : u.role,
        isVerified: isVerified !== undefined ? isVerified : u.isVerified,
        status: status !== undefined ? status : u.status,
        name: name !== undefined ? name : u.name,
        universityName: universityName !== undefined ? universityName : u.universityName,
        major: major !== undefined ? major : u.major,
      };
    });

    try {
      const data: any = {};
      if (role !== undefined) data.role = role;
      if (isVerified !== undefined) data.isVerified = isVerified;
      if (name !== undefined) data.name = name;
      if (major !== undefined) data.major = major;

      await prisma.user.update({
        where: { id },
        data,
      });
    } catch {
      // In-memory fallback
    }

    return NextResponse.json({ success: true, id, role, isVerified, status });
  } catch (error) {
    console.error("Admin users PATCH error:", error);
    return NextResponse.json({ error: "Foydalanuvchini yangilashda xatolik" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID talab qilinadi" }, { status: 400 });

    MOCK_USERS = MOCK_USERS.filter((u) => u.id !== id);

    try {
      await prisma.user.delete({ where: { id } });
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Admin users DELETE error:", error);
    return NextResponse.json({ error: "O'chirishda xatolik" }, { status: 500 });
  }
}
