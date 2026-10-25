import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { CommunityCategory } from "@prisma/client";
import { isDbAvailable, markDbOffline } from "@/lib/dbCheck";

// Spam va nomaqbul so'zlarni tekshirish (TZ 3.6)
const BLOCKED_WORDS = ["kazino", "1xbet", "stavka", "parol sotiladi", "kripto daromad 100%"];
function containsSpam(text: string): boolean {
  const lower = text.toLowerCase();
  return BLOCKED_WORDS.some((word) => lower.includes(word));
}

const MOCK_COMMUNITY_POSTS = [
  {
    id: "post-1",
    title: "TATUda stipendiya tushish sanalari va rektor chegirmasini olish shartlari qanday?",
    content: "Assalomu alaykum talabalar! 2-kurs talabasiman. O'tgan semestr GPA ko'rsatkichim 4.8 bo'ldi. Rektor grantiga hujjat topshirish tartibi qanday bo'ladi va bu oygi stipendiyalar qachon tushishi haqida ma'lumot bormi?",
    category: "UNIVERSITY_LIFE" as CommunityCategory,
    upvotes: 42,
    downvotes: 2,
    tags: ["TATU", "Stipendiya", "Grant", "GPA"],
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    author: {
      id: "u-1",
      name: "Sardorbek Rahimov",
      avatarUrl: null,
      isVerified: true,
      university: { name: "TATU" },
      major: "Dasturiy injiniring",
    },
    answersCount: 7,
    answers: [
      {
        id: "ans-1",
        content: "Vaalaykum assalom! Rektor grantiga har semestr boshida Yoshlar ittifoqi va dekanat orqali hujjat qabul qilinadi. GPA 4.5+ va bitta xalqaro sertifikat yoki olimpiada g'olibligi kerak bo'ladi. Stipendiya odatda oyning 10-15 sanalarida tushadi.",
        upvotes: 18,
        isAccepted: true,
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        author: {
          name: "Azizbek Olimov",
          isVerified: true,
          university: { name: "TATU" },
        },
      },
      {
        id: "ans-2",
        content: "Ha, to'g'ri. Hujjatlarni dekanatdagi tyutoringizga topshirasiz, 1 hafta ichida buyruq chiqadi.",
        upvotes: 6,
        isAccepted: false,
        createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
        author: {
          name: "Madina Karimova",
          isVerified: false,
          university: { name: "TATU" },
        },
      },
    ],
  },
  {
    id: "post-2",
    title: "Junior dasturchilar uchun O'zbekiston IT bozorida React vs Next.js talabi",
    content: "Hozirda frontend yo'nalishini o'rganyapman. Sof React'ni chuqur o'rganib ish qidirgan ma'qulmi yoki birdaniga Next.js (App Router, SSR) ga o'tgan afzalroqmi? Kompaniyalarda amaliyotda qaysi biriga ko'proq e'tibor berishmoqda?",
    category: "IT_DEV" as CommunityCategory,
    upvotes: 68,
    downvotes: 1,
    tags: ["Frontend", "React", "Nextjs", "Karyera", "JavaScript"],
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    author: {
      id: "u-2",
      name: "Javohir Toshpo'latov",
      avatarUrl: null,
      isVerified: true,
      university: { name: "INHA" },
      major: "Computer Science",
    },
    answersCount: 12,
    answers: [
      {
        id: "ans-3",
        content: "Albatta avval React asoslarini (hooks, state management, reconciliation) yaxshilab o'zlashtiring. Keyin Next.js ga o'tish juda oson bo'ladi. Hozirda Uzum, Payme kabi top kompaniyalarda deyarli barcha yangi loyihalar Next.js da qilinmoqda.",
        upvotes: 29,
        isAccepted: true,
        createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
        author: {
          name: "Farrux Muxtorov",
          isVerified: true,
          university: { name: "TUIT" },
        },
      },
    ],
  },
  {
    id: "post-3",
    title: "El-yurt umidi jamg'armasi orqali Buyuk Britaniyaga magistraturaga hujjat topshirish tajribasi",
    content: "Kim bu yil EYUF (El-yurt umidi) saralash bosqichidan muvaffaqiyatli o'tgan bo'lsa, suhbat bosqichida nimalarga e'tibor qaratish kerakligi va so'zsiz qabul (Unconditional offer) olish bo'yicha maslahat bersangiz juda minnatdor bo'lardim.",
    category: "STUDY_ABROAD" as CommunityCategory,
    upvotes: 54,
    downvotes: 0,
    tags: ["EYUF", "Magistratura", "BuyukBritaniya", "IELTS", "Grant"],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    author: {
      id: "u-3",
      name: "Zilola Ergasheva",
      avatarUrl: null,
      isVerified: true,
      university: { name: "O'zMU" },
      major: "Iqtisodiyot",
    },
    answersCount: 9,
    answers: [
      {
        id: "ans-4",
        content: "Eng muhimi Top-100 yoki Top-300 OTMdan offer olish. Suhbatda sizning O'zbekistonga qaytib kelib qaysi sohani rivojlantirishingiz va o'qishdan keyingi aniq rejangiz so'raladi. Motivatsion inshoni chuqur o'rganib boring.",
        upvotes: 22,
        isAccepted: true,
        createdAt: new Date(Date.now() - 72000000).toISOString(),
        author: {
          name: "Shahzod Normatov",
          isVerified: true,
          university: { name: "Westminster" },
        },
      },
    ],
  },
  {
    id: "post-4",
    title: "Yunusobod 11-mavzeda metro yaqinida 2 kishilik shinam ijara xonadon sheriklikka",
    content: "Salom barchaga! Yunusobod metro bekati yonida 2 xonali toza kvartira bor. Barcha qulayliklari (Wi-Fi, kir yuvish mashinasi, konditsioner) mavjud. Tartibli, chekmaydigan 1 nafar talaba sherik kerak.",
    category: "DORM_HOUSING" as CommunityCategory,
    upvotes: 19,
    downvotes: 1,
    tags: ["Ijara", "Yunusobod", "Sheriklik", "Kvartira"],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    author: {
      id: "u-4",
      name: "Bekzod Qodirov",
      avatarUrl: null,
      isVerified: false,
      university: { name: "ToshDShU" },
      major: "Sharqshunoslik",
    },
    answersCount: 4,
    answers: [
      {
        id: "ans-5",
        content: "Oylik to'lovi qancha bo'ladi va kommunal xarajatlar ichidami? Telegramdan yozsangiz yaxshi bo'lardi.",
        upvotes: 3,
        isAccepted: false,
        createdAt: new Date(Date.now() - 160000000).toISOString(),
        author: {
          name: "Doniyor Yoqubov",
          isVerified: false,
          university: { name: "TATU" },
        },
      },
    ],
  },
  {
    id: "post-5",
    title: "Imtihon sessiyasi paytida 'Burnout' va charchoqni yengish uchun qanday fokus texnikalarini qo'llaysiz?",
    content: "Ketma-ket modullar, oraliq va yakuniy nazoratlarda ko'p charchab, diqqatni jamlash qiyinlashadi. Siz qanday usullardan (Pomodoro, Time Blocking, sport) foydalanasiz?",
    category: "GENERAL" as CommunityCategory,
    upvotes: 37,
    downvotes: 0,
    tags: ["Motivatsiya", "Fokus", "Sessiya", "Tayyorgarlik"],
    createdAt: new Date(Date.now() - 250000000).toISOString(),
    author: {
      id: "u-5",
      name: "Gulnoza Ahmedova",
      avatarUrl: null,
      isVerified: true,
      university: { name: "O'zDJTU" },
      major: "Xorijiy tillar",
    },
    answersCount: 8,
    answers: [
      {
        id: "ans-6",
        content: "Menga 50/10 Pomodoro tartibi juda yordam beradi: 50 daqiqa hech narsaga chalg'imasdan o'qish, 10 daqiqa toza havoda harakatlanish. Asosiysi - uxlash vaqtini kamaytirmang!",
        upvotes: 15,
        isAccepted: true,
        createdAt: new Date(Date.now() - 240000000).toISOString(),
        author: {
          name: "Temur Aliyev",
          isVerified: true,
          university: { name: "ToshDTU" },
        },
      },
    ],
  },
];

const CreatePostSchema = z.object({
  title: z.string().min(5, "Mavzu sarlavhasi kamida 5 belgidan iborat bo'lishi kerak"),
  content: z.string().min(10, "Mavzu matni kamida 10 belgidan iborat bo'lishi kerak"),
  category: z.enum([
    "UNIVERSITY_LIFE",
    "IT_DEV",
    "STUDY_ABROAD",
    "DORM_HOUSING",
    "GENERAL",
  ]).default("GENERAL"),
  tags: z.array(z.string()).default([]),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase().trim() || "";
    const category = searchParams.get("category");
    const sortBy = searchParams.get("sortBy") || "popular"; // popular, newest, unanswered

    let posts = [...MOCK_COMMUNITY_POSTS];

    // Try DB first
    if (await isDbAvailable()) {
      try {
        const where: any = {};
        if (search) {
          where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { content: { contains: search, mode: "insensitive" } },
          ];
        }
        if (category && category !== "ALL") {
          where.category = category as CommunityCategory;
        }

        const dbPosts = await prisma.communityPost.findMany({
          where,
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
                isVerified: true,
                university: { select: { name: true } },
                major: true,
              },
            },
            answers: {
              include: {
                author: {
                  select: {
                    name: true,
                    avatarUrl: true,
                    isVerified: true,
                    university: { select: { name: true } },
                  },
                },
              },
              orderBy: [{ isAccepted: "desc" }, { upvotes: "desc" }],
            },
          },
          orderBy:
            sortBy === "newest"
              ? { createdAt: "desc" }
              : { upvotes: "desc" },
        });

        if (dbPosts.length > 0) {
          posts = dbPosts.map((p) => ({
            ...p,
            createdAt: p.createdAt.toISOString(),
            answersCount: p.answers.length,
            answers: p.answers.map((a) => ({
              ...a,
              createdAt: a.createdAt.toISOString(),
            })),
          })) as any;
        }
      } catch {
        markDbOffline();
      }
    }

    // In-memory filter
    if (search) {
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(search) ||
          p.content.toLowerCase().includes(search) ||
          p.tags.some((t) => t.toLowerCase().includes(search))
      );
    }

    if (category && category !== "ALL") {
      posts = posts.filter((p) => p.category === category);
    }

    if (sortBy === "newest") {
      posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "unanswered") {
      posts = posts.filter((p) => (p.answersCount || p.answers.length) === 0);
    } else {
      // Popular (net upvotes)
      posts.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
    }

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Community GET error:", error);
    return NextResponse.json({ posts: MOCK_COMMUNITY_POSTS });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Savol yoki muhokama ochish uchun tizimga kiring" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validated = CreatePostSchema.parse(body);

    // Spam tekshiruvi (TZ 3.6)
    if (containsSpam(validated.title) || containsSpam(validated.content)) {
      return NextResponse.json(
        { error: "Xabarda taqiqlangan yoki spam so'zlar aniqlandi" },
        { status: 400 }
      );
    }

    try {
      const created = await prisma.communityPost.create({
        data: {
          title: validated.title,
          content: validated.content,
          category: validated.category as CommunityCategory,
          tags: validated.tags,
          authorId: user.id,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              isVerified: true,
              university: { select: { name: true } },
              major: true,
            },
          },
          answers: true,
        },
      });

      return NextResponse.json(
        {
          success: true,
          post: {
            ...created,
            answersCount: 0,
            answers: [],
          },
        },
        { status: 201 }
      );
    } catch {
      // Fallback response agar DB ulanmagan bo'lsa
      const fallbackPost = {
        id: "post-local-" + Date.now(),
        ...validated,
        upvotes: 1,
        downvotes: 0,
        createdAt: new Date().toISOString(),
        author: {
          id: user.id,
          name: user.name,
          avatarUrl: user.avatarUrl,
          isVerified: user.isVerified,
          university: user.university,
          major: user.major,
        },
        answersCount: 0,
        answers: [],
      };

      return NextResponse.json({ success: true, post: fallbackPost }, { status: 201 });
    }
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message || "Ma'lumotlar to'liq kiritilmadi" },
        { status: 400 }
      );
    }
    console.error("Community POST error:", err);
    return NextResponse.json(
      { error: "Postni saqlashda server xatoligi yuz berdi" },
      { status: 500 }
    );
  }
}
