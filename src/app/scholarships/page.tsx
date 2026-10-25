"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import Link from "next/link";
import {
  Award,
  Search,
  SlidersHorizontal,
  Calendar,
  Clock,
  Globe,
  GraduationCap,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ExternalLink,
  Share2,
  AlertTriangle,
  Sparkles,
  DollarSign,
  Building2,
  MapPin,
  ChevronRight,
  Flame,
  X,
  FileCheck,
  Info,
  Check,
  Filter,
} from "lucide-react";

interface Scholarship {
  id: string;
  title: string;
  organization: string;
  country: string;
  category: "INTERNATIONAL" | "NATIONAL" | "UNIVERSITY";
  degree: string;
  coverage: string;
  requirements: string[];
  deadline: string;
  officialUrl: string;
  imageUrl?: string;
  description: string;
  daysLeft: number;
  isUrgent: boolean;
  isExpired: boolean;
}

function ScholarshipsContent() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtrlash holatlari
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("ALL");
  const [degree, setDegree] = useState<string>("ALL");
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [bookmarksOnly, setBookmarksOnly] = useState(false);

  // Saqlanganlar (Bookmarks)
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Tanlangan grant (Modal uchun)
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);

  // Modal ichidagi interaktiv checklist (har bir grant uchun foydalanuvchi belgilagan talablar)
  const [checkedRequirements, setCheckedRequirements] = useState<Record<string, Record<number, boolean>>>({});

  // Dastlabki yuklash
  useEffect(() => {
    // LocalStorage dan bookmarklarni o'qish
    try {
      const saved = localStorage.getItem("student_hub_scholarship_bookmarks");
      if (saved) {
        setBookmarks(JSON.parse(saved));
      }
    } catch {
      // ignore
    }

    fetchScholarships();
  }, []);

  const fetchScholarships = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/scholarships");
      if (res.ok) {
        const data = await res.json();
        setScholarships(data.scholarships || []);
      }
    } catch (err) {
      console.error("Grantlarni yuklashda xatolik:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Bookmark qo'shish / o'chirish
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
        localStorage.setItem("student_hub_scholarship_bookmarks", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Havola ulashish
  const handleShare = (s: Scholarship, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = window.location.origin + `/scholarships?id=${s.id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(s.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Checkbox bosilganda
  const toggleRequirement = (scholarshipId: string, index: number) => {
    setCheckedRequirements((prev) => {
      const currentSch = prev[scholarshipId] || {};
      return {
        ...prev,
        [scholarshipId]: {
          ...currentSch,
          [index]: !currentSch[index],
        },
      };
    });
  };

  // Filtrlangan grantlar
  const filteredScholarships = useMemo(() => {
    return scholarships.filter((s) => {
      // Qidiruv
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.organization.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q) ||
        s.coverage.toLowerCase().includes(q);

      // Kategoriya
      const matchCat = category === "ALL" || s.category === category;

      // Daraja
      const matchDeg = degree === "ALL" || s.degree.includes(degree);

      // Shoshilinch
      const matchUrgent = !urgentOnly || s.isUrgent;

      // Saqlanganlar
      const matchBookmarked = !bookmarksOnly || bookmarks.includes(s.id);

      return matchSearch && matchCat && matchDeg && matchUrgent && matchBookmarked;
    });
  }, [scholarships, search, category, degree, urgentOnly, bookmarksOnly, bookmarks]);

  // Statistika
  const stats = useMemo(() => {
    const total = scholarships.length;
    const international = scholarships.filter((s) => s.category === "INTERNATIONAL").length;
    const urgent = scholarships.filter((s) => s.isUrgent).length;
    return { total, international, urgent };
  }, [scholarships]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* 3D HERO SECTION */}
      <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden glass-3d border border-purple-500/20 perspective-1000">
        {/* Orqa fon nur effekti */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/25 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Xalqaro & Milliy Grantlar Portali</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Kelajagingizni Moliyalashtiring —{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
              3D Grantlar & Stipendiyalar
            </span>
          </h1>

          <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
            Dunyoning top universitetlari, elchixonalar, davlat jamg&apos;armalari hamda OTMlarning 100% kontrakt, yashash
            stipendiyasi va aviachipta bilan ta&apos;minlovchi tasdiqlangan grant dasturlari. Muddatlarni boy bermang!
          </p>

          {/* 3D Statistik bloklar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4">
            <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md text-left">
              <div className="text-2xl font-black text-purple-400">{stats.total} ta</div>
              <div className="text-xs text-zinc-400 font-medium">Faol Dasturlar</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md text-left">
              <div className="text-2xl font-black text-blue-400">{stats.international} ta</div>
              <div className="text-xs text-zinc-400 font-medium">Global Grantlar</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md text-left">
              <div className="text-2xl font-black text-emerald-400">100%</div>
              <div className="text-xs text-zinc-400 font-medium">To&apos;liq Qoplov</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-rose-500/30 bg-rose-500/5 backdrop-blur-md text-left">
              <div className="text-2xl font-black text-rose-400 flex items-center gap-1">
                <Flame className="w-5 h-5 text-rose-500" />
                <span>{stats.urgent} ta</span>
              </div>
              <div className="text-xs text-rose-300/80 font-medium">&le; 14 kun qolgan</div>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER & QIDIRUV BOSHQARUVI */}
      <div className="space-y-4">
        <div className="p-4 sm:p-5 rounded-2xl glass-3d border border-zinc-800/90 shadow-xl space-y-4">
          {/* Qidiruv qatori va saralash */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Grant nomi, tashkilot, davlat yoki imtiyoz bo'yicha qidiring..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-700/80 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
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

            {/* Daraja selektori */}
            <div className="flex items-center gap-2">
              <div className="relative min-w-[170px]">
                <select
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  aria-label="Ta'lim darajasini tanlang"
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-700/80 text-zinc-200 text-sm focus:outline-none focus:border-purple-500 transition-all cursor-pointer appearance-none pr-8"
                >
                  <option value="ALL">Barcha darajalar</option>
                  <option value="Bakalavr">Bakalavr</option>
                  <option value="Magistratura">Magistratura</option>
                  <option value="PhD">PhD / Doktorantura</option>
                </select>
                <ChevronRight className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Kategoriya tablari va shoshilinch/saqlanganlar tugmalari */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/80">
            {/* Kategoriya tugmalari */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setCategory("ALL")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  category === "ALL"
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                    : "bg-zinc-900/70 text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                🌐 Barchasi ({scholarships.length})
              </button>
              <button
                onClick={() => setCategory("INTERNATIONAL")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  category === "INTERNATIONAL"
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                    : "bg-zinc-900/70 text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                ✈️ Xalqaro Grantlar
              </button>
              <button
                onClick={() => setCategory("NATIONAL")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  category === "NATIONAL"
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                    : "bg-zinc-900/70 text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                🇺🇿 Davlat & Milliy
              </button>
              <button
                onClick={() => setCategory("UNIVERSITY")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  category === "UNIVERSITY"
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                    : "bg-zinc-900/70 text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                🏛️ OTM Ichki Chegirmalari
              </button>
            </div>

            {/* Qo'shimcha filtrlar */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setUrgentOnly(!urgentOnly)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  urgentOnly
                    ? "bg-rose-500/20 text-rose-300 border-rose-500 shadow-md shadow-rose-500/20"
                    : "bg-zinc-900/70 text-zinc-400 border-zinc-800 hover:text-rose-400"
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>Shoshilinch (&le;14 kun)</span>
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

      {/* GRANTLAR RO'YXATI (3D KARTALAR) */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-96 rounded-3xl glass-3d border border-zinc-800/80 animate-pulse bg-zinc-900/40 p-6 space-y-4"
            >
              <div className="h-44 bg-zinc-800/60 rounded-2xl" />
              <div className="h-6 w-3/4 bg-zinc-800/60 rounded-lg" />
              <div className="h-4 w-1/2 bg-zinc-800/60 rounded-lg" />
              <div className="h-12 bg-zinc-800/60 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredScholarships.length === 0 ? (
        <div className="text-center py-20 px-4 glass-3d rounded-3xl border border-zinc-800 max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto shadow-inner">
            <Award className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">Hech qanday grant topilmadi</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Qidiruv so&apos;rovini o&apos;zgartirib ko&apos;ring yoki tanlangan filtrlarni qayta sozlang.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setCategory("ALL");
              setDegree("ALL");
              setUrgentOnly(false);
              setBookmarksOnly(false);
            }}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md"
          >
            Filtrlarni tozalash
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScholarships.map((s) => {
            const isBookmarked = bookmarks.includes(s.id);
            const deadlineDate = new Date(s.deadline).toLocaleDateString("uz-UZ", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <div
                key={s.id}
                onClick={() => setSelectedScholarship(s)}
                className="group relative rounded-3xl glass-3d border border-zinc-800/90 hover:border-purple-500/50 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer shadow-xl hover:-translate-y-2 hover:shadow-purple-500/10"
              >
                {/* Tepada rasm va holat nishonlari */}
                <div className="relative h-44 w-full overflow-hidden bg-zinc-950">
                  <img
                    src={s.imageUrl || "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80"}
                    alt={s.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

                  {/* Kategoriya nishoni */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold backdrop-blur-md shadow-md border ${
                        s.category === "INTERNATIONAL"
                          ? "bg-purple-900/80 text-purple-200 border-purple-500/40"
                          : s.category === "NATIONAL"
                          ? "bg-blue-900/80 text-blue-200 border-blue-500/40"
                          : "bg-emerald-900/80 text-emerald-200 border-emerald-500/40"
                      }`}
                    >
                      {s.category === "INTERNATIONAL"
                        ? "✈️ Xalqaro"
                        : s.category === "NATIONAL"
                        ? "🇺🇿 Davlat"
                        : "🏛️ OTM"}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-900/80 text-zinc-200 backdrop-blur-md border border-zinc-700/60">
                      {s.country}
                    </span>
                  </div>

                  {/* Bookmark tugmasi */}
                  <button
                    onClick={(e) => toggleBookmark(s.id, e)}
                    aria-label="Grantni saqlash"
                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all shadow-md border ${
                      isBookmarked
                        ? "bg-amber-500 text-zinc-950 border-amber-400 scale-105"
                        : "bg-zinc-900/70 text-zinc-300 border-zinc-700/80 hover:text-white hover:bg-zinc-800"
                    }`}
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="w-4 h-4 fill-zinc-950" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>

                  {/* Muddat signali (Urgency Pill) */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border ${
                        s.isUrgent
                          ? "bg-rose-950/90 text-rose-300 border-rose-500 shadow-lg shadow-rose-900/50 animate-pulse"
                          : s.isExpired
                          ? "bg-zinc-900/90 text-zinc-400 border-zinc-700"
                          : "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {s.isExpired
                          ? "Muddati tugagan"
                          : s.isUrgent
                          ? `Shoshiling! ${s.daysLeft} kun qoldi`
                          : `${s.daysLeft} kun qoldi`}
                      </span>
                    </div>

                    <span className="text-[11px] text-zinc-400 bg-zinc-900/80 px-2 py-0.5 rounded-md font-mono">
                      {deadlineDate}
                    </span>
                  </div>
                </div>

                {/* Asosiy kontent */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-purple-400 font-medium">
                      <Building2 className="w-3.5 h-3.5" />
                      <span className="truncate">{s.organization}</span>
                    </div>
                    <h2 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2">
                      {s.title}
                    </h2>
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {s.description}
                    </p>
                  </div>

                  {/* Qoplov detallari */}
                  <div className="p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Moliyaviy Qamrov</span>
                    </div>
                    <div className="text-xs font-semibold text-zinc-200 line-clamp-2">
                      {s.coverage}
                    </div>
                  </div>

                  {/* Pastki qism: Daraja va tugma */}
                  <div className="pt-2 flex items-center justify-between border-t border-zinc-800/80">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <GraduationCap className="w-4 h-4 text-purple-400" />
                      <span>{s.degree}</span>
                    </div>

                    <div className="inline-flex items-center gap-1 text-xs font-bold text-purple-400 group-hover:text-purple-300">
                      <span>Batafsil</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3D GRANT CHUQUR MODALI */}
      {selectedScholarship && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setSelectedScholarship(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl glass-3d border border-purple-500/40 p-6 sm:p-8 space-y-6 shadow-2xl bg-zinc-950 text-white transform transition-all animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal yopish */}
            <button
              onClick={() => setSelectedScholarship(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-zinc-900/80 border border-zinc-700/80 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all z-20"
              aria-label="Yopish"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal rasm va sarlavha */}
            <div className="relative h-48 -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 rounded-t-3xl overflow-hidden bg-zinc-900">
              <img
                src={selectedScholarship.imageUrl}
                alt={selectedScholarship.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
              
              <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-900/90 text-purple-200 border border-purple-500/40 mb-2">
                    {selectedScholarship.category === "INTERNATIONAL"
                      ? "✈️ Xalqaro Grant"
                      : selectedScholarship.category === "NATIONAL"
                      ? "🇺🇿 Davlat Granti"
                      : "🏛️ OTM Ichki Granti"}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {selectedScholarship.title}
                  </h2>
                </div>
              </div>
            </div>

            {/* Tashkilot, davlat va muddat */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                <div className="text-[11px] text-zinc-400">Tashkilot</div>
                <div className="text-xs font-bold text-zinc-200 truncate mt-0.5">
                  {selectedScholarship.organization}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                <div className="text-[11px] text-zinc-400">Hudud / Davlat</div>
                <div className="text-xs font-bold text-zinc-200 truncate mt-0.5">
                  {selectedScholarship.country}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 col-span-2 sm:col-span-1">
                <div className="text-[11px] text-zinc-400">Oxirgi muddat</div>
                <div
                  className={`text-xs font-bold truncate mt-0.5 ${
                    selectedScholarship.isUrgent ? "text-rose-400 font-black" : "text-emerald-400"
                  }`}
                >
                  {selectedScholarship.daysLeft > 0
                    ? `${selectedScholarship.daysLeft} kun qoldi`
                    : "Muddati tugagan"}
                </div>
              </div>
            </div>

            {/* Tavsif */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                <Info className="w-4 h-4 text-purple-400" />
                <span>Dastur Haqida</span>
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed bg-zinc-900/40 p-3.5 rounded-2xl border border-zinc-800/80">
                {selectedScholarship.description}
              </p>
            </div>

            {/* Moliyaviy imtiyozlar */}
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <DollarSign className="w-4 h-4" />
                <span>Nimalar To&apos;liq Qoplanadi:</span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-emerald-200">
                {selectedScholarship.coverage}
              </p>
            </div>

            {/* Interaktiv Talablar Cheklisti */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-blue-400" />
                  <span>Talablar & Hujjatlar Cheklisti</span>
                </h3>
                <span className="text-[11px] text-purple-400 font-mono">
                  {Object.values(checkedRequirements[selectedScholarship.id] || {}).filter(Boolean).length} /{" "}
                  {selectedScholarship.requirements.length} bajarildi
                </span>
              </div>

              <div className="space-y-2">
                {selectedScholarship.requirements.map((req, idx) => {
                  const isChecked = !!checkedRequirements[selectedScholarship.id]?.[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleRequirement(selectedScholarship.id, idx)}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                        isChecked
                          ? "bg-purple-950/40 border-purple-500/60 text-purple-200"
                          : "bg-zinc-900/60 border-zinc-800/80 text-zinc-300 hover:border-zinc-700"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 transition-colors ${
                          isChecked
                            ? "bg-purple-600 text-white"
                            : "border border-zinc-600 bg-zinc-800 text-transparent"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span className={`text-xs sm:text-sm ${isChecked ? "line-through opacity-80" : ""}`}>
                        {req}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Harakatlar: Ariza topshirish, Saqlash, Ulashish */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-zinc-800">
              <a
                href={selectedScholarship.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 group transition-all"
              >
                <span>Rasmiy Saytda Ariza Topshirish</span>
                <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => toggleBookmark(selectedScholarship.id)}
                  className={`flex-1 sm:flex-none p-3 rounded-2xl border transition-all flex items-center justify-center gap-2 text-xs font-bold ${
                    bookmarks.includes(selectedScholarship.id)
                      ? "bg-amber-500/20 text-amber-300 border-amber-500"
                      : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white"
                  }`}
                >
                  {bookmarks.includes(selectedScholarship.id) ? (
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
                  onClick={() => handleShare(selectedScholarship)}
                  className="flex-1 sm:flex-none p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-2 text-xs font-bold"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{copiedId === selectedScholarship.id ? "Nusxalandi!" : "Ulashish"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grant taklif qilish va Ma'lumot banneri */}
      <div className="rounded-3xl p-6 sm:p-8 glass-3d border border-purple-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 text-xs font-bold">
            <Award className="w-3.5 h-3.5" />
            <span>OTM yoki Tashkilot vakilimisiz?</span>
          </div>
          <h3 className="text-xl font-bold text-white">Yangi Grant yoki Chegirmani e&apos;lon qiling</h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
            Talabalar uchun yangi stipendiya dasturi, ichki OTM chegirmasi yoki xalqaro grant haqida ma&apos;lumot bormi?
            Bizga yuboring, tekshiruvdan o&apos;tgach platformaga bepul joylaymiz.
          </p>
        </div>
        <a
          href="https://t.me/studenthub_admin"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-xs sm:text-sm transition-all whitespace-nowrap shadow-lg"
        >
          Grant Tavsiya Qilish (Telegram)
        </a>
      </div>
    </div>
  );
}

export default function ScholarshipsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center text-zinc-400">
          Yuklanmoqda...
        </div>
      }
    >
      <ScholarshipsContent />
    </Suspense>
  );
}
