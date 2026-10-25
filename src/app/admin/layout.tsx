"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  ShieldCheck,
  LayoutDashboard,
  FileText,
  AlertTriangle,
  Users,
  Briefcase,
  ExternalLink,
  LogOut,
  RefreshCw,
  Activity,
  Menu,
  X,
  Lock,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [passkeyInput, setPasskeyInput] = useState("");
  const [passkeyError, setPasskeyError] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    // 1. Session storage tekshiruvi (agar avvalroq demo yoki passkey bilan tasdiqlangan bo'lsa)
    const sessionAuth = sessionStorage.getItem("studenthub_admin_auth");
    if (sessionAuth === "granted") {
      setIsAuthorized(true);
      return;
    }

    // 2. Cookie orqali joriy foydalanuvchi huquqini tekshirish
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        if (data.user?.role === "ADMIN" || data.user?.role === "MODERATOR") {
          setIsAuthorized(true);
          sessionStorage.setItem("studenthub_admin_auth", "granted");
          return;
        }
      }
    } catch {
      // ignore
    }

    // Agar avtorizatsiyadan o'tmagan bo'lsa, xavfsizlik darvozasini ko'rsatamiz
    setIsAuthorized(false);
  };

  const handleUnlockWithPasskey = (e: React.FormEvent) => {
    e.preventDefault();
    // Standart admin maxfiy kaliti yoki demo kirish
    if (passkeyInput === "admin2026" || passkeyInput === "superadmin" || passkeyInput === "7777") {
      setIsAuthorized(true);
      sessionStorage.setItem("studenthub_admin_auth", "granted");
      setPasskeyError("");
    } else {
      setPasskeyError("Noto'g'ri maxfiy kalit kiritildi! (Maslahat: 'admin2026' yoki Demo tugmasi)");
    }
  };

  const handleDemoUnlock = () => {
    setIsAuthorized(true);
    sessionStorage.setItem("studenthub_admin_auth", "granted");
    setPasskeyError("");
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem("studenthub_admin_auth");
    setIsAuthorized(false);
  };

  // Agar yuklanayotgan bo'lsa
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-[#060911] flex items-center justify-center text-zinc-400">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <span>Admin xavfsizlik protokoli tekshirilmoqda...</span>
        </div>
      </div>
    );
  }

  // AGAR ADMIN HUQUQI TASDIQLANMAGAN BO'LSA — XAVFSIZLIK DARVOZASI
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#060911] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Fon nur effektlari */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-md p-8 rounded-3xl glass-3d border border-cyan-500/30 bg-zinc-950/90 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Himoyalangan Hudud</span>
            </div>
            <h2 className="text-2xl font-black text-white">StudentHub Admin Darvozasi</h2>
            <p className="text-xs text-zinc-400">
              Ushbu bo&apos;lim faqat tizim ma&apos;murlari (Admin va Moderatorlar) uchun mo&apos;ljallangan. Ochiq platformaga ta&apos;sir qilmaydi.
            </p>
          </div>

          {passkeyError && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-300 text-xs font-medium">
              {passkeyError}
            </div>
          )}

          <form onSubmit={handleUnlockWithPasskey} className="space-y-3 text-left">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                Admin Maxfiy Kaliti (Passkey)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={passkeyInput}
                  onChange={(e) => setPasskeyInput(e.target.value)}
                  placeholder="Maxfiy kalitni kiriting..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none focus:border-cyan-500 transition-all font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Admin Panelni Ochish</span>
            </button>
          </form>

          {/* Tezkor Demo Kirish */}
          <div className="pt-2 border-t border-zinc-800 space-y-2.5">
            <button
              onClick={handleDemoUnlock}
              className="w-full py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Bir Bosishda Demo Admin Rejimiga Kirish</span>
            </button>

            <Link
              href="/"
              className="w-full py-2 rounded-xl text-zinc-400 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ommaviy Ochiq Platformaga Qaytish</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // TO'LIQ ISOLATSIYA QILINGAN STANDALONE ADMIN COCKPIT
  return (
    <div className="min-h-screen bg-[#060911] text-zinc-100 flex flex-col antialiased">
      {/* ADMIN YUQORI HEADER / STATUS BAR */}
      <header className="sticky top-0 z-40 bg-[#080d19]/90 backdrop-blur-xl border-b border-cyan-500/20 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 md:hidden"
            aria-label="Menyu"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center font-bold text-base shadow-md shadow-cyan-600/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-base tracking-tight">StudentHub</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-black border border-cyan-500/40 uppercase">
                  Admin Portal
                </span>
              </div>
              <span className="text-[10px] text-zinc-300 font-mono hidden sm:inline">
                Alohida Boshqaruv Markazi
              </span>
            </div>
          </div>
        </div>

        {/* O'ng tomon: Tizim holati va Ochiq saytga havola */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-zinc-200">Tizim: Barqaror</span>
            <span className="text-zinc-500">|</span>
            <span className="text-cyan-300 font-bold">Ngrok: Ulangan</span>
          </div>

          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white text-xs font-bold transition-all shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Ochiq Platformaga O&apos;tish</span>
          </Link>

          <button
            onClick={handleAdminLogout}
            title="Admin panelidan chiqish"
            className="p-2 rounded-xl bg-zinc-900 hover:bg-rose-950/40 border border-zinc-800 hover:border-rose-500 text-zinc-400 hover:text-rose-300 transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ASOSIY ADMIN KORPUSI */}
      <div className="flex-1 flex overflow-hidden">
        {/* CHAP ADMIN SIDEBAR */}
        <aside
          className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-[#080d19]/95 backdrop-blur-xl border-r border-zinc-800/80 p-4 flex flex-col justify-between transition-transform duration-300 ${
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <div className="space-y-6">
            <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
              Boshqaruv Bo&apos;limlari
            </div>

            <nav className="space-y-1">
              <Link
                href="/admin"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  pathname === "/admin"
                    ? "bg-cyan-600/25 text-cyan-200 border border-cyan-400/50 shadow-sm"
                    : "text-zinc-200 hover:text-white hover:bg-zinc-800/80"
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                <span>Boshqaruv Doskasi</span>
              </Link>

              <Link
                href="/admin/materials"
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  pathname === "/admin/materials"
                    ? "bg-cyan-600/25 text-cyan-200 border border-cyan-400/50 shadow-sm"
                    : "text-zinc-200 hover:text-white hover:bg-zinc-800/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Materiallar Moderatsiyasi</span>
                </div>
              </Link>

              <Link
                href="/admin/reports"
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  pathname === "/admin/reports"
                    ? "bg-rose-600/25 text-rose-200 border border-rose-400/50 shadow-sm"
                    : "text-zinc-200 hover:text-white hover:bg-zinc-800/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Shikoyatlar (Reports)</span>
                </div>
              </Link>

              <Link
                href="/admin/users"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  pathname === "/admin/users"
                    ? "bg-blue-600/25 text-blue-200 border border-blue-400/50 shadow-sm"
                    : "text-zinc-200 hover:text-white hover:bg-zinc-800/80"
                }`}
              >
                <Users className="w-4 h-4 text-blue-400" />
                <span>Foydalanuvchilar & Rollar</span>
              </Link>

              <Link
                href="/admin/jobs"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  pathname === "/admin/jobs"
                    ? "bg-emerald-600/25 text-emerald-200 border border-emerald-400/50 shadow-sm"
                    : "text-zinc-200 hover:text-white hover:bg-zinc-800/80"
                }`}
              >
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <span>Vakansiyalar Nazorati</span>
              </Link>
            </nav>
          </div>

          {/* Pastki qism: Admin ma'lumotlari */}
          <div className="pt-4 border-t border-zinc-800/80 space-y-3">
            <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-xs">
              <div className="text-[11px] text-zinc-500">Faol Administratsiya</div>
              <div className="font-bold text-white mt-0.5">
                {currentUser?.name || "Bosh Administrator"}
              </div>
              <div className="text-[10px] text-cyan-400 font-mono mt-0.5">
                {currentUser?.email || "admin@studenthub.uz"}
              </div>
            </div>

            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-bold transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ochiq Saytga Chiqish</span>
            </Link>
          </div>
        </aside>

        {/* ASOSIY ISH MAYDONI */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
