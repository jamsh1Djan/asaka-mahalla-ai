import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession, isBanker } from "@/lib/auth";
import ArizalarTable from "@/components/ArizalarTable";
import ProfileForm from "@/components/ProfileForm";
import MahallaCard from "@/components/MahallaCard";
import ListingsManager from "@/components/ListingsManager";
import TwoFactorSection from "@/components/TwoFactorSection";
import Reveal from "@/components/Reveal";
import DashSubNav from "@/components/DashSubNav";

export const metadata = { title: "Bankir kabineti — Asaka Mahalla AI" };

const TABS = [
  ["arizalar", "Arizalar"],
  ["mahallalar", "Mahallalarim"],
  ["elonlar", "E'lonlar boshqaruvi"],
  ["profil", "Profil"],
] as const;

export default async function BankirPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await getSession();
  if (!isBanker(session)) redirect("/kirish?rol=banker");
  if (session.role === "ADMIN") redirect("/admin");

  const { tab: rawTab } = await searchParams;
  const tab = (["arizalar", "mahallalar", "elonlar", "profil"] as const).includes(rawTab as never)
    ? (rawTab as "arizalar" | "mahallalar" | "elonlar" | "profil")
    : "arizalar";

  const banker = await prisma.banker.findUniqueOrThrow({
    where: { id: session.bankerId },
    include: { mahallalar: { include: { mahalla: true } } },
  });
  if (banker.mustChangePassword) redirect("/parol-almashtirish");

  const myMahallas = banker.mahallalar.map((bm) => bm.mahalla);
  const myMahallaIds = myMahallas.map((m) => m.id);

  const applications =
    tab === "arizalar"
      ? await prisma.application.findMany({
          where: { mahallaId: { in: myMahallaIds } },
          include: { mahalla: { select: { nomi: true } } },
          orderBy: { createdAt: "desc" },
        })
      : [];

  const [listings, businesses] =
    tab === "elonlar"
      ? await Promise.all([
          prisma.listing.findMany({
            where: { mahallaId: { in: myMahallaIds } },
            include: { mahalla: { select: { nomi: true } }, business: { select: { nomi: true } } },
            orderBy: { createdAt: "desc" },
          }),
          prisma.business.findMany({ where: { mahallaId: { in: myMahallaIds } }, orderBy: { nomi: "asc" } }),
        ])
      : [[], []];

  return (
    <>
      <DashSubNav tabs={TABS} activeKey={tab} basePath="/bankir" />
      <section>
        <div className="wrap">
          <Reveal>
            <div className="section-head">
              <div className="section-eyebrow">Bankir kabineti</div>
              <h2 className="section-title">Assalomu alaykum, {banker.ism}</h2>
              <p className="section-desc">
                Sizga biriktirilgan mahallalar: {myMahallas.map((m) => m.nomi).join(", ") || "— (admin biriktiradi)"}
              </p>
            </div>
          </Reveal>

          {tab === "arizalar" && (
            <ArizalarTable applications={applications} title="Sizga biriktirilgan mahallalardan arizalar" />
          )}

          {tab === "mahallalar" && (
            <div className="grid grid-2">
              {myMahallas.map((m) => (
                <MahallaCard key={m.id} m={m} />
              ))}
            </div>
          )}

          {tab === "elonlar" && (
            <ListingsManager listings={listings} mahallas={myMahallas} businesses={businesses} />
          )}

          {tab === "profil" && (
            <>
              <ProfileForm banker={banker} />
              <TwoFactorSection totpEnabled={banker.totpEnabled} />
            </>
          )}
        </div>
      </section>
    </>
  );
}
