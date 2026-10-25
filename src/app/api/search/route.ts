import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isDbAvailable, markDbOffline } from "@/lib/dbCheck";
import { INITIAL_UNIVERSITIES } from "@/lib/seed-data";
import { getPublicApprovedMaterials } from "@/lib/materialsStore";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() || "";

    if (!query || query.length < 2) {
      return NextResponse.json({
        materials: [],
        users: [],
        universities: [],
      });
    }

    const qLower = query.toLowerCase();
    const dbOk = await isDbAvailable();

    if (dbOk) {
      try {
        const [materials, users, universities] = await Promise.all([
          prisma.studyMaterial.findMany({
            where: {
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
                { teacherName: { contains: query, mode: "insensitive" } },
              ],
            },
            include: {
              subject: true,
              author: { select: { name: true } },
            },
            take: 5,
          }),
          prisma.user.findMany({
            where: {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { major: { contains: query, mode: "insensitive" } },
                { skills: { has: query } },
              ],
            },
            select: {
              id: true,
              name: true,
              major: true,
              academicYear: true,
              isVerified: true,
              avatarUrl: true,
            },
            take: 5,
          }),
          prisma.university.findMany({
            where: {
              name: { contains: query, mode: "insensitive" },
            },
            select: {
              id: true,
              name: true,
              city: true,
            },
            take: 5,
          }),
        ]);

        return NextResponse.json({
          materials,
          users,
          universities,
        });
      } catch (err) {
        markDbOffline();
      }
    }

    // Fast In-Memory Fallback from Unified Store
    const materials = getPublicApprovedMaterials({ search: query }).slice(0, 5);

    const universities = INITIAL_UNIVERSITIES.filter((u) =>
      u.name.toLowerCase().includes(qLower)
    )
      .slice(0, 5)
      .map((u, i) => ({
        id: `uni-${i}`,
        name: u.name,
        city: u.city,
      }));

    const users = [
      {
        id: "usr-demo-1",
        name: "Jamshid Qodirov",
        major: "Dasturiy injiniring",
        academicYear: 3,
        isVerified: true,
        avatarUrl: null,
      },
      {
        id: "usr-demo-2",
        name: "Zuhra Yusupova",
        major: "Amaliy matematika",
        academicYear: 4,
        isVerified: true,
        avatarUrl: null,
      },
    ].filter(
      (u) =>
        u.name.toLowerCase().includes(qLower) ||
        u.major.toLowerCase().includes(qLower)
    );

    return NextResponse.json({
      materials,
      users,
      universities,
    });
  } catch (error) {
    console.error("Global search error:", error);
    return NextResponse.json({
      materials: [],
      users: [],
      universities: [],
    });
  }
}
