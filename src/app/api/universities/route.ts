import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { INITIAL_UNIVERSITIES } from "@/lib/seed-data";
import { isDbAvailable, markDbOffline } from "@/lib/dbCheck";

export const dynamic = "force-dynamic";

const FORMATTED_SEED_UNIVERSITIES = INITIAL_UNIVERSITIES.map((u, uIdx) => ({
  id: `uni-${u.slug || uIdx}`,
  name: u.name,
  slug: u.slug,
  city: u.city,
  faculties: u.faculties.map((f, fIdx) => ({
    id: `fac-${u.slug}-${fIdx}`,
    name: f.name,
    slug: f.slug,
    subjects: f.subjects.map((sub, sIdx) => ({
      id: `sub-${u.slug}-${fIdx}-${sIdx}`,
      name: sub,
    })),
  })),
}));

export async function GET() {
  try {
    const dbOk = await isDbAvailable();
    if (!dbOk) {
      return NextResponse.json({ universities: FORMATTED_SEED_UNIVERSITIES });
    }

    let universities = await prisma.university.findMany({
      include: {
        faculties: {
          include: {
            subjects: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    if (universities.length === 0) {
      return NextResponse.json({ universities: FORMATTED_SEED_UNIVERSITIES });
    }

    return NextResponse.json({ universities });
  } catch (error) {
    markDbOffline();
    return NextResponse.json({ universities: FORMATTED_SEED_UNIVERSITIES });
  }
}
