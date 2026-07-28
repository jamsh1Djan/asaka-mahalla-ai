import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSession } from "@/lib/auth";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
    <html lang="uz" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <div id="splash" aria-hidden="true">
          <div className="splash-glow" />
          <div className="splash-ring">
            <div className="splash-mark">AM</div>
          </div>
          <div className="splash-title">
            Asaka<span>Mahalla</span> AI
          </div>
          <div className="splash-sub">Mahalla bankiri uchun aqlli raqamli yordamchi</div>
        </div>
        <Header session={session} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
