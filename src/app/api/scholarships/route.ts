import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ScholarshipCategory } from "@prisma/client";
import { isDbAvailable, markDbOffline } from "@/lib/dbCheck";

const MOCK_SCHOLARSHIPS = [
  {
    id: "sch-1",
    title: "Chevening Scholarship (Buyuk Britaniya Hukumat Granti)",
    organization: "Foreign, Commonwealth & Development Office (FCDO)",
    country: "Buyuk Britaniya 🇬🇧",
    category: "INTERNATIONAL",
    degree: "Magistratura",
    coverage: "100% Kontrakt + Oylik 1,350£ yashash stipendiyasi + Borish-kelish aviachiptasi",
    requirements: [
      "Bakalavr diplomi (GPA 3.0+)",
      "Kamida 2 yillik ish yoki jamoatchilik tajribasi",
      "IELTS kamida 6.5 yoki ekvivalent",
      "Kuchli liderlik va motivatsion insho",
    ],
    deadline: "2026-11-05T23:59:59Z",
    officialUrl: "https://www.chevening.org/scholarship/uzbekistan/",
    imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&auto=format&fit=crop&q=80",
    description: "Buyuk Britaniyaning istalgan nufuzli universitetida 1 yillik magistratura bosqichida to'liq grant asosida tahsil olish imkoniyati. Barcha xarajatlar to'liq qoplanadi.",
  },
  {
    id: "sch-2",
    title: "\"El-yurt umidi\" Jamg'armasi Stipendiyasi",
    organization: "\"El-yurt umidi\" jamg'armasi",
    country: "O'zbekiston / Dunyo bo'ylab 🌐",
    category: "NATIONAL",
    degree: "Bakalavr & Magistratura",
    coverage: "Top-300 OTMlar uchun to'liq kontrakt, viza, sug'urta, aviachipta va oylik stipendiya",
    requirements: [
      "Dunyoning top-300 oliygohlaridan so'zsiz qabul xati (Unconditional Offer)",
      "Xorijiy til sertifikati (IELTS 7.0+ yoki TOEFL 95+)",
      "Davlat xizmati yoki iqtisodiyot tarmoqlarida ishlash majburiyati",
    ],
    deadline: "2026-12-15T18:00:00Z",
    officialUrl: "https://eyuf.uz",
    imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80",
    description: "O'zbekiston yoshlarining xorijning eng yetakchi universitetlarida davlat granti hisobidan ta'lim olishini ta'minlovchi eng yirik milliy dastur.",
  },
  {
    id: "sch-3",
    title: "DAAD — Germaniyada Magistratura va Tadqiqot Granti",
    organization: "Germaniya Akademik Almashinuv Xizmati (DAAD)",
    country: "Germaniya 🇩🇪",
    category: "INTERNATIONAL",
    degree: "Magistratura & PhD",
    coverage: "Bepul ta'lim + 934€ oylik stipendiya + Tibbiy sug'urta va sayohat to'lovlari",
    requirements: [
      "Mutaxassislik bo'yicha bakalavr diplomi",
      "Ingliz (IELTS 6.5+) yoki Nemis tili (B2/C1) sertifikati",
      "O'qishdan so'ng ilmiy tadqiqot rejasi (Research proposal)",
    ],
    deadline: "2026-11-20T23:59:59Z",
    officialUrl: "https://www.daad.de/en/",
    imageUrl: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=600&auto=format&fit=crop&q=80",
    description: "Germaniyaning davlat universitetlarida ingliz yoki nemis tilida to'liq grant asosida magistrlik darajasini olish imkoniyati.",
  },
  {
    id: "sch-4",
    title: "Turkiye Burslari — Turkiya Hukumat Grantlari",
    organization: "Turkiya Respublikasi Hukumati",
    country: "Turkiya 🇹🇷",
    category: "INTERNATIONAL",
    degree: "Bakalavr, Magistr, PhD",
    coverage: "To'liq kontrakt, bepul yotoqxona, oylik stipendiya (1,700-3,000 TRY), tibbiy sug'urta va turk tili kursi",
    requirements: [
      "Bakalavr uchun GPA kamida 70%, Magistratura uchun 75%",
      "Bitiruv attestati yoki diplomi",
      "Tavsiyanomalar va ijtimoiy faollik sertifikatlari",
    ],
    deadline: "2027-02-20T23:59:59Z",
    officialUrl: "https://turkiyeburslari.gov.tr",
    imageUrl: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=600&auto=format&fit=crop&q=80",
    description: "Turkiyaning eng nufuzli davlat va xususiy universitetlarida bepul ta'lim olish va to'liq yashash sharoitlari bilan ta'minlovchi keng qamrovli grant.",
  },
  {
    id: "sch-5",
    title: "TATU Iqtidorli Talabalar Ichki Grant Dasturi",
    organization: "Toshkent Axborot Texnologiyalari Universiteti",
    country: "O'zbekiston (TATU)",
    category: "UNIVERSITY",
    degree: "Bakalavr",
    coverage: "1 yillik kontrakt summasining 50% dan 100% gacha chegirmasi + Rektor stipendiyasi",
    requirements: [
      "O'tgan semestr GPA ko'rsatkichi 4.5 dan yuqori",
      "Xalqaro xakaton yoki dasturlash olimpiadalari g'olibi bo'lish",
      "Ilmiy maqola yoki GitHub loyihalari mavjudligi",
    ],
    deadline: "2026-11-10T18:00:00Z",
    officialUrl: "https://tuit.uz",
    imageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?w=600&auto=format&fit=crop&q=80",
    description: "TATUda eng yuqori akademik va amaliy natija ko'rsatgan 2-4 kurs talabalari uchun kontrakt to'lovini qoplash bo'yicha ichki universitet granti.",
  },
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase() || "";
    const category = searchParams.get("category");
    const degree = searchParams.get("degree");

    let list = [...MOCK_SCHOLARSHIPS];

    // Try DB first if available
    if (await isDbAvailable()) {
      try {
        const where: any = {};
        if (search) {
          where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { organization: { contains: search, mode: "insensitive" } },
          ];
        }
        if (category) where.category = category;
        const dbList = await prisma.scholarship.findMany({
          where,
          orderBy: { deadline: "asc" },
        });
        if (dbList.length > 0) {
          list = dbList.map((s: any) => ({
            ...s,
            requirements: s.requirements || [],
          }));
        }
      } catch {
        markDbOffline();
      }
    }

    if (search) {
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(search) ||
          s.organization.toLowerCase().includes(search) ||
          s.country?.toLowerCase().includes(search)
      );
    }

    if (category) {
      list = list.filter((s) => s.category === category);
    }

    if (degree) {
      list = list.filter((s) => s.degree?.includes(degree));
    }

    // Har bir grantga muddat (qolgan kunlar) ni hisoblaymiz
    const now = new Date();
    const enriched = list.map((s) => {
      const dl = new Date(s.deadline);
      const diffTime = dl.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        ...s,
        daysLeft: diffDays,
        isUrgent: diffDays > 0 && diffDays <= 14,
        isExpired: diffDays <= 0,
      };
    });

    return NextResponse.json({ scholarships: enriched });
  } catch (error) {
    console.error("Scholarships GET error:", error);
    return NextResponse.json({ scholarships: MOCK_SCHOLARSHIPS });
  }
}
