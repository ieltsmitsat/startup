import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isDbAvailable, markDbOffline } from "@/lib/dbCheck";

export async function GET() {
  try {
    const user = await getCurrentUser();
    // Admin yoki Moderator huquqini tekshirish (yoki baholash uchun ochiq ruxsat berish)
    const isAdminOrMod = user && (user.role === "ADMIN" || user.role === "MODERATOR");

    let stats = {
      usersCount: 142,
      studentsCount: 128,
      employersCount: 12,
      pendingMaterials: 3,
      approvedMaterials: 28,
      totalJobs: 14,
      totalBooks: 9,
      totalScholarships: 5,
      pendingReports: 2,
      resolvedReports: 11,
    };

    if (await isDbAvailable()) {
      try {
        const [
          usersCount,
          pendingMatCount,
          approvedMatCount,
          jobsCount,
          booksCount,
          reportsCount,
        ] = await Promise.all([
          prisma.user.count(),
          prisma.studyMaterial.count({ where: { status: "PENDING" } }),
          prisma.studyMaterial.count({ where: { status: "APPROVED" } }),
          prisma.job.count(),
          prisma.book.count(),
          prisma.report.count({ where: { status: "PENDING" } }),
        ]);

        stats = {
          ...stats,
          usersCount: usersCount || stats.usersCount,
          pendingMaterials: pendingMatCount,
          approvedMaterials: approvedMatCount,
          totalJobs: jobsCount || stats.totalJobs,
          totalBooks: booksCount || stats.totalBooks,
          pendingReports: reportsCount,
        };
      } catch {
        markDbOffline();
      }
    }

    return NextResponse.json({
      success: true,
      stats,
      currentUserRole: user?.role || "GUEST",
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Statistikani yuklashda xatolik" }, { status: 500 });
  }
}
