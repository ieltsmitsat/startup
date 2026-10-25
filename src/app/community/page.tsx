"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Plus,
  Filter,
  CheckCircle2,
  Flag,
  Share2,
  X,
  Send,
  Building2,
  GraduationCap,
  ShieldCheck,
  Tag,
  AlertTriangle,
  HelpCircle,
  Clock,
  Compass,
  ArrowUp,
  ArrowDown,
  Award,
  ChevronRight,
  Flame,
} from "lucide-react";

interface Answer {
  id: string;
  content: string;
  upvotes: number;
  isAccepted: boolean;
  createdAt: string;
  author: {
    name: string;
    avatarUrl?: string | null;
    isVerified: boolean;
    university?: { name: string } | null;
  };
}

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  category: "UNIVERSITY_LIFE" | "IT_DEV" | "STUDY_ABROAD" | "DORM_HOUSING" | "GENERAL";
  upvotes: number;
  downvotes: number;
  tags: string[];
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    isVerified: boolean;
    university?: { name: string } | null;
    major?: string | null;
  };
  answersCount: number;
  answers: Answer[];
}

function CommunityContent() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Filtrlash holatlari
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"popular" | "newest" | "unanswered">("popular");

  // Tanlangan post (batafsil ko'rish va javob yozish uchun)
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);

  // Yangi savol modal holati
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<string>("GENERAL");
  const [newTags, setNewTags] = useState("");
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [postError, setPostError] = useState("");

  // Yangi javob (answer) holati
  const [answerContent, setAnswerContent] = useState("");
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [answerError, setAnswerError] = useState("");

  // Shikoyat (Report) modal holati
  const [reportingPost, setReportingPost] = useState<CommunityPost | null>(null);
  const [reportReason, setReportReason] = useState("Spam yoki reklama");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);

  // Ovoz berilgan postlar IDlari (mahalliy state)
  const [votedPosts, setVotedPosts] = useState<Record<string, "UP" | "DOWN">>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchUser();
    fetchPosts();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    } catch {
      // ignore
    }
  };

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/community/posts");
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error("Postlarni yuklashda xatolik:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Ovoz berish (Upvote / Downvote)
  const handleVote = async (postId: string, type: "UP" | "DOWN", e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentUser) {
      alert("Ovoz berish uchun avval tizimga kiring!");
      return;
    }

    const currentVote = votedPosts[postId];
    if (currentVote === type) return; // allaqachon ovoz berilgan

    // Optimizatsiyalangan tezkor UI yangilanish
    setVotedPosts((prev) => ({ ...prev, [postId]: type }));
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          upvotes: type === "UP" ? p.upvotes + 1 : (currentVote === "UP" ? p.upvotes - 1 : p.upvotes),
          downvotes: type === "DOWN" ? p.downvotes + 1 : (currentVote === "DOWN" ? p.downvotes - 1 : p.downvotes),
        };
      })
    );

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost((prev) =>
        prev
          ? {
              ...prev,
              upvotes: type === "UP" ? prev.upvotes + 1 : (currentVote === "UP" ? prev.upvotes - 1 : prev.upvotes),
              downvotes: type === "DOWN" ? prev.downvotes + 1 : (currentVote === "DOWN" ? prev.downvotes - 1 : prev.downvotes),
            }
          : null
      );
    }

    try {
      await fetch(`/api/community/posts/${postId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
    } catch {
      // ignore
    }
  };

  // Yangi savol / muhokama yaratish
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setPostError("Mavzu ochish uchun tizimga kiring!");
      return;
    }
    setPostError("");
    setIsSubmittingPost(true);

    const tagsArray = newTags
      .split(/[\s,]+/)
      .map((t) => t.replace("#", "").trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          category: newCategory,
          tags: tagsArray,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPostError(data.error || "Xatolik yuz berdi");
        return;
      }

      setPosts((prev) => [data.post, ...prev]);
      setIsAddModalOpen(false);
      // Tozalash
      setNewTitle("");
      setNewContent("");
      setNewTags("");
      setNewCategory("GENERAL");
    } catch {
      setPostError("Serverga ulanishda xatolik");
    } finally {
      setIsSubmittingPost(false);
    }
  };

  // Yangi javob qo'shish
  const handleCreateAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost) return;
    if (!currentUser) {
      setAnswerError("Javob yozish uchun avval tizimga kiring!");
      return;
    }
    if (!answerContent.trim()) return;

    setAnswerError("");
    setIsSubmittingAnswer(true);

    try {
      const res = await fetch(`/api/community/posts/${selectedPost.id}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: answerContent }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAnswerError(data.error || "Xatolik yuz berdi");
        return;
      }

      // Tanlangan postni yangilash
      const updatedAnswers = [...(selectedPost.answers || []), data.answer];
      const updatedPost = {
        ...selectedPost,
        answersCount: (selectedPost.answersCount || 0) + 1,
        answers: updatedAnswers,
      };

      setSelectedPost(updatedPost);
      setPosts((prev) => prev.map((p) => (p.id === selectedPost.id ? updatedPost : p)));
      setAnswerContent("");
    } catch {
      setAnswerError("Javob yuborishda xatolik yuz berdi");
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  // Shikoyat yuborish (Report)
  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingPost) return;

    try {
      await fetch("/api/community/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetId: reportingPost.id,
          targetType: "POST",
          reason: reportReason,
          details: reportDetails,
        }),
      });
      setReportSuccess(true);
      setTimeout(() => {
        setReportingPost(null);
        setReportSuccess(false);
        setReportDetails("");
      }, 2000);
    } catch {
      // ignore
    }
  };

  const handleShare = (post: CommunityPost, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = window.location.origin + `/community?id=${post.id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(post.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Kategoriya nishoni va nomlari
  const getCategoryDetails = (cat: string) => {
    switch (cat) {
      case "UNIVERSITY_LIFE":
        return { label: "🏛️ Universitet hayoti", color: "bg-blue-900/80 text-blue-200 border-blue-500/40" };
      case "IT_DEV":
        return { label: "💻 IT va Dasturlash", color: "bg-emerald-900/80 text-emerald-200 border-emerald-500/40" };
      case "STUDY_ABROAD":
        return { label: "✈️ Chet elda ta'lim", color: "bg-purple-900/80 text-purple-200 border-purple-500/40" };
      case "DORM_HOUSING":
        return { label: "🏠 Yotoqxona & Ijara", color: "bg-amber-900/80 text-amber-200 border-amber-500/40" };
      case "GENERAL":
      default:
        return { label: "☕ Umumiy suhbat", color: "bg-zinc-800 text-zinc-300 border-zinc-700" };
    }
  };

  // Filtrlangan postlar
  const filteredPosts = useMemo(() => {
    let result = posts.filter((p) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));

      const matchCat = category === "ALL" || p.category === category;
      return matchSearch && matchCat;
    });

    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "unanswered") {
      result = result.filter((p) => (p.answersCount || p.answers.length) === 0);
    } else {
      // Popular (net score)
      result.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
    }

    return result;
  }, [posts, search, category, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* 3D HERO SECTION */}
      <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden glass-3d border border-sky-500/20 perspective-1000">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-600/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Ochiq Savol-Javob va Talabalar Maydoni</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Talabalar Hamjamiyati —{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-teal-300 to-purple-400">
              Q&A va Tajriba Almashish
            </span>
          </h1>

          <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
            Universitet hayoti, IT va dasturlash, xalqaro grantlar va yotoqxona masalalari bo&apos;yicha o&apos;zaro fikr
            almashing, savol bering va tasdiqlangan talabalardan real maslahatlar oling.
          </p>

          {/* 3D Statistik bloklar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4">
            <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md text-left">
              <div className="text-2xl font-black text-sky-400">{posts.length} ta</div>
              <div className="text-xs text-zinc-400 font-medium">Faol Muhokama</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md text-left">
              <div className="text-2xl font-black text-emerald-400">96%</div>
              <div className="text-xs text-zinc-400 font-medium">Javob Olingan</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md text-left">
              <div className="text-2xl font-black text-purple-400">30+</div>
              <div className="text-xs text-zinc-400 font-medium">Universitetlar</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md text-left">
              <div className="text-2xl font-black text-teal-400">100%</div>
              <div className="text-xs text-zinc-400 font-medium">Spam Himoyasi</div>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER VA BOSHQARUV PANELI */}
      <div className="space-y-4">
        <div className="p-4 sm:p-5 rounded-2xl glass-3d border border-zinc-800/90 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Qidiruv */}
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Savol sarlavhasi, universitet, mavzu yoki teglar bo'yicha qidiring..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-700/80 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
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

            {/* Yangi savol tugmasi */}
            <button
              onClick={() => {
                if (!currentUser) {
                  alert("Savol ochish uchun avval tizimga kiring!");
                  return;
                }
                setIsAddModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi Savol / Muhokama</span>
            </button>
          </div>

          {/* Kategoriya pills va saralash */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800/80">
            {/* Toifalar */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setCategory("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  category === "ALL"
                    ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30"
                    : "bg-zinc-900/70 text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                🌐 Barchasi
              </button>
              <button
                onClick={() => setCategory("UNIVERSITY_LIFE")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  category === "UNIVERSITY_LIFE"
                    ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30"
                    : "bg-zinc-900/70 text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                🏛️ Universitet hayoti
              </button>
              <button
                onClick={() => setCategory("IT_DEV")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  category === "IT_DEV"
                    ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30"
                    : "bg-zinc-900/70 text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                💻 IT & Dasturlash
              </button>
              <button
                onClick={() => setCategory("STUDY_ABROAD")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  category === "STUDY_ABROAD"
                    ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30"
                    : "bg-zinc-900/70 text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                ✈️ Chet elda ta&apos;lim
              </button>
              <button
                onClick={() => setCategory("DORM_HOUSING")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  category === "DORM_HOUSING"
                    ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30"
                    : "bg-zinc-900/70 text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                🏠 Yotoqxona & Ijara
              </button>
              <button
                onClick={() => setCategory("GENERAL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  category === "GENERAL"
                    ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30"
                    : "bg-zinc-900/70 text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                ☕ Umumiy
              </button>
            </div>

            {/* Saralash */}
            <div className="flex items-center gap-1.5 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setSortBy("popular")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  sortBy === "popular"
                    ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                🔥 Ommabop
              </button>
              <button
                onClick={() => setSortBy("newest")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  sortBy === "newest"
                    ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                ✨ Yangi
              </button>
              <button
                onClick={() => setSortBy("unanswered")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  sortBy === "unanswered"
                    ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                ❓ Javobsizlar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SAVOL VA MUHOKAMALAR RO'YXATI */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-40 rounded-3xl glass-3d border border-zinc-800/80 animate-pulse bg-zinc-900/40 p-6 space-y-3"
            >
              <div className="h-5 w-1/3 bg-zinc-800/60 rounded" />
              <div className="h-7 w-3/4 bg-zinc-800/60 rounded-lg" />
              <div className="h-4 w-1/2 bg-zinc-800/60 rounded" />
            </div>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-20 px-4 glass-3d rounded-3xl border border-zinc-800 max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center mx-auto shadow-inner">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">Hech qanday savol topilmadi</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Birinchi bo&apos;lib o&apos;zingizni qiziqtirgan savolni bering yoki filtr parametrlarini o&apos;zgartiring.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-md"
          >
            Yangi savol berish
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const catDetails = getCategoryDetails(post.category);
            const userVote = votedPosts[post.id];
            const netScore = post.upvotes - post.downvotes;

            return (
              <div
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="group relative rounded-3xl glass-3d border border-zinc-800/90 hover:border-sky-500/50 transition-all duration-300 p-5 sm:p-6 cursor-pointer shadow-xl hover:-translate-y-1 hover:shadow-sky-500/10 flex flex-col sm:flex-row gap-5 items-start"
              >
                {/* Chap ustun: Upvote / Downvote hisoblagichi (Q&A style) */}
                <div
                  className="flex sm:flex-col items-center gap-1.5 sm:gap-1 bg-zinc-900/80 p-2 sm:p-2.5 rounded-2xl border border-zinc-800 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => handleVote(post.id, "UP", e)}
                    className={`p-1.5 rounded-xl transition-all ${
                      userVote === "UP"
                        ? "bg-sky-500 text-white shadow-md shadow-sky-500/40"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                    }`}
                    title="Foydali savol / Upvote"
                  >
                    <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                  </button>

                  <span
                    className={`text-xs sm:text-sm font-black font-mono ${
                      netScore > 0 ? "text-sky-400" : netScore < 0 ? "text-rose-400" : "text-zinc-400"
                    }`}
                  >
                    {netScore}
                  </span>

                  <button
                    onClick={(e) => handleVote(post.id, "DOWN", e)}
                    className={`p-1.5 rounded-xl transition-all ${
                      userVote === "DOWN"
                        ? "bg-rose-500 text-white shadow-md shadow-rose-500/40"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                    }`}
                    title="Nofoali savol / Downvote"
                  >
                    <ArrowDown className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>

                {/* Asosiy kontent */}
                <div className="flex-1 space-y-3 min-w-0">
                  {/* Muallif va toifa */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-md">
                        {post.author.name.charAt(0)}
                      </div>
                      <div className="flex items-center gap-1 text-zinc-300 font-bold">
                        <span>{post.author.name}</span>
                        {post.author.isVerified && (
                          <span title="Tasdiqlangan talaba">
                            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                          </span>
                        )}
                      </div>
                      {post.author.university && (
                        <span className="text-zinc-300 text-[11px] font-medium hidden sm:inline">
                          · {post.author.university.name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border backdrop-blur-md ${catDetails.color}`}>
                        {catDetails.label}
                      </span>
                    </div>
                  </div>

                  {/* Sarlavha va matn */}
                  <div className="space-y-1.5">
                    <h2 className="text-base sm:text-lg font-bold text-white group-hover:text-sky-300 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-200 line-clamp-2 leading-relaxed font-normal">
                      {post.content}
                    </p>
                  </div>

                  {/* Teglar */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {post.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-700 text-[11px] text-zinc-300 font-mono font-medium"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Pastki qism: Javoblar soni, Ulashish, Shikoyat */}
                  <div className="pt-2 flex items-center justify-between border-t border-zinc-800/80 text-xs">
                    <div className="flex items-center gap-4 text-zinc-400">
                      <div className="flex items-center gap-1.5 font-bold text-sky-400">
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.answersCount || post.answers.length} ta javob</span>
                      </div>
                      <span className="text-zinc-500 text-[11px]">
                        {new Date(post.createdAt).toLocaleDateString("uz-UZ")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleShare(post, e)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all text-[11px] flex items-center gap-1"
                        title="Ulashish"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">
                          {copiedId === post.id ? "Nusxalandi!" : "Ulashish"}
                        </span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setReportingPost(post);
                        }}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20 transition-all text-[11px] flex items-center gap-1"
                        title="Shikoyat qilish (Report)"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3D MUHOKAMA VA JAVOBLAR MODALI */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl glass-3d border border-sky-500/40 p-6 sm:p-8 space-y-6 shadow-2xl bg-zinc-950 text-white transform transition-all animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal yopish */}
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white"
              aria-label="Yopish"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Sarlavha & Muallif */}
            <div className="space-y-3 pr-10">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getCategoryDetails(selectedPost.category).color}`}>
                  {getCategoryDetails(selectedPost.category).label}
                </span>
                <span className="text-xs text-zinc-500">
                  {new Date(selectedPost.createdAt).toLocaleDateString("uz-UZ")}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {selectedPost.title}
              </h2>

              <div className="flex items-center gap-2.5 text-xs text-zinc-400 pt-1 border-b border-zinc-800 pb-3">
                <div className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-[10px]">
                  {selectedPost.author.name.charAt(0)}
                </div>
                <span className="font-bold text-zinc-300">{selectedPost.author.name}</span>
                {selectedPost.author.university && (
                  <span>· {selectedPost.author.university.name}</span>
                )}
                {selectedPost.author.major && (
                  <span className="text-zinc-500">({selectedPost.author.major})</span>
                )}
              </div>
            </div>

            {/* Savol matni */}
            <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 text-xs sm:text-sm text-zinc-200 leading-relaxed whitespace-pre-line">
              {selectedPost.content}
            </div>

            {/* Teglar */}
            {selectedPost.tags && selectedPost.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedPost.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-sky-400 font-mono"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* JAVOBLAR RO'YXATI */}
            <div className="space-y-4 pt-4 border-t border-zinc-800">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-sky-400" />
                <span>Javoblar va Fikrlar ({selectedPost.answers?.length || 0})</span>
              </h3>

              {(!selectedPost.answers || selectedPost.answers.length === 0) ? (
                <div className="text-center py-8 text-xs text-zinc-500">
                  Hozircha javoblar yo&apos;q. Birinchi bo&apos;lib javob yozing!
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedPost.answers.map((ans) => (
                    <div
                      key={ans.id}
                      className={`p-4 rounded-2xl border space-y-2.5 ${
                        ans.isAccepted
                          ? "bg-emerald-950/20 border-emerald-500/40"
                          : "bg-zinc-900/60 border-zinc-800/80"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-zinc-800 text-sky-400 flex items-center justify-center font-bold text-[10px] border border-zinc-700">
                            {ans.author.name.charAt(0)}
                          </div>
                          <span className="font-bold text-zinc-200">{ans.author.name}</span>
                          {ans.author.isVerified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                          )}
                          {ans.author.university && (
                            <span className="text-zinc-500 text-[11px]">
                              · {ans.author.university.name}
                            </span>
                          )}
                        </div>

                        {ans.isAccepted && (
                          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Yechim / Qabul qilingan</span>
                          </div>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                        {ans.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* JAVOB YOZISH FORMASI */}
            <form onSubmit={handleCreateAnswer} className="space-y-3 pt-4 border-t border-zinc-800">
              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Sizning javobingiz yoki fikringiz:
              </h4>

              {answerError && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-300 text-xs">
                  {answerError}
                </div>
              )}

              <textarea
                rows={3}
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                placeholder="Foydali va tushunarli javob yozing..."
                className="w-full p-3.5 rounded-2xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-sky-500"
              />

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Avtomatik spam filtri faol</span>
                </span>

                <button
                  type="submit"
                  disabled={isSubmittingAnswer || !answerContent.trim()}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-sky-600/30 transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingAnswer ? "Yuborilmoqda..." : "Javobni Yuborish"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3D YANGI SAVOL OCHISH MODALI */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl glass-3d border border-sky-500/40 p-6 sm:p-8 space-y-6 shadow-2xl bg-zinc-950 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-black text-white">Yangi Savol / Mavzu Ochish</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {postError && (
              <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-300 text-xs">
                {postError}
              </div>
            )}

            <form onSubmit={handleCreatePost} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-zinc-300 font-bold mb-1">Mavzu / Savol sarlavhasi *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Masalan: INHA universitetida almashinuv dasturi qanday ishlaydi?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">Toifa tanlang</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="UNIVERSITY_LIFE">🏛️ Universitet hayoti</option>
                  <option value="IT_DEV">💻 IT va Dasturlash</option>
                  <option value="STUDY_ABROAD">✈️ Chet elda ta&apos;lim</option>
                  <option value="DORM_HOUSING">🏠 Yotoqxona va ijara</option>
                  <option value="GENERAL">☕ Umumiy suhbat</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">
                  Teglar (Vergul yoki bo&apos;sh joy bilan ajrating)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="TATU, Grant, Dasturlash, Sessiya"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">Batafsil tavsif *</label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Savolingizni aniq va tushunarli yozing. Qaysi jihati sizni ko'proq qiziqtirmoqda?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-[11px] text-zinc-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Iltimos, odob-axloq qoidalariga rioya qiling. Spam va reklama xabarlari avtomatik cheklanadi.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmittingPost}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-sky-600/30 transition-all disabled:opacity-50"
              >
                {isSubmittingPost ? "Joylanmoqda..." : "Savolni Chop Etish"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SHIKOYAT (REPORT) MODALI (TZ 3.6) */}
      {reportingPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setReportingPost(null)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl glass-3d border border-rose-500/40 p-6 space-y-5 bg-zinc-950 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <Flag className="w-4 h-4" />
                <span>Mavzu ustidan shikoyat</span>
              </div>
              <button
                onClick={() => setReportingPost(null)}
                className="p-1 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-white">Shikoyatingiz qabul qilindi</h4>
                <p className="text-xs text-zinc-400">
                  Moderatorlar 24 soat ichida ko&apos;rib chiqib chora ko&apos;radi. Rahmat!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendReport} className="space-y-4 text-xs">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Sababni tanlang</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="Spam yoki reklama">Spam yoki reklama</option>
                    <option value="Nomaqbul yoki haqoratomuz so'zlar">Nomaqbul yoki haqoratomuz so&apos;zlar</option>
                    <option value="Soxta yoki noto'g'ri ma'lumot">Soxta yoki noto&apos;g&apos;ri ma&apos;lumot</option>
                    <option value="Boshqa qonunbuzarlik">Boshqa qonunbuzarlik</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Qo&apos;shimcha izoh (ixtiyoriy)</label>
                  <textarea
                    rows={3}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Batafsil izoh qoldiring..."
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all shadow-md"
                >
                  Shikoyatni Yuborish
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CommunityPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center text-zinc-400">
          Yuklanmoqda...
        </div>
      }
    >
      <CommunityContent />
    </Suspense>
  );
}
