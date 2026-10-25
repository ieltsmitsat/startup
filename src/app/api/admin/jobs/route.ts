import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isDbAvailable, markDbOffline } from "@/lib/dbCheck";

export interface ExtendedAdminJobItem {
  id: string;
  title: string;
  companyName: string;
  companyLogo?: string | null;
  jobType: "INTERNSHIP" | "PART_TIME" | "FULL_TIME" | "REMOTE";
  location?: string | null;
  isRemote: boolean;
  salaryMin?: number | null;
  salaryMax?: number | null;
  description: string;
  requirements: string[];
  applyUrl?: string | null;
  deadline?: string | null;
  status: "ACTIVE" | "PENDING" | "CLOSED" | "FLAGGED";
  authorName: string;
  isAuthorVerified: boolean;
  applicationsCount: number;
  createdAt: string;
}

let MOCK_ADMIN_JOBS: ExtendedAdminJobItem[] = [
  {
    id: "job-1",
    title: "Junior Frontend Developer (React / Next.js)",
    companyName: "Uzum Market Ecosystem",
    companyLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80",
    jobType: "PART_TIME",
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
    status: "ACTIVE",
    authorName: "Uzum HR Team",
    isAuthorVerified: true,
    applicationsCount: 28,
    createdAt: new Date().toISOString(),
  },
  {
    id: "job-2",
    title: "Backend Go / Python Intern (Stajirovka)",
    companyName: "Payme (Inspired)",
    companyLogo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=120&auto=format&fit=crop&q=80",
    jobType: "INTERNSHIP",
    location: "Toshkent (Gibrid format)",
    isRemote: true,
    salaryMin: 3500000,
    salaryMax: 5000000,
    description: "To'lov tizimlari va mikroxizmatlar arxitekturasi bo'yicha 3 oylik to'lanadigan stajirovka. Dastur so'ngida muvaffaqiyatli stajyorlarga doimiy junior kontrakt taklif etiladi.",
    requirements: [
      "Go (Golang) yoki Python bo'yicha mustahkam fundamental bilim",
      "Relatsion ma'lumotlar bazalari (PostgreSQL) va SQL so'rovlar",
      "RESTful API va JSON tamoyillarini tushunish",
    ],
    applyUrl: "https://payme.uz/careers",
    deadline: "2026-11-25T18:00:00Z",
    status: "ACTIVE",
    authorName: "Payme Tech Lead",
    isAuthorVerified: true,
    applicationsCount: 42,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "job-3",
    title: "UI/UX Designer & Product Researcher Intern",
    companyName: "Mohirdev EdTech",
    companyLogo: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=120&auto=format&fit=crop&q=80",
    jobType: "INTERNSHIP",
    location: "Masofaviy (Remote 🌐)",
    isRemote: true,
    salaryMin: 3000000,
    salaryMax: 4500000,
    description: "Ta'lim platformasining yangi mobil va veb funksionallari uchun dizayn tizimlari, wireframe va interaktiv prototiplar yaratish.",
    requirements: [
      "Figma dasturida erkin ishlay olish (Auto Layout, Components)",
      "Mobil va veb interfeyslar dizayn qoidalarini bilish",
      "Dizayn portfolioga ega bo'lish",
    ],
    applyUrl: "https://t.me/mohirdev_hr",
    deadline: "2026-12-10T23:59:59Z",
    status: "ACTIVE",
    authorName: "Mohirdev Studio",
    isAuthorVerified: true,
    applicationsCount: 19,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "job-4",
    title: "Junior Data Analyst / BI Trainee",
    companyName: "IT Park Uzbekistan",
    companyLogo: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=120&auto=format&fit=crop&q=80",
    jobType: "INTERNSHIP",
    location: "Toshkent, IT Park",
    isRemote: false,
    salaryMin: 3000000,
    salaryMax: 4000000,
    description: "IT Park rezidentlari bo'yicha statistik ko'rsatkichlarni tahlil qilish va Power BI dashboardlar yaratish.",
    requirements: [
      "Excel (Pivot tables, XLOOKUP) chuqur bilimi",
      "Boshlang'ich SQL (SELECT, JOIN)",
      "Tahliliy fikrlash qobiliyati",
    ],
    applyUrl: "https://it-park.uz/vacancies",
    deadline: "2026-11-20T18:00:00Z",
    status: "PENDING",
    authorName: "IT Park Recruiter",
    isAuthorVerified: false,
    applicationsCount: 5,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: "job-5",
    title: "Shubhali Online Operatorlik (Katta Maosh)",
    companyName: "Global Wealth Hub (Soxta)",
    companyLogo: null,
    jobType: "REMOTE",
    location: "Masofaviy",
    isRemote: true,
    salaryMin: 12000000,
    salaryMax: 20000000,
    description: "Kuniga 2 soat ishlab oyiga 15 million so'm daromad. Ishga kirish uchun 100 ming so'm oldindan badal to'lash kerak.",
    requirements: ["Telefon bo'lsa kifoya", "Boshqa talab yo'q"],
    applyUrl: "https://t.me/fake_wealth_hr",
    deadline: "2026-11-15T00:00:00Z",
    status: "FLAGGED",
    authorName: "Spam Bot",
    isAuthorVerified: false,
    applicationsCount: 2,
    createdAt: new Date(Date.now() - 345600000).toISOString(),
  },
  {
    id: "job-6",
    title: "Junior DevOps & Cloud Support Specialist",
    companyName: "TBC Bank Uzbekistan",
    companyLogo: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=120&auto=format&fit=crop&q=80",
    jobType: "FULL_TIME",
    location: "Toshkent, TBC Bosh ofisi",
    isRemote: false,
    salaryMin: 6000000,
    salaryMax: 9000000,
    description: "Bitiruvchi bosqich talabalari va yosh mutaxassislar uchun TBC IT infratuzilmasi va CI/CD quvurlarini yuritish.",
    requirements: [
      "Linux (Ubuntu, CentOS) bo'yicha tushuncha",
      "Docker va konteynerlar",
      "Git va CI/CD asoslari",
    ],
    applyUrl: "https://tbcbank.uz/careers",
    deadline: "2026-10-20T00:00:00Z",
    status: "CLOSED",
    authorName: "TBC People & Culture",
    isAuthorVerified: true,
    applicationsCount: 35,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const jobType = searchParams.get("jobType");
    const search = searchParams.get("search")?.toLowerCase().trim() || "";

    let jobs = [...MOCK_ADMIN_JOBS];

    if (await isDbAvailable()) {
      try {
        const where: any = {};
        if (search) {
          where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { companyName: { contains: search, mode: "insensitive" } },
          ];
        }
        if (jobType && jobType !== "ALL") {
          where.jobType = jobType as any;
        }

        const dbJobs = await prisma.job.findMany({
          where,
          include: {
            author: { select: { name: true, isVerified: true } },
          },
          orderBy: { createdAt: "desc" },
        });

        if (dbJobs.length > 0) {
          jobs = dbJobs.map((j) => ({
            id: j.id,
            title: j.title,
            companyName: j.companyName,
            jobType: j.jobType as any,
            location: j.location,
            isRemote: j.isRemote,
            salaryMin: j.salaryMin,
            salaryMax: j.salaryMax,
            description: j.description,
            requirements: j.requirements || [],
            applyUrl: j.applyUrl,
            deadline: j.deadline?.toISOString() || null,
            status: "ACTIVE",
            authorName: j.author?.name || "Ish beruvchi",
            isAuthorVerified: j.author?.isVerified || false,
            applicationsCount: 10,
            createdAt: j.createdAt.toISOString(),
          }));
        }
      } catch {
        markDbOffline();
      }
    }

    if (status && status !== "ALL") {
      jobs = jobs.filter((j) => j.status === status);
    }
    if (jobType && jobType !== "ALL") {
      jobs = jobs.filter((j) => j.jobType === jobType);
    }
    if (search) {
      jobs = jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(search) ||
          j.companyName.toLowerCase().includes(search) ||
          j.location?.toLowerCase().includes(search) ||
          j.authorName.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      jobs,
      totalCount: jobs.length,
      activeCount: jobs.filter((j) => j.status === "ACTIVE").length,
      pendingCount: jobs.filter((j) => j.status === "PENDING").length,
      flaggedCount: jobs.filter((j) => j.status === "FLAGGED").length,
      closedCount: jobs.filter((j) => j.status === "CLOSED").length,
    });
  } catch (error) {
    console.error("Admin jobs GET error:", error);
    return NextResponse.json({ jobs: MOCK_ADMIN_JOBS });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, companyName, jobType, location, isRemote, salaryMin, salaryMax, description, requirements, applyUrl, deadline } = body;

    if (!title || !companyName) {
      return NextResponse.json({ error: "Sarlavha va kompaniya nomi talab qilinadi" }, { status: 400 });
    }

    const newJob: ExtendedAdminJobItem = {
      id: "job-" + Date.now(),
      title,
      companyName,
      jobType: jobType || "INTERNSHIP",
      location: location || "Toshkent",
      isRemote: isRemote || false,
      salaryMin: salaryMin ? Number(salaryMin) : null,
      salaryMax: salaryMax ? Number(salaryMax) : null,
      description: description || "Ish tavsifi",
      requirements: requirements || [],
      applyUrl: applyUrl || null,
      deadline: deadline || null,
      status: "ACTIVE",
      authorName: "StudentHub Admin",
      isAuthorVerified: true,
      applicationsCount: 0,
      createdAt: new Date().toISOString(),
    };

    MOCK_ADMIN_JOBS.unshift(newJob);

    return NextResponse.json({ success: true, job: newJob }, { status: 201 });
  } catch (error) {
    console.error("Admin job POST error:", error);
    return NextResponse.json({ error: "Vakansiya yaratishda xatolik" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, isAuthorVerified, title, salaryMin, salaryMax, location } = body;

    MOCK_ADMIN_JOBS = MOCK_ADMIN_JOBS.map((j) => {
      if (j.id !== id) return j;
      return {
        ...j,
        status: status !== undefined ? status : j.status,
        isAuthorVerified: isAuthorVerified !== undefined ? isAuthorVerified : j.isAuthorVerified,
        title: title !== undefined ? title : j.title,
        salaryMin: salaryMin !== undefined ? salaryMin : j.salaryMin,
        salaryMax: salaryMax !== undefined ? salaryMax : j.salaryMax,
        location: location !== undefined ? location : j.location,
      };
    });

    return NextResponse.json({ success: true, id, status });
  } catch (error) {
    console.error("Admin jobs PATCH error:", error);
    return NextResponse.json({ error: "Vakansiyani yangilashda xatolik" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID talab qilinadi" }, { status: 400 });

    MOCK_ADMIN_JOBS = MOCK_ADMIN_JOBS.filter((j) => j.id !== id);

    try {
      await prisma.job.delete({ where: { id } });
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Admin jobs DELETE error:", error);
    return NextResponse.json({ error: "O'chirishda xatolik" }, { status: 500 });
  }
}
