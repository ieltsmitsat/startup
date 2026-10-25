"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  BookOpen,
  Filter,
  Search,
  Download,
  Star,
  ShieldCheck,
  FileText,
  Calendar,
  Eye,
  SlidersHorizontal,
  X,
  ExternalLink,
  ThumbsUp,
} from "lucide-react";
import { formatBytes, formatDate } from "@/lib/utils";

function StudyContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialType = searchParams.get("type") || "";

  const [materials, setMaterials] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Quick Preview Modal state (impeccable standard)
  const [previewMaterial, setPreviewMaterial] = useState<any | null>(null);

  // Filter holatlari
  const [search, setSearch] = useState(initialSearch);
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedType, setSelectedType] = useState(initialType);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    async function loadUniversities() {
      try {
        const res = await fetch("/api/universities");
        if (res.ok) {
          const data = await res.json();
          setUniversities(data.universities || []);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadUniversities();
  }, []);

  useEffect(() => {
    async function fetchMaterials() {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.set("search", search);
        if (selectedUniversity) queryParams.set("universityId", selectedUniversity);
        if (selectedFaculty) queryParams.set("facultyId", selectedFaculty);
        if (selectedSubject) queryParams.set("subjectId", selectedSubject);
        if (selectedType) queryParams.set("materialType", selectedType);
        if (sortBy) queryParams.set("sortBy", sortBy);

        const res = await fetch(`/api/study/materials?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setMaterials(data.materials || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchMaterials();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, selectedUniversity, selectedFaculty, selectedSubject, selectedType, sortBy]);

  const currentFaculties =
    universities.find((u) => u.id === selectedUniversity)?.faculties || [];

  const currentSubjects =
    currentFaculties.find((f: any) => f.id === selectedFaculty)?.subjects || [];

  const materialTypes = [
    { value: "", label: "Barchasi" },
    { value: "LECTURE", label: "Ma'ruzalar" },
    { value: "SLIDES", label: "Slaydlar" },
    { value: "EXAM_QUESTIONS", label: "Imtihon savollari" },
    { value: "LAB_WORK", label: "Laboratoriya ishlari" },
    { value: "TESTS", label: "Testlar" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs tracking-wider uppercase">
            <BookOpen className="w-4 h-4" />
            <span>Akademik Katalog</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            O'quv Materiallari Bazasi
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-200 font-medium mt-1">
            OTMlar va fanlar kesimida tartiblangan rasmiy ma'ruzalar, slaydlar va nazorat savollari.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Admin tomonidan tasdiqlangan rasmiy baza</span>
        </div>
      </div>

      {/* Filterlar paneli */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        
        {/* Qidiruv va Saralash */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Fan nomi, mavzu yoki domla familiyasi bo'yicha qidiruv..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full py-2.5 px-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="newest">Eng yangi qo'shilganlar</option>
              <option value="popular">Eng ko'p ko'rilganlar</option>
              <option value="downloads">Eng ko'p yuklanganlar</option>
            </select>
          </div>
        </div>

        {/* Iyerarxik Filterlar: OTM -> Fakultet -> Fan */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">Universitet (OTM):</label>
            <select
              value={selectedUniversity}
              onChange={(e) => {
                setSelectedUniversity(e.target.value);
                setSelectedFaculty("");
                setSelectedSubject("");
              }}
              className="w-full py-2 px-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="">Barcha OTMlar</option>
              {universities.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">Fakultet:</label>
            <select
              value={selectedFaculty}
              disabled={!selectedUniversity}
              onChange={(e) => {
                setSelectedFaculty(e.target.value);
                setSelectedSubject("");
              }}
              className="w-full py-2 px-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500 disabled:opacity-50"
            >
              <option value="">Barcha Fakultetlar</option>
              {currentFaculties.map((f: any) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">Fan:</label>
            <select
              value={selectedSubject}
              disabled={!selectedFaculty}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full py-2 px-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500 disabled:opacity-50"
            >
              <option value="">Barcha Fanlar</option>
              {currentSubjects.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Material Turi bo'yicha filter tugmalari */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mr-1">Turi:</span>
          {materialTypes.map((t) => (
            <button
              key={t.value}
              onClick={() => setSelectedType(t.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedType === t.value
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

      </div>

      {/* Rich Document Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-56 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse"
            />
          ))}
        </div>
      ) : materials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 uppercase">
                    {item.materialType}
                  </span>
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{item.avgRating || "Yangi"}</span>
                    {item.reviewsCount > 0 && (
                      <span className="text-slate-400 font-normal">({item.reviewsCount})</span>
                    )}
                  </div>
                </div>

                <h3
                  onClick={() => setPreviewMaterial(item)}
                  className="font-extrabold text-lg text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2 leading-snug cursor-pointer transition-colors"
                >
                  {item.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-200 font-normal mt-2 line-clamp-2 leading-relaxed">
                  {item.description || "Ushbu material uchun batafsil tavsif kiritilmagan."}
                </p>

                {/* University Crest Pill */}
                <div className="mt-3.5 flex flex-wrap gap-1.5 text-[11px] font-bold">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold">
                    {item.subject?.faculty?.university?.name || "OTM"}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold">
                    {item.subject?.name}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                    {item.author?.name?.charAt(0) || "U"}
                  </div>
                  <span className="truncate max-w-[120px] font-bold text-slate-900 dark:text-white">
                    {item.author?.name}
                  </span>
                  {item.author?.isVerified && (
                    <span title="Tasdiqlangan talaba">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPreviewMaterial(item)}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Ko'rish
                  </button>
                  <span className="font-extrabold text-slate-700 dark:text-slate-300 uppercase">
                    {item.fileType}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Ushbu filter bo'yicha materiallar topilmadi
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Boshqa fan yoki OTMni tanlab ko'ring yoki qidiruv so'zini o'zgartiring.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setSelectedUniversity("");
              setSelectedFaculty("");
              setSelectedSubject("");
              setSelectedType("");
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filtrlarni tozalash</span>
          </button>
        </div>
      )}

      {/* Quick Preview Modal (impeccable standard: fast preview without navigation) */}
      {previewMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setPreviewMaterial(null)}
              className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 uppercase">
                {previewMaterial.materialType}
              </span>
              <span className="text-xs text-slate-400">
                {previewMaterial.fileType.toUpperCase()} • {formatBytes(previewMaterial.fileSize)}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {previewMaterial.title}
            </h2>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 space-y-1.5 font-medium">
              <p><span className="font-bold text-slate-500 dark:text-slate-400">Universitet:</span> {previewMaterial.subject?.faculty?.university?.name}</p>
              <p><span className="font-bold text-slate-500 dark:text-slate-400">Fan:</span> {previewMaterial.subject?.name}</p>
              {previewMaterial.teacherName && (
                <p><span className="font-bold text-slate-500 dark:text-slate-400">O'qituvchi:</span> {previewMaterial.teacherName}</p>
              )}
            </div>

            <p className="text-sm text-slate-700 dark:text-slate-100 leading-relaxed whitespace-pre-line font-normal">
              {previewMaterial.description || "Material haqida qisqacha tavsif kiritilmagan."}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {previewMaterial.avgRating || "Yangi"}
                </span>
                <span className="text-xs text-slate-400">
                  ({previewMaterial.reviewsCount || 0} ta sharh)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/study/${previewMaterial.id}`}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Batafsil & Sharhlar</span>
                </Link>

                <a
                  href={previewMaterial.fileUrl}
                  download={previewMaterial.fileName}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Yuklab olish</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function StudyPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Materiallar yuklanmoqda...</p>
        </div>
      }
    >
      <StudyContent />
    </Suspense>
  );
}
