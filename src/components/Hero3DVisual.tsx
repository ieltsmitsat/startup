"use client";

import { useState } from "react";
import {
  FileText,
  Star,
  ShieldCheck,
  Download,
  GraduationCap,
  Sparkles,
  BookOpen,
  CheckCircle2,
} from "lucide-react";

export default function Hero3DVisual() {
  const [rotate, setRotate] = useState({ x: 8, y: -12 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - card.left;
    const y = e.clientY - card.top;
    const centerX = card.width / 2;
    const centerY = card.height / 2;

    const rotateX = ((y - centerY) / centerY) * -14;
    const rotateY = ((x - centerX) / centerX) * 14;

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 8, y: -12 });
  };

  return (
    <div
      className="relative w-full max-w-lg mx-auto h-[440px] perspective-1000 flex items-center justify-center select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-600/30 rounded-full blur-[80px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-600/25 rounded-full blur-[80px] pointer-events-none animate-float-reverse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Main 3D Container with Dynamic Tilt */}
      <div
        className="relative w-full h-full transform-style-3d transition-transform duration-200 ease-out flex items-center justify-center"
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        }}
      >
        
        {/* Layer 1: Isometric Grid Base Platform */}
        <div className="absolute inset-x-4 inset-y-8 rounded-3xl border border-blue-500/20 bg-gradient-to-br from-slate-900/80 via-blue-950/40 to-slate-900/90 backdrop-blur-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] -z-10 translate-z-10">
          <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-25 rounded-3xl" />
        </div>

        {/* Layer 2: Main Floating Document Card (Elevated in 3D Space) */}
        <div className="w-[340px] sm:w-[370px] p-6 rounded-2xl glass-3d translate-z-30 border border-blue-400/30 text-left relative overflow-hidden group">
          
          {/* Shimmer Effect */}
          <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/5 to-transparent rotate-45 group-hover:translate-x-full transition-transform duration-1000" />

          {/* Card Top Meta */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[11px] font-extrabold tracking-wider uppercase">
                Ma'ruza PDF
              </span>
              <span className="text-xs text-slate-400 font-mono">14.2 MB</span>
            </div>

            <div className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>5.0</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-white leading-snug">
            Algoritmlar va ma'lumotlar tuzilmasi — To'liq ma'ruzalar to'plami
          </h3>

          <p className="text-xs text-slate-400 mt-2">
            Toshkent Axborot Texnologiyalari Universiteti (TATU) • Dasturiy injiniring
          </p>

          {/* Progress / Verified Status */}
          <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-[10px]">
                SA
              </div>
              <span className="text-slate-200 font-medium">Sherzod Aliyev</span>
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            </div>

            <div className="flex items-center gap-1.5 text-blue-400 font-semibold text-xs">
              <Download className="w-3.5 h-3.5" />
              <span>482 yuklandi</span>
            </div>
          </div>
        </div>

        {/* Layer 3: Floating Sub-card 1 (Top Right Badge) */}
        <div className="absolute -top-4 -right-2 sm:-right-6 p-3.5 rounded-2xl glass-3d border border-purple-500/30 text-left animate-float shadow-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Verified Talaba</p>
            <p className="text-[10px] text-purple-300">OTM guvohnomasi bilan</p>
          </div>
        </div>

        {/* Layer 4: Floating Sub-card 2 (Bottom Left Stats Badge) */}
        <div className="absolute -bottom-4 -left-2 sm:-left-6 p-3.5 rounded-2xl glass-3d border border-emerald-500/30 text-left animate-float-reverse shadow-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">50+ Universitetlar</p>
            <p className="text-[10px] text-emerald-300">12,000+ Resurslar bazasi</p>
          </div>
        </div>

      </div>
    </div>
  );
}
