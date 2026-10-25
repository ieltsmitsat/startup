"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";

export default function PublicLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  // Agar admin yo'lida bo'lsa, umumiy ommaviy navbar va footerni ko'rsatmaymiz!
  if (isAdminRoute) {
    return <div className="min-h-screen bg-[#060911] text-slate-100">{children}</div>;
  }

  return (
    <>
      <Suspense fallback={<div className="h-16 border-b border-slate-800" />}>
        <Navbar />
      </Suspense>
      <main className="flex-1">{children}</main>

      {/* 3D Glass Ommaviy Footer */}
      <footer className="border-t border-slate-800/80 bg-[#080c16]/90 backdrop-blur-xl mt-24 py-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                🎓
              </div>
              <span className="font-bold text-lg text-white">
                Student<span className="text-blue-500">Hub</span>
              </span>
              <span className="text-xs text-slate-500 ml-2">
                © 2026 StudentHub. Barcha huquqlar himoyalangan.
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
              <a href="/study" className="hover:text-blue-400 transition-colors">
                Study
              </a>
              <a href="/jobs" className="hover:text-blue-400 transition-colors">
                Jobs
              </a>
              <a href="/books" className="hover:text-blue-400 transition-colors">
                Books
              </a>
              <a href="/scholarships" className="hover:text-blue-400 transition-colors">
                Grantlar
              </a>
              <a href="/community" className="hover:text-blue-400 transition-colors">
                Forum
              </a>
              <a href="/team-up" className="hover:text-blue-400 transition-colors">
                Team Up
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
