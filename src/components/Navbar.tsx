"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  GraduationCap,
  BookOpen,
  Briefcase,
  BookMarked,
  Award,
  Users,
  Search,
  LogIn,
  ShieldCheck,
  ShieldAlert,
  User,
  LogOut,
  Menu,
  X,
  FileText,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUser();
  }, [pathname]);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setCurrentUser(null);
    router.push("/login");
    router.refresh();
  };

  // Global qidiruv
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
          if (res.ok) {
            const data = await res.json();
            setSearchResults(data);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults(null);
      }
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchResults(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: "Study", href: "/study", icon: BookOpen },
    { name: "Jobs", href: "/jobs", icon: Briefcase },
    { name: "Books", href: "/books", icon: BookMarked },
    { name: "Scholarships", href: "/scholarships", icon: Award },
    { name: "Community", href: "/community", icon: Users },
  ];

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#080c14]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 font-bold text-lg text-blue-600 dark:text-blue-400 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="leading-none text-slate-900 dark:text-white font-extrabold tracking-tight text-base">
                Student<span className="text-blue-600 dark:text-blue-400">Hub</span>
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-wider uppercase mt-0.5">
                Akademik Platforma
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Global Search Bar */}
          <div ref={searchRef} className="relative flex-1 max-w-xs lg:max-w-md hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Fan, material yoki o'qituvchi qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-1.5 text-sm rounded-full bg-slate-100/80 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-[#0f172a] focus:outline-none transition-all placeholder:text-slate-400"
              />
              {isSearching && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Qidiruv natijalari dropdowni */}
            {searchResults && (
              <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-[#0f172a] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2.5 max-h-96 overflow-y-auto z-50">
                {searchResults.materials?.length > 0 && (
                  <div className="mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 block">
                      Materiallar
                    </span>
                    {searchResults.materials.map((m: any) => (
                      <Link
                        key={m.id}
                        href={`/study/${m.id}`}
                        onClick={() => setSearchResults(null)}
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-sm group transition-colors"
                      >
                        <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                        <div className="overflow-hidden">
                          <p className="font-semibold truncate text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {m.title}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {m.subject?.name} • {m.teacherName || "O'qituvchi"}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {searchResults.users?.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 block">
                      Talabalar
                    </span>
                    {searchResults.users.map((u: any) => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center text-xs font-bold">
                            {u.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{u.name}</span>
                          {u.isVerified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                          )}
                        </div>
                        <span className="text-xs text-slate-400">{u.major || "Talaba"}</span>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.materials?.length === 0 && searchResults.users?.length === 0 && (
                  <div className="text-center py-4 text-sm text-slate-400">
                    Hech narsa topilmadi
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Action buttons & Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Theme Toggle Button */}
            <ThemeToggle />

            {currentUser ? (
              <div className="flex items-center gap-2">
                {(currentUser.role === "ADMIN" || currentUser.role === "MODERATOR") && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 text-xs font-bold transition-all shadow-sm"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 hidden sm:inline max-w-[120px] truncate">
                    {currentUser.name}
                  </span>
                  {currentUser.isVerified && (
                    <span title="Tasdiqlangan talaba">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    </span>
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  title="Chiqish"
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Kirish</span>
                </Link>
                <Link
                  href="/register"
                  className="hidden sm:inline-flex items-center justify-center px-4 py-1.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Ro'yxatdan o'tish
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-300 md:hidden rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 px-4 pt-3 pb-5 space-y-2 bg-white dark:bg-[#080c14]">
          <div className="mb-3">
            <input
              type="text"
              placeholder="Qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border focus:outline-none"
            />
          </div>
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Icon className="w-4 h-4 text-blue-500" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
