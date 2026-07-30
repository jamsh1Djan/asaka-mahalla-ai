import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LogoMark from "@/components/Logo";
import { getSession } from "@/lib/auth";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Asaka Mahalla AI",
  description: "Mahalla bankiri uchun aqlli raqamli yordamchi",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="uz" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <div id="splash" aria-hidden="true">
          <div className="splash-corner tl" />
          <div className="splash-corner tr" />
          <div className="splash-corner bl" />
          <div className="splash-corner br" />
          <div className="splash-inner">
            <div className="splash-glow" />
            <div className="splash-mark">
              <LogoMark size={42} />
            </div>
            <div className="splash-title">
              Asaka<span>Mahalla</span> AI
            </div>
            <div className="splash-sub">Mahalla bankiri uchun aqlli raqamli yordamchi</div>
          </div>
        </div>
        <Header session={session} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
