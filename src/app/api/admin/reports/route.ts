import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isDbAvailable, markDbOffline } from "@/lib/dbCheck";

export interface ExtendedAdminReport {
  id: string;
  targetType: "COMMUNITY" | "STUDY" | "JOB" | "BOOK" | "USER";
  targetId: string;
  targetTitle: string;
  targetAuthor?: string;
  reason: string;
  details: string | null;
  reporterName: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  status: "PENDING" | "INVESTIGATING" | "RESOLVED" | "DISMISSED";
  actionTaken?: string | null;
  adminNotes?: string | null;
  createdAt: string;
}

let MOCK_REPORTS: ExtendedAdminReport[] = [
  {
    id: "rep-1",
    targetType: "COMMUNITY",
    targetId: "post-spam-99",
    targetTitle: "Tezkor 100% kafolatlangan daromad va kripto yutuqlar",
    targetAuthor: "BotAccount_77",
    reason: "Spam, reklama va moliyaviy piramida",
    details: "Mavzu matnida begona qimor va piramida sayti havolasi berilgan, talabalarni aldamoqda. Tezroq o'chirilsin.",
    reporterName: "Sardorbek Rahimov",
    severity: "HIGH",
    status: "PENDING",
    actionTaken: null,
    adminNotes: null,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "rep-2",
    targetType: "STUDY",
    targetId: "mat-fake-12",
    targetTitle: "Oliy matematika 2026 yopiq imtihon biletlari javoblari (ZIP)",
    targetAuthor: "Anonim_Talaba",
    reason: "Buzilgan yoki zararli fayl (Malware/Phishing)",
    details: "Fayl ichidagi arxiv parollangan va parolni olish uchun Telegram botga obuna bo'lishni talab qilmoqda.",
    reporterName: "Gulnoza Ahmedova",
    severity: "HIGH",
    status: "PENDING",
    actionTaken: null,
    adminNotes: null,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "rep-3",
    targetType: "JOB",
    targetId: "job-fake-4",
    targetTitle: "Online Operatorlik (Kunlik 500,000 UZS)",
    targetAuthor: "Express Recruit Agency",
    reason: "Soxta ish beruvchi / Firibgarlik",
    details: "Ishga qabul qilish uchun oldindan 80,000 so'm 'hujjat topshirish to'lovi' so'ramoqda.",
    reporterName: "Javohir Toshpo'latov",
    severity: "HIGH",
    status: "INVESTIGATING",
    actionTaken: "Ish beruvchiga aloqaga chiqildi, tekshirilmoqda",
    adminNotes: "Kompaniya STIR raqami soxta bo'lib chiqdi",
    createdAt: new Date(Date.now() - 3600000 * 14).toISOString(),
  },
  {
    id: "rep-4",
    targetType: "COMMUNITY",
    targetId: "ans-toxic-5",
    targetTitle: "Universitetda stipendiya kechikishi bo'yicha bahs",
    targetAuthor: "User_Unknown92",
    reason: "Haqoratomuz so'zlar va noo'rin muomala",
    details: "Muhokamada boshqa talabalarni haqorat qilgan va odob-axloq qoidalarini qo'pol ravishda buzgan.",
    reporterName: "Madina Karimova",
    severity: "MEDIUM",
    status: "PENDING",
    actionTaken: null,
    adminNotes: null,
    createdAt: new Date(Date.now() - 3600000 * 22).toISOString(),
  },
  {
    id: "rep-5",
    targetType: "BOOK",
    targetId: "book-dup-7",
    targetTitle: "Clean Code (Robert Martin) - O'zbekcha tarjima",
    targetAuthor: "KitobSavdosi",
    reason: "Sun'iy oshirilgan narx va takroriy e'lon",
    details: "Ushbu foydalanuvchi bir xil kitobni 4 marta qayta-qayta e'lon qilib feedni to'ldirib yuborgan.",
    reporterName: "Bekzod Qodirov",
    severity: "LOW",
    status: "RESOLVED",
    actionTaken: "Takroriy e'lonlar o'chirildi, foydalanuvchiga ogohlantirish berildi",
    adminNotes: "Qoidabuzarlik to'liq bartaraf etildi",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "rep-6",
    targetType: "STUDY",
    targetId: "mat-clean-8",
    targetTitle: "Fizika 1-kurs ma'ruzalar konspekti",
    targetAuthor: "Temur Aliyev",
    reason: "Asossiz shikoyat",
    details: "Menga bu o'qituvchi yoqmaydi deb shikoyat qilingan.",
    reporterName: "Anonim",
    severity: "LOW",
    status: "DISMISSED",
    actionTaken: "Material toza va talablarga to'liq javob beradi. Shikoyat asossiz deb topildi.",
    adminNotes: "Asossiz ariza yopildi",
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const targetType = searchParams.get("targetType");
    const search = searchParams.get("search")?.toLowerCase().trim() || "";

    let reports = [...MOCK_REPORTS];

    if (await isDbAvailable()) {
      try {
        const dbReports = await prisma.report.findMany({
          include: {
            reporter: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
        });

        if (dbReports.length > 0) {
          reports = dbReports.map((r, i) => ({
            id: r.id,
            targetType: (r.reason.includes("COMMUNITY") ? "COMMUNITY" : r.reason.includes("JOB") ? "JOB" : "STUDY") as any,
            targetId: "ref-" + i,
            targetTitle: r.reason,
            reason: r.reason,
            details: r.details,
            reporterName: r.reporter?.name || "Anonim talaba",
            severity: "MEDIUM",
            status: (r.status as any) || "PENDING",
            createdAt: r.createdAt.toISOString(),
          }));
        }
      } catch {
        markDbOffline();
      }
    }

    // In-memory filter
    if (status && status !== "ALL") {
      reports = reports.filter((r) => r.status === status);
    }
    if (targetType && targetType !== "ALL") {
      reports = reports.filter((r) => r.targetType === targetType);
    }
    if (search) {
      reports = reports.filter(
        (r) =>
          r.targetTitle.toLowerCase().includes(search) ||
          r.reason.toLowerCase().includes(search) ||
          r.details?.toLowerCase().includes(search) ||
          r.reporterName.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      reports,
      pendingCount: reports.filter((r) => r.status === "PENDING").length,
      investigatingCount: reports.filter((r) => r.status === "INVESTIGATING").length,
      resolvedCount: reports.filter((r) => r.status === "RESOLVED").length,
      totalCount: reports.length,
    });
  } catch (error) {
    console.error("Admin reports GET error:", error);
    return NextResponse.json({ reports: MOCK_REPORTS });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, actionTaken, adminNotes } = body;

    MOCK_REPORTS = MOCK_REPORTS.map((r) => {
      if (r.id !== id) return r;
      return {
        ...r,
        status: status || r.status,
        actionTaken: actionTaken !== undefined ? actionTaken : r.actionTaken,
        adminNotes: adminNotes !== undefined ? adminNotes : r.adminNotes,
      };
    });

    try {
      await prisma.report.update({
        where: { id },
        data: { status },
      });
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, id, status, actionTaken, adminNotes });
  } catch (error) {
    console.error("Admin reports PATCH error:", error);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID talab qilinadi" }, { status: 400 });

    MOCK_REPORTS = MOCK_REPORTS.filter((r) => r.id !== id);

    try {
      await prisma.report.delete({ where: { id } });
    } catch {
      // In-memory fallback
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Admin reports DELETE error:", error);
    return NextResponse.json({ error: "O'chirishda xatolik" }, { status: 500 });
  }
}
