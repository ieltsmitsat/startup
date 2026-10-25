import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { isDbAvailable, markDbOffline } from "@/lib/dbCheck";

const JWT_SECRET = process.env.JWT_SECRET || "studenthub-fallback-secret-key";
const COOKIE_NAME = "studenthub_token";

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
}

// Parolni heshlash
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Parolni tekshirish
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// JWT Token yaratish (7 kun amal qiladi)
export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

// JWT Tokendan foydalanuvchini olish
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

// Server-side autentifikatsiya qilingan foydalanuvchini olish
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded) return null;

    if (!(await isDbAvailable())) {
      return {
        id: decoded.userId,
        name: decoded.name || "Foydalanuvchi",
        email: decoded.email,
        role: decoded.role || "STUDENT",
        avatarUrl: null,
        bio: null,
        isVerified: decoded.role === "ADMIN" || decoded.role === "MODERATOR",
        university: { id: "uni-tatu", name: "TATU" },
        faculty: { id: "fac-1", name: "Dasturiy injiniring" },
        major: "Dasturiy injiniring",
        academicYear: 3,
        skills: ["Next.js", "TypeScript"],
        telegramUsername: null,
        githubUrl: null,
        linkedinUrl: null,
      };
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatarUrl: true,
          bio: true,
          isVerified: true,
          university: { select: { id: true, name: true } },
          faculty: { select: { id: true, name: true } },
          major: true,
          academicYear: true,
          skills: true,
          telegramUsername: true,
          githubUrl: true,
          linkedinUrl: true,
        },
      });

      return user;
    } catch {
      markDbOffline();
      return {
        id: decoded.userId,
        name: decoded.name || "Foydalanuvchi",
        email: decoded.email,
        role: decoded.role || "STUDENT",
        avatarUrl: null,
        bio: null,
        isVerified: decoded.role === "ADMIN" || decoded.role === "MODERATOR",
        university: { id: "uni-tatu", name: "TATU" },
        faculty: { id: "fac-1", name: "Dasturiy injiniring" },
        major: "Dasturiy injiniring",
        academicYear: 3,
        skills: ["Next.js", "TypeScript"],
        telegramUsername: null,
        githubUrl: null,
        linkedinUrl: null,
      };
    }
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
}

// Cookie o'rnatish
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 kun
  });
}

// Cookie tozalash (Chiqish / Logout)
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
