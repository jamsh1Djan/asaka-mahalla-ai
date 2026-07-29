import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";
import { getSystemSettings } from "@/lib/settings";
import ArizalarTable from "@/components/ArizalarTable";
import AdminBankersPanel from "@/components/AdminBankersPanel";
import AdminMahallasPanel from "@/components/AdminMahallasPanel";
import AdminActivityLogPanel from "@/components/AdminActivityLogPanel";
import AdminStatsPanel from "@/components/AdminStatsPanel";
import AdminSettingsPanel from "@/components/AdminSettingsPanel";

export const metadata = { title: "Admin panel — Asaka Mahalla AI" };

const TABS = [
  ["bankirlar", "Foydalanuvchilar"],
  ["mahallalar", "Mahallalar"],
  ["arizalar", "Barcha arizalar"],
  ["statistika", "Statistika"],
  ["jurnal", "Faoliyat jurnali"],
  ["sozlamalar", "Sozlamalar"],
] as const;

type Tab = (typeof TABS)[number][0];

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; logAction?: string }>;
}) {
  const session = await getSession();
  if (!isAdmin(session)) redirect("/kirish?rol=banker");

  const { tab: rawTab, logAction } = await searchParams;
  const validTabs = TABS.map(([key]) => key);
  const tab: Tab = (validTabs as string[]).includes(rawTab ?? "")
    ? (rawTab as Tab)
    : "bankirlar";

  const mahallas = await prisma.mahalla.findMany({ orderBy: { nomi: "asc" } });
  const bankers =
    tab === "bankirlar"
      ? await prisma.banker.findMany({
          include: { mahallalar: true },
          orderBy: { ism: "asc" },
        })
      : [];
  const applications =
    tab === "arizalar"
      ? await prisma.application.findMany({
          include: { mahalla: { select: { nomi: true } } },
          orderBy: { createdAt: "desc" },
        })
      : [];
  const settings = tab === "sozlamalar" ? await getSystemSettings() : null;

  return (
    <section>
      <div className="wrap">
        <div className="section-head">
          <div className="section-eyebrow">Admin panel</div>
          <h2 className="section-title">Boshqaruv paneli</h2>
          <p className="section-desc">
            Barcha mahallalar, foydalanuvchilar va arizalarni to&apos;liq boshqarish
          </p>
        </div>
        <div className="dash-tabs">
          {TABS.map(([key, label]) => (
            <Link key={key} href={`/admin?tab=${key}`} className={tab === key ? "active" : ""}>
              {label}
            </Link>
          ))}
        </div>

        {tab === "bankirlar" && (
          <AdminBankersPanel bankers={bankers} mahallas={mahallas} currentBankerId={session.bankerId} />
        )}
        {tab === "mahallalar" && <AdminMahallasPanel mahallas={mahallas} />}
        {tab === "arizalar" && <ArizalarTable applications={applications} title="Barcha arizalar" />}
        {tab === "statistika" && <AdminStatsPanel />}
        {tab === "jurnal" && <AdminActivityLogPanel actionFilter={logAction} />}
        {tab === "sozlamalar" && settings && (
          <AdminSettingsPanel aiPlannerYoqilgan={settings.aiPlannerYoqilgan} />
        )}
      </div>
    </section>
  );
}
