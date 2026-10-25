import Link from "next/link";
import {
  BookOpen,
  Briefcase,
  BookMarked,
  Award,
  Search,
  ArrowRight,
  Download,
  Star,
  ShieldCheck,
  FileText,
  Upload,
  Sparkles,
  Building2,
  Users2,
  Layers,
  ChevronRight,
} from "lucide-react";
import Hero3DVisual from "@/components/Hero3DVisual";

export default function Home() {
  const quickCategories = [
    { title: "Ma'ruzalar", href: "/study?type=LECTURE" },
    { title: "Laboratoriyalar", href: "/study?type=LAB_WORK" },
    { title: "Imtihon savollari", href: "/study?type=EXAM_QUESTIONS" },
    { title: "Slaydlar & Taqdimot", href: "/study?type=SLIDES" },
    { title: "Testlar bazasi", href: "/study?type=TESTS" },
  ];

  const bentoCards = [
    {
      title: "Study",
      subtitle: "Akademik Resurslar",
      desc: "Universitet, fakultet va fanlar kesimida saralangan ma'ruzalar, laboratoriya ishlari va imtihon savollari bazasi.",
      icon: BookOpen,
      href: "/study",
      badge: "Faol Modul",
      colSpan: "lg:col-span-2",
      accent: "from-blue-600 to-cyan-500",
    },
    {
      title: "Jobs",
      subtitle: "Vakansiyalar & Amaliyot",
      desc: "Talabalar uchun part-time, internship va masofaviy amaliyotlar hamda avtomatik PDF rezyume shakllantirish.",
      icon: Briefcase,
      href: "/jobs",
      badge: "2-bosqich",
      colSpan: "lg:col-span-1",
      accent: "from-emerald-600 to-teal-500",
    },
    {
      title: "Books",
      subtitle: "Kitoblar Bozori",
      desc: "Talabalar o'rtasida darslik va adabiyotlarni arzon sotish, sotib olish yoki o'zaro ayirboshlash maydoni.",
      icon: BookMarked,
      href: "/books",
      badge: "2-bosqich",
      colSpan: "lg:col-span-1",
      accent: "from-amber-600 to-orange-500",
    },
    {
      title: "Scholarships",
      subtitle: "Grantlar & Stipendiyalar",
      desc: "Mahalliy va xalqaro stipendiyalar, davlat grantlari, kontrakt chegirmalari hamda muddat eslatmalari.",
      icon: Award,
      href: "/scholarships",
      badge: "3-bosqich",
      colSpan: "lg:col-span-2",
      accent: "from-purple-600 to-pink-500",
    },
  ];

  const featuredMaterials = [
    {
      id: "mat-1",
      title: "Algoritmlar va ma'lumotlar tuzilmasi — To'liq ma'ruzalar to'plami",
      subject: "Dasturiy injiniring",
      university: "TATU",
      type: "Ma'ruza",
      fileType: "PDF",
      fileSize: "14.2 MB",
      author: "Sherzod Aliyev",
      isVerified: true,
      rating: 4.9,
      downloads: 482,
    },
    {
      id: "mat-2",
      title: "PostgreSQL relyatsion bazalar nazariyasi va oraliq nazorat savollari",
      subject: "Ma'lumotlar bazasi",
      university: "Inha Universiteti",
      type: "Imtihon savollari",
      fileType: "DOCX",
      fileSize: "3.8 MB",
      author: "Dilnoza Karimova",
      isVerified: true,
      rating: 5.0,
      downloads: 319,
    },
    {
      id: "mat-3",
      title: "Kiberxavfsizlik asoslari va tarmoq auditi laboratoriya ishlari",
      subject: "Kiberxavfsizlik",
      university: "TATU",
      type: "Laboratoriya",
      fileType: "ZIP",
      fileSize: "28.5 MB",
      author: "Javohir Toshpo'latov",
      isVerified: false,
      rating: 4.8,
      downloads: 215,
    },
  ];

  return (
    <div className="relative space-y-28 pb-24 overflow-hidden">
      
      {/* 3D Immersive Hero Section */}
      <section className="relative pt-12 md:pt-20 px-4 sm:px-6 lg:px-8">
        
        {/* Subtle background ambient mesh */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] overflow-hidden -z-10 pointer-events-none">
          <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px]" />
          <div className="absolute top-20 right-1/4 w-[450px] h-[450px] bg-purple-600/15 rounded-full blur-[130px]" />
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading, Search & Stats */}
          <div className="lg:col-span-7 space-y-7 text-left">
            
            {/* 3D Neon Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-400 text-xs font-bold tracking-wide shadow-[0_0_20px_rgba(59,130,246,0.2)]">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Yagona Raqamli Ekotizim • 2026</span>
            </div>

            {/* Hero Main Heading with 3D Depth */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.12]">
              Talabalik jarayonini <br />
              <span className="text-blue-500 drop-shadow-[0_0_25px_rgba(59,130,246,0.4)]">
                yangi 3D darajaga
              </span> olib chiqing
            </h1>

            <p className="max-w-xl text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              O'zbekiston oliygohlari bo'yicha saralangan darsliklar, laboratoriyalar, imtihon savollari va akademik hamjamiyat bitta interaktiv platformada.
            </p>

            {/* 3D Search Deck */}
            <div className="max-w-xl pt-1">
              <form
                action="/study"
                method="GET"
                className="relative flex items-center rounded-2xl glass-3d border border-blue-500/30 p-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/30 transition-all shadow-xl"
              >
                <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
                <input
                  type="text"
                  name="search"
                  placeholder="OTM, fan yoki o'qituvchi bo'yicha qidiring..."
                  className="w-full px-3 py-2 text-sm sm:text-base bg-transparent focus:outline-none text-white placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl btn-3d transition-all shrink-0 cursor-pointer"
                >
                  Qidirish
                </button>
              </form>
            </div>

            {/* Quick Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-semibold text-slate-400 mr-1">Tezkor toifalar:</span>
              {quickCategories.map((cat, idx) => (
                <Link
                  key={idx}
                  href={cat.href}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:border-blue-500/50 hover:text-blue-400 hover:scale-105 transition-all shadow-sm"
                >
                  {cat.title}
                </Link>
              ))}
            </div>

            {/* Stats Row with 3D cards */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-w-xl">
              <div className="p-3.5 rounded-2xl glass-3d border border-slate-800">
                <p className="text-2xl font-black text-white">50+</p>
                <p className="text-[11px] font-bold text-slate-300 mt-0.5">Universitetlar</p>
              </div>
              <div className="p-3.5 rounded-2xl glass-3d border border-slate-800">
                <p className="text-2xl font-black text-blue-400">12,000+</p>
                <p className="text-[11px] font-bold text-slate-300 mt-0.5">Materiallar</p>
              </div>
              <div className="p-3.5 rounded-2xl glass-3d border border-slate-800">
                <p className="text-2xl font-black text-emerald-400">100%</p>
                <p className="text-[11px] font-bold text-slate-300 mt-0.5">Verifikatsiya</p>
              </div>
              <div className="p-3.5 rounded-2xl glass-3d border border-slate-800">
                <p className="text-2xl font-black text-amber-400">4.9</p>
                <p className="text-[11px] font-bold text-slate-300 mt-0.5">Foydalilik</p>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive 3D Visual Deck */}
          <div className="lg:col-span-5 flex justify-center">
            <Hero3DVisual />
          </div>

        </div>
      </section>

      {/* 3D Bento Grid Modules */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10 border-b border-slate-800/80 pb-5">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Ekotizim modullari
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Barcha akademik va karyera imkoniyatlari yagona 3D interfeysda.
            </p>
          </div>
          <Link
            href="/study"
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-400 hover:text-blue-300"
          >
            <span>Barcha modullar</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bentoCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <Link
                key={idx}
                href={card.href}
                className={`group flex flex-col justify-between p-7 rounded-3xl glass-3d border border-slate-800 hover:border-blue-500/50 transition-all ${card.colSpan}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 border border-slate-700/60 flex items-center justify-center text-blue-400 shadow-md group-hover:scale-110 group-hover:border-blue-500/40 transition-all">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-300">
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-white group-hover:text-blue-400 transition-colors">
                    {card.title} <span className="text-slate-300 font-medium text-base ml-1">— {card.subtitle}</span>
                  </h3>

                  <p className="text-sm text-slate-200 mt-3 leading-relaxed font-normal">
                    {card.desc}
                  </p>
                </div>

                <div className="mt-8 flex items-center gap-2 text-xs font-bold text-blue-400 group-hover:translate-x-1.5 transition-transform">
                  <span>Modulni ochish</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Documents Section (Study MVP) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 border-b border-slate-800/80 pb-5">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Ommabop o'quv materiallari
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Eng ko'p yuklab olingan va tasdiqlangan hujjatlar.
            </p>
          </div>
          <Link
            href="/study"
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-400 hover:text-blue-300"
          >
            <span>Katalogga o'tish</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredMaterials.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between p-6 rounded-3xl glass-3d border border-slate-800 hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 uppercase">
                      {item.type}
                    </span>
                    <span className="text-[11px] font-bold text-slate-300 font-mono">
                      {item.fileType} • {item.fileSize}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{item.rating}</span>
                  </div>
                </div>

                <Link
                  href="/study"
                  className="font-extrabold text-base text-white hover:text-blue-400 line-clamp-2 leading-snug transition-colors"
                >
                  {item.title}
                </Link>

                <p className="text-xs text-slate-300 font-medium mt-2.5">
                  {item.university} • {item.subject}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-300 flex items-center justify-center text-[10px] font-bold">
                    {item.author.charAt(0)}
                  </div>
                  <span className="truncate max-w-[110px] font-bold text-white">
                    {item.author}
                  </span>
                  {item.isVerified && (
                    <span title="Tasdiqlangan talaba">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
                  <Download className="w-3.5 h-3.5" />
                  <span>{item.downloads}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3D Call to Action Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl glass-3d border border-blue-500/30 p-8 sm:p-12 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="max-w-xl space-y-2 z-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              O'zbekiston OTMlari akademik bazasi
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Barcha rasmiy ma'ruzalar, slaydlar va nazorat savollari markazlashtirilgan tarzda administratorlar va moderatorlar tomonidan taqdim etiladi.
            </p>
          </div>
          <div className="flex flex-wrap gap-3.5 shrink-0 z-10">
            <Link
              href="/study"
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white btn-3d transition-all flex items-center gap-2 shadow-lg"
            >
              <BookOpen className="w-4 h-4" />
              <span>Materiallar Katalogi</span>
            </Link>
            <Link
              href="/register"
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors"
            >
              Hamjamiyatga a'zo bo'lish
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
