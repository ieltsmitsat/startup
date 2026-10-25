import Link from "next/link";
import { Users, ArrowLeft, Sparkles } from "lucide-react";

export default function TeamUpPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center mx-auto shadow-md">
        <Users className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>2-bosqich rejasida</span>
        </div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
          Team Up (Loyiha Uchun Hamkor Qidirish)
        </h1>
        <p className="text-sm text-zinc-500 max-w-md mx-auto">
          Startaplar, xakatonlar va ilmiy loyihalar uchun jamoa yig'ish hamda "Nega men?" motivatsion arizalari tizimi tez orada ishga tushadi!
        </p>
      </div>
      <Link
        href="/study"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Hozirda faol: Study bo'limiga o'tish</span>
      </Link>
    </div>
  );
}
