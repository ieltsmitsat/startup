import type { Metadata } from "next";
import "./globals.css";
import PublicLayoutWrapper from "@/components/PublicLayoutWrapper";

export const metadata: Metadata = {
  title: "StudentHub — Talabalar uchun Yagona 3D Raqamli Platforma",
  description:
    "O'quv materiallari, imtihon savollari, kitoblar bozori, talabalar uchun ish va amaliyot o'rinlari, grantlar hamda jamoa qidirish platformasi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className="dark h-full">
      <body className="min-h-full flex flex-col bg-[#080c16] text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        <PublicLayoutWrapper>{children}</PublicLayoutWrapper>
      </body>
    </html>
  );
}
