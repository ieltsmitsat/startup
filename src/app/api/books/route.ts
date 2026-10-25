import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { BookStatus } from "@prisma/client";
import { isDbAvailable, markDbOffline } from "@/lib/dbCheck";

const createBookSchema = z.object({
  title: z.string().min(2, "Kitob nomi kamida 2 ta belgidan iborat bo'lishi kerak"),
  author: z.string().min(2, "Muallif nomi kiritilishi shart"),
  publishYear: z.number().int().min(1900).max(2030).optional().nullable(),
  condition: z.enum(["Yangi", "Yaxshi", "O'rtacha"]),
  price: z.number().min(0).optional().nullable(),
  isExchange: z.boolean().default(false),
  isFree: z.boolean().default(false),
  imageUrl: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

// Fallback / In-Memory Mock Books
let MOCK_BOOKS: any[] = [
  {
    id: "book-1",
    title: "Grokking Algorithms (Algoritmlarni chuqur o'rganish)",
    author: "Aditya Bhargava",
    publishYear: 2022,
    condition: "Yangi",
    price: 65000,
    isExchange: false,
    isFree: false,
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
    description: "Kitob mutlaqo yangi, illyustratsiyali o'zbek/rus tilida. Dasturlashga yangi kirganlar uchun juda tushunarli.",
    status: "AVAILABLE",
    sellerId: "mock-user-1",
    createdAt: new Date().toISOString(),
    seller: {
      id: "mock-user-1",
      name: "Javohir Alimov",
      telegramUsername: "javohir_dev",
      isVerified: true,
      university: { name: "Toshkent Axborot Texnologiyalari Universiteti (TATU)" },
    },
  },
  {
    id: "book-2",
    title: "Clean Code (Toza Kod — Dasturiy ta'minot san'ati)",
    author: "Robert C. Martin (Uncle Bob)",
    publishYear: 2021,
    condition: "Yaxshi",
    price: 0,
    isExchange: true,
    isFree: false,
    imageUrl: "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=600&auto=format&fit=crop&q=80",
    description: "Boshqa dasturlash kitobiga (masalan: Go yoki Design Patterns kitoblariga) almashtiraman.",
    status: "AVAILABLE",
    sellerId: "mock-user-2",
    createdAt: new Date().toISOString(),
    seller: {
      id: "mock-user-2",
      name: "Madina Karimova",
      telegramUsername: "madina_it",
      isVerified: true,
      university: { name: "Inha Universiteti (Toshkent)" },
    },
  },
  {
    id: "book-3",
    title: "Oliy Matematika va Matematik Analiz (1-2 qismlar)",
    author: "Sh. Alimov, O. Xolmuhamedov",
    publishYear: 2020,
    condition: "Yaxshi",
    price: 0,
    isExchange: false,
    isFree: true,
    imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80",
    description: "1-kurs talabalariga tekinga beraman. Toshkent shahri, Milliy universitet yaqinidan olib ketishingiz mumkin.",
    status: "AVAILABLE",
    sellerId: "mock-user-3",
    createdAt: new Date().toISOString(),
    seller: {
      id: "mock-user-3",
      name: "Sardor Rahimov",
      telegramUsername: "sardor_math",
      isVerified: false,
      university: { name: "O'zbekiston Milliy Universiteti (O'zMU)" },
    },
  },
  {
    id: "book-4",
    title: "Kiberxavfsizlik asoslari va amaliy tarmoq auditi",
    author: "William Stallings",
    publishYear: 2023,
    condition: "Yangi",
    price: 85000,
    isExchange: false,
    isFree: false,
    imageUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop&q=80",
    description: "Axborot xavfsizligi fakulteti talabalari uchun asosiy qo'llanma. Holati yangi.",
    status: "RESERVED",
    sellerId: "mock-user-1",
    createdAt: new Date().toISOString(),
    seller: {
      id: "mock-user-1",
      name: "Javohir Alimov",
      telegramUsername: "javohir_dev",
      isVerified: true,
      university: { name: "TATU" },
    },
  },
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase() || "";
    const condition = searchParams.get("condition");
    const filterType = searchParams.get("type"); // free, exchange, sell
    const status = searchParams.get("status");
    const sortBy = searchParams.get("sortBy") || "newest";

    // DB mavjudligini tekshiramiz
    if (await isDbAvailable()) {
      try {
        const where: any = {};
        if (search) {
          where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { author: { contains: search, mode: "insensitive" } },
          ];
        }
        if (condition) where.condition = condition;
        if (status) where.status = status;
        if (filterType === "free") where.isFree = true;
        if (filterType === "exchange") where.isExchange = true;
        if (filterType === "sell") {
          where.isFree = false;
          where.isExchange = false;
        }

        const books = await prisma.book.findMany({
          where,
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                telegramUsername: true,
                phone: true,
                isVerified: true,
                university: { select: { name: true } },
              },
            },
          },
        });

        if (books.length > 0) {
          return NextResponse.json({ books });
        }
      } catch {
        markDbOffline();
      }
    }

    // Fallback Mock Filter
    let filtered = [...MOCK_BOOKS];
    if (search) {
      filtered = filtered.filter(
        (b) =>
          b.title.toLowerCase().includes(search) ||
          b.author.toLowerCase().includes(search)
      );
    }
    if (condition) {
      filtered = filtered.filter((b) => b.condition === condition);
    }
    if (filterType === "free") {
      filtered = filtered.filter((b) => b.isFree);
    } else if (filterType === "exchange") {
      filtered = filtered.filter((b) => b.isExchange);
    } else if (filterType === "sell") {
      filtered = filtered.filter((b) => !b.isFree && !b.isExchange);
    }

    if (sortBy === "price_asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      filtered.sort((a, b) => b.price - a.price);
    }

    return NextResponse.json({ books: filtered });
  } catch (error) {
    console.error("Books GET error:", error);
    return NextResponse.json({ books: MOCK_BOOKS });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const validatedData = createBookSchema.parse(body);

    const newBookItem = {
      id: `book-${Date.now()}`,
      title: validatedData.title,
      author: validatedData.author,
      publishYear: validatedData.publishYear || 2023,
      condition: validatedData.condition,
      price: validatedData.isFree || validatedData.isExchange ? 0 : validatedData.price || 0,
      isExchange: validatedData.isExchange,
      isFree: validatedData.isFree,
      imageUrl: validatedData.imageUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
      description: validatedData.description || "",
      sellerId: user?.id || "mock-user-1",
      status: "AVAILABLE",
      createdAt: new Date().toISOString(),
      seller: {
        id: user?.id || "mock-user-1",
        name: user?.name || "Javohir Alimov",
        telegramUsername: user?.telegramUsername || "talaba_uz",
        isVerified: user?.isVerified ?? true,
      },
    };

    try {
      if (user) {
        const dbBook = await prisma.book.create({
          data: {
            title: validatedData.title,
            author: validatedData.author,
            publishYear: validatedData.publishYear,
            condition: validatedData.condition,
            price: validatedData.isFree || validatedData.isExchange ? 0 : validatedData.price || 0,
            isExchange: validatedData.isExchange,
            isFree: validatedData.isFree,
            imageUrl: validatedData.imageUrl,
            description: validatedData.description,
            sellerId: user.id,
          },
        });
        return NextResponse.json({ success: true, book: dbBook });
      }
    } catch {
      // In-memory fallback
    }

    MOCK_BOOKS.unshift(newBookItem);

    return NextResponse.json({
      success: true,
      message: "Kitob muvaffaqiyatli joylandi",
      book: newBookItem,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Validatsiya xatosi" },
        { status: 400 }
      );
    }
    console.error("Book POST error:", error);
    return NextResponse.json(
      { error: "Kitobni saqlashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
