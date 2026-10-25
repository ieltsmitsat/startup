"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import Link from "next/link";
import {
  Briefcase,
  Search,
  SlidersHorizontal,
  MapPin,
  Clock,
  DollarSign,
  GraduationCap,
  Building2,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Sparkles,
  Plus,
  FileText,
  Share2,
  X,
  Send,
  Download,
  Printer,
  ChevronRight,
  ShieldCheck,
  Globe,
  Flame,
  Check,
  User,
  AlertCircle,
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  companyName: string;
  companyLogo?: string;
  jobType: "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "REMOTE";
  location?: string;
  isRemote: boolean;
  salaryMin?: number;
  salaryMax?: number;
  description: string;
  requirements: string[];
  applyUrl?: string;
  deadline?: string;
  createdAt: string;
  author?: {
    name: string;
    isVerified: boolean;
  };
}

function JobsContent() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Filtrlash holatlari
  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState<string>("ALL");
  const [isRemoteOnly, setIsRemoteOnly] = useState(false);
  const [hasSalaryOnly, setHasSalaryOnly] = useState(false);
  const [bookmarksOnly, setBookmarksOnly] = useState(false);

  // Saqlanganlar (Bookmarks)
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modallar
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  // Yangi vakansiya formasi
  const [newTitle, setNewTitle] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newType, setNewType] = useState("INTERNSHIP");
  const [newLocation, setNewLocation] = useState("Toshkent");
  const [newIsRemote, setNewIsRemote] = useState(false);
  const [newSalaryMin, setNewSalaryMin] = useState<number | "">("");
  const [newSalaryMax, setNewSalaryMax] = useState<number | "">("");
  const [newDescription, setNewDescription] = useState("");
  const [newRequirements, setNewRequirements] = useState("");
  const [newApplyUrl, setNewApplyUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("student_hub_job_bookmarks");
      if (saved) {
        setBookmarks(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
    fetchCurrentUser();
    fetchJobs();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    } catch {
      // ignore
    }
  };

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/jobs");
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error("Vakansiyalarni yuklashda xatolik:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setBookmarks((prev) => {
      let updated: string[];
      if (prev.includes(id)) {
        updated = prev.filter((item) => item !== id);
      } else {
        updated = [...prev, id];
      }
      try {
        localStorage.setItem("student_hub_job_bookmarks", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleShare = (j: Job, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = window.location.origin + `/jobs?id=${j.id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(j.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setFormError("Vakansiya joylash uchun avval profilingizga kiring");
      return;
    }
    setFormError("");
    setIsSubmitting(true);

    const reqs = newRequirements
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/jobs", {
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
          description: newDescription,
          requirements: reqs,
          applyUrl: newApplyUrl || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Xatolik yuz berdi");
        return;
      }

      setJobs((prev) => [data.job, ...prev]);
      setIsAddModalOpen(false);
      // Reset form
      setNewTitle("");
      setNewCompany("");
      setNewDescription("");
      setNewRequirements("");
      setNewApplyUrl("");
      setNewSalaryMin("");
      setNewSalaryMax("");
    } catch {
      setFormError("Server bilan bog'lanishda xatolik");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrlangan ishlar
  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        j.title.toLowerCase().includes(q) ||
        j.companyName.toLowerCase().includes(q) ||
        j.location?.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q) ||
        j.requirements.some((r) => r.toLowerCase().includes(q));

      const matchType = jobType === "ALL" || j.jobType === jobType;
      const matchRemote = !isRemoteOnly || j.isRemote;
      const matchSalary = !hasSalaryOnly || (j.salaryMin && j.salaryMin > 0);
      const matchBookmark = !bookmarksOnly || bookmarks.includes(j.id);

      return matchSearch && matchType && matchRemote && matchSalary && matchBookmark;
    });
  }, [jobs, search, jobType, isRemoteOnly, hasSalaryOnly, bookmarksOnly, bookmarks]);

  const stats = useMemo(() => {
    const total = jobs.length;
    const internships = jobs.filter((j) => j.jobType === "INTERNSHIP").length;
    const partTime = jobs.filter((j) => j.jobType === "PART_TIME").length;
    const remote = jobs.filter((j) => j.isRemote).length;
    return { total, internships, partTime, remote };
  }, [jobs]);

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return "Kelishuv asosida";
    if (min && max) {
      return `${(min / 1000000).toFixed(1)} - ${(max / 1000000).toFixed(1)} mln UZS`;
    }
    if (min) return `${(min / 1000000).toFixed(1)} mln UZS dan`;
    return `${(max! / 1000000).toFixed(1)} mln UZS gacha`;
  };

  const getJobTypeLabel = (type: string) => {
    switch (type) {
      case "INTERNSHIP":
        return { label: "Amaliyot / Internship", color: "bg-emerald-900/80 text-emerald-200 border-emerald-500/40" };
      case "PART_TIME":
        return { label: "Part-time (Darsdan so'ng)", color: "bg-purple-900/80 text-purple-200 border-purple-500/40" };
      case "FULL_TIME":
        return { label: "Full-time", color: "bg-blue-900/80 text-blue-200 border-blue-500/40" };
      case "REMOTE":
        return { label: "Masofaviy (Remote)", color: "bg-sky-900/80 text-sky-200 border-sky-500/40" };
      default:
        return { label: type, color: "bg-zinc-800 text-zinc-300 border-zinc-700" };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* 3D HERO SECTION */}
      <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden glass-3d border border-emerald-500/20 perspective-1000">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Talabalar & Bitiruvchilar Karyera Markazi</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Karyerangizni Boshlang —{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Ish, Amaliyot & CV
            </span>
          </h1>

          <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
            Dars jadvaliga mos qulay grafikli ishlar, IT Park va top kompaniyalarda to&apos;lanadigan stajirovkalar
            hamda talabalik profilingiz asosida 1-bosishda tayyor bo&apos;luvchi professional rezyume generatori.
          </p>

          {/* 3D Statistik bloklar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4">
            <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md text-left">
              <div className="text-2xl font-black text-emerald-400">{stats.total} ta</div>
              <div className="text-xs text-zinc-400 font-medium">Faol Vakansiyalar</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md text-left">
              <div className="text-2xl font-black text-teal-400">{stats.internships} ta</div>
              <div className="text-xs text-zinc-400 font-medium">Stajirovkalar</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md text-left">
              <div className="text-2xl font-black text-purple-400">{stats.partTime} ta</div>
              <div className="text-xs text-zinc-400 font-medium">Part-Time Ishlar</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md text-left">
              <div className="text-2xl font-black text-sky-400">{stats.remote} ta</div>
              <div className="text-xs text-zinc-400 font-medium">Masofaviy (Remote)</div>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER & BOSHQARUV TUGMALARI */}
      <div className="space-y-4">
        <div className="p-4 sm:p-5 rounded-2xl glass-3d border border-zinc-800/90 shadow-xl space-y-4">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
            {/* Qidiruv */}
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Kasb nomi, kompaniya, shahar yoki texnologiya (React, Python)..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-700/80 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Asosiy harakatlar: CV Generator va Yangi vakansiya */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsResumeModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>Rezyume (CV) Yaratish</span>
              </button>

              <button
                onClick={() => {
                  if (!currentUser) {
                    alert("Iltimos, vakansiya joylash uchun avval tizimga kiring!");
                    return;
                  }
                  setIsAddModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Vakansiya Joylash</span>
              </button>
            </div>
          </div>

          {/* Kategoriya va qo'shimcha filtrlar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/80">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setJobType("ALL")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  jobType === "ALL"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                    : "bg-zinc-900/70 text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                Barchasi ({jobs.length})
              </button>
              <button
                onClick={() => setJobType("INTERNSHIP")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  jobType === "INTERNSHIP"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                    : "bg-zinc-900/70 text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                🎯 Stajirovka (Internship)
              </button>
              <button
                onClick={() => setJobType("PART_TIME")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  jobType === "PART_TIME"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                    : "bg-zinc-900/70 text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                ⏱️ Part-Time
              </button>
              <button
                onClick={() => setJobType("FULL_TIME")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  jobType === "FULL_TIME"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                    : "bg-zinc-900/70 text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                💼 Full-Time
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRemoteOnly(!isRemoteOnly)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  isRemoteOnly
                    ? "bg-sky-500/20 text-sky-300 border-sky-500 shadow-md shadow-sky-500/20"
                    : "bg-zinc-900/70 text-zinc-400 border-zinc-800 hover:text-sky-400"
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                <span>Masofaviy (Remote)</span>
              </button>

              <button
                onClick={() => setHasSalaryOnly(!hasSalaryOnly)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  hasSalaryOnly
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-md shadow-emerald-500/20"
                    : "bg-zinc-900/70 text-zinc-400 border-zinc-800 hover:text-emerald-400"
                }`}
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Faqat maoshli</span>
              </button>

              <button
                onClick={() => setBookmarksOnly(!bookmarksOnly)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  bookmarksOnly
                    ? "bg-amber-500/20 text-amber-300 border-amber-500 shadow-md shadow-amber-500/20"
                    : "bg-zinc-900/70 text-zinc-400 border-zinc-800 hover:text-amber-400"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                <span>Saqlanganlar ({bookmarks.length})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* VAKANSIYALAR RO'YXATI (3D KARTALAR) */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-80 rounded-3xl glass-3d border border-zinc-800/80 animate-pulse bg-zinc-900/40 p-6 space-y-4"
            >
              <div className="h-12 w-12 bg-zinc-800/60 rounded-xl" />
              <div className="h-6 w-3/4 bg-zinc-800/60 rounded-lg" />
              <div className="h-4 w-1/2 bg-zinc-800/60 rounded-lg" />
              <div className="h-20 bg-zinc-800/60 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-20 px-4 glass-3d rounded-3xl border border-zinc-800 max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
            <Briefcase className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">Hech qanday vakansiya topilmadi</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Qidiruv so&apos;rovingizni o&apos;zgartirib ko&apos;ring yoki yangi vakansiya e&apos;lon qiling.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setJobType("ALL");
              setIsRemoteOnly(false);
              setHasSalaryOnly(false);
              setBookmarksOnly(false);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md"
          >
            Filtrlarni tozalash
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((j) => {
            const isBookmarked = bookmarks.includes(j.id);
            const typeConfig = getJobTypeLabel(j.jobType);

            return (
              <div
                key={j.id}
                onClick={() => setSelectedJob(j)}
                className="group relative rounded-3xl glass-3d border border-zinc-800/90 hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer shadow-xl hover:-translate-y-2 hover:shadow-emerald-500/10 p-6"
              >
                {/* Tepada kompaniya logosi va nishonlar */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-emerald-400 shadow-md">
                        {j.companyLogo ? (
                          <img src={j.companyLogo} alt={j.companyName} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-bold">
                          <span>{j.companyName}</span>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-0.5">
                          <MapPin className="w-3 h-3 text-zinc-500" />
                          <span className="truncate max-w-[150px]">{j.location || "Toshkent"}</span>
                          {j.isRemote && (
                            <span className="text-sky-400 font-medium ml-1">· Masofaviy</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => toggleBookmark(j.id, e)}
                      aria-label="Vakansiyani saqlash"
                      className={`p-2 rounded-xl backdrop-blur-md transition-all border ${
                        isBookmarked
                          ? "bg-amber-500 text-zinc-950 border-amber-400 scale-105"
                          : "bg-zinc-900/80 text-zinc-400 border-zinc-700/80 hover:text-white hover:bg-zinc-800"
                      }`}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="w-4 h-4 fill-zinc-950" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Sarlavha */}
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border backdrop-blur-md ${typeConfig.color}">
                      {typeConfig.label}
                    </div>
                    <h2 className="text-base font-extrabold text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                      {j.title}
                    </h2>
                  </div>

                  {/* Qisqa tavsif */}
                  <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed font-normal">
                    {j.description}
                  </p>

                  {/* Talab qilinadigan texnologiyalar / skills */}
                  {j.requirements && j.requirements.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {j.requirements.slice(0, 3).map((r, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300 font-mono truncate max-w-[180px]"
                        >
                          {r}
                        </span>
                      ))}
                      {j.requirements.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-500 font-mono">
                          +{j.requirements.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Pastki qism: Maosh va tugma */}
                <div className="pt-4 mt-4 flex items-center justify-between border-t border-zinc-800/80">
                  <div className="space-y-0.5">
                    <div className="text-[10px] text-zinc-400 font-medium">Oylik maosh:</div>
                    <div className="text-xs font-black text-emerald-400">
                      {formatSalary(j.salaryMin, j.salaryMax)}
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
                    <span>Batafsil</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3D VAKANSIYA TAFSILOTLARI MODALI */}
      {selectedJob && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => {
            setSelectedJob(null);
            setApplySuccess(false);
          }}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl glass-3d border border-emerald-500/40 p-6 sm:p-8 space-y-6 shadow-2xl bg-zinc-950 text-white transform transition-all animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setSelectedJob(null);
                setApplySuccess(false);
              }}
              className="absolute top-5 right-5 p-2 rounded-full bg-zinc-900/80 border border-zinc-700/80 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all z-20"
              aria-label="Yopish"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Sarlavha qismi */}
            <div className="flex items-start gap-4 pr-10">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg">
                {selectedJob.companyLogo ? (
                  <img src={selectedJob.companyLogo} alt={selectedJob.companyName} className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-8 h-8" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-zinc-300">{selectedJob.companyName}</span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Tasdiqlangan</span>
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">{selectedJob.title}</h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                    {selectedJob.location || "Toshkent"}
                  </span>
                  {selectedJob.isRemote && (
                    <span className="text-sky-400 font-semibold flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5" />
                      Masofaviy (Remote)
                    </span>
                  )}
                  <span className="text-zinc-500">· {new Date(selectedJob.createdAt).toLocaleDateString("uz-UZ")}</span>
                </div>
              </div>
            </div>

            {/* Maosh va sharoitlar kartasi */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                <div className="text-[11px] text-zinc-400">Oylik maosh</div>
                <div className="text-sm font-black text-emerald-400 mt-0.5">
                  {formatSalary(selectedJob.salaryMin, selectedJob.salaryMax)}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                <div className="text-[11px] text-zinc-400">Bandlik turi</div>
                <div className="text-sm font-bold text-zinc-200 mt-0.5">
                  {selectedJob.jobType}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 col-span-2 sm:col-span-1">
                <div className="text-[11px] text-zinc-400">Qabul muddati</div>
                <div className="text-sm font-bold text-zinc-200 mt-0.5">
                  {selectedJob.deadline ? new Date(selectedJob.deadline).toLocaleDateString("uz-UZ") : "Ochiq"}
                </div>
              </div>
            </div>

            {/* Tavsif */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-zinc-300">Vakansiya haqida</h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800/80 whitespace-pre-line">
                {selectedJob.description}
              </p>
            </div>

            {/* Talablar */}
            {selectedJob.requirements && selectedJob.requirements.length > 0 && (
              <div className="space-y-2.5">
                <h3 className="text-sm font-bold text-zinc-300">Talablar va vazifalar</h3>
                <div className="space-y-1.5">
                  {selectedJob.requirements.map((req, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ariza muvaffaqiyat bildirishnomasi */}
            {applySuccess && (
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500 text-emerald-200 text-xs sm:text-sm flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  Arizangiz muvaffaqiyatli topshirildi! Rezyumengiz ish beruvchiga yuborildi.
                </span>
              </div>
            )}

            {/* Ariza topshirish tugmalari */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-zinc-800">
              {selectedJob.applyUrl ? (
                <a
                  href={selectedJob.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 group transition-all"
                >
                  <span>Ariza Topshirish (Rasmiy / Telegram)</span>
                  <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              ) : (
                <button
                  onClick={() => setApplySuccess(true)}
                  className="w-full sm:flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>StudentHub Profili orqali Ariza Qoldirish</span>
                </button>
              )}

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => toggleBookmark(selectedJob.id)}
                  className={`flex-1 sm:flex-none p-3 rounded-2xl border transition-all flex items-center justify-center gap-2 text-xs font-bold ${
                    bookmarks.includes(selectedJob.id)
                      ? "bg-amber-500/20 text-amber-300 border-amber-500"
                      : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white"
                  }`}
                >
                  {bookmarks.includes(selectedJob.id) ? (
                    <>
                      <BookmarkCheck className="w-4 h-4" />
                      <span>Saqlangan</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4" />
                      <span>Saqlash</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleShare(selectedJob)}
                  className="flex-1 sm:flex-none p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-2 text-xs font-bold"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{copiedId === selectedJob.id ? "Nusxalandi!" : "Ulashish"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3D AVTOMATIK REZYUME (PDF CV) GENERATOR MODALI */}
      {isResumeModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
          onClick={() => setIsResumeModalOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl glass-3d border border-teal-500/40 p-6 sm:p-8 space-y-6 shadow-2xl bg-zinc-950 text-white transform transition-all animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Talaba Rezyumesi (Avtomatik CV)</h3>
                  <p className="text-xs text-zinc-400">
                    Profilingiz ma&apos;lumotlari asosida yaratilgan professional A4 rezyume
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-teal-600/30 transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Chop etish / PDF</span>
                </button>
                <button
                  onClick={() => setIsResumeModalOpen(false)}
                  className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* A4 FORMATDAGI REZYUME QOLIBI */}
            <div
              id="student-cv-template"
              className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-6 sm:p-8 space-y-6 text-zinc-200 shadow-inner"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
                <div>
                  <h1 className="text-2xl font-black text-white">
                    {currentUser?.name || "Talaba Ism Familiyasi"}
                  </h1>
                  <p className="text-sm font-semibold text-emerald-400 mt-0.5">
                    {currentUser?.major || "Axborot Texnologiyalari va Dasturiy Injiniring"}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    {currentUser?.university?.name || "Toshkent Axborot Texnologiyalari Universiteti"} ·{" "}
                    {currentUser?.academicYear || 3}-bosqich talabasi
                  </p>
                </div>

                <div className="space-y-1 text-xs text-zinc-300 sm:text-right font-mono">
                  <div>📧 {currentUser?.email || "talaba@studenthub.uz"}</div>
                  {currentUser?.telegramUsername && (
                    <div>✈️ Telegram: @{currentUser.telegramUsername.replace("@", "")}</div>
                  )}
                  {currentUser?.githubUrl && (
                    <div className="truncate max-w-[200px]">🐙 GitHub: {currentUser.githubUrl}</div>
                  )}
                  {currentUser?.linkedinUrl && (
                    <div className="truncate max-w-[200px]">💼 LinkedIn: {currentUser.linkedinUrl}</div>
                  )}
                </div>
              </div>

              {/* Bio / Maqsad */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-teal-400">
                  Karyera Maqsadi & Qisqacha Tavsif
                </h4>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800/80">
                  {currentUser?.bio ||
                    "Universitetda o'rgangan nazariy bilimlarimni amaliy loyihalarda qo'llash, zamonaviy texnologiyalar ustida ishlash va jamoada tajribali mentorlar ko'magida kuchli mutaxassis sifatida shakllanishga intilaman."}
                </p>
              </div>

              {/* Ta'lim */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-teal-400">
                  Ta&apos;lim & Universitet
                </h4>
                <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-start justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">
                      {currentUser?.university?.name || "Toshkent Axborot Texnologiyalari Universiteti"}
                    </div>
                    <div className="text-xs text-zinc-400">
                      Fakultet: {currentUser?.faculty?.name || "Kompyuter Injiniringi"}
                    </div>
                    <div className="text-xs text-zinc-400">
                      Yo&apos;nalish: {currentUser?.major || "Dasturiy Ta'minot"} ({currentUser?.academicYear || 3}-kurs)
                    </div>
                  </div>
                  <span className="text-xs font-mono text-zinc-500">2022 — 2026</span>
                </div>
              </div>

              {/* Ko'nikmalar */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-teal-400">
                  Texnik & Amaliy Ko&apos;nikmalar (Skills)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(currentUser?.skills && currentUser.skills.length > 0
                    ? currentUser.skills
                    : ["JavaScript", "TypeScript", "React", "Next.js", "Tailwind CSS", "Git", "SQL", "Problem Solving"]
                  ).map((s: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg bg-teal-950/40 border border-teal-500/30 text-teal-200 text-xs font-semibold"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Ma&apos;lumotlarni o&apos;zgartirish uchun profilingizni tahrirlashingiz mumkin.</span>
              <Link
                href="/profile"
                className="text-teal-400 hover:underline font-bold"
              >
                Profilni tahrirlash &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 3D YANGI VAKANSIYA QO'SHISH MODALI */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl glass-3d border border-emerald-500/40 p-6 sm:p-8 space-y-6 shadow-2xl bg-zinc-950 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-black text-white">Yangi Vakansiya Joylash</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateJob} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-zinc-300 font-bold mb-1">Lavozim nomi *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Masalan: Junior Frontend Dasturchi"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Kompaniya nomi *</label>
                  <input
                    type="text"
                    required
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="Masalan: Uzum, IT Park, Payme"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Bandlik turi</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="INTERNSHIP">Stajirovka (Internship)</option>
                    <option value="PART_TIME">Part-time</option>
                    <option value="FULL_TIME">Full-time</option>
                    <option value="REMOTE">Masofaviy (Remote)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Manzil / Shahar</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Toshkent, Yunusobod"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="remote-check"
                    checked={newIsRemote}
                    onChange={(e) => setNewIsRemote(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-zinc-900 border-zinc-700"
                  />
                  <label htmlFor="remote-check" className="text-zinc-300 text-xs font-semibold cursor-pointer">
                    Masofaviy ishlash mumkin (Remote)
                  </label>
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Maks maosh (UZS)</label>
                  <input
                    type="number"
                    value={newSalaryMax}
                    onChange={(e) => setNewSalaryMax(e.target.value ? Number(e.target.value) : "")}
                    placeholder="6000000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">Vakansiya tavsifi *</label>
                <textarea
                  required
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Kompaniya, ish sharoitlari va vazifalar haqida yozing..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">
                  Talablar ro&apos;yxati (Har bir qatorga bittadan talab)
                </label>
                <textarea
                  rows={3}
                  value={newRequirements}
                  onChange={(e) => setNewRequirements(e.target.value)}
                  placeholder="HTML, CSS, JS bilimi&#10;Git bilan ishlash&#10;Ingliz tili B1+"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">Ariza / Telegram havola</label>
                <input
                  type="text"
                  value={newApplyUrl}
                  onChange={(e) => setNewApplyUrl(e.target.value)}
                  placeholder="https://t.me/hr_uzum yoki https://company.uz/careers"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Joylanmoqda..." : "Vakansiyani Chop Etish"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center text-zinc-400">
          Yuklanmoqda...
        </div>
      }
    >
      <JobsContent />
    </Suspense>
  );
}
