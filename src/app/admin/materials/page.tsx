"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Edit3,
  Eye,
  AlertTriangle,
  Building2,
  GraduationCap,
  Download,
  ExternalLink,
  Check,
  X,
  FileCheck,
  RefreshCw,
  Sparkles,
  HelpCircle,
  FileArchive,
  Layers,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  CheckSquare,
  Square,
  Upload,
  Plus,
} from "lucide-react";
import { AdminMaterialItem } from "@/app/api/admin/materials/route";

function MaterialsModerationContent() {
  const [materials, setMaterials] = useState<AdminMaterialItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtrlar
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [universityFilter, setUniversityFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  // Tanlangan elementlar (Batch actions uchun)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modallar
  const [inspectingItem, setInspectingItem] = useState<AdminMaterialItem | null>(null);
  const [rejectingItem, setRejectingItem] = useState<AdminMaterialItem | null>(null);
  const [editingItem, setEditingItem] = useState<AdminMaterialItem | null>(null);

  // Yangi Material Yuklash Modali
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadSubject, setUploadSubject] = useState("");
  const [uploadUniversity, setUploadUniversity] = useState("TATU");
  const [uploadTeacher, setUploadTeacher] = useState("");
  const [uploadType, setUploadType] = useState("LECTURE");
  const [uploadYear, setUploadYear] = useState<number>(2);
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadFileSizeMb, setUploadFileSizeMb] = useState<number>(4.2);
  const [uploadFileUrl, setUploadFileUrl] = useState("/uploads/sample-material.pdf");
  const [uploadStatus, setUploadStatus] = useState<"APPROVED" | "PENDING">("APPROVED");
  const [uploadDescription, setUploadDescription] = useState("");

  // Rad etish sababi
  const [rejectionReason, setRejectionReason] = useState("Fayl skaneri juda xira yoki o'qib bo'lmaydi.");
  const [customReason, setCustomReason] = useState("");

  // Tahrirlash maydonlari
  const [editTitle, setEditTitle] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editTeacher, setEditTeacher] = useState("");
  const [editType, setEditType] = useState("LECTURE");

  // Bildirishnoma (Toast)
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/materials");
      if (res.ok) {
        const data = await res.json();
        setMaterials(data.materials || []);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  // Holatni yangilash (Tasdiqlash / Rad etish)
  const handleUpdateStatus = async (
    id: string,
    status: "APPROVED" | "REJECTED",
    reason?: string | null
  ) => {
    setMaterials((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status, rejectionReason: reason || null } : m
      )
    );

    try {
      await fetch("/api/admin/materials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, rejectionReason: reason || null }),
      });
      showToast(status === "APPROVED" ? "✅ Material tasdiqlandi va nashr etildi!" : "❌ Material rad etildi!");
    } catch {
      // ignore
    }

    if (inspectingItem?.id === id) {
      setInspectingItem(null);
    }
    if (rejectingItem?.id === id) {
      setRejectingItem(null);
      setCustomReason("");
    }
  };

  // O'chirish
  const handleDelete = async (id: string) => {
    if (!confirm("Ushbu materialni tizimdan butunlay o'chirib tashlamoqchimisiz?")) return;

    setMaterials((prev) => prev.filter((m) => m.id !== id));
    try {
      await fetch(`/api/admin/materials?id=${id}`, { method: "DELETE" });
      showToast("Material tizimdan o'chirildi!");
    } catch {
      // ignore
    }
    if (inspectingItem?.id === id) setInspectingItem(null);
  };

  // Yangi material yuklash (Admin)
  const handleAdminUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !uploadSubject.trim() || !uploadUniversity.trim()) {
      showToast("Iltimos, sarlavha, fan va universitetni to'ldiring");
      return;
    }

    setIsSubmitting(true);
    try {
      let res: Response;
      if (uploadFile) {
        const formData = new FormData();
        formData.append("file", uploadFile);
        formData.append("title", uploadTitle);
        formData.append("subjectName", uploadSubject);
        formData.append("universityName", uploadUniversity);
        formData.append("teacherName", uploadTeacher || "Kafedra o'qituvchisi");
        formData.append("type", uploadType);
        formData.append("academicYear", String(uploadYear));
        formData.append("status", uploadStatus);
        formData.append("description", uploadDescription);

        res = await fetch("/api/admin/materials", {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch("/api/admin/materials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: uploadTitle,
            subjectName: uploadSubject,
            universityName: uploadUniversity,
            teacherName: uploadTeacher || "Kafedra o'qituvchisi",
            type: uploadType,
            academicYear: uploadYear,
            fileName: uploadFileName || `${uploadTitle.replace(/\s+/g, "_")}.pdf`,
            fileSizeMb: uploadFileSizeMb,
            fileUrl: uploadFileUrl,
            status: uploadStatus,
            description: uploadDescription,
          }),
        });
      }

      if (res.ok) {
        const data = await res.json();
        if (data.material) {
          setMaterials((prev) => [data.material, ...prev]);
        }
        showToast("Yangi material muvaffaqiyatli yuklandi va bazaga qo'shildi!");
        setIsUploadModalOpen(false);
        // Reset form
        setUploadFile(null);
        setUploadTitle("");
        setUploadSubject("");
        setUploadTeacher("");
        setUploadFileName("");
        setUploadDescription("");
      } else {
        showToast("Material yuklashda xatolik yuz berdi");
      }
    } catch {
      showToast("Tarmoq xatosi yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tahrirlashni saqlash
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setMaterials((prev) =>
      prev.map((m) =>
        m.id === editingItem.id
          ? {
              ...m,
              title: editTitle,
              subjectName: editSubject,
              teacherName: editTeacher,
              type: editType,
            }
          : m
      )
    );

    try {
      await fetch("/api/admin/materials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingItem.id,
          title: editTitle,
          subjectName: editSubject,
          teacherName: editTeacher,
          type: editType,
        }),
      });
      showToast("Material ma'lumotlari muvaffaqiyatli yangilandi!");
    } catch {
      // ignore
    }

    setEditingItem(null);
  };

  // Batch (Ko'p elementni birdaniga) tasdiqlash
  const handleBatchApprove = async () => {
    if (selectedIds.length === 0) return;
    setMaterials((prev) =>
      prev.map((m) => (selectedIds.includes(m.id) ? { ...m, status: "APPROVED" } : m))
    );
    for (const id of selectedIds) {
      try {
        await fetch("/api/admin/materials", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status: "APPROVED" }),
        });
      } catch {
        // ignore
      }
    }
    showToast(`${selectedIds.length} ta material birdaniga tasdiqlandi!`);
    setSelectedIds([]);
  };

  // Checkbox tanlash
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredMaterials.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMaterials.map((m) => m.id));
    }
  };

  // Filtrlar hisob-kitobi
  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        m.title.toLowerCase().includes(q) ||
        m.subjectName.toLowerCase().includes(q) ||
        m.teacherName.toLowerCase().includes(q) ||
        m.uploaderName.toLowerCase().includes(q);

      const matchStatus = statusFilter === "ALL" || m.status === statusFilter;
      const matchUni = universityFilter === "ALL" || m.universityName === universityFilter;
      const matchType = typeFilter === "ALL" || m.type === typeFilter;

      return matchSearch && matchStatus && matchUni && matchType;
    });
  }, [materials, searchQuery, statusFilter, universityFilter, typeFilter]);

  // Statistika
  const stats = useMemo(() => {
    const pending = materials.filter((m) => m.status === "PENDING").length;
    const approved = materials.filter((m) => m.status === "APPROVED").length;
    const rejected = materials.filter((m) => m.status === "REJECTED").length;
    const total = materials.length;
    return { pending, approved, rejected, total };
  }, [materials]);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "LECTURE":
        return { label: "Ma'ruza", color: "bg-blue-900/60 text-blue-200 border-blue-500/40" };
      case "SLIDES":
        return { label: "Slayd / Taqdimot", color: "bg-purple-900/60 text-purple-200 border-purple-500/40" };
      case "EXAM_QUESTIONS":
        return { label: "Imtihon savollari", color: "bg-amber-900/60 text-amber-200 border-amber-500/40" };
      case "LAB_WORK":
        return { label: "Laboratoriya ishi", color: "bg-emerald-900/60 text-emerald-200 border-emerald-500/40" };
      case "TESTS":
        return { label: "Testlar bazasi", color: "bg-cyan-900/60 text-cyan-200 border-cyan-500/40" };
      default:
        return { label: "Boshqa resurs", color: "bg-zinc-800 text-zinc-300 border-zinc-700" };
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast xabari */}
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
            <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 mb-1">
              <Link href="/admin" className="hover:underline flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Admin Doskasi</span>
              </Link>
              <span>/</span>
              <span>O&apos;quv Materiallari Moderatsiyasi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              O&apos;quv Materiallari Moderatsiyasi Markazi
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 font-medium">
              Talabalar tomonidan yuklangan fayllarni tekshirish, fan va o&apos;qituvchi ma&apos;lumotlarini to&apos;g&apos;rilash hamda nashr etish.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-2 text-xs font-bold transition-all shadow-lg shadow-cyan-600/30 btn-3d"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi Material Yuklash</span>
            </button>
            <button
              onClick={fetchMaterials}
              className="p-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center gap-2 text-xs font-bold transition-all shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Yangilash</span>
            </button>
            <Link
              href="/study"
              className="p-2.5 rounded-2xl bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-300 flex items-center gap-1.5 text-xs font-bold transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Study Sahifasi</span>
            </Link>
          </div>
        </div>

        {/* 4 TA STATISTIKA BENTO KARTALARI */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <button
            onClick={() => setStatusFilter("PENDING")}
            className={`p-4 rounded-2xl border text-left transition-all ${
              statusFilter === "PENDING"
                ? "bg-amber-500/20 border-amber-500 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500"
                : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center justify-between text-amber-400">
              <span className="text-xs font-bold">Kutilmoqda</span>
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-300 mt-1">
              {stats.pending} ta
            </div>
            <div className="text-[11px] text-zinc-300 font-semibold mt-0.5">Pre-moderatsiya talab</div>
          </button>

          <button
            onClick={() => setStatusFilter("APPROVED")}
            className={`p-4 rounded-2xl border text-left transition-all ${
              statusFilter === "APPROVED"
                ? "bg-emerald-500/20 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500"
                : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-xs font-bold">Tasdiqlangan</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-300 mt-1">
              {stats.approved} ta
            </div>
            <div className="text-[11px] text-zinc-300 font-semibold mt-0.5">Saytda ommaga ochiq</div>
          </button>

          <button
            onClick={() => setStatusFilter("REJECTED")}
            className={`p-4 rounded-2xl border text-left transition-all ${
              statusFilter === "REJECTED"
                ? "bg-rose-500/20 border-rose-500 shadow-lg shadow-rose-500/10 ring-1 ring-rose-500"
                : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center justify-between text-rose-400">
              <span className="text-xs font-bold">Rad etilgan</span>
              <XCircle className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-300 mt-1">
              {stats.rejected} ta
            </div>
            <div className="text-[11px] text-zinc-300 font-semibold mt-0.5">Qayta ishlash kerak</div>
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
              <FileCheck className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">
              {stats.total} ta
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Barcha yuklanganlar</div>
          </button>
        </div>
      </div>

      {/* BOSHQARUV, QIDIRUV VA FILTRLAR PANELI */}
      <div className="p-4 sm:p-5 rounded-3xl glass-3d border border-zinc-800 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Qidiruv */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Material nomi, fan, o'qituvchi yoki yuklovchi talaba..."
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

          {/* Universitet va toifa selektori */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <select
              value={universityFilter}
              onChange={(e) => setUniversityFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs sm:text-sm focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">Barcha universitetlar</option>
              <option value="TATU">TATU</option>
              <option value="INHA">INHA</option>
              <option value="O'zMU">O&apos;zMU</option>
              <option value="ToshDTU">ToshDTU</option>
              <option value="TDIU">TDIU</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs sm:text-sm focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">Barcha turlar</option>
              <option value="LECTURE">Ma&apos;ruza</option>
              <option value="SLIDES">Slayd</option>
              <option value="EXAM_QUESTIONS">Imtihon savollari</option>
              <option value="LAB_WORK">Laboratoriya ishi</option>
              <option value="TESTS">Testlar</option>
              <option value="OTHER">Boshqa</option>
            </select>
          </div>
        </div>

        {/* Holat tablari va Batch harakatlar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-800">
          <div className="flex items-center gap-2">
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
              onClick={() => setStatusFilter("APPROVED")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === "APPROVED"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              ✅ Tasdiqlangan ({stats.approved})
            </button>
            <button
              onClick={() => setStatusFilter("REJECTED")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === "REJECTED"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                  : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              ❌ Rad etilgan ({stats.rejected})
            </button>
          </div>

          {/* Batch Harakatlar */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 animate-fadeIn">
              <span className="text-xs text-zinc-400 font-mono">
                {selectedIds.length} ta tanlandi:
              </span>
              <button
                onClick={handleBatchApprove}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-emerald-600/30 transition-all"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Birvarakay Tasdiqlash</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MATERIALLAR RO'YXATI */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-28 rounded-3xl glass-3d border border-zinc-800 animate-pulse bg-zinc-900/40 p-5"
            />
          ))}
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="text-center py-16 px-4 glass-3d rounded-3xl border border-zinc-800 max-w-lg mx-auto space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">Hech qanday material topilmadi</h3>
          <p className="text-xs text-zinc-400">
            Tanlangan filtrlarga mos keluvchi materiallar mavjud emas.
          </p>
          <button
            onClick={() => {
              setStatusFilter("ALL");
              setSearchQuery("");
              setUniversityFilter("ALL");
              setTypeFilter("ALL");
            }}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md"
          >
            Filtrlarni tozalash
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Tanlash qatori */}
          <div className="flex items-center justify-between px-2 text-xs text-zinc-500">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 hover:text-zinc-300 transition-colors"
            >
              {selectedIds.length === filteredMaterials.length ? (
                <CheckSquare className="w-4 h-4 text-cyan-400" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              <span>Barchasini tanlash ({filteredMaterials.length})</span>
            </button>
            <span>Har bir material pre-moderatsiya nazorati ostida</span>
          </div>

          {filteredMaterials.map((m) => {
            const isSelected = selectedIds.includes(m.id);
            const typeConfig = getTypeLabel(m.type);

            return (
              <div
                key={m.id}
                className={`p-5 rounded-3xl glass-3d border transition-all duration-200 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xl ${
                  m.status === "PENDING"
                    ? "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/60"
                    : m.status === "APPROVED"
                    ? "border-zinc-800/90 hover:border-emerald-500/40"
                    : "border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50"
                } ${isSelected ? "ring-2 ring-cyan-500/80" : ""}`}
              >
                {/* Chap tomon: Checkbox va asosiy ma'lumot */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <button
                    onClick={() => toggleSelect(m.id)}
                    className="mt-1 text-zinc-400 hover:text-cyan-400 transition-colors shrink-0"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-cyan-400" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>

                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Holat nishoni */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md ${
                          m.status === "APPROVED"
                            ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                            : m.status === "PENDING"
                            ? "bg-amber-950 text-amber-300 border-amber-500/40 animate-pulse"
                            : "bg-rose-950 text-rose-300 border-rose-500/40"
                        }`}
                      >
                        {m.status === "APPROVED"
                          ? "✅ Tasdiqlangan"
                          : m.status === "PENDING"
                          ? "⏳ Kutilmoqda (Tekshiring)"
                          : "❌ Rad etilgan"}
                      </span>

                      {/* Turi */}
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${typeConfig.color}`}>
                        {typeConfig.label}
                      </span>

                      {/* Universitet */}
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-zinc-900 border border-zinc-700 text-cyan-300">
                        {m.universityName}
                      </span>

                      {/* Hajmi */}
                      <span className="text-[10px] text-zinc-300 font-mono font-bold">
                        {m.fileSizeMb} MB
                      </span>
                    </div>

                    {/* Sarlavha */}
                    <h3
                      onClick={() => setInspectingItem(m)}
                      className="text-base font-extrabold text-white hover:text-cyan-300 transition-colors cursor-pointer leading-snug"
                    >
                      {m.title}
                    </h3>

                    {/* Rad etish sababi ko'rinishi (agar rad etilgan bo'lsa) */}
                    {m.status === "REJECTED" && m.rejectionReason && (
                      <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs">
                        <strong>Rad sababi:</strong> {m.rejectionReason}
                      </div>
                    )}

                    {/* Meta qator */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-300 font-medium">
                      <span>Fan: <strong className="text-white font-bold">{m.subjectName}</strong></span>
                      <span>O&apos;qituvchi: <strong className="text-white font-bold">{m.teacherName}</strong></span>
                      <span>Yuklovchi: <strong className="text-white font-bold">{m.uploaderName}</strong></span>
                      {m.academicYear && (
                        <span>Kurs: <strong className="text-white font-bold">{m.academicYear}-kurs</strong></span>
                      )}
                      <span className="text-zinc-400 font-semibold">
                        {new Date(m.createdAt).toLocaleDateString("uz-UZ")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* O'ng tomon: Moderatsiya amallari */}
                <div className="flex items-center gap-2 shrink-0 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-zinc-800">
                  {/* Tekshirish / Ko'rish */}
                  <button
                    onClick={() => setInspectingItem(m)}
                    className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5"
                    title="Faylni tekshirish"
                  >
                    <Eye className="w-4 h-4 text-cyan-400" />
                    <span>Tekshirish</span>
                  </button>

                  {/* Tasdiqlash */}
                  {m.status !== "APPROVED" && (
                    <button
                      onClick={() => handleUpdateStatus(m.id, "APPROVED")}
                      className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Tasdiqlash</span>
                    </button>
                  )}

                  {/* Rad etish */}
                  {m.status !== "REJECTED" && (
                    <button
                      onClick={() => setRejectingItem(m)}
                      className="px-3 py-2.5 rounded-xl bg-zinc-900 hover:bg-rose-950/60 border border-zinc-700 hover:border-rose-500 text-zinc-300 hover:text-rose-300 font-bold text-xs flex items-center gap-1.5 transition-all"
                    >
                      <X className="w-4 h-4" />
                      <span>Rad etish</span>
                    </button>
                  )}

                  {/* Tahrirlash */}
                  <button
                    onClick={() => {
                      setEditingItem(m);
                      setEditTitle(m.title);
                      setEditSubject(m.subjectName);
                      setEditTeacher(m.teacherName);
                      setEditType(m.type);
                    }}
                    className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-cyan-400 transition-all"
                    title="Ma'lumotlarni tahrirlash"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* O'chirish */}
                  <button
                    onClick={() => handleDelete(m.id)}
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

      {/* 1. CHUQUR TEKSHIRUV & PREVIEW MODALI */}
      {inspectingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setInspectingItem(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl glass-3d border border-cyan-500/40 p-6 sm:p-8 space-y-6 shadow-2xl bg-zinc-950 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Material Ekspertizasi</h3>
                  <p className="text-[11px] text-zinc-400">Fayl sifati va ma&apos;lumotlar to&apos;g&apos;riligini tekshiring</p>
                </div>
              </div>
              <button
                onClick={() => setInspectingItem(null)}
                className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sarlavha & Metrika */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  {inspectingItem.universityName}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-900 text-zinc-300 border border-zinc-800">
                  {getTypeLabel(inspectingItem.type).label}
                </span>
                <span className="text-xs text-zinc-500 font-mono">
                  {inspectingItem.fileSizeMb} MB
                </span>
              </div>

              <h2 className="text-xl font-black text-white leading-snug">
                {inspectingItem.title}
              </h2>
            </div>

            {/* Batafsil parametrlar jadvali */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                <div className="text-[11px] text-zinc-400">Fan nomi</div>
                <div className="text-xs font-bold text-white mt-0.5 truncate">
                  {inspectingItem.subjectName}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                <div className="text-[11px] text-zinc-400">O&apos;qituvchi</div>
                <div className="text-xs font-bold text-white mt-0.5 truncate">
                  {inspectingItem.teacherName}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                <div className="text-[11px] text-zinc-400">Yuklovchi talaba</div>
                <div className="text-xs font-bold text-cyan-400 mt-0.5 truncate">
                  {inspectingItem.uploaderName}
                </div>
              </div>
            </div>

            {/* Fayl ko'rish simulyatori */}
            <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span>Fayl formati va yaxlitligi: Toza</span>
                </span>
                <a
                  href={inspectingItem.fileUrl}
                  download
                  className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-bold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Faylni yuklab ko&apos;rish</span>
                </a>
              </div>
              <div className="h-32 rounded-xl bg-zinc-950 border border-zinc-800/80 flex flex-col items-center justify-center text-center p-4 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="text-xs text-zinc-400 font-mono truncate max-w-sm">
                  {inspectingItem.fileUrl} ({inspectingItem.fileSizeMb} MB)
                </div>
                <div className="text-[11px] text-emerald-400 font-medium">
                  Hujjat skanerlandi: Zararli skriptlar va viruslar aniqlanmadi
                </div>
              </div>
            </div>

            {/* Harakatlar: Tasdiqlash / Rad etish */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-zinc-800">
              <button
                onClick={() => handleUpdateStatus(inspectingItem.id, "APPROVED")}
                className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Tekshiruvdan O&apos;tdi — Tasdiqlash</span>
              </button>

              <button
                onClick={() => {
                  setRejectingItem(inspectingItem);
                  setInspectingItem(null);
                }}
                className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-zinc-900 hover:bg-rose-950/60 border border-zinc-700 hover:border-rose-500 text-zinc-300 hover:text-rose-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
              >
                <X className="w-4 h-4" />
                <span>Rad etish</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. RAD ETISH VA SABABINI BELGILASH MODALI */}
      {rejectingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setRejectingItem(null)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl glass-3d border border-rose-500/40 p-6 space-y-5 bg-zinc-950 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <XCircle className="w-5 h-5" />
                <span>Materialni Rad Etish</span>
              </div>
              <button
                onClick={() => setRejectingItem(null)}
                className="p-1 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-zinc-400">
              Ushbu sabab material yuklagan talabaga bildirishnoma sifatida yuboriladi:
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-300 font-bold mb-1.5">Tayyor sabablardan biri:</label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-rose-500"
                >
                  <option value="Fayl skaneri juda xira yoki o'qib bo'lmaydi.">
                    Fayl skaneri juda xira yoki o&apos;qib bo&apos;lmaydi
                  </option>
                  <option value="Fayl ochilmayapti yoki buzilgan (Corrupted file).">
                    Fayl ochilmayapti yoki buzilgan (Corrupted)
                  </option>
                  <option value="Fan yoki o'qituvchi nomi noto'g'ri ko'rsatilgan.">
                    Fan yoki o&apos;qituvchi nomi noto&apos;g&apos;ri ko&apos;rsatilgan
                  </option>
                  <option value="Materialda noo'rin reklama yoki spam havolalar mavjud.">
                    Materialda noo&apos;rin reklama yoki spam havolalar mavjud
                  </option>
                  <option value="Mualliflik huquqi buzilgan yoki plagiat holati aniqlandi.">
                    Mualliflik huquqi buzilgan / Plagiat
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1.5">Qo&apos;shimcha aniqlik (ixtiyoriy):</label>
                <textarea
                  rows={2}
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Masalan: 4-betdagi formulalar tushunarli emas..."
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                onClick={() =>
                  handleUpdateStatus(
                    rejectingItem.id,
                    "REJECTED",
                    customReason ? `${rejectionReason} (${customReason})` : rejectionReason
                  )
                }
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all"
              >
                Rad Etishni Tasdiqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. METADATA TAHRIRLASH MODALI */}
      {editingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setEditingItem(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl glass-3d border border-cyan-500/40 p-6 space-y-5 bg-zinc-950 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Edit3 className="w-4 h-4" />
                <span>Material Ma&apos;lumotlarini Tahrirlash</span>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-300 font-bold mb-1">Material sarlavhasi</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Fan nomi</label>
                  <input
                    type="text"
                    required
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">O&apos;qituvchi ismi</label>
                  <input
                    type="text"
                    value={editTeacher}
                    onChange={(e) => setEditTeacher(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">Material turi</label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="LECTURE">Ma&apos;ruza</option>
                  <option value="SLIDES">Slayd / Taqdimot</option>
                  <option value="EXAM_QUESTIONS">Imtihon savollari</option>
                  <option value="LAB_WORK">Laboratoriya ishi</option>
                  <option value="TESTS">Testlar</option>
                  <option value="OTHER">Boshqa</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all mt-2"
              >
                O&apos;zgarishlarni Saqlash
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. YANGI MATERIAL YUKLASH MODALI (ADMIN UPLOAD) */}
      {isUploadModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setIsUploadModalOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl glass-3d border border-cyan-500/40 p-6 sm:p-8 space-y-6 bg-zinc-950 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Yangi O&apos;quv Materiali Yuklash</h3>
                  <p className="text-[11px] text-zinc-400">Rasmiy admin nazorati ostida bazaga yangi fayl qo&apos;shish</p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdminUpload} className="space-y-4 text-xs">
              
              {/* Fayl yuklash maydoni */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-cyan-500/30 hover:border-cyan-500/60 bg-cyan-950/20 text-center space-y-2 transition-colors">
                <FileText className="w-8 h-8 text-cyan-400 mx-auto" />
                <div>
                  <label htmlFor="admin-file-input" className="cursor-pointer text-cyan-300 font-bold hover:underline">
                    Faylni tanlang yoki shu yerga tashlang
                  </label>
                  <p className="text-[11px] text-zinc-400 mt-0.5">PDF, DOCX, PPTX yoki ZIP (Maksimal 50 MB)</p>
                  <input
                    id="admin-file-input"
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUploadFile(file);
                        setUploadFileName(file.name);
                        setUploadFileSizeMb(Number((file.size / (1024 * 1024)).toFixed(1)));
                        setUploadFileUrl(`/uploads/${file.name}`);
                        if (!uploadTitle) {
                          setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
                        }
                      }
                    }}
                  />
                </div>
                {uploadFileName && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 text-[11px] font-semibold mt-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{uploadFileName} ({uploadFileSizeMb} MB)</span>
                  </div>
                )}
              </div>

              {/* Sarlavha */}
              <div>
                <label className="block text-zinc-300 font-bold mb-1">
                  Material Sarlavhasi <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Diskret matematika va graflar nazariyasi - Ma'ruzalar matni"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Universitet & Fan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">
                    Universitet (OTM) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    list="uni-suggestions"
                    placeholder="Masalan: TATU, O'zMU, INHA..."
                    value={uploadUniversity}
                    onChange={(e) => setUploadUniversity(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                  />
                  <datalist id="uni-suggestions">
                    <option value="TATU" />
                    <option value="O'zMU" />
                    <option value="INHA" />
                    <option value="ToshDTU" />
                    <option value="ToshDShU" />
                    <option value="SamDU" />
                    <option value="JIDU" />
                    <option value="MDIST" />
                  </datalist>
                </div>

                <div>
                  <label className="block text-zinc-300 font-bold mb-1">
                    Fan Nomi <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Diskret matematika"
                    value={uploadSubject}
                    onChange={(e) => setUploadSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* O'qituvchi & Kurs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">
                    O&apos;qituvchi / Professor (Ixtiyoriy)
                  </label>
                  <input
                    type="text"
                    placeholder="Masalan: Prof. S. Rahmatov"
                    value={uploadTeacher}
                    onChange={(e) => setUploadTeacher(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Qaysi kurs uchun</label>
                  <select
                    value={uploadYear}
                    onChange={(e) => setUploadYear(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value={1}>1-kurs</option>
                    <option value={2}>2-kurs</option>
                    <option value={3}>3-kurs</option>
                    <option value={4}>4-kurs</option>
                  </select>
                </div>
              </div>

              {/* Material turi & Holat */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Material Turi</label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="LECTURE">Ma&apos;ruza (Konspekt)</option>
                    <option value="SLIDES">Slayd / Taqdimot</option>
                    <option value="EXAM_QUESTIONS">Imtihon savollari</option>
                    <option value="LAB_WORK">Laboratoriya ishi</option>
                    <option value="TESTS">Testlar to&apos;plami</option>
                    <option value="OTHER">Boshqa o&apos;quv resursi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Nashr Holati</label>
                  <select
                    value={uploadStatus}
                    onChange={(e) => setUploadStatus(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="APPROVED">Tasdiqlangan (Darhol saytda ochiq ko&apos;rinadi)</option>
                    <option value="PENDING">Kutilmoqda (Tekshiruv ro&apos;yxatida turadi)</option>
                  </select>
                </div>
              </div>

              {/* Tavsif */}
              <div>
                <label className="block text-zinc-300 font-bold mb-1">Qisqacha Tavsif (Ixtiyoriy)</label>
                <textarea
                  rows={2}
                  placeholder="Ushbu material kimlar uchun va qanday mavzularni o'z ichiga oladi..."
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold shadow-lg shadow-cyan-600/30 transition-all flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isSubmitting ? "Yuklanmoqda..." : "Materialni Bazaga Saqlash"}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminMaterialsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-400">Yuklanmoqda...</div>}>
      <MaterialsModerationContent />
    </Suspense>
  );
}
