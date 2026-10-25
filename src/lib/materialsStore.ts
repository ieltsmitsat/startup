import fs from "fs";
import path from "path";

export interface UnifiedMaterial {
  id: string;
  title: string;
  description: string;
  materialType: "LECTURE" | "SLIDES" | "EXAM_QUESTIONS" | "LAB_WORK" | "TESTS" | "OTHER" | "BOOK";
  fileUrl: string;
  fileName: string;
  fileSize: number; // baytlarda
  fileSizeMb: number;
  fileType: string;
  teacherName: string;
  academicYear: number;
  downloadsCount: number;
  viewsCount: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason: string | null;
  avgRating: number;
  reviewsCount: number;
  createdAt: string;
  subject: {
    id: string;
    name: string;
    faculty: {
      id: string;
      name: string;
      university: {
        id: string;
        name: string;
      };
    };
  };
  author: {
    id: string;
    name: string;
    isVerified: boolean;
    avatarUrl: string | null;
  };
}

export const INITIAL_MATERIALS: UnifiedMaterial[] = [
  {
    id: "mat-sit-6-amaliy",
    title: "SIT 6-amaliy mashg'ulot",
    description: "TATU 2-kurs talabalari uchun SIT (Sanoat axborot tizimlari) bo'yicha 6-amaliy mashg'ulot ko'rsatmasi va topshiriqlari.",
    materialType: "LECTURE",
    fileUrl: "/uploads/SIT_6-amaliy_mashg_ulot.pdf",
    fileName: "SIT_6-amaliy_mashg_ulot.pdf",
    fileSize: 102400,
    fileSizeMb: 0.1,
    fileType: "pdf",
    teacherName: "srdfgh",
    academicYear: 2,
    downloadsCount: 12,
    viewsCount: 42,
    status: "APPROVED",
    rejectionReason: null,
    avgRating: 5.0,
    reviewsCount: 3,
    createdAt: new Date().toISOString(),
    subject: {
      id: "sub-esrdgf",
      name: "esrdgf",
      faculty: {
        id: "fac-tatu-dit",
        name: "Dasturiy injiniring",
        university: { id: "uni-tatu", name: "TATU" },
      },
    },
    author: {
      id: "admin-official",
      name: "Admin (Rasmiy)",
      isVerified: true,
      avatarUrl: null,
    },
  },
  {
    id: "mat-kiber-2026",
    title: "Kiberxavfsizlik Asoslari - Darslik 2026",
    description: "Tizim xavfsizligi va kriptografiya asoslari boyicha yangi qollanma.",
    materialType: "BOOK",
    fileUrl: "/uploads/kiber.pdf",
    fileName: "Kiberxavfsizlik_Asoslari_2026.pdf",
    fileSize: 3670016,
    fileSizeMb: 3.5,
    fileType: "pdf",
    teacherName: "Prof. Karimov",
    academicYear: 3,
    downloadsCount: 34,
    viewsCount: 110,
    status: "APPROVED",
    rejectionReason: null,
    avgRating: 5.0,
    reviewsCount: 4,
    createdAt: new Date().toISOString(),
    subject: {
      id: "sub-kiber",
      name: "Kiberxavfsizlik",
      faculty: {
        id: "fac-kiber-tatu",
        name: "Kiberxavfsizlik",
        university: { id: "uni-tatu", name: "TATU" },
      },
    },
    author: {
      id: "admin-platform",
      name: "Admin (Rasmiy)",
      isVerified: true,
      avatarUrl: null,
    },
  },
  {
    id: "mat-mod-1",
    title: "Algoritmlar va ma'lumotlar tuzilmasi - Ma'ruzalar matni",
    description: "TATU Dasturiy injiniring fakulteti 2-kurs talabalari uchun saralash, qidiruv va daraxtlar bo'yicha to'liq ma'ruza.",
    materialType: "LECTURE",
    fileUrl: "/uploads/mock-algo.pdf",
    fileName: "Algorithms_Lectures_TATU.pdf",
    fileSize: 4200000,
    fileSizeMb: 4.2,
    fileType: "pdf",
    teacherName: "Prof. S. Rahmatov",
    academicYear: 2,
    downloadsCount: 148,
    viewsCount: 620,
    status: "APPROVED",
    rejectionReason: null,
    avgRating: 4.9,
    reviewsCount: 18,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    subject: {
      id: "sub-1",
      name: "Algoritmlar va ma'lumotlar tuzilmasi",
      faculty: {
        id: "fac-1",
        name: "Dasturiy injiniring",
        university: { id: "uni-tatu", name: "TATU" },
      },
    },
    author: {
      id: "usr-1",
      name: "Jamshid Qodirov",
      isVerified: true,
      avatarUrl: null,
    },
  },
  {
    id: "mat-mod-2",
    title: "Sun'iy intellekt va neyron tarmoqlar - Oraliq nazorat savollari",
    description: "O'zMU Amaliy matematika fakulteti uchun 40 ta nazorat savollari va qisqacha javoblar konspekti.",
    materialType: "EXAM_QUESTIONS",
    fileUrl: "/uploads/mock-ai-exam.pdf",
    fileName: "AI_Exam_Questions_OzMU.pdf",
    fileSize: 2100000,
    fileSizeMb: 2.1,
    fileType: "pdf",
    teacherName: "Akademik X. Nurmatov",
    academicYear: 4,
    downloadsCount: 95,
    viewsCount: 380,
    status: "APPROVED",
    rejectionReason: null,
    avgRating: 4.8,
    reviewsCount: 12,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    subject: {
      id: "sub-2",
      name: "Mashinali o'rganish (Machine Learning)",
      faculty: {
        id: "fac-2",
        name: "Amaliy matematika",
        university: { id: "uni-ozmu", name: "O'zMU" },
      },
    },
    author: {
      id: "usr-2",
      name: "Zuhra Yusupova",
      isVerified: true,
      avatarUrl: null,
    },
  },
  {
    id: "mat-mod-3",
    title: "Web dasturlash (React & Next.js) - Taqdimot slaydlari",
    description: "Zamonaviy veb-ishlab chiqish, komponentlar arxitekturasi, server components va SSR bo'yicha slaydlar to'plami.",
    materialType: "SLIDES",
    fileUrl: "/uploads/mock-web.pptx",
    fileName: "Nextjs_Architecture_Slides.pptx",
    fileSize: 8400000,
    fileSizeMb: 8.4,
    fileType: "pptx",
    teacherName: "Katta o'qituvchi B. Saidov",
    academicYear: 3,
    downloadsCount: 215,
    viewsCount: 890,
    status: "APPROVED",
    rejectionReason: null,
    avgRating: 5.0,
    reviewsCount: 26,
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    subject: {
      id: "sub-3",
      name: "Web dasturlash (React & Next.js)",
      faculty: {
        id: "fac-1",
        name: "Dasturiy injiniring",
        university: { id: "uni-tatu", name: "TATU" },
      },
    },
    author: {
      id: "usr-3",
      name: "Farrux Muxtorov",
      isVerified: true,
      avatarUrl: null,
    },
  },
  {
    id: "mat-mod-4",
    title: "Kiberxavfsizlik asoslari bo'yicha laboratoriya ishlari to'plami (Lab 1-6)",
    description: "Simmetrik va asimmetrik shifrlash (RSA, AES) algoritmlarini amalda qo'llash bo'yicha laboratoriya metodik qo'llanmasi.",
    materialType: "LAB_WORK",
    fileUrl: "/uploads/cyber-lab.zip",
    fileName: "Crypto_Lab_Guide.zip",
    fileSize: 12800000,
    fileSizeMb: 12.8,
    fileType: "zip",
    teacherName: "Dots. A. Karimov",
    academicYear: 3,
    downloadsCount: 160,
    viewsCount: 510,
    status: "PENDING",
    rejectionReason: null,
    avgRating: 4.7,
    reviewsCount: 15,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    subject: {
      id: "sub-4",
      name: "Kriptografiya asoslari",
      faculty: {
        id: "fac-3",
        name: "Kiberxavfsizlik",
        university: { id: "uni-inha", name: "INHA" },
      },
    },
    author: {
      id: "usr-4",
      name: "Rustam Aliyev",
      isVerified: true,
      avatarUrl: null,
    },
  },
  {
    id: "mat-mod-5",
    title: "Oliy matematika 1-semestr testlar va yechimlar bazasi",
    description: "ToshDTU muhandislik yo'nalishlari uchun differensial va integral hisob bo'yicha 200 ta test savollari va javoblar kaliti.",
    materialType: "TESTS",
    fileUrl: "/uploads/math-solutions.pdf",
    fileName: "Math_Tests_Solutions.pdf",
    fileSize: 5100000,
    fileSizeMb: 5.1,
    fileType: "pdf",
    teacherName: "Dots. M. Saidov",
    academicYear: 1,
    downloadsCount: 310,
    viewsCount: 1240,
    status: "APPROVED",
    rejectionReason: null,
    avgRating: 4.9,
    reviewsCount: 34,
    createdAt: new Date(Date.now() - 86400000 * 16).toISOString(),
    subject: {
      id: "sub-5",
      name: "Oliy matematika",
      faculty: {
        id: "fac-4",
        name: "Mashinasozlik",
        university: { id: "uni-toshdtu", name: "ToshDTU" },
      },
    },
    author: {
      id: "usr-5",
      name: "Doniyor Yoqubov",
      isVerified: true,
      avatarUrl: null,
    },
  },
  {
    id: "mat-mod-6",
    title: "Iqtisodiy tahlil va ekonometrika oraliq nazorat savollari",
    description: "TDIU Iqtisodiyot fakulteti oraliq nazorat imtihoni savollari.",
    materialType: "EXAM_QUESTIONS",
    fileUrl: "/uploads/bad-scan.pdf",
    fileName: "Ekonometrika_Nazorat.pdf",
    fileSize: 1800000,
    fileSizeMb: 1.8,
    fileType: "pdf",
    teacherName: "Dots. F. Yo'ldoshev",
    academicYear: 2,
    downloadsCount: 12,
    viewsCount: 45,
    status: "REJECTED",
    rejectionReason: "Fayl skaneri juda xira va o'qib bo'lmaydi. Iltimos, aniq nusxasini qayta yuklang.",
    avgRating: 3.5,
    reviewsCount: 2,
    createdAt: new Date(Date.now() - 86400000 * 18).toISOString(),
    subject: {
      id: "sub-6",
      name: "Iqtisodiy tahlil",
      faculty: {
        id: "fac-5",
        name: "Iqtisodiyot",
        university: { id: "uni-tdiu", name: "TDIU" },
      },
    },
    author: {
      id: "usr-6",
      name: "Madina Karimova",
      isVerified: false,
      avatarUrl: null,
    },
  },
];

const DB_FILE_PATH = path.join(process.cwd(), "src", "data", "materials-db.json");

function readStoreFromDisk(): UnifiedMaterial[] {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error reading materials-db.json:", e);
  }
  writeStoreToDisk(INITIAL_MATERIALS);
  return [...INITIAL_MATERIALS];
}

function writeStoreToDisk(materials: UnifiedMaterial[]) {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(materials, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing materials-db.json:", e);
  }
}

/**
 * Barcha materiallarni olish (Admin panel va Public platforma uchun doimiy sinxron ro'yxat)
 */
export function getAllMaterials(): UnifiedMaterial[] {
  return readStoreFromDisk();
}

/**
 * Admin formatidagi ro'yxatni olish
 */
export function getAdminMaterialsFormatted() {
  const list = getAllMaterials();
  return list.map((m) => ({
    id: m.id,
    title: m.title,
    subjectName: m.subject?.name || "Fan",
    universityName: m.subject?.faculty?.university?.name || "Universitet",
    teacherName: m.teacherName || "Kafedra o'qituvchisi",
    type: m.materialType,
    status: m.status,
    fileUrl: m.fileUrl,
    fileSizeMb: m.fileSizeMb,
    uploaderName: m.author?.name || "Admin",
    academicYear: m.academicYear || 1,
    rejectionReason: m.rejectionReason,
    createdAt: m.createdAt,
  }));
}

/**
 * Ommaga ochiq tasdiqlangan (APPROVED) materiallar ro'yxatini olish (Public /study uchun)
 */
export function getPublicApprovedMaterials(params: {
  search?: string;
  materialType?: string | null;
  universityId?: string | null;
  sortBy?: string;
}) {
  const { search, materialType, universityId, sortBy } = params;
  let filtered = getAllMaterials().filter((m) => m.status === "APPROVED");

  if (search) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.teacherName?.toLowerCase().includes(q) ||
        m.subject.name.toLowerCase().includes(q) ||
        m.subject.faculty.university.name.toLowerCase().includes(q)
    );
  }

  if (materialType) {
    filtered = filtered.filter((m) => m.materialType === materialType);
  }

  if (universityId) {
    const uId = universityId.toLowerCase();
    filtered = filtered.filter(
      (m) =>
        m.subject.faculty.university.id === universityId ||
        m.subject.faculty.university.name.toLowerCase().includes(uId)
    );
  }

  if (sortBy === "popular") {
    filtered.sort((a, b) => b.viewsCount - a.viewsCount);
  } else if (sortBy === "downloads") {
    filtered.sort((a, b) => b.downloadsCount - a.downloadsCount);
  } else {
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return filtered;
}

/**
 * Yangi material qo'shish (Admin yoki Moderator tomonidan)
 * Bu funksiya orqali qo'shilgan material BIR VAQTDA ham Admin panelda, ham Ochiq /study da paydo bo'ladi!
 */
export function addMaterialToStore(data: {
  title: string;
  subjectName: string;
  universityName: string;
  teacherName?: string;
  type?: string;
  fileUrl?: string;
  fileName?: string;
  fileSizeMb?: number;
  academicYear?: number;
  description?: string;
  status?: "APPROVED" | "PENDING";
  uploaderName?: string;
}): UnifiedMaterial {
  const store = readStoreFromDisk();

  const sizeMb = data.fileSizeMb ? Number(data.fileSizeMb) : 3.5;
  const ext = (data.fileName?.split(".").pop() || "pdf").toLowerCase();
  const matStatus = data.status || "APPROVED"; // Admin yuklaganda odatda APPROVED

  const newMat: UnifiedMaterial = {
    id: `mat-${Date.now()}`,
    title: data.title,
    description: data.description || `${data.universityName} talabalari uchun ${data.subjectName} fani bo'yicha rasmiy o'quv resursi.`,
    materialType: (data.type as any) || "LECTURE",
    fileUrl: data.fileUrl || "/uploads/sample-material.pdf",
    fileName: data.fileName || `${data.title.replace(/\s+/g, "_")}.${ext}`,
    fileSize: Math.round(sizeMb * 1024 * 1024),
    fileSizeMb: sizeMb,
    fileType: ext,
    teacherName: data.teacherName || "Kafedra o'qituvchisi",
    academicYear: data.academicYear ? Number(data.academicYear) : 2,
    downloadsCount: 0,
    viewsCount: 1,
    status: matStatus,
    rejectionReason: null,
    avgRating: 5.0,
    reviewsCount: 1,
    createdAt: new Date().toISOString(),
    subject: {
      id: `sub-${Date.now()}`,
      name: data.subjectName,
      faculty: {
        id: `fac-${Date.now()}`,
        name: "Asosiy Fakultet",
        university: {
          id: `uni-${data.universityName.toLowerCase()}`,
          name: data.universityName,
        },
      },
    },
    author: {
      id: "admin-platform",
      name: data.uploaderName || "Admin (Rasmiy)",
      isVerified: true,
      avatarUrl: null,
    },
  };

  store.unshift(newMat);
  writeStoreToDisk(store);
  return newMat;
}

/**
 * Holatni yangilash (Tasdiqlash / Rad etish)
 */
export function updateMaterialStatusInStore(
  id: string,
  status: "PENDING" | "APPROVED" | "REJECTED",
  rejectionReason?: string | null
) {
  const store = readStoreFromDisk();
  const updated = store.map((m) => {
    if (m.id !== id) return m;
    return {
      ...m,
      status,
      rejectionReason: rejectionReason !== undefined ? rejectionReason : m.rejectionReason,
    };
  });
  writeStoreToDisk(updated);
}

/**
 * Tahrirlash
 */
export function updateMaterialDataInStore(
  id: string,
  data: {
    title?: string;
    subjectName?: string;
    teacherName?: string;
    type?: string;
  }
) {
  const store = readStoreFromDisk();
  const updated = store.map((m) => {
    if (m.id !== id) return m;
    return {
      ...m,
      title: data.title || m.title,
      teacherName: data.teacherName || m.teacherName,
      materialType: (data.type as any) || m.materialType,
      subject: {
        ...m.subject,
        name: data.subjectName || m.subject.name,
      },
    };
  });
  writeStoreToDisk(updated);
}

/**
 * O'chirish
 */
export function deleteMaterialFromStore(id: string) {
  const store = readStoreFromDisk();
  const updated = store.filter((m) => m.id !== id);
  writeStoreToDisk(updated);
}
