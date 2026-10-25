"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  GraduationCap,
  CheckCircle2,
  ShieldCheck,
  BookOpen,
  Send,
  Globe,
  Share2,
  FileText,
  Save,
  AlertCircle,
  Plus,
  X,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [universities, setUniversities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Tahrirlash maydonlari
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [major, setMajor] = useState("");
  const [academicYear, setAcademicYear] = useState<number>(1);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [userRes, uniRes] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/universities"),
        ]);

        if (userRes.ok) {
          const userData = await userRes.json();
          const u = userData.user;
          setUser(u);
          setName(u.name || "");
          setBio(u.bio || "");
          setSelectedUniversity(u.universityId || "");
          setSelectedFaculty(u.facultyId || "");
          setMajor(u.major || "");
          setAcademicYear(u.academicYear || 1);
          setSkills(u.skills || []);
          setTelegramUsername(u.telegramUsername || "");
          setGithubUrl(u.githubUrl || "");
          setLinkedinUrl(u.linkedinUrl || "");
        } else {
          router.push("/login");
        }

        if (uniRes.ok) {
          const uniData = await uniRes.json();
          setUniversities(uniData.universities || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [router]);

  const currentFaculties =
    universities.find((u) => u.id === selectedUniversity)?.faculties || [];

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          bio,
          universityId: selectedUniversity || null,
          facultyId: selectedFaculty || null,
          major,
          academicYear: Number(academicYear),
          skills,
          telegramUsername,
          githubUrl,
          linkedinUrl,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Profil ma'lumotlari muvaffaqiyatli saqlandi!");
        setUser(data.user);
      } else {
        setError(data.error || "Xatolik yuz berdi");
      }
    } catch {
      setError("Server bilan aloqa uzildi");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-zinc-500">Profil ma'lumotlari yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Profil Header Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-3xl shadow-lg shadow-blue-500/20">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-zinc-900 dark:text-white">
                  {user?.name}
                </h1>
                {user?.isVerified ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Tasdiqlangan Talaba</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verifikatsiya kutilmoqda</span>
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-500 mt-1">
                {user?.university?.name ? `${user.university.name}` : "Universitet belgilanmagan"}
                {user?.major && ` • ${user.major}`}
                {user?.academicYear && ` (${user.academicYear}-kurs)`}
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">{user?.email}</p>
            </div>
          </div>

          <Link
            href="/study"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-colors shrink-0"
          >
            <BookOpen className="w-4 h-4" />
            <span>Materiallarni ko'rish</span>
          </Link>
        </div>
      </div>

      {/* Profil Ma'lumotlarini Tahrirlash Formasi */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-4">
          Profil Ma'lumotlarini Yangilash
        </h2>

        {message && (
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-sm border border-emerald-200 dark:border-emerald-800">
            {message}
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 text-sm border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1">
                Ism va Familiya
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1">
                Universitet (OTM)
              </label>
              <select
                value={selectedUniversity}
                onChange={(e) => {
                  setSelectedUniversity(e.target.value);
                  setSelectedFaculty("");
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">OTMni tanlang</option>
                {universities.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1">
                Fakultet
              </label>
              <select
                disabled={!selectedUniversity}
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
              >
                <option value="">Fakultetni tanlang</option>
                {currentFaculties.map((f: any) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1">
                Ta'lim Yo'nalishi
              </label>
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1">
                Kurs Darajasi
              </label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(Number(e.target.value))}
                className="w-full py-2.5 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value={1}>1-kurs</option>
                <option value={2}>2-kurs</option>
                <option value={3}>3-kurs</option>
                <option value={4}>4-kurs</option>
                <option value={5}>Magistratura</option>
              </select>
            </div>
          </div>

          {/* Ko'nikmalar (Skills) */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1">
              Texnik va Amaliy Ko'nikmalar (Skills)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {skills.map((s, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                >
                  <span>{s}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(s)}
                    className="hover:text-red-500"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Yangi ko'nikma qo'shish (masalan: Python, Figma, React)..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                className="flex-1 px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-xs hover:bg-zinc-300"
              >
                Qo'shish
              </button>
            </div>
          </div>

          {/* Ijtimoiy Tarmoqlar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-sky-500" />
                <span>Telegram Username</span>
              </label>
              <input
                type="text"
                placeholder="@username"
                value={telegramUsername}
                onChange={(e) => setTelegramUsername(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>GitHub Havolasi</span>
              </label>
              <input
                type="text"
                placeholder="https://github.com/..."
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-blue-600" />
                <span>LinkedIn Havolasi</span>
              </label>
              <input
                type="text"
                placeholder="https://linkedin.com/in/..."
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1">
              O'zingiz haqingizda (Bio)
            </label>
            <textarea
              rows={3}
              placeholder="Qiziqishlaringiz, maqsadlaringiz va qaysi loyihalarga qiziqishingiz..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saqlanmoqda..." : "O'zgarishlarni Saqlash"}</span>
          </button>

        </form>
      </div>

      {/* Yuklangan Materiallar ro'yxati */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
          Siz yuklagan materiallar ({user?.materials?.length || 0})
        </h2>

        {user?.materials?.length > 0 ? (
          <div className="space-y-3">
            {user.materials.map((m: any) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <Link
                      href={`/study/${m.id}`}
                      className="font-bold text-sm text-zinc-900 dark:text-white hover:text-blue-600"
                    >
                      {m.title}
                    </Link>
                    <p className="text-xs text-zinc-400">
                      {formatDate(m.createdAt)} • {m.downloadsCount} marta yuklangan
                    </p>
                  </div>
                </div>

                <Link
                  href={`/study/${m.id}`}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Ko'rish
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-400 py-4">
            Siz hali hech qanday material yuklamadingiz.
          </p>
        )}
      </div>

    </div>
  );
}
