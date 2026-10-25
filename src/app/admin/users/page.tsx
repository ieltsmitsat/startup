"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  UserPlus,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Building2,
  GraduationCap,
  Mail,
  Phone,
  Send,
  Eye,
  X,
  Check,
  RefreshCw,
  Sparkles,
  ArrowLeft,
  Lock,
  ChevronRight,
  Briefcase,
  AlertTriangle,
} from "lucide-react";
import { ExtendedAdminUserItem } from "@/app/api/admin/users/route";

function UsersManagementContent() {
  const [users, setUsers] = useState<ExtendedAdminUserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtrlar
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modallar
  const [inspectingUser, setInspectingUser] = useState<ExtendedAdminUserItem | null>(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  // Yangi foydalanuvchi formasi
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"STUDENT" | "EMPLOYER" | "MODERATOR" | "ADMIN">("STUDENT");
  const [newUni, setNewUni] = useState("TATU");
  const [newMajor, setNewMajor] = useState("Dasturiy injiniring");
  const [newPhone, setNewPhone] = useState("+998 ");
  const [newTelegram, setNewTelegram] = useState("@");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bildirishnoma (Toast)
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  // Rolni o'zgartirish
  const handleRoleChange = async (id: string, role: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: role as any } : u))
    );
    try {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, role }),
      });
      showToast(`Foydalanuvchi roli '${role}' ga o'zgartirildi!`);
    } catch {
      // ignore
    }
    if (inspectingUser?.id === id) {
      setInspectingUser((prev) => (prev ? { ...prev, role: role as any } : null));
    }
  };

  // Verifikatsiya (Talabalik ID tasdig'i)
  const handleToggleVerify = async (id: string, currentStatus: boolean) => {
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
      showToast(isVerified ? "✅ Talabalik guvohnomasi tasdiqlandi (Verified)!" : "Verifikatsiya bekor qilindi.");
    } catch {
      // ignore
    }
    if (inspectingUser?.id === id) {
      setInspectingUser((prev) => (prev ? { ...prev, isVerified } : null));
    }
  };

  // Muzlatish / Faollashtirish (Suspend / Activate)
  const handleToggleStatus = async (id: string, currentStatus: "ACTIVE" | "SUSPENDED") => {
    const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: nextStatus } : u))
    );
    try {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus }),
      });
      showToast(nextStatus === "SUSPENDED" ? "🚫 Foydalanuvchi hisobi muzlatildi!" : "🟢 Foydalanuvchi qayta faollashtirildi!");
    } catch {
      // ignore
    }
    if (inspectingUser?.id === id) {
      setInspectingUser((prev) => (prev ? { ...prev, status: nextStatus } : null));
    }
  };

  // O'chirish
  const handleDeleteUser = async (id: string) => {
    if (!confirm("Haqiqatan ham bu foydalanuvchini va uning barcha ma'lumotlarini o'chirmoqchimisiz?")) return;
    setUsers((prev) => prev.filter((u) => u.id !== id));
    try {
      await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
      showToast("Foydalanuvchi hisobi o'chirildi!");
    } catch {
      // ignore
    }
    if (inspectingUser?.id === id) setInspectingUser(null);
  };

  // Yangi foydalanuvchi qo'shish
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          role: newRole,
          universityName: newUni,
          major: newMajor,
          phone: newPhone,
          telegramUsername: newTelegram,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => [data.user, ...prev]);
        setIsAddUserModalOpen(false);
        setNewName("");
        setNewEmail("");
        showToast("Yangi foydalanuvchi tizimga qo'shildi!");
      }
    } catch {
      // ignore
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrlar
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.universityName?.toLowerCase().includes(q) ||
        u.major?.toLowerCase().includes(q) ||
        u.telegramUsername?.toLowerCase().includes(q);

      const matchRole = roleFilter === "ALL" || u.role === roleFilter;
      const matchStatus = statusFilter === "ALL" || u.status === statusFilter;

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Statistika
  const stats = useMemo(() => {
    const students = users.filter((u) => u.role === "STUDENT").length;
    const employers = users.filter((u) => u.role === "EMPLOYER").length;
    const moderators = users.filter((u) => u.role === "MODERATOR" || u.role === "ADMIN").length;
    const verified = users.filter((u) => u.isVerified).length;
    return { students, employers, moderators, verified, total: users.length };
  }, [users]);

  return (
    <div className="space-y-8">
      {/* Toast xabar */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-cyan-600 text-white font-bold text-xs sm:text-sm shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER & METRIKALAR */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 mb-1">
              <Link href="/admin" className="hover:underline flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Admin Doskasi</span>
              </Link>
              <span>/</span>
              <span>Foydalanuvchilar & Rollar Boshqaruvi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Foydalanuvchilar va Rollar Markazi
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Talabalar, ish beruvchilar va moderatorlar ustidan to&apos;liq nazorat, talabalik guvohnomalarini tasdiqlash hamda rollarni taqsimlash.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Yangi Foydalanuvchi</span>
            </button>
            <button
              onClick={fetchUsers}
              className="p-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center gap-2 text-xs font-bold transition-all shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 TA STATISTIKA BENTO KARTALARI */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <button
            onClick={() => setRoleFilter("STUDENT")}
            className={`p-4 rounded-2xl border text-left transition-all ${
              roleFilter === "STUDENT"
                ? "bg-blue-500/20 border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500"
                : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center justify-between text-blue-400">
              <span className="text-xs font-bold">Talabalar</span>
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-blue-300 mt-1">
              {stats.students} ta
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Asosiy kontingent</div>
          </button>

          <button
            onClick={() => setRoleFilter("EMPLOYER")}
            className={`p-4 rounded-2xl border text-left transition-all ${
              roleFilter === "EMPLOYER"
                ? "bg-emerald-500/20 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500"
                : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-xs font-bold">Ish Beruvchilar</span>
              <Briefcase className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-300 mt-1">
              {stats.employers} ta
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Kompaniyalar & HR</div>
          </button>

          <button
            onClick={() => setRoleFilter("MODERATOR")}
            className={`p-4 rounded-2xl border text-left transition-all ${
              roleFilter === "MODERATOR"
                ? "bg-purple-500/20 border-purple-500 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500"
                : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center justify-between text-purple-400">
              <span className="text-xs font-bold">Moderatorlar</span>
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-purple-300 mt-1">
              {stats.moderators} ta
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Kontent nazoratchilari</div>
          </button>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-left">
            <div className="flex items-center justify-between text-cyan-400">
              <span className="text-xs font-bold">Tasdiqlangan ID</span>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-cyan-300 mt-1">
              {stats.verified} ta
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Rasman tasdiqlangan talabalar</div>
          </div>
        </div>
      </div>

      {/* BOSHQARUV, QIDIRUV VA FILTRLAR PANELI */}
      <div className="p-4 sm:p-5 rounded-3xl glass-3d border border-zinc-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ism, email, universitet yoki telegram username..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs sm:text-sm focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">Barcha holatlar</option>
              <option value="ACTIVE">🟢 Faol hisoblar</option>
              <option value="SUSPENDED">🔴 Muzlatilganlar</option>
            </select>
          </div>
        </div>

        {/* Rol tablari */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-zinc-800">
          <button
            onClick={() => setRoleFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              roleFilter === "ALL"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                : "bg-zinc-900 text-zinc-400 hover:text-white"
            }`}
          >
            Barchasi ({stats.total})
          </button>
          <button
            onClick={() => setRoleFilter("STUDENT")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              roleFilter === "STUDENT"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "bg-zinc-900 text-zinc-400 hover:text-white"
            }`}
          >
            🎓 Talabalar ({stats.students})
          </button>
          <button
            onClick={() => setRoleFilter("EMPLOYER")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              roleFilter === "EMPLOYER"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "bg-zinc-900 text-zinc-400 hover:text-white"
            }`}
          >
            🏢 Ish Beruvchilar ({stats.employers})
          </button>
          <button
            onClick={() => setRoleFilter("MODERATOR")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              roleFilter === "MODERATOR"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "bg-zinc-900 text-zinc-400 hover:text-white"
            }`}
          >
            🛡️ Moderatorlar ({stats.moderators})
          </button>
        </div>
      </div>

      {/* FOYDALANUVCHILAR JADVALI */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-24 rounded-3xl glass-3d border border-zinc-800 animate-pulse bg-zinc-900/40 p-5"
            />
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-16 px-4 glass-3d rounded-3xl border border-zinc-800 max-w-lg mx-auto space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">Hech qanday foydalanuvchi topilmadi</h3>
          <p className="text-xs text-zinc-400">
            Qidiruv so&apos;rovini yoki rol filtrini o&apos;zgartirib ko&apos;ring.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl glass-3d border border-zinc-800 shadow-xl">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-zinc-900/80 text-zinc-400 uppercase text-[10px] font-bold border-b border-zinc-800">
              <tr>
                <th className="px-5 py-4">Foydalanuvchi</th>
                <th className="px-5 py-4">Universitet & Yo&apos;nalish</th>
                <th className="px-5 py-4">Tizimdagi Rol</th>
                <th className="px-5 py-4">Talabalik ID Tasdig&apos;i</th>
                <th className="px-5 py-4">Holati</th>
                <th className="px-5 py-4 text-right">Boshqaruv</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredUsers.map((u) => {
                return (
                  <tr key={u.id} className="hover:bg-zinc-900/50 transition-colors">
                    {/* Foydalanuvchi ismi va email */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-md">
                            {u.name.charAt(0)}
                          </div>
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-zinc-950 ${
                              u.status === "ACTIVE" ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          />
                        </div>
                        <div>
                          <div
                            onClick={() => setInspectingUser(u)}
                            className="font-bold text-white hover:text-cyan-300 cursor-pointer flex items-center gap-1.5"
                          >
                            <span>{u.name}</span>
                            {u.isVerified && (
                              <span title="Tasdiqlangan talaba">
                                <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              </span>
                            )}
                          </div>
                          <div className="text-zinc-500 text-xs font-mono">{u.email}</div>
                          {u.telegramUsername && (
                            <div className="text-[11px] text-cyan-400 font-mono mt-0.5">
                              {u.telegramUsername}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Universitet va soha */}
                    <td className="px-5 py-4 text-zinc-300">
                      <div className="font-semibold text-white">
                        {u.universityName || "Kiritilmagan"}
                      </div>
                      <div className="text-zinc-400 text-xs">
                        {u.major || "Yo'nalish noma'lum"}
                        {u.academicYear && ` (${u.academicYear}-kurs)`}
                      </div>
                    </td>

                    {/* Rol selektori */}
                    <td className="px-5 py-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black border bg-zinc-900 cursor-pointer transition-colors ${
                          u.role === "ADMIN"
                            ? "text-rose-400 border-rose-500/40"
                            : u.role === "MODERATOR"
                            ? "text-purple-400 border-purple-500/40"
                            : u.role === "EMPLOYER"
                            ? "text-emerald-400 border-emerald-500/40"
                            : "text-blue-300 border-blue-500/40"
                        }`}
                      >
                        <option value="STUDENT">STUDENT</option>
                        <option value="EMPLOYER">EMPLOYER</option>
                        <option value="MODERATOR">MODERATOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>

                    {/* Verifikatsiya toggle */}
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggleVerify(u.id, u.isVerified)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                          u.isVerified
                            ? "bg-blue-500/20 text-blue-300 border-blue-500 shadow-sm"
                            : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white"
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{u.isVerified ? "Tasdiqlangan" : "Tasdiqlash"}</span>
                      </button>
                    </td>

                    {/* Holati */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                          u.status === "ACTIVE"
                            ? "bg-emerald-950 text-emerald-300 border-emerald-500/30"
                            : "bg-rose-950 text-rose-300 border-rose-500/30"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            u.status === "ACTIVE" ? "bg-emerald-400" : "bg-rose-400"
                          }`}
                        />
                        <span>{u.status === "ACTIVE" ? "Faol" : "Muzlatilgan"}</span>
                      </span>
                    </td>

                    {/* Amallar */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInspectingUser(u)}
                          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-cyan-400 hover:bg-zinc-800 transition-all"
                          title="Foydalanuvchi ma'lumotlari"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(u.id, u.status)}
                          className={`p-2 rounded-xl border transition-all ${
                            u.status === "ACTIVE"
                              ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-rose-400"
                              : "bg-emerald-950 border-emerald-500 text-emerald-300"
                          }`}
                          title={u.status === "ACTIVE" ? "Muzlatish" : "Qayta faollashtirish"}
                        >
                          {u.status === "ACTIVE" ? (
                            <UserX className="w-4 h-4" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-400 transition-all"
                          title="O'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 1. CHUQUR FOYDALANUVCHI DOSYESI MODALI */}
      {inspectingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
          onClick={() => setInspectingUser(null)}
        >
          <div
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl glass-3d border border-blue-500/40 p-6 sm:p-8 space-y-6 shadow-2xl bg-zinc-950 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Foydalanuvchi Profili (Dossier)</h3>
                  <p className="text-[11px] text-zinc-400">Akademik ma&apos;lumotlar va tizim huquqlari</p>
                </div>
              </div>
              <button
                onClick={() => setInspectingUser(null)}
                className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ism va Asosiy status */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center text-2xl font-black shadow-lg">
                {inspectingUser.name.charAt(0)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-white">{inspectingUser.name}</h2>
                  {inspectingUser.isVerified && (
                    <span title="Tasdiqlangan talaba">
                      <ShieldCheck className="w-4 h-4 text-blue-400" />
                    </span>
                  )}
                </div>
                <div className="text-xs text-zinc-400 font-mono">{inspectingUser.email}</div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-900/60 text-blue-200 border border-blue-500/40">
                    {inspectingUser.role}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      inspectingUser.status === "ACTIVE"
                        ? "bg-emerald-950 text-emerald-300"
                        : "bg-rose-950 text-rose-300"
                    }`}
                  >
                    {inspectingUser.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Parametrlar gridi */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                <div className="text-zinc-500">Universitet</div>
                <div className="text-sm font-bold text-white mt-0.5">
                  {inspectingUser.universityName || "Kiritilmagan"}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                <div className="text-zinc-500">Yo&apos;nalish & Kurs</div>
                <div className="text-sm font-bold text-white mt-0.5">
                  {inspectingUser.major || "Noma'lum"} ({inspectingUser.academicYear || 1}-kurs)
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                <div className="text-zinc-500">Telegram Username</div>
                <div className="text-sm font-bold text-cyan-400 mt-0.5 font-mono">
                  {inspectingUser.telegramUsername || "Mavjud emas"}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                <div className="text-zinc-500">Yuklagan Materiallari</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">
                  {inspectingUser.materialsCount} ta hujjat
                </div>
              </div>
            </div>

            {/* Ko'nikmalar */}
            {inspectingUser.skills && inspectingUser.skills.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Texnik Ko&apos;nikmalar (Skills):
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {inspectingUser.skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 font-semibold"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Harakatlar */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-4 border-t border-zinc-800">
              <button
                onClick={() => handleToggleVerify(inspectingUser.id, inspectingUser.isVerified)}
                className={`w-full sm:flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  inspectingUser.isVerified
                    ? "bg-zinc-800 text-zinc-300 hover:text-white"
                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {inspectingUser.isVerified
                    ? "Verifikatsiyani Bekor Qilish"
                    : "Talabalik ID Tasdiqlash"}
                </span>
              </button>

              <button
                onClick={() => handleToggleStatus(inspectingUser.id, inspectingUser.status)}
                className={`w-full sm:w-auto py-2.5 px-4 rounded-xl font-bold text-xs border transition-all ${
                  inspectingUser.status === "ACTIVE"
                    ? "bg-rose-950/60 border-rose-500/40 text-rose-300 hover:bg-rose-900"
                    : "bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900"
                }`}
              >
                {inspectingUser.status === "ACTIVE" ? "Hisobni Muzlatish" : "Qayta Faollashtirish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. YANGI FOYDALANUVCHI QO'SHISH MODALI */}
      {isAddUserModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setIsAddUserModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl glass-3d border border-blue-500/40 p-6 space-y-5 bg-zinc-950 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                <UserPlus className="w-4 h-4" />
                <span>Yangi Foydalanuvchi Yaratish</span>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-300 font-bold mb-1">To&apos;liq Ism Familiya *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Masalan: Azizbek Olimov"
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">Email manzili *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="azizbek@tuit.uz"
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Tizimdagi Roli</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="STUDENT">STUDENT (Talaba)</option>
                    <option value="EMPLOYER">EMPLOYER (Ish beruvchi)</option>
                    <option value="MODERATOR">MODERATOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Universitet</label>
                  <input
                    type="text"
                    value={newUni}
                    onChange={(e) => setNewUni(e.target.value)}
                    placeholder="TATU"
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Yo&apos;nalish</label>
                  <input
                    type="text"
                    value={newMajor}
                    onChange={(e) => setNewMajor(e.target.value)}
                    placeholder="Dasturiy injiniring"
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Telegram username</label>
                  <input
                    type="text"
                    value={newTelegram}
                    onChange={(e) => setNewTelegram(e.target.value)}
                    placeholder="@azizbek_dev"
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all mt-2 disabled:opacity-50"
              >
                {isSubmitting ? "Yaratilmoqda..." : "Foydalanuvchini Saqlash"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-400">Yuklanmoqda...</div>}>
      <UsersManagementContent />
    </Suspense>
  );
}
