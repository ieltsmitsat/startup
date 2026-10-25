"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Search,
  Filter,
  Check,
  X,
  ExternalLink,
  RefreshCw,
  Sparkles,
  MessageSquare,
  FileText,
  Briefcase,
  BookMarked,
  UserX,
  ArrowLeft,
  Flame,
  ChevronRight,
  Eye,
  AlertOctagon,
  UserCheck,
  Flag,
} from "lucide-react";
import { ExtendedAdminReport } from "@/app/api/admin/reports/route";

function ReportsModerationContent() {
  const [reports, setReports] = useState<ExtendedAdminReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtrlar
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");
  const [targetTypeFilter, setTargetTypeFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Tanlangan shikoyat (Chuqur ekspertiza va chora ko'rish modali)
  const [inspectingReport, setInspectingReport] = useState<ExtendedAdminReport | null>(null);

  // Qaror qabul qilish formalari
  const [chosenAction, setChosenAction] = useState<string>("Kontent darhol tizimdan o'chirildi");
  const [adminNotes, setAdminNotes] = useState<string>("");

  // Bildirishnoma (Toast)
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/reports");
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  // Shikoyat bo'yicha chora ko'rish (Qarorni saqlash)
  const handleResolveReport = async (
    id: string,
    status: "RESOLVED" | "DISMISSED" | "INVESTIGATING",
    action?: string,
    notes?: string
  ) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              actionTaken: action || r.actionTaken,
              adminNotes: notes || r.adminNotes,
            }
          : r
      )
    );

    try {
      await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status,
          actionTaken: action || (status === "RESOLVED" ? "Chora ko'rildi" : "Asossiz deb topildi"),
          adminNotes: notes || null,
        }),
      });
      showToast(
        status === "RESOLVED"
          ? "✅ Shikoyat hal qilindi va qoidabuzarlik bartaraf etildi!"
          : status === "INVESTIGATING"
          ? "🔍 Shikoyat tekshiruvga olindi!"
          : "✖️ Shikoyat asossiz deb yopildi."
      );
    } catch {
      // ignore
    }

    if (inspectingReport?.id === id) {
      setInspectingReport(null);
      setAdminNotes("");
    }
  };

  // Shikoyatni o'chirish
  const handleDeleteReport = async (id: string) => {
    if (!confirm("Ushbu shikoyat kartochkasini ro'yxatdan o'chirmoqchimisiz?")) return;
    setReports((prev) => prev.filter((r) => r.id !== id));
    try {
      await fetch(`/api/admin/reports?id=${id}`, { method: "DELETE" });
      showToast("Shikoyat kartasi o'chirildi!");
    } catch {
      // ignore
    }
  };

  // Filtrlar
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        r.targetTitle.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q) ||
        r.details?.toLowerCase().includes(q) ||
        r.reporterName.toLowerCase().includes(q);

      const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
      const matchType = targetTypeFilter === "ALL" || r.targetType === targetTypeFilter;

      return matchSearch && matchStatus && matchType;
    });
  }, [reports, searchQuery, statusFilter, targetTypeFilter]);

  // Statistika
  const stats = useMemo(() => {
    const pending = reports.filter((r) => r.status === "PENDING").length;
    const investigating = reports.filter((r) => r.status === "INVESTIGATING").length;
    const resolved = reports.filter((r) => r.status === "RESOLVED").length;
    const total = reports.length;
    return { pending, investigating, resolved, total };
  }, [reports]);

  const getSourceIcon = (type: string) => {
    switch (type) {
      case "COMMUNITY":
        return <MessageSquare className="w-4 h-4 text-sky-400" />;
      case "STUDY":
        return <FileText className="w-4 h-4 text-amber-400" />;
      case "JOB":
        return <Briefcase className="w-4 h-4 text-emerald-400" />;
      case "BOOK":
        return <BookMarked className="w-4 h-4 text-purple-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-zinc-400" />;
    }
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
            <div className="inline-flex items-center gap-2 text-xs font-bold text-rose-400 mb-1">
              <Link href="/admin" className="hover:underline flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Admin Doskasi</span>
              </Link>
              <span>/</span>
              <span>Shikoyatlar va Xavfsizlik Nazorati</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Shikoyatlar va Moderatsiya Markazi
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Spam, haqorat, soxta vakansiyalar yoki buzilgan materiallar bo&apos;yicha talabalardan kelgan arizalarni tekshirish va qat&apos;iy chora ko&apos;rish.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchReports}
              className="p-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center gap-2 text-xs font-bold transition-all shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Yangilash</span>
            </button>
            <div className="px-3.5 py-2 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-1.5 text-xs font-bold">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Spam & Firibgarlik Filtratsiyasi</span>
            </div>
          </div>
        </div>

        {/* 4 TA STATISTIKA BENTO KARTALARI */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <button
            onClick={() => setStatusFilter("PENDING")}
            className={`p-4 rounded-2xl border text-left transition-all ${
              statusFilter === "PENDING"
                ? "bg-rose-500/20 border-rose-500 shadow-lg shadow-rose-500/10 ring-1 ring-rose-500"
                : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center justify-between text-rose-400">
              <span className="text-xs font-bold">Yangi Shikoyatlar</span>
              <AlertOctagon className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-300 mt-1">
              {stats.pending} ta
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Shoshilinch ko&apos;rib chiqish</div>
          </button>

          <button
            onClick={() => setStatusFilter("INVESTIGATING")}
            className={`p-4 rounded-2xl border text-left transition-all ${
              statusFilter === "INVESTIGATING"
                ? "bg-amber-500/20 border-amber-500 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500"
                : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center justify-between text-amber-400">
              <span className="text-xs font-bold">Tekshiruvda</span>
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-300 mt-1">
              {stats.investigating} ta
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Ekspertiza jarayonida</div>
          </button>

          <button
            onClick={() => setStatusFilter("RESOLVED")}
            className={`p-4 rounded-2xl border text-left transition-all ${
              statusFilter === "RESOLVED"
                ? "bg-emerald-500/20 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500"
                : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-xs font-bold">Hal qilinganlar</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-300 mt-1">
              {stats.resolved} ta
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Qoidabuzarlik bartaraf</div>
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
              <span className="text-xs font-bold">Barcha E&apos;tirozlar</span>
              <Flag className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">
              {stats.total} ta
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Umumiy shikoyatlar arxivi</div>
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
              placeholder="Shikoyat sababi, kontent sarlavhasi yoki shikoyatchi talaba..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-rose-500 transition-all"
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
              value={targetTypeFilter}
              onChange={(e) => setTargetTypeFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs sm:text-sm focus:outline-none focus:border-rose-500"
            >
              <option value="ALL">Barcha bo&apos;limlar</option>
              <option value="COMMUNITY">Forum (Community)</option>
              <option value="STUDY">O&apos;quv fayllar (Study)</option>
              <option value="JOB">Vakansiyalar (Jobs)</option>
              <option value="BOOK">Kitoblar (Books)</option>
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
            onClick={() => setStatusFilter("PENDING")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === "PENDING"
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                : "bg-zinc-900 text-zinc-400 hover:text-white"
            }`}
          >
            🚨 Yangi ({stats.pending})
          </button>
          <button
            onClick={() => setStatusFilter("INVESTIGATING")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === "INVESTIGATING"
                ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20"
                : "bg-zinc-900 text-zinc-400 hover:text-white"
            }`}
          >
            🔍 Tekshiruvda ({stats.investigating})
          </button>
          <button
            onClick={() => setStatusFilter("RESOLVED")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === "RESOLVED"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "bg-zinc-900 text-zinc-400 hover:text-white"
            }`}
          >
            ✔️ Hal qilingan ({stats.resolved})
          </button>
          <button
            onClick={() => setStatusFilter("DISMISSED")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === "DISMISSED"
                ? "bg-zinc-700 text-white"
                : "bg-zinc-900 text-zinc-400 hover:text-white"
            }`}
          >
            ✖️ Asossiz
          </button>
        </div>
      </div>

      {/* SHIKOYATLAR RO'YXATI */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-28 rounded-3xl glass-3d border border-zinc-800 animate-pulse bg-zinc-900/40 p-5"
            />
          ))}
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-16 px-4 glass-3d rounded-3xl border border-zinc-800 max-w-lg mx-auto space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">Shikoyatlar mavjud emas</h3>
          <p className="text-xs text-zinc-400">
            Hozirda tanlangan toifada hech qanday qoidabuzarlik yoki yangi ariza yo&apos;q.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredReports.map((r) => {
            return (
              <div
                key={r.id}
                className={`p-5 sm:p-6 rounded-3xl glass-3d border transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 shadow-xl ${
                  r.status === "PENDING"
                    ? "border-rose-500/40 bg-rose-500/5 hover:border-rose-500/70"
                    : r.status === "INVESTIGATING"
                    ? "border-amber-500/40 bg-amber-500/5 hover:border-amber-500/70"
                    : r.status === "RESOLVED"
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-zinc-800/80 bg-zinc-900/40"
                }`}
              >
                {/* Asosiy ma'lumot */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Holat */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md ${
                        r.status === "PENDING"
                          ? "bg-rose-950 text-rose-300 border-rose-500/50 animate-pulse"
                          : r.status === "INVESTIGATING"
                          ? "bg-amber-950 text-amber-300 border-amber-500/50"
                          : r.status === "RESOLVED"
                          ? "bg-emerald-950 text-emerald-300 border-emerald-500/50"
                          : "bg-zinc-800 text-zinc-400 border-zinc-700"
                      }`}
                    >
                      {r.status === "PENDING"
                        ? "🚨 Yangi Shikoyat"
                        : r.status === "INVESTIGATING"
                        ? "🔍 Tekshiruvda"
                        : r.status === "RESOLVED"
                        ? "✔️ Hal qilingan"
                        : "✖️ Asossiz"}
                    </span>

                    {/* Manba nishoni */}
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-zinc-900 border border-zinc-700 text-zinc-300">
                      {getSourceIcon(r.targetType)}
                      <span>{r.targetType}</span>
                    </span>

                    {/* Jiddiylik darajasi */}
                    {r.severity === "HIGH" && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600/30 text-rose-300 border border-rose-500/40">
                        🔥 Yuqori xavf
                      </span>
                    )}

                    <span className="text-[11px] text-zinc-500 font-mono">
                      {new Date(r.createdAt).toLocaleDateString("uz-UZ")}
                    </span>
                  </div>

                  {/* Shikoyat qilingan kontent nomi */}
                  <h3
                    onClick={() => setInspectingReport(r)}
                    className="text-base font-bold text-white hover:text-rose-300 transition-colors cursor-pointer leading-snug"
                  >
                    {r.targetTitle}
                  </h3>

                  {/* Sabab va izoh */}
                  <div className="space-y-1">
                    <div className="text-xs text-rose-300 font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                      <span>{r.reason}</span>
                    </div>

                    {r.details && (
                      <p className="text-xs text-zinc-300 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80 leading-relaxed">
                        &ldquo;{r.details}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Ko'rilgan chora haqida ma'lumot */}
                  {r.actionTaken && (
                    <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>Ko&apos;rilgan chora:</strong> {r.actionTaken}</span>
                    </div>
                  )}

                  <div className="text-[11px] text-zinc-400 flex items-center gap-2 pt-1">
                    <span>Yuborgan talaba: <strong className="text-zinc-200">{r.reporterName}</strong></span>
                    {r.targetAuthor && (
                      <>
                        <span>•</span>
                        <span>Muallif: <strong className="text-rose-400">{r.targetAuthor}</strong></span>
                      </>
                    )}
                  </div>
                </div>

                {/* Harakatlar */}
                <div className="flex items-center gap-2 shrink-0 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-zinc-800">
                  {/* Ekspertiza va Qaror modali */}
                  <button
                    onClick={() => setInspectingReport(r)}
                    className="px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Eye className="w-4 h-4 text-cyan-400" />
                    <span>Ekspertiza & Qaror</span>
                  </button>

                  {/* Tezkor Hal Qilish */}
                  {r.status !== "RESOLVED" && (
                    <button
                      onClick={() =>
                        handleResolveReport(
                          r.id,
                          "RESOLVED",
                          "Tezkor chora ko'rildi: Kontent bloklandi va tartibga keltirildi"
                        )
                      }
                      className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Hal qilindi</span>
                    </button>
                  )}

                  {/* Asossiz */}
                  {r.status === "PENDING" && (
                    <button
                      onClick={() => handleResolveReport(r.id, "DISMISSED", "Shikoyat asossiz deb topildi")}
                      className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-bold transition-all"
                      title="Asossiz deb topish"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  {/* O'chirish */}
                  <button
                    onClick={() => handleDeleteReport(r.id)}
                    className="p-2.5 rounded-xl bg-zinc-900 hover:bg-rose-950/40 border border-zinc-800 text-zinc-400 hover:text-rose-400 transition-all"
                    title="Shikoyatni o'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CHUQUR EKSPERTIZA VA MODERATSIYA QARORI MODALI */}
      {inspectingReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
          onClick={() => setInspectingReport(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl glass-3d border border-rose-500/40 p-6 sm:p-8 space-y-6 shadow-2xl bg-zinc-950 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center font-bold">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Qoidabuzarlik Ekspertizasi</h3>
                  <p className="text-[11px] text-zinc-400">Shikoyatni ko&apos;rib chiqish va qat&apos;iy chora ko&apos;rish</p>
                </div>
              </div>
              <button
                onClick={() => setInspectingReport(null)}
                className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ish tafsilotlari */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-zinc-900 border border-zinc-700 text-zinc-300">
                  Bo&apos;lim: {inspectingReport.targetType}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-rose-950 text-rose-300 border border-rose-500/40">
                  {inspectingReport.reason}
                </span>
              </div>

              <h2 className="text-xl font-black text-white leading-snug">
                {inspectingReport.targetTitle}
              </h2>

              {inspectingReport.details && (
                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1.5">
                  <div className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
                    Talabaning e&apos;tirozi:
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                    &ldquo;{inspectingReport.details}&rdquo;
                  </p>
                </div>
              )}
            </div>

            {/* Qaror qabul qilish bloki */}
            <div className="space-y-3 pt-2 border-t border-zinc-800">
              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Moderator Qarori & Ko&apos;riladigan Chora:
              </h4>

              <div className="space-y-2">
                {[
                  "Kontent darhol tizimdan butunlay o'chirildi (Delete)",
                  "Foydalanuvchiga qat'iy ogohlantirish yuborildi (Warning)",
                  "Foydalanuvchi hisobi bloklandi / to'xtatildi (Suspend)",
                  "Shikoyat asossiz deb topildi, kontent qoidalarga mos (Dismiss)",
                ].map((action, idx) => (
                  <label
                    key={idx}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      chosenAction === action
                        ? "bg-rose-950/40 border-rose-500/60 text-rose-200"
                        : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="moderationAction"
                      checked={chosenAction === action}
                      onChange={() => setChosenAction(action)}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span className="text-xs sm:text-sm font-semibold">{action}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-zinc-300 text-xs font-bold mb-1">
                  Admin xulosasi (Qaror jurnali uchun):
                </label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Xulosa va sababini yozing (masalan: STIR tekshirildi, spam tasdiqlandi)..."
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Tasdiqlash tugmalari */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-zinc-800">
              <button
                onClick={() =>
                  handleResolveReport(
                    inspectingReport.id,
                    chosenAction.includes("Dismiss") ? "DISMISSED" : "RESOLVED",
                    chosenAction,
                    adminNotes
                  )
                }
                className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Qarorni Ijro Etish & Saqlash</span>
              </button>

              <button
                onClick={() =>
                  handleResolveReport(
                    inspectingReport.id,
                    "INVESTIGATING",
                    "Qo'shimcha ekspertizaga yuborildi"
                  )
                }
                className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold text-xs sm:text-sm"
              >
                Tekshiruvga Olish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminReportsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-400">Yuklanmoqda...</div>}>
      <ReportsModerationContent />
    </Suspense>
  );
}
