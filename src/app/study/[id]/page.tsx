"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  ArrowLeft,
  Download,
  Star,
  CheckCircle2,
  FileText,
  Calendar,
  Eye,
  User,
  Share2,
  ThumbsUp,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { formatBytes, formatDate } from "@/lib/utils";

function MaterialDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [material, setMaterial] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Sharh qoldirish holatlari
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isHelpful, setIsHelpful] = useState(true);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  useEffect(() => {
    if (!id) return;
    async function loadMaterial() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/study/materials/${id}`);
        if (res.ok) {
          const data = await res.json();
          setMaterial(data.material);
        } else {
          setError("Material topilmadi");
        }
      } catch (e) {
        setError("Yuklashda xatolik");
      } finally {
        setIsLoading(false);
      }
    }
    loadMaterial();
  }, [id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    setReviewMessage("");

    try {
      const res = await fetch(`/api/study/materials/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment, isHelpful }),
      });

      const data = await res.json();
      if (res.ok) {
        setReviewMessage("Bahoyingiz muvaffaqiyatli saqlandi!");
        setComment("");
        // Ma'lumotni qayta yuklash
        const updatedRes = await fetch(`/api/study/materials/${id}`);
        if (updatedRes.ok) {
          const updatedData = await updatedRes.json();
          setMaterial(updatedData.material);
        }
      } else {
        setReviewMessage(data.error || "Xatolik yuz berdi");
      }
    } catch {
      setReviewMessage("Server bilan aloqa uzildi");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-zinc-500">Material tafsilotlari yuklanmoqda...</p>
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold">{error || "Material topilmadi"}</h2>
        <Link
          href="/study"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Materiallar ro'yxatiga qaytish</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Back button */}
      <Link
        href="/study"
        className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Barcha materiallar ro'yxatiga qaytish</span>
      </Link>

      {/* Main Material Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-10 shadow-sm space-y-8">
        
        {/* Top Badges & Meta */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              {material.materialType}
            </span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 uppercase">
              {material.fileType} • {formatBytes(material.fileSize)}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-zinc-500">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{material.viewsCount} ko'rildi</span>
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-4 h-4" />
              <span>{material.downloadsCount} yuklandi</span>
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(material.createdAt)}</span>
            </span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white leading-tight">
          {material.title}
        </h1>

        {/* University, Faculty, Subject Breadcrumb Path */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
          <span className="font-semibold text-zinc-900 dark:text-zinc-200">
            {material.subject?.faculty?.university?.name}
          </span>
          <span>/</span>
          <span>{material.subject?.faculty?.name}</span>
          <span>/</span>
          <span className="font-bold text-blue-600 dark:text-blue-400">
            {material.subject?.name}
          </span>
          {material.teacherName && (
            <span className="ml-auto text-xs bg-white dark:bg-zinc-900 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-700 font-medium">
              O'qituvchi: {material.teacherName}
            </span>
          )}
        </div>

        {/* Description */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
            Material Tavsifi:
          </h3>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base whitespace-pre-line">
            {material.description || "Ushbu material uchun batafsil matnli tavsif kiritilmagan."}
          </p>
        </div>

        {/* Download Action Area */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-900/60">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <p className="font-bold text-base text-zinc-900 dark:text-white">{material.fileName}</p>
              <p className="text-xs text-zinc-500 mt-0.5">Hajmi: {formatBytes(material.fileSize)} • Format: {material.fileType.toUpperCase()}</p>
            </div>
          </div>

          <a
            href={`/api/study/materials/${material.id}/download`}
            download={material.fileName}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
          >
            <Download className="w-5 h-5" />
            <span>Yuklab Olish</span>
          </a>
        </div>

        {/* Author Card */}
        <div className="flex items-center justify-between pt-6 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-lg font-bold text-blue-600">
              {material.author?.name?.charAt(0) || "U"}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-zinc-900 dark:text-white">
                  {material.author?.name}
                </span>
                {material.author?.isVerified && (
                  <span title="Tasdiqlangan talaba">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500">
                {material.author?.university?.name || "Talaba"}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Reviews & Ratings Section (TZ 3.2: 5 yulduzli baho qo'yish va izoh qoldirish) */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-10 shadow-sm space-y-8">
        
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Foydalanuvchilar Bahosi va Sharhlari
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              Materialning foydaliligi haqida o'z fikringizni bildiring
            </p>
          </div>

          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 px-4 py-2 rounded-2xl">
            <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
            <div>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {material.avgRating || "0.0"}
              </span>
              <span className="text-xs text-zinc-500 block">
                {material.reviewsCount} ta sharh
              </span>
            </div>
          </div>
        </div>

        {/* Add Review Form */}
        <form onSubmit={handleSubmitReview} className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700/80 space-y-4">
          <h3 className="font-bold text-base text-zinc-900 dark:text-white">
            Materialga baho qo'yish
          </h3>

          {/* Interactive Star Picker */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-500">Bahoyingiz:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 text-amber-400 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating ? "fill-amber-400 text-amber-400" : "text-zinc-300 dark:text-zinc-600"
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-sm font-bold text-amber-500 ml-2">{rating} / 5</span>
          </div>

          {/* Comment text */}
          <div>
            <textarea
              rows={3}
              placeholder="Material foydali bo'ldimi? Imtihon savollari to'g'rimi? Fikringizni qoldiring..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3 text-sm rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Helpful checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="helpful"
              checked={isHelpful}
              onChange={(e) => setIsHelpful(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="helpful" className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
              Bu material menga o'qishda/imtihonda yordam berdi
            </label>
          </div>

          {reviewMessage && (
            <p className="text-xs font-medium text-blue-600">{reviewMessage}</p>
          )}

          <button
            type="submit"
            disabled={isSubmittingReview}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors disabled:opacity-50"
          >
            {isSubmittingReview ? "Saqlanmoqda..." : "Sharhni Yuborish"}
          </button>
        </form>

        {/* Existing Reviews List */}
        <div className="space-y-4">
          {material.reviews?.length > 0 ? (
            material.reviews.map((rev: any) => (
              <div
                key={rev.id}
                className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center font-bold text-xs">
                      {rev.user?.name?.charAt(0) || "U"}
                    </div>
                    <span className="font-semibold text-sm text-zinc-900 dark:text-white">
                      {rev.user?.name}
                    </span>
                    {rev.user?.isVerified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                    ))}
                  </div>
                </div>

                {rev.comment && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 pl-9">
                    {rev.comment}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-zinc-400 pl-9 pt-1">
                  <span>{formatDate(rev.createdAt)}</span>
                  {rev.isHelpful && (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <ThumbsUp className="w-3 h-3" />
                      <span>Foydali deb topildi</span>
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-zinc-400 text-center py-6">
              Hozircha hech qanday sharh qoldirilmagan. Birinchi bo'lib fikr bildiring!
            </p>
          )}
        </div>

      </div>

    </div>
  );
}

export default function MaterialDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500 text-sm">Material tafsilotlari yuklanmoqda...</p>
        </div>
      }
    >
      <MaterialDetailContent />
    </Suspense>
  );
}
