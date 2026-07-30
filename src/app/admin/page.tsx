import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";
import { getSystemSettings } from "@/lib/settings";
import ArizalarTable from "@/components/ArizalarTable";
import AdminArizalarFilters from "@/components/AdminArizalarFilters";
import AdminBankersPanel from "@/components/AdminBankersPanel";
import AdminUsersSecurityPanel from "@/components/AdminUsersSecurityPanel";
import AdminMahallasPanel from "@/components/AdminMahallasPanel";
import AdminActivityLogPanel from "@/components/AdminActivityLogPanel";
import AdminLoginHistoryPanel from "@/components/AdminLoginHistoryPanel";
import AdminStatsPanel from "@/components/AdminStatsPanel";
import AdminSettingsPanel from "@/components/AdminSettingsPanel";
import ProfileForm from "@/components/ProfileForm";
import Reveal from "@/components/Reveal";
import TwoFactorSection from "@/components/TwoFactorSection";
import type { ApplicationStatus, Prisma } from "@prisma/client";

export const metadata = { title: "Admin panel — Asaka Mahalla AI" };

const TABS = [
  ["mahallalar", "Mahallalar"],
  ["bankirlar", "Bankirlar"],
  ["foydalanuvchilar", "Foydalanuvchilar"],
  ["arizalar", "Arizalar"],
  ["kirish-tarixi", "Kirish tarixi"],
  ["jurnal", "Faoliyat jurnali"],
  ["statistika", "Statistika"],
  ["sozlamalar", "Sozlamalar"],
  ["profil", "Profil"],
] as const;

type Tab = (typeof TABS)[number][0];

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    logAction?: string;
    mahallaId?: string;
    status?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const session = await getSession();
  if (!isAdmin(session)) redirect("/kirish?rol=banker");

  const me = await prisma.banker.findUniqueOrThrow({ where: { id: session.bankerId } });
  if (me.mustChangePassword) redirect("/parol-almashtirish");

  const { tab: rawTab, logAction, mahallaId, status, from, to } = await searchParams;
  const validTabs = TABS.map(([key]) => key);
  const tab: Tab = (validTabs as string[]).includes(rawTab ?? "") ? (rawTab as Tab) : "mahallalar";

  const needsMahallas = ["mahallalar", "bankirlar", "arizalar"].includes(tab);
  const mahallas = needsMahallas ? await prisma.mahalla.findMany({ orderBy: { nomi: "asc" } }) : [];

  const needsBankers = ["mahallalar", "bankirlar", "foydalanuvchilar"].includes(tab);
  const bankers = needsBankers
    ? await prisma.banker.findMany({ include: { mahallalar: true }, orderBy: { ism: "asc" } })
    : [];

  let applications: Prisma.ApplicationGetPayload<{ include: { mahalla: { select: { nomi: true } } } }>[] = [];
  if (tab === "arizalar") {
    const where: { mahallaId?: string; status?: ApplicationStatus; createdAt?: { gte?: Date; lte?: Date } } = {};
    if (mahallaId) where.mahallaId = mahallaId;
    if (status) where.status = status as ApplicationStatus;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(`${from}T00:00:00`);
      if (to) where.createdAt.lte = new Date(`${to}T23:59:59`);
    }
    applications = await prisma.application.findMany({
      where,
      include: { mahalla: { select: { nomi: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  const settings = await getSystemSettings();

  return (
    <section>
      <div className="wrap">
        <Reveal>
          <div className="section-head">
            <div className="section-eyebrow">Admin panel</div>
            <h2 className="section-title">Boshqaruv paneli</h2>
            <p className="section-desc">
              Barcha mahallalar, foydalanuvchilar va arizalarni to&apos;liq boshqarish
            </p>
          </div>
        </Reveal>

        {settings.enforce2faForAdmins && !me.totpEnabled && (
          <div className="warn-box" style={{ marginBottom: 18, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>
              Tizim siyosatiga ko&apos;ra Super Admin hisoblari uchun 2FA majburiy qilingan,
              lekin sizning hisobingizda hali yoqilmagan.{" "}
              <Link href="/admin?tab=profil" style={{ textDecoration: "underline", display: "inline-flex", alignItems: "center", gap: 4 }}>
                Hozir sozlash <ArrowRight size={13} />
              </Link>
            </span>
          </div>
        )}

        <div className="dash-tabs">
          {TABS.map(([key, label]) => (
            <Link key={key} href={`/admin?tab=${key}`} className={tab === key ? "active" : ""}>
              {label}
            </Link>
          ))}
        </div>

        {tab === "mahallalar" && <AdminMahallasPanel mahallas={mahallas} bankers={bankers} />}

        {tab === "bankirlar" && (
          <AdminBankersPanel bankers={bankers} mahallas={mahallas} currentBankerId={session.bankerId} />
        )}

        {tab === "foydalanuvchilar" && (
          <AdminUsersSecurityPanel users={bankers} currentBankerId={session.bankerId} />
        )}

        {tab === "arizalar" && (
          <>
            <AdminArizalarFilters mahallas={mahallas} mahallaId={mahallaId} status={status} from={from} to={to} />
            <ArizalarTable applications={applications} title={`Arizalar (${applications.length})`} />
          </>
        )}

        {tab === "kirish-tarixi" && <AdminLoginHistoryPanel from={from} to={to} />}

        {tab === "jurnal" && <AdminActivityLogPanel actionFilter={logAction} />}

        {tab === "statistika" && <AdminStatsPanel />}

        {tab === "sozlamalar" && (
          <AdminSettingsPanel
            aiPlannerYoqilgan={settings.aiPlannerYoqilgan}
            enforce2faForAdmins={settings.enforce2faForAdmins}
          />
        )}

        {tab === "profil" && (
          <>
            <ProfileForm banker={me} />
            <TwoFactorSection totpEnabled={me.totpEnabled} />
          </>
        )}
      </div>
    </section>
  );
}
