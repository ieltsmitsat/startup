"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  FileText,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Trash2,
  Search,
  Filter,
  Check,
  X,
  ExternalLink,
  Sparkles,
  BarChart3,
  Building2,
  Clock,
  ArrowRight,
  Eye,
  Settings,
  RefreshCw,
  Award,
  BookOpen,
} from "lucide-react";

interface AdminStats {
  usersCount: number;
  studentsCount: number;
  employersCount: number;
  pendingMaterials: number;
  approvedMaterials: number;
  totalJobs: number;
  totalBooks: number;
  totalScholarships: number;
  pendingReports: number;
  resolvedReports: number;
}

interface AdminMaterial {
  id: string;
  title: string;
  subjectName: string;
  universityName: string;
  teacherName: string;
  type: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  fileUrl: string;
  fileSizeMb: number;
  uploaderName: string;
  createdAt: string;
}

interface AdminReport {
  id: string;
  reason: string;
  details?: string;
  reporterName: string;
  status: "PENDING" | "RESOLVED" | "DISMISSED";
  createdAt: string;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "EMPLOYER" | "MODERATOR" | "ADMIN";
  isVerified: boolean;
  universityName?: string | null;
  major?: string | null;
  createdAt: string;
}

function AdminContent() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activeTab, setActiveTab] = useState<"materials" | "reports" | "users" | "jobs">("materials");
  const [isLoading, setIsLoading] = useState(true);

  // Materiallar holati
  const [materials, setMaterials] = useState<AdminMaterial[]>([]);
  const [materialFilter, setMaterialFilter] = useState<string>("ALL");

  // Shikoyatlar holati
  const [reports, setReports] = useState<AdminReport[]>([]);

  // Foydalanuvchilar holati
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("ALL");

  // Xabarnoma
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    fetchStats();
    fetchMaterials();
    fetchReports();
    fetchUsers();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMaterials = async () => {
    try {
      const res = await fetch("/api/admin/materials");
      if (res.ok) {
        const data = await res.json();
        setMaterials(data.materials || []);
      }
    } catch {
      // ignore
    }
  };

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/admin/reports");
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch {
      // ignore
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch {
      // ignore
    }
  };

  // Materialni tasdiqlash yoki rad etish
  const handleMaterialStatus = async (id: string, status: "APPROVED" | "REJECTED") => {
    setMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status } : m))
    );
    try {
      await fetch("/api/admin/materials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      showToast(status === "APPROVED" ? "Material tasdiqlandi!" : "Material rad etildi!");
    } catch {
      // ignore
    }
  };

  // Materialni o'chirish
  const handleDeleteMaterial = async (id: string) => {
    if (!confirm("Haqiqatan ham ushbu materialni butunlay o'chirmoqchimisiz?")) return;
    setMaterials((prev) => prev.filter((m) => m.id !== id));
    try {
      await fetch(`/api/admin/materials?id=${id}`, { method: "DELETE" });
      showToast("Material muvaffaqiyatli o'chirildi!");
    } catch {
      // ignore
    }
  };

  // Shikoyatni hal qilish yoki bekor qilish
  const handleReportStatus = async (id: string, status: "RESOLVED" | "DISMISSED") => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    try {
      await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      showToast(status === "RESOLVED" ? "Shikoyat ko'rib chiqildi (Hal qilindi)!" : "Shikoyat bekor qilindi!");
    } catch {
      // ignore
    }
  };

  // Foydalanuvchi rolini o'zgartirish
  const handleUserRole = async (id: string, role: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: role as any } : u))
    );
    try {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, role }),
      });
      showToast("Foydalanuvchi roli yangilandi!");
    } catch {
      // ignore
    }
  };

  // Foydalanuvchini verifikatsiya qilish (Tasdiqlangan talaba ko'k galochkasi)
  const handleUserVerify = async (id: string, currentStatus: boolean) => {
    const isVerified = !currentStatus;
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isVerified } : u))
    );
    try {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isVerified }),
      });
      showToast(isVerified ? "Talaba rasman tasdiqlandi (Verified)!" : "Verifikatsiya bekor qilindi.");
    } catch {
      // ignore
    }
  };

  // Filtrlangan materiallar
  const filteredMaterials = useMemo(() => {
    if (materialFilter === "ALL") return materials;
    return materials.filter((m) => m.status === materialFilter);
  }, [materials, materialFilter]);

  // Filtrlangan foydalanuvchilar
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = userSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.universityName?.toLowerCase().includes(q);

      const matchRole = userRoleFilter === "ALL" || u.role === userRoleFilter;
      return matchSearch && matchRole;
    });
  }, [users, userSearch, userRoleFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Toast xabar */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 3D ADMIN HEADER */}
      <div className="relative rounded-3xl p-8 sm:p-10 overflow-hidden glass-3d border border-cyan-500/30 perspective-1000 shadow-2xl">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>StudentHub Markaziy Boshqaruv Portali</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              Admin & Moderatsiya Markazi
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              O&apos;quv materiallarini tekshirish, foydalanuvchi rollarini boshqarish, talabalik guvohnomalarini
              tasdiqlash va kelib tushgan shikoyatlarni (Reports) tezkor nazorat qilish paneli.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                fetchStats();
                fetchMaterials();
                fetchReports();
                fetchUsers();
                showToast("Ma'lumotlar qayta yangilandi!");
              }}
              className="p-3 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-all shadow-md flex items-center gap-2 text-xs font-bold"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Yangilash</span>
            </button>
            <div className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/30">
              <ShieldAlert className="w-4 h-4" />
              <span>SuperAdmin Huquqlari Faol</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 TA 3D BENTO STATISTIKA KARTALARI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-3xl glass-3d border border-zinc-800 shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-zinc-400 font-medium">Jami Foydalanuvchilar</div>
            <div className="text-3xl font-black text-white">{stats?.usersCount || 142}</div>
            <div className="text-[11px] text-zinc-500">Talabalar & Ish beruvchilar</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl glass-3d border border-amber-500/30 bg-amber-500/5 shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-amber-300 font-medium">Kutilayotgan Materiallar</div>
            <div className="text-3xl font-black text-amber-400">
              {materials.filter((m) => m.status === "PENDING").length}
            </div>
            <div className="text-[11px] text-amber-400/80">Pre-moderatsiya talab</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl glass-3d border border-rose-500/30 bg-rose-500/5 shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-rose-300 font-medium">Faol Shikoyatlar (Reports)</div>
            <div className="text-3xl font-black text-rose-400">
              {reports.filter((r) => r.status === "PENDING").length}
            </div>
            <div className="text-[11px] text-rose-400/80">Spam yoki qoidabuzarlik</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl glass-3d border border-emerald-500/30 bg-emerald-500/5 shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-emerald-300 font-medium">Faol Vakansiyalar</div>
            <div className="text-3xl font-black text-emerald-400">{stats?.totalJobs || 14}</div>
            <div className="text-[11px] text-emerald-400/80">Karyera va amaliyotlar</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* BOSHQARUV TABLARI */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-zinc-900/90 border border-zinc-800/90 max-w-fit">
        <button
          onClick={() => setActiveTab("materials")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "materials"
              ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/30"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Materiallar Moderatsiyasi</span>
          {materials.filter((m) => m.status === "PENDING").length > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-zinc-950 text-[10px] font-black flex items-center justify-center">
              {materials.filter((m) => m.status === "PENDING").length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("reports")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "reports"
              ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/30"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Shikoyatlar (Reports)</span>
          {reports.filter((r) => r.status === "PENDING").length > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
              {reports.filter((r) => r.status === "PENDING").length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "users"
              ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/30"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Foydalanuvchilar & Rollar ({users.length})</span>
        </button>
      </div>

      {/* 1-TAB: MATERIALLAR MODERATSIYASI */}
      {activeTab === "materials" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl glass-3d border border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Holat:</span>
              <button
                onClick={() => setMaterialFilter("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                  materialFilter === "ALL" ? "bg-cyan-600 text-white" : "bg-zinc-900 text-zinc-400"
                }`}
              >
                Barchasi ({materials.length})
              </button>
              <button
                onClick={() => setMaterialFilter("PENDING")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                  materialFilter === "PENDING"
                    ? "bg-amber-500 text-zinc-950 font-bold"
                    : "bg-zinc-900 text-zinc-400"
                }`}
              >
                Kutilmoqda ({materials.filter((m) => m.status === "PENDING").length})
              </button>
              <button
                onClick={() => setMaterialFilter("APPROVED")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                  materialFilter === "APPROVED" ? "bg-emerald-600 text-white" : "bg-zinc-900 text-zinc-400"
                }`}
              >
                Tasdiqlangan ({materials.filter((m) => m.status === "APPROVED").length})
              </button>
              <button
                onClick={() => setMaterialFilter("REJECTED")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                  materialFilter === "REJECTED" ? "bg-rose-600 text-white" : "bg-zinc-900 text-zinc-400"
                }`}
              >
                Rad etilgan
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredMaterials.map((m) => (
              <div
                key={m.id}
                className="p-5 rounded-3xl glass-3d border border-zinc-800 hover:border-cyan-500/40 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        m.status === "APPROVED"
                          ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                          : m.status === "PENDING"
                          ? "bg-amber-950 text-amber-300 border-amber-500/40"
                          : "bg-rose-950 text-rose-300 border-rose-500/40"
                      }`}
                    >
                      {m.status === "APPROVED"
                        ? "✅ Tasdiqlangan"
                        : m.status === "PENDING"
                        ? "⏳ Ko'rib chiqilmoqda"
                        : "❌ Rad etilgan"}
                    </span>
                    <span className="text-[11px] text-zinc-400 font-mono bg-zinc-900 px-2 py-0.5 rounded">
                      {m.type} · {m.fileSizeMb} MB
                    </span>
                    <span className="text-[11px] text-cyan-400 font-bold">{m.universityName}</span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug">{m.title}</h3>

                  <div className="text-xs text-zinc-400 flex flex-wrap items-center gap-3 pt-1">
                    <span>Fan: <strong className="text-zinc-300">{m.subjectName}</strong></span>
                    <span>O&apos;qituvchi: <strong className="text-zinc-300">{m.teacherName}</strong></span>
                    <span>Yuklovchi: <strong className="text-zinc-300">{m.uploaderName}</strong></span>
                    <span>Sana: {new Date(m.createdAt).toLocaleDateString("uz-UZ")}</span>
                  </div>
                </div>

                {/* Harakatlar (Approve, Reject, Delete) */}
                <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-zinc-800">
                  {m.status !== "APPROVED" && (
                    <button
                      onClick={() => handleMaterialStatus(m.id, "APPROVED")}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Tasdiqlash</span>
                    </button>
                  )}

                  {m.status !== "REJECTED" && (
                    <button
                      onClick={() => handleMaterialStatus(m.id, "REJECTED")}
                      className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-rose-950/60 border border-zinc-700 hover:border-rose-500 text-zinc-300 hover:text-rose-300 font-bold text-xs flex items-center gap-1.5 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Rad etish</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteMaterial(m.id)}
                    className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-all"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2-TAB: SHIKOYATLAR VA SPAM NAZORATI */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl glass-3d border border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
            <span>Foydalanuvchilar tomonidan nomaqbul so&apos;zlar, soxta e&apos;lonlar yoki buzilgan fayllar bo&apos;yicha yuborilgan shikoyatlar.</span>
            <span className="font-bold text-white">Jami: {reports.length} ta</span>
          </div>

          <div className="space-y-3">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="p-5 rounded-3xl glass-3d border border-zinc-800 hover:border-rose-500/40 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        rep.status === "RESOLVED"
                          ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                          : rep.status === "PENDING"
                          ? "bg-rose-950 text-rose-300 border-rose-500/40"
                          : "bg-zinc-800 text-zinc-400 border-zinc-700"
                      }`}
                    >
                      {rep.status === "RESOLVED"
                        ? "✔️ Hal qilingan"
                        : rep.status === "PENDING"
                        ? "🚨 Ko'rib chiqilishi kerak"
                        : "✖️ Bekor qilingan"}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {new Date(rep.createdAt).toLocaleDateString("uz-UZ")}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white">{rep.reason}</h3>
                  {rep.details && (
                    <p className="text-xs text-zinc-300 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800">
                      {rep.details}
                    </p>
                  )}
                  <div className="text-xs text-zinc-400">
                    Yuborgan: <strong className="text-zinc-300">{rep.reporterName}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {rep.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => handleReportStatus(rep.id, "RESOLVED")}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Hal qilindi</span>
                      </button>
                      <button
                        onClick={() => handleReportStatus(rep.id, "DISMISSED")}
                        className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs"
                      >
                        Asossiz
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3-TAB: FOYDALANUVCHILAR VA ROLLAR */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl glass-3d border border-zinc-800 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Ism, email yoki universitet bo'yicha qidirish..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs sm:text-sm focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">Barcha rollar</option>
                <option value="STUDENT">Talaba (STUDENT)</option>
                <option value="EMPLOYER">Ish beruvchi (EMPLOYER)</option>
                <option value="MODERATOR">Moderator (MODERATOR)</option>
                <option value="ADMIN">Administrator (ADMIN)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-3xl glass-3d border border-zinc-800 shadow-xl">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-zinc-900/80 text-zinc-400 uppercase text-[11px] font-bold border-b border-zinc-800">
                <tr>
                  <th className="px-5 py-4">Foydalanuvchi</th>
                  <th className="px-5 py-4">Universitet / Soha</th>
                  <th className="px-5 py-4">Tizimdagi Rol</th>
                  <th className="px-5 py-4">Verifikatsiya (ID)</th>
                  <th className="px-5 py-4 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 font-bold flex items-center justify-center text-xs">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {u.isVerified && (
                              <span title="Tasdiqlangan talaba">
                                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                              </span>
                            )}
                          </div>
                          <div className="text-zinc-500 text-xs font-mono">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-zinc-300">
                      <div>{u.universityName || "Kiritilmagan"}</div>
                      <div className="text-zinc-500 text-xs">{u.major || "Talaba"}</div>
                    </td>

                    <td className="px-5 py-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleUserRole(u.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border bg-zinc-900 cursor-pointer ${
                          u.role === "ADMIN"
                            ? "text-rose-400 border-rose-500/40"
                            : u.role === "MODERATOR"
                            ? "text-purple-400 border-purple-500/40"
                            : u.role === "EMPLOYER"
                            ? "text-emerald-400 border-emerald-500/40"
                            : "text-zinc-300 border-zinc-700"
                        }`}
                      >
                        <option value="STUDENT">STUDENT</option>
                        <option value="EMPLOYER">EMPLOYER</option>
                        <option value="MODERATOR">MODERATOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleUserVerify(u.id, u.isVerified)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                          u.isVerified
                            ? "bg-blue-500/20 text-blue-300 border-blue-500 shadow-sm"
                            : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white"
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{u.isVerified ? "Tasdiqlangan" : "Tasdiqlash"}</span>
                      </button>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <span className="text-[11px] text-zinc-500 font-mono">
                        {new Date(u.createdAt).toLocaleDateString("uz-UZ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center text-zinc-400">
          Admin paneli yuklanmoqda...
        </div>
      }
    >
      <AdminContent />
    </Suspense>
  );
}
