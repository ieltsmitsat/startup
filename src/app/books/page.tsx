"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import {
  BookMarked,
  Search,
  Plus,
  SlidersHorizontal,
  Send,
  Tag,
  ShieldCheck,
  CheckCircle2,
  X,
  ExternalLink,
  Repeat,
  Gift,
  AlertCircle,
  Sparkles,
  Phone,
} from "lucide-react";

function BooksContent() {
  const [books, setBooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Filter holatlari
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState(""); // all, sell, exchange, free
  const [condition, setCondition] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Modal holatlari
  const [selectedBook, setSelectedBook] = useState<any | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Yangi kitob formasi
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newYear, setNewYear] = useState<number>(2023);
  const [newCondition, setNewCondition] = useState("Yaxshi");
  const [newPrice, setNewPrice] = useState<number>(50000);
  const [isExchange, setIsExchange] = useState(false);
  const [isFree, setIsFree] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    } catch {
      setCurrentUser(null);
    }
  };

  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filterType) params.set("type", filterType);
      if (condition) params.set("condition", condition);
      if (sortBy) params.set("sortBy", sortBy);

      const res = await fetch(`/api/books?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setBooks(data.books || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchBooks();
    }, 250);
    return () => clearTimeout(delay);
  }, [search, filterType, condition, sortBy]);

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!newTitle || !newAuthor) {
      setFormError("Kitob nomi va muallifi to'ldirilishi shart");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          author: newAuthor,
          publishYear: Number(newYear) || null,
          condition: newCondition,
          price: isFree || isExchange ? 0 : Number(newPrice),
          isExchange,
          isFree,
          imageUrl: newImageUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
          description: newDesc,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsAddModalOpen(false);
        // Formani tozalash
        setNewTitle("");
        setNewAuthor("");
        setNewDesc("");
        fetchBooks();
      } else {
        setFormError(data.error || "E'lonni saqlashda xatolik yuz berdi");
      }
    } catch {
      setFormError("Server bilan aloqa uzildi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (bookId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/books/${bookId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setSelectedBook(null);
        fetchBooks();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* 3D Immersive Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-3d border border-amber-500/30 p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Talabalar Kitob Bozori & Ayirboshlash</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Darsliklarni soting yoki <br />
              <span className="text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.4)]">
                o'zaro tekinga
              </span> almashtiring!
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              O'tgan semestr darsliklaringiz shkafda qolib ketmasin. Yangi kitoblarni esa do'kondan 2-3 barobar arzonroq xarid qiling.
            </p>
          </div>

          <button
            onClick={() => {
              if (!currentUser) {
                window.location.href = "/login";
              } else {
                setIsAddModalOpen(true);
              }
            }}
            className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition-all shadow-[0_4px_0_#b45309] active:translate-y-1 active:shadow-[0_1px_0_#b45309] flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span>Kitob E'lonini Joylash</span>
          </button>
        </div>
      </div>

      {/* 3D Filters & Search Bar */}
      <div className="glass-3d rounded-2xl border border-slate-800 p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Kitob nomi, muallif yoki tavsif bo'yicha qidiruv..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full py-2.5 px-3 text-sm rounded-xl bg-slate-900/80 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="newest">Eng yangi e'lonlar</option>
              <option value="price_asc">Narxi: Avval arzonlar</option>
              <option value="price_desc">Narxi: Avval qimmatlar</option>
            </select>
          </div>
        </div>

        {/* Filter Tugmalari */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
          
          {/* Turi: Sotuvda / Almashtirish / Tekin */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-semibold mr-1">Turi:</span>
            <button
              onClick={() => setFilterType("")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filterType === ""
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
            >
              Barchasi
            </button>
            <button
              onClick={() => setFilterType("sell")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filterType === "sell"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
            >
              Sotuvda
            </button>
            <button
              onClick={() => setFilterType("exchange")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
                filterType === "exchange"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>Almashtirish</span>
            </button>
            <button
              onClick={() => setFilterType("free")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
                filterType === "free"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Tekinga</span>
            </button>
          </div>

          {/* Holati: Yangi / Yaxshi / O'rtacha */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">Holati:</span>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="">Barcha holatlar</option>
              <option value="Yangi">Yangi</option>
              <option value="Yaxshi">Yaxshi</option>
              <option value="O'rtacha">O'rtacha</option>
            </select>
          </div>

        </div>
      </div>

      {/* 3D Realistic Book Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-80 rounded-3xl bg-slate-800/60 animate-pulse" />
          ))}
        </div>
      ) : books.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {books.map((book) => {
            const isSold = book.status === "SOLD";
            const isReserved = book.status === "RESERVED";

            return (
              <div
                key={book.id}
                onClick={() => setSelectedBook(book)}
                className={`group flex flex-col justify-between rounded-3xl glass-3d border border-slate-800 p-4 transition-all cursor-pointer relative overflow-hidden ${
                  isSold ? "opacity-60" : "hover:border-amber-500/50"
                }`}
              >
                
                {/* 3D Book Cover & Spine Representation */}
                <div className="relative w-full h-52 rounded-2xl overflow-hidden bg-slate-900 border border-slate-700/60 shadow-lg group-hover:scale-[1.02] transition-transform">
                  <img
                    src={book.imageUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"}
                    alt={book.title}
                    className="w-full h-full object-cover object-center"
                  />

                  {/* 3D Spine Gradient overlay */}
                  <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

                  {/* Badges on Cover */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                    {book.isFree ? (
                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/90 text-white font-extrabold text-[11px] shadow-md">
                        Tekinga
                      </span>
                    ) : book.isExchange ? (
                      <span className="px-2.5 py-0.5 rounded-lg bg-cyan-500/90 text-white font-extrabold text-[11px] shadow-md flex items-center gap-1">
                        <Repeat className="w-3 h-3" />
                        <span>Almashtirish</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/95 text-slate-950 font-black text-xs shadow-md">
                        {book.price ? `${book.price.toLocaleString("uz-UZ")} so'm` : "Kelishiladi"}
                      </span>
                    )}
                  </div>

                  {/* Status Overlay */}
                  {isSold && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="px-3.5 py-1.5 rounded-xl bg-red-600/90 text-white font-black text-xs tracking-wider uppercase shadow-xl">
                        Sotildi
                      </span>
                    </div>
                  )}

                  {isReserved && !isSold && (
                    <div className="absolute bottom-2.5 right-2.5">
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/90 text-slate-950 font-bold text-[10px] shadow-md">
                        Band qilingan
                      </span>
                    </div>
                  )}
                </div>

                {/* Book Details */}
                <div className="mt-4 space-y-1 text-left flex-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{book.condition} holatda</span>
                    {book.publishYear && <span>{book.publishYear}-yil</span>}
                  </div>

                  <h3 className="font-extrabold text-sm text-white line-clamp-2 group-hover:text-amber-400 transition-colors">
                    {book.title}
                  </h3>

                  <p className="text-xs text-slate-400 truncate">
                    {book.author}
                  </p>
                </div>

                {/* Seller & Telegram footer */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="truncate font-medium text-slate-300">
                      {book.seller?.name || "Talaba"}
                    </span>
                    {book.seller?.isVerified && (
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    )}
                  </div>

                  {book.seller?.telegramUsername && (
                    <span className="text-[11px] font-bold text-sky-400 flex items-center gap-1">
                      <Send className="w-3 h-3" />
                      <span>Telegram</span>
                    </span>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 rounded-3xl glass-3d border border-slate-800 space-y-3">
          <BookMarked className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">Kitoblar topilmadi</h3>
          <p className="text-sm text-slate-400">Boshqa so'rov bo'yicha qidiring yoki birinchi bo'lib e'lon joylang!</p>
        </div>
      )}

      {/* Quick Detail & Direct Telegram Contact Modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-[#0f172a] rounded-3xl border border-amber-500/30 max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto text-left">
            
            <button
              onClick={() => setSelectedBook(null)}
              className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="w-full sm:w-44 h-60 rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 shrink-0 shadow-lg relative">
                <img
                  src={selectedBook.imageUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"}
                  alt={selectedBook.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-xs uppercase">
                    {selectedBook.condition}
                  </span>
                  {selectedBook.publishYear && (
                    <span className="text-xs text-slate-400">{selectedBook.publishYear}-yil</span>
                  )}
                </div>

                <h2 className="text-xl font-extrabold text-white leading-snug">
                  {selectedBook.title}
                </h2>

                <p className="text-xs font-semibold text-slate-400">
                  Muallif: <span className="text-slate-200">{selectedBook.author}</span>
                </p>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                  <p className="text-xs text-slate-400">Narxi:</p>
                  <p className="text-xl font-black text-amber-400 mt-0.5">
                    {selectedBook.isFree
                      ? "Tekinga beriladi 🎁"
                      : selectedBook.isExchange
                      ? "Boshqa kitobga almashtiriladi 🔄"
                      : `${selectedBook.price?.toLocaleString("uz-UZ")} so'm`}
                  </p>
                </div>
              </div>
            </div>

            {selectedBook.description && (
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">E'lon mazmuni:</p>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {selectedBook.description}
                </p>
              </div>
            )}

            {/* Seller Contact Card (TZ 3.4: Aloqa mexanizmi - Telegram) */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                  {selectedBook.seller?.name?.charAt(0) || "U"}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-sm text-white">{selectedBook.seller?.name}</p>
                    {selectedBook.seller?.isVerified && (
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    {selectedBook.seller?.university?.name || "Talaba"}
                  </p>
                </div>
              </div>

              {selectedBook.seller?.telegramUsername ? (
                <a
                  href={`https://t.me/${selectedBook.seller.telegramUsername.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>Telegram orqali bog'lanish</span>
                </a>
              ) : selectedBook.seller?.phone ? (
                <a
                  href={`tel:${selectedBook.seller.phone}`}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md"
                >
                  <Phone className="w-4 h-4" />
                  <span>Qo'ng'iroq qilish</span>
                </a>
              ) : (
                <span className="text-xs text-slate-400">Aloqa ma'lumoti ko'rsatilmagan</span>
              )}
            </div>

            {/* Status updates for Author */}
            {currentUser && currentUser.id === selectedBook.sellerId && (
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <p className="text-xs font-semibold text-slate-400">Sizning e'loningiz — Statusni o'zgartirish:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedBook.id, "AVAILABLE")}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                  >
                    Sotuvda
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedBook.id, "RESERVED")}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-semibold hover:bg-amber-500/30"
                  >
                    Band qilindi
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedBook.id, "SOLD")}
                    className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 text-xs font-semibold hover:bg-red-500/30"
                  >
                    Sotildi
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Add Book 3D Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-[#0f172a] rounded-3xl border border-amber-500/30 max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto text-left">
            
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-black text-white">
              Kitob E'lonini Joylash
            </h2>

            {formError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateBook} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Kitob Nomi *</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Grokking Algorithms"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Muallif *</label>
                  <input
                    type="text"
                    required
                    placeholder="Aditya Bhargava"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Nashr Yili</label>
                  <input
                    type="number"
                    value={newYear}
                    onChange={(e) => setNewYear(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Kitob Holati</label>
                <select
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
                >
                  <option value="Yangi">Yangi (ishlatilmagan)</option>
                  <option value="Yaxshi">Yaxshi (belgilar kam)</option>
                  <option value="O'rtacha">O'rtacha (sahifalari to'liq)</option>
                </select>
              </div>

              {/* Tekin / Almashtirish / Narx */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isFreeCheck"
                      checked={isFree}
                      onChange={(e) => {
                        setIsFree(e.target.checked);
                        if (e.target.checked) setIsExchange(false);
                      }}
                      className="w-4 h-4 text-amber-500 rounded"
                    />
                    <label htmlFor="isFreeCheck" className="text-xs font-semibold text-slate-200">
                      Tekinga beriladi 🎁
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isExchangeCheck"
                      checked={isExchange}
                      onChange={(e) => {
                        setIsExchange(e.target.checked);
                        if (e.target.checked) setIsFree(false);
                      }}
                      className="w-4 h-4 text-amber-500 rounded"
                    />
                    <label htmlFor="isExchangeCheck" className="text-xs font-semibold text-slate-200">
                      Almashtiriladi 🔄
                    </label>
                  </div>
                </div>

                {!isFree && !isExchange && (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Narxi (so'mda):</label>
                    <input
                      type="number"
                      step={1000}
                      placeholder="50000"
                      value={newPrice}
                      onChange={(e) => setNewPrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Kitob Rasmi Havolasi (URL)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Tavsif va Aloqa</label>
                <textarea
                  rows={3}
                  placeholder="Kitob qayerdan olib ketilishi mumkin, holati haqida qo'shimcha ma'lumot..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-[0_4px_0_#b45309] active:translate-y-1 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? "Joylanmoqda..." : "E'lonni Saqlash"}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function BooksPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Kitoblar bozori yuklanmoqda...</p>
        </div>
      }
    >
      <BooksContent />
    </Suspense>
  );
}
