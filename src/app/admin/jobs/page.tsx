"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import Link from "next/link";
import {
  Briefcase,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  Building2,
  MapPin,
  Clock,
  DollarSign,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  RefreshCw,
  Eye,
  X,
  Check,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Globe,
  Flame,
  FileText,
  Lock,
  Unlock,
} from "lucide-react";
import { ExtendedAdminJobItem } from "@/app/api/admin/jobs/route";

function JobsModerationContent() {
  const [jobs, setJobs] = useState<ExtendedAdminJobItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtrlar
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [jobTypeFilter, setJobTypeFilter] = useState("ALL");

  // Modallar
  const [inspectingJob, setInspectingJob] = useState<ExtendedAdminJobItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Yangi vakansiya formasi
  const [newTitle, setNewTitle] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newType, setNewType] = useState<"INTERNSHIP" | "PART_TIME" | "FULL_TIME" | "REMOTE">("INTERNSHIP");
  const [newLocation, setNewLocation] = useState("Toshkent");
  const [newIsRemote, setNewIsRemote] = useState(false);
  const [newSalaryMin, setNewSalaryMin] = useState<number | "">("");
  const [newSalaryMax, setNewSalaryMax] = useState<number | "">("");
  const [newDesc, setNewDesc] = useState("");
  const [newReqs, setNewReqs] = useState("");
  const [newApplyUrl, setNewApplyUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/jobs");
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  // Holatni yangilash (ACTIVE, FLAGGED, CLOSED, PENDING)
  const handleUpdateStatus = async (
    id: string,
    status: "ACTIVE" | "PENDING" | "CLOSED" | "FLAGGED"
  ) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status } : j))
    );
    try {
      await fetch("/api/admin/jobs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      showToast(
        status === "ACTIVE"
          ? "✅ Vakansiya faollashtirildi!"
          : status === "FLAGGED"
          ? "🚨 Vakansiya shubhali deb bloklandi!"
          : "🔒 Vakansiya yopildi."
      );
    } catch {
      // ignore
    }
    if (inspectingJob?.id === id) {
      setInspectingJob((prev) => (prev ? { ...prev, status } : null));
    }
  };

  // Ish beruvchini tasdiqlash
  const handleToggleEmployerVerify = async (id: string, currentStatus: boolean) => {
    const isAuthorVerified = !currentStatus;
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, isAuthorVerified } : j))
    );
    try {
      await fetch("/api/admin/jobs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isAuthorVerified }),
      });
      showToast(isAuthorVerified ? "🏢 Ish beruvchi tasdiqlandi!" : "Ish beruvchi tasdig'i bekor qilindi.");
    } catch {
      // ignore
    }
    if (inspectingJob?.id === id) {
      setInspectingJob((prev) => (prev ? { ...prev, isAuthorVerified } : null));
    }
  };

  // O'chirish
  const handleDeleteJob = async (id: string) => {
    if (!confirm("Haqiqatan ham bu vakansiyani butunlay o'chirmoqchimisiz?")) return;
    setJobs((prev) => prev.filter((j) => j.id !== id));
    try {
      await fetch(`/api/admin/jobs?id=${id}`, { method: "DELETE" });
      showToast("Vakansiya o'chirildi!");
    } catch {
      // ignore
    }
    if (inspectingJob?.id === id) setInspectingJob(null);
  };

  // Yangi rasmiy vakansiya qo'shish
  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const reqsArray = newReqs
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          companyName: newCompany,
          jobType: newType,
          location: newLocation,
          isRemote: newIsRemote,
          salaryMin: newSalaryMin ? Number(newSalaryMin) : null,
          salaryMax: newSalaryMax ? Number(newSalaryMax) : null,
          description: newDesc,
          requirements: reqsArray,
          applyUrl: newApplyUrl,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setJobs((prev) => [data.job, ...prev]);
        setIsAddModalOpen(false);
        setNewTitle("");
        setNewCompany("");
        setNewDesc("");
        setNewReqs("");
        showToast("Yangi rasmiy vakansiya tizimga kiritildi!");
      }
    } catch {
      // ignore
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrlar
  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        j.title.toLowerCase().includes(q) ||
        j.companyName.toLowerCase().includes(q) ||
        j.location?.toLowerCase().includes(q) ||
        j.authorName.toLowerCase().includes(q);

      const matchStatus = statusFilter === "ALL" || j.status === statusFilter;
      const matchType = jobTypeFilter === "ALL" || j.jobType === jobTypeFilter;

      return matchSearch && matchStatus && matchType;
    });
  }, [jobs, searchQuery, statusFilter, jobTypeFilter]);

  // Statistika
  const stats = useMemo(() => {
    const active = jobs.filter((j) => j.status === "ACTIVE").length;
    const pending = jobs.filter((j) => j.status === "PENDING").length;
    const flagged = jobs.filter((j) => j.status === "FLAGGED").length;
    const closed = jobs.filter((j) => j.status === "CLOSED").length;
    return { active, pending, flagged, closed, total: jobs.length };
  }, [jobs]);

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return "Kelishuv asosida";
    if (min && max) return `${(min / 1000000).toFixed(1)} - ${(max / 1000000).toFixed(1)} mln`;
    if (min) return `${(min / 1000000).toFixed(1)} mln+`;
    return `${(max! / 1000000).toFixed(1)} mln gacha`;
  };

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
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
              <Link href="/admin" className="hover:underline flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Admin Doskasi</span>
              </Link>
              <span>/</span>
              <span>Vakansiyalar va E&apos;lonlar Nazorati</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Vakansiyalar va Karyera Nazorati Markazi
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Ish beruvchilarning e&apos;lonlarini tekshirish, soxta takliflarni bloklash va tasdiqlangan stajirovkalarni boshqarish.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi Rasmiy Vakansiya</span>
            </button>
            <button
              onClick={fetchJobs}
              className="p-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center gap-2 text-xs font-bold transition-all shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 TA STATISTIKA BENTO KARTALARI */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <button
            onClick={() => setStatusFilter("ACTIVE")}
            className={`p-4 rounded-2xl border text-left transition-all ${
              statusFilter === "ACTIVE"
                ? "bg-emerald-500/20 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500"
                : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-xs font-bold">Faol E&apos;lonlar</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-300 mt-1">
              {stats.active} ta
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Platformada ochiq</div>
          </button>

          <button
            onClick={() => setStatusFilter("PENDING")}
            className={`p-4 rounded-2xl border text-left transition-all ${
              statusFilter === "PENDING"
                ? "bg-amber-500/20 border-amber-500 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500"
                : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center justify-between text-amber-400">
              <span className="text-xs font-bold">Moderatsiyada</span>
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-300 mt-1">
              {stats.pending} ta
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Tekshiruv kutilmoqda</div>
          </button>

          <button
            onClick={() => setStatusFilter("FLAGGED")}
            className={`p-4 rounded-2xl border text-left transition-all ${
              statusFilter === "FLAGGED"
                ? "bg-rose-500/20 border-rose-500 shadow-lg shadow-rose-500/10 ring-1 ring-rose-500"
                : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center justify-between text-rose-400">
              <span className="text-xs font-bold">Shubhali / Bloklangan</span>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-300 mt-1">
              {stats.flagged} ta
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Spam yoki firibgarlik</div>
          </button>

          <button
            onClick={() => setStatusFilter("ALL")}
            className={`p-4 rounded-2xl border text-left transition-all ${
              statusFilter === "ALL"
                ? "bg-cyan-500/20 border-cyan-500 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500"
                : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center justify-between text-cyan-400">
              <span className="text-xs font-bold">Jami Bazada</span>
              <Briefcase className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">
              {stats.total} ta
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Barcha vakansiyalar</div>
          </button>
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
              placeholder="Lavozim nomi, kompaniya, shahar yoki ish beruvchi..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition-all"
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
              value={jobTypeFilter}
              onChange={(e) => setJobTypeFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Barcha bandlik turlari</option>
              <option value="INTERNSHIP">Stajirovka (Internship)</option>
              <option value="PART_TIME">Part-Time</option>
              <option value="FULL_TIME">Full-Time</option>
              <option value="REMOTE">Masofaviy (Remote)</option>
            </select>
          </div>
        </div>

        {/* Holat tablari */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-zinc-800">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === "ALL"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                : "bg-zinc-900 text-zinc-400 hover:text-white"
            }`}
          >
            Barchasi ({stats.total})
          </button>
          <button
            onClick={() => setStatusFilter("ACTIVE")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === "ACTIVE"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "bg-zinc-900 text-zinc-400 hover:text-white"
            }`}
          >
            🟢 Faol ({stats.active})
          </button>
          <button
            onClick={() => setStatusFilter("PENDING")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === "PENDING"
                ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20"
                : "bg-zinc-900 text-zinc-400 hover:text-white"
            }`}
          >
            ⏳ Kutilmoqda ({stats.pending})
          </button>
          <button
            onClick={() => setStatusFilter("FLAGGED")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === "FLAGGED"
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                : "bg-zinc-900 text-zinc-400 hover:text-white"
            }`}
          >
            🚨 Shubhali ({stats.flagged})
          </button>
          <button
            onClick={() => setStatusFilter("CLOSED")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === "CLOSED"
                ? "bg-zinc-700 text-white"
                : "bg-zinc-900 text-zinc-400 hover:text-white"
            }`}
          >
            🔒 Yopilgan ({stats.closed})
          </button>
        </div>
      </div>

      {/* VAKANSIYALAR RO'YXATI */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-28 rounded-3xl glass-3d border border-zinc-800 animate-pulse bg-zinc-900/40 p-5"
            />
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-16 px-4 glass-3d rounded-3xl border border-zinc-800 max-w-lg mx-auto space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <Briefcase className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">Hech qanday vakansiya topilmadi</h3>
          <p className="text-xs text-zinc-400">
            Tanlangan filtrlarga mos keluvchi e&apos;lonlar mavjud emas.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredJobs.map((j) => {
            return (
              <div
                key={j.id}
                className={`p-5 rounded-3xl glass-3d border transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 shadow-xl ${
                  j.status === "ACTIVE"
                    ? "border-zinc-800/90 hover:border-emerald-500/40"
                    : j.status === "PENDING"
                    ? "border-amber-500/40 bg-amber-500/5 hover:border-amber-500/70"
                    : j.status === "FLAGGED"
                    ? "border-rose-500/40 bg-rose-500/5 hover:border-rose-500/70"
                    : "border-zinc-800/80 bg-zinc-900/40 opacity-70"
                }`}
              >
                {/* Asosiy ma'lumot */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Holat */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md ${
                        j.status === "ACTIVE"
                          ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                          : j.status === "PENDING"
                          ? "bg-amber-950 text-amber-300 border-amber-500/40 animate-pulse"
                          : j.status === "FLAGGED"
                          ? "bg-rose-950 text-rose-300 border-rose-500/40"
                          : "bg-zinc-800 text-zinc-400 border-zinc-700"
                      }`}
                    >
                      {j.status === "ACTIVE"
                        ? "🟢 Faol"
                        : j.status === "PENDING"
                        ? "⏳ Kutilmoqda"
                        : j.status === "FLAGGED"
                        ? "🚨 Shubhali (Bloklangan)"
                        : "🔒 Yopilgan"}
                    </span>

                    {/* Bandlik turi */}
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-zinc-900 border border-zinc-700 text-zinc-300">
                      {j.jobType}
                    </span>

                    {j.isRemote && (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-sky-950 text-sky-300 border border-sky-500/40 flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        <span>Remote</span>
                      </span>
                    )}

                    <span className="text-xs text-emerald-400 font-bold font-mono">
                      {formatSalary(j.salaryMin, j.salaryMax)}
                    </span>
                  </div>

                  {/* Sarlavha va kompaniya */}
                  <div className="space-y-0.5">
                    <h3
                      onClick={() => setInspectingJob(j)}
                      className="text-base font-bold text-white hover:text-emerald-300 transition-colors cursor-pointer leading-snug"
                    >
                      {j.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-zinc-300 font-medium">
                      <span className="font-bold text-white">{j.companyName}</span>
                      {j.isAuthorVerified && (
                        <span title="Tasdiqlangan ish beruvchi">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                        </span>
                      )}
                      <span>•</span>
                      <span className="flex items-center gap-1 text-zinc-300">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        {j.location || "Toshkent"}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-200 line-clamp-1 leading-relaxed font-normal">
                    {j.description}
                  </p>

                  <div className="text-[11px] text-zinc-300 flex items-center gap-3 pt-1 font-medium">
                    <span>Arizalar: <strong className="text-cyan-400 font-bold">{j.applicationsCount} ta</strong></span>
                    <span>•</span>
                    <span>Qo&apos;shgan: <strong className="text-zinc-200">{j.authorName}</strong></span>
                    <span>•</span>
                    <span className="text-zinc-400">{new Date(j.createdAt).toLocaleDateString("uz-UZ")}</span>
                  </div>
                </div>

                {/* Harakatlar */}
                <div className="flex items-center gap-2 shrink-0 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-zinc-800">
                  <button
                    onClick={() => setInspectingJob(j)}
                    className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5"
                    title="Vakansiyani tekshirish"
                  >
                    <Eye className="w-4 h-4 text-emerald-400" />
                    <span>Tekshirish</span>
                  </button>

                  {/* Faollashtirish */}
                  {j.status !== "ACTIVE" && (
                    <button
                      onClick={() => handleUpdateStatus(j.id, "ACTIVE")}
                      className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Faollashtirish</span>
                    </button>
                  )}

                  {/* Shubhali deb bloklash */}
                  {j.status !== "FLAGGED" && (
                    <button
                      onClick={() => handleUpdateStatus(j.id, "FLAGGED")}
                      className="px-3 py-2.5 rounded-xl bg-zinc-900 hover:bg-rose-950/60 border border-zinc-700 hover:border-rose-500 text-zinc-300 hover:text-rose-300 font-bold text-xs flex items-center gap-1.5 transition-all"
                      title="Shubhali yoki firibgarlik deb bloklash"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>Bloklash</span>
                    </button>
                  )}

                  {/* Yopish */}
                  {j.status === "ACTIVE" && (
                    <button
                      onClick={() => handleUpdateStatus(j.id, "CLOSED")}
                      className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-all"
                      title="Vakansiyani yopish"
                    >
                      <Lock className="w-4 h-4" />
                    </button>
                  )}

                  {/* O'chirish */}
                  <button
                    onClick={() => handleDeleteJob(j.id)}
                    className="p-2.5 rounded-xl bg-zinc-900 hover:bg-rose-950/40 border border-zinc-800 text-zinc-400 hover:text-rose-400 transition-all"
                    title="Butunlay o'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 1. CHUQUR VAKANSIYA TEKSHIRUVI MODALI */}
      {inspectingJob && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
          onClick={() => setInspectingJob(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl glass-3d border border-emerald-500/40 p-6 sm:p-8 space-y-6 shadow-2xl bg-zinc-950 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Vakansiya Ekspertizasi</h3>
                  <p className="text-[11px] text-zinc-400">Ish beruvchi ishonchliligi va maosh shartlari</p>
                </div>
              </div>
              <button
                onClick={() => setInspectingJob(null)}
                className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sarlavha & Kompaniya */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  {inspectingJob.jobType}
                </span>
                <span className="text-xs text-emerald-400 font-bold font-mono">
                  {formatSalary(inspectingJob.salaryMin, inspectingJob.salaryMax)}
                </span>
              </div>
              <h2 className="text-xl font-black text-white">{inspectingJob.title}</h2>
              <div className="text-xs text-zinc-300 flex items-center gap-2">
                <span className="font-bold">{inspectingJob.companyName}</span>
                <span>•</span>
                <span>{inspectingJob.location || "Toshkent"}</span>
              </div>
            </div>

            {/* Tavsif */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Ish sharoitlari va tavsifi:
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800 leading-relaxed whitespace-pre-line">
                {inspectingJob.description}
              </p>
            </div>

            {/* Talablar */}
            {inspectingJob.requirements && inspectingJob.requirements.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Talab qilinadigan bilimlar:
                </div>
                <div className="space-y-1">
                  {inspectingJob.requirements.map((r, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-zinc-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ish beruvchi verifikatsiyasi */}
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Qo&apos;shgan: {inspectingJob.authorName}</span>
                  {inspectingJob.isAuthorVerified && (
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  )}
                </div>
                <div className="text-[11px] text-zinc-400">
                  Ariza havolasi: {inspectingJob.applyUrl || "StudentHub profili orqali"}
                </div>
              </div>

              <button
                onClick={() => handleToggleEmployerVerify(inspectingJob.id, inspectingJob.isAuthorVerified)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  inspectingJob.isAuthorVerified
                    ? "bg-blue-600/20 text-blue-300 border-blue-500"
                    : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white"
                }`}
              >
                {inspectingJob.isAuthorVerified ? "Tasdiqlangan Ish beruvchi" : "Ish beruvchini Tasdiqlash"}
              </button>
            </div>

            {/* Harakatlar */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-4 border-t border-zinc-800">
              {inspectingJob.status !== "ACTIVE" && (
                <button
                  onClick={() => handleUpdateStatus(inspectingJob.id, "ACTIVE")}
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Vakansiyani Faollashtirish</span>
                </button>
              )}

              {inspectingJob.status !== "FLAGGED" && (
                <button
                  onClick={() => handleUpdateStatus(inspectingJob.id, "FLAGGED")}
                  className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-rose-950/60 border border-rose-500 text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Shubhali / Bloklash</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. YANGI RASMIY VAKANSIYA QO'SHISH MODALI */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="relative w-full max-w-xl rounded-3xl glass-3d border border-emerald-500/40 p-6 space-y-5 bg-zinc-950 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Briefcase className="w-4 h-4" />
                <span>Yangi Rasmiy Vakansiya Joylash</span>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-300 font-bold mb-1">Lavozim nomi *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Junior Frontend Dasturchi"
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Kompaniya nomi *</label>
                  <input
                    type="text"
                    required
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="Uzum Market, IT Park"
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Bandlik turi</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="INTERNSHIP">Stajirovka (Internship)</option>
                    <option value="PART_TIME">Part-Time</option>
                    <option value="FULL_TIME">Full-Time</option>
                    <option value="REMOTE">Masofaviy (Remote)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Min maosh (UZS)</label>
                  <input
                    type="number"
                    value={newSalaryMin}
                    onChange={(e) => setNewSalaryMin(e.target.value ? Number(e.target.value) : "")}
                    placeholder="3000000"
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Maks maosh (UZS)</label>
                  <input
                    type="number"
                    value={newSalaryMax}
                    onChange={(e) => setNewSalaryMax(e.target.value ? Number(e.target.value) : "")}
                    placeholder="6000000"
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">Batafsil tavsif</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Talabalar uchun ish sharoitlari va vazifalar..."
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">
                  Talablar (Har bir qatorga bittadan talab)
                </label>
                <textarea
                  rows={2}
                  value={newReqs}
                  onChange={(e) => setNewReqs(e.target.value)}
                  placeholder="React.js bilimi&#10;Git bilan ishlash&#10;Ingliz tili B1+"
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">Ariza / Telegram havola</label>
                <input
                  type="text"
                  value={newApplyUrl}
                  onChange={(e) => setNewApplyUrl(e.target.value)}
                  placeholder="https://t.me/hr_company yoki https://company.uz"
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all mt-2 disabled:opacity-50"
              >
                {isSubmitting ? "Joylanmoqda..." : "Rasmiy Vakansiyani Chop Etish"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminJobsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-400">Yuklanmoqda...</div>}>
      <JobsModerationContent />
    </Suspense>
  );
}
