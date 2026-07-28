import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";
import ArizalarTable from "@/components/ArizalarTable";
import AdminBankersPanel from "@/components/AdminBankersPanel";
import AdminMahallasPanel from "@/components/AdminMahallasPanel";

export const metadata = { title: "Admin panel — Asaka Mahalla AI" };

const TABS = [
  ["bankirlar", "Bankirlar"],
  ["mahallalar", "Mahallalar"],
  ["arizalar", "Barcha arizalar"],
] as const;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await getSession();
  if (!isAdmin(session)) redirect("/kirish?rol=banker");

  const { tab: rawTab } = await searchParams;
  const tab = (["bankirlar", "mahallalar", "arizalar"] as const).includes(rawTab as never)
    ? (rawTab as "bankirlar" | "mahallalar" | "arizalar")
    : "bankirlar";

  const mahallas = await prisma.mahalla.findMany({ orderBy: { nomi: "asc" } });
  const bankers =
    tab === "bankirlar"
      ? await prisma.banker.findMany({
          where: { role: "BANKER" },
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

  return (
    <section>
      <div className="wrap">
        <div className="section-head">
          <div className="section-eyebrow">Admin panel</div>
          <h2 className="section-title">Boshqaruv paneli</h2>
          <p className="section-desc">
            Barcha mahallalar, bankirlar va arizalarni to&apos;liq boshqarish
          </p>
        </div>
        <div className="dash-tabs">
          {TABS.map(([key, label]) => (
            <Link key={key} href={`/admin?tab=${key}`} className={tab === key ? "active" : ""}>
              {label}
            </Link>
          ))}
        </div>

        {tab === "bankirlar" && <AdminBankersPanel bankers={bankers} mahallas={mahallas} />}
        {tab === "mahallalar" && <AdminMahallasPanel mahallas={mahallas} />}
        {tab === "arizalar" && <ArizalarTable applications={applications} title="Barcha arizalar" />}
      </div>
    </section>
  );
}
