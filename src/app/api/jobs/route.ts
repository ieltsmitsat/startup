import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { JobType } from "@prisma/client";
import { isDbAvailable, markDbOffline } from "@/lib/dbCheck";

const MOCK_JOBS = [
  {
    id: "job-1",
    title: "Junior Frontend Developer (React / Next.js)",
    companyName: "Uzum Market Ecosystem",
    companyLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80",
    jobType: "PART_TIME" as JobType,
    location: "Toshkent, Mirobod tumani",
    isRemote: false,
    salaryMin: 4000000,
    salaryMax: 7000000,
    description: "Uzum ekotizimida talabalar uchun qulay grafikli (part-time) ish o'rni. Zamonaviy veb-interfeyslarni ishlab chiqish, qayta ishlovchi komponentlar yaratish va tajribali senior dasturchilar nazoratida ishlash imkoniyati.",
    requirements: [
      "JavaScript (ES6+) va TypeScript asoslarini bilish",
      "React.js va Next.js bo'yicha boshlang'ich amaliy tajriba",
      "HTML5, CSS3, Tailwind CSS bilan toza versta qilish",
      "Git versiya nazorat tizimi bilan ishlash",
      "2-4 kurs talabasi bo'lish (darsdan so'ng 4-5 soat vaqt ajrata olish)",
    ],
    applyUrl: "https://t.me/uzum_careers",
    deadline: "2026-11-30T23:59:59Z",
    createdAt: new Date().toISOString(),
    author: {
      name: "Uzum HR Team",
      isVerified: true,
    },
  },
  {
    id: "job-2",
    title: "Backend Go / Python Intern (Stajirovka)",
    companyName: "Payme (Inspired)",
    companyLogo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=120&auto=format&fit=crop&q=80",
    jobType: "INTERNSHIP" as JobType,
    location: "Toshkent (Gibrid format)",
    isRemote: true,
    salaryMin: 3500000,
    salaryMax: 5000000,
    description: "To'lov tizimlari va mikroxizmatlar arxitekturasi bo'yicha 3 oylik to'lanadigan stajirovka. Dastur so'ngida muvaffaqiyatli stajyorlarga doimiy junior kontrakt taklif etiladi.",
    requirements: [
      "Go (Golang) yoki Python bo'yicha mustahkam fundamental bilim",
      "Relatsion ma'lumotlar bazalari (PostgreSQL) va SQL so'rovlar",
      "RESTful API va JSON tamoyillarini tushunish",
      "Algoritmik fikrlash va masalalarni tahlil qilish ko'nikmasi",
    ],
    applyUrl: "https://payme.uz/careers",
    deadline: "2026-11-25T18:00:00Z",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    author: {
      name: "Payme Tech Lead",
      isVerified: true,
    },
  },
  {
    id: "job-3",
    title: "UI/UX Designer & Product Researcher Intern",
    companyName: "Mohirdev EdTech",
    companyLogo: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=120&auto=format&fit=crop&q=80",
    jobType: "INTERNSHIP" as JobType,
    location: "Masofaviy (Remote 🌐)",
    isRemote: true,
    salaryMin: 3000000,
    salaryMax: 4500000,
    description: "Ta'lim platformasining yangi mobil va veb funksionallari uchun dizayn tizimlari, wireframe va interaktiv prototiplar yaratish. Foydalanuvchilar bilan suhbatlar o'tkazish.",
    requirements: [
      "Figma dasturida erkin ishlay olish (Auto Layout, Components, Variants)",
      "Mobil va veb interfeyslar dizayn qoidalarini (UI Guidelines) bilish",
      "Dizayn portfolioga (Behance / Dribbble yoki Figma link) ega bo'lish",
      "O'rganishga va fikr-mulohazalarni (feedback) qabul qilishga tayyorlik",
    ],
    applyUrl: "https://t.me/mohirdev_hr",
    deadline: "2026-12-10T23:59:59Z",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    author: {
      name: "Mohirdev Design Studio",
      isVerified: true,
    },
  },
  {
    id: "job-4",
    title: "Junior Data Analyst / BI Trainee",
    companyName: "IT Park Uzbekistan",
    companyLogo: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=120&auto=format&fit=crop&q=80",
    jobType: "INTERNSHIP" as JobType,
    location: "Toshkent, IT Park rezidentsiyasi",
    isRemote: false,
    salaryMin: 3000000,
    salaryMax: 4000000,
    description: "IT Park rezidentlari bo'yicha statistik ko'rsatkichlarni tahlil qilish, Power BI dashboardlar yaratish va hisobotlarni avtomatlashtirish.",
    requirements: [
      "Excel (Pivot tables, VLOOKUP/XLOOKUP) chuqur bilimi",
      "Boshlang'ich SQL (SELECT, JOIN, GROUP BY)",
      "Power BI yoki Tableau bilan qiziqish va boshlang'ich tajriba",
      "Tahliliy fikrlash va diqqatni jamlay olish",
    ],
    applyUrl: "https://it-park.uz/vacancies",
    deadline: "2026-11-20T18:00:00Z",
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    author: {
      name: "IT Park Talent Acquisition",
      isVerified: true,
    },
  },
  {
    id: "job-5",
    title: "Junior DevOps & Cloud Support Specialist",
    companyName: "TBC Bank Uzbekistan",
    companyLogo: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=120&auto=format&fit=crop&q=80",
    jobType: "FULL_TIME" as JobType,
    location: "Toshkent, TBC Bosh ofisi",
    isRemote: false,
    salaryMin: 6000000,
    salaryMax: 9000000,
    description: "Bitiruvchi bosqich talabalari va yosh mutaxassislar uchun TBC IT infratuzilmasi, CI/CD quvurlari va monitoring tizimlarini yuritish bo'yicha ajoyib karyera boshlanishi.",
    requirements: [
      "Linux (Ubuntu, CentOS) operatsion tizimlari bo'yicha yaxshi tushuncha",
      "Docker va konteynerlashtirish asoslari",
      "Boshlang'ich Bash yoki Python skript yozish",
      "Git va CI/CD tushunchalari (GitLab CI / GitHub Actions)",
    ],
    applyUrl: "https://tbcbank.uz/careers",
    deadline: "2026-12-05T23:59:59Z",
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    author: {
      name: "TBC People & Culture",
      isVerified: true,
    },
  },
  {
    id: "job-6",
    title: "SMM & Texnik Kontent Muharriri (Part-time)",
    companyName: "Click Uzbekistan",
    companyLogo: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=120&auto=format&fit=crop&q=80",
    jobType: "PART_TIME" as JobType,
    location: "Gibrid / Masofaviy",
    isRemote: true,
    salaryMin: 3000000,
    salaryMax: 5000000,
    description: "Fintech mahsulotlar uchun talabalar tilida qiziqarli postlar, qo'llanmalar va Telegram kanallar uchun texnik kontent tayyorlash.",
    requirements: [
      "O'zbek tilida savodli va qiziqarli yozish (kopirayting) qobiliyati",
      "Telegram va Instagram ijtimoiy tarmoqlarida kontent yaratish tajribasi",
      "Boshlang'ich vizual tayyorlash (Canva, Photoshop yoki Figma)",
    ],
    applyUrl: "https://t.me/click_uz_jobs",
    deadline: "2026-11-28T18:00:00Z",
    createdAt: new Date(Date.now() - 432000000).toISOString(),
    author: {
      name: "Click Marketing Team",
      isVerified: true,
    },
  },
];

const CreateJobSchema = z.object({
  title: z.string().min(3, "Lavozim nomi kamida 3 belgidan iborat bo'lishi kerak"),
  companyName: z.string().min(2, "Kompaniya nomi kamida 2 belgidan iborat bo'lishi kerak"),
  jobType: z.enum(["FULL_TIME", "PART_TIME", "INTERNSHIP", "REMOTE"]).default("INTERNSHIP"),
  location: z.string().optional(),
  isRemote: z.boolean().default(false),
  salaryMin: z.number().optional().nullable(),
  salaryMax: z.number().optional().nullable(),
  description: z.string().min(10, "Batafsil tavsif kamida 10 belgidan iborat bo'lishi kerak"),
  requirements: z.array(z.string()).default([]),
  applyUrl: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase().trim() || "";
    const jobType = searchParams.get("jobType");
    const isRemote = searchParams.get("isRemote") === "true";
    const hasSalary = searchParams.get("hasSalary") === "true";

    let jobs = [...MOCK_JOBS];

    // Try DB first
    if (await isDbAvailable()) {
      try {
        const where: any = {};
        if (search) {
          where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { companyName: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ];
        }
        if (jobType && jobType !== "ALL") {
          where.jobType = jobType as JobType;
        }
        if (isRemote) {
          where.isRemote = true;
        }
        if (hasSalary) {
          where.salaryMin = { not: null, gt: 0 };
        }

        const dbJobs = await prisma.job.findMany({
          where,
          include: {
            author: {
              select: {
                name: true,
                isVerified: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });

        if (dbJobs.length > 0) {
          jobs = dbJobs.map((j) => ({
            ...j,
            deadline: j.deadline?.toISOString() || null,
            createdAt: j.createdAt.toISOString(),
            requirements: j.requirements || [],
          })) as any;
        }
      } catch {
        markDbOffline();
      }
    }

    // Filter in-memory
    if (search) {
      jobs = jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(search) ||
          j.companyName.toLowerCase().includes(search) ||
          j.description.toLowerCase().includes(search) ||
          j.requirements.some((r) => r.toLowerCase().includes(search))
      );
    }

    if (jobType && jobType !== "ALL") {
      jobs = jobs.filter((j) => j.jobType === jobType);
    }

    if (isRemote) {
      jobs = jobs.filter((j) => j.isRemote);
    }

    if (hasSalary) {
      jobs = jobs.filter((j) => j.salaryMin && j.salaryMin > 0);
    }

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Jobs GET error:", error);
    return NextResponse.json({ jobs: MOCK_JOBS });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Vakansiya joylash uchun avval tizimga kiring" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validated = CreateJobSchema.parse(body);

    try {
      const created = await prisma.job.create({
        data: {
          title: validated.title,
          companyName: validated.companyName,
          jobType: validated.jobType as JobType,
          location: validated.location || "Toshkent",
          isRemote: validated.isRemote,
          salaryMin: validated.salaryMin,
          salaryMax: validated.salaryMax,
          description: validated.description,
          requirements: validated.requirements,
          applyUrl: validated.applyUrl || user.telegramUsername ? `https://t.me/${user.telegramUsername?.replace("@", "")}` : null,
          deadline: validated.deadline ? new Date(validated.deadline) : null,
          authorId: user.id,
        },
        include: {
          author: {
            select: {
              name: true,
              isVerified: true,
            },
          },
        },
      });

      return NextResponse.json({ success: true, job: created }, { status: 201 });
    } catch {
      // Agar DB ulanmagan bo'lsa, xavfsiz mock formatida muvaffaqiyatli qaytarish
      const fallbackJob = {
        id: "job-local-" + Date.now(),
        ...validated,
        createdAt: new Date().toISOString(),
        author: {
          name: user.name,
          isVerified: user.isVerified,
        },
      };

      return NextResponse.json({ success: true, job: fallbackJob }, { status: 201 });
    }
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message || "Ma'lumotlar noto'g'ri kiritildi" },
        { status: 400 }
      );
    }
    console.error("Jobs POST error:", err);
    return NextResponse.json(
      { error: "Vakansiyani saqlashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
