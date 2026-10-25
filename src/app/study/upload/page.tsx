"use client";

import Link from "next/link";
import {
  ShieldAlert,
  ArrowLeft,
  Lock,
  ExternalLink,
  BookOpen,
  CheckCircle,
} from "lucide-react";

export default function UploadRestrictedPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24">
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-2xl text-center space-y-6">
        
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-inner">
          <Lock className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Admin Ruxsati Talab Qilinadi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Material Yuklash Faqat Admin Paneldan Amalga Oshiriladi
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Akademik sifat va xavfsizlikni ta'minlash maqsadida, o'quv materiallari faqat administratorlar va OTM moderatorlari tomonidan Admin Panel orqali tekshirilib yuklanadi.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 text-left text-xs text-slate-600 dark:text-slate-300 space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>Agar siz administrator bo'lsangiz, Admin paneldagi <strong>"O'quv Materiallari"</strong> bo'limiga o'ting va yangi material kiriting.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>Talabalar tasdiqlangan rasmiy materiallarni to'g'ridan-to'g'ri o'qish va yuklab olish imkoniyatiga ega.</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/admin/materials"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-lg shadow-cyan-600/20 transition-all"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Admin Panelga O'tish</span>
          </Link>
          <Link
            href="/study"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Katalogga Qaytish</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
