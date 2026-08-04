import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CitizenListingForm from "@/components/CitizenListingForm";
import Reveal from "@/components/Reveal";

export const metadata = { title: "E'lon berish — Asaka Mahalla AI" };

function nextPath(turi?: string, mahallaId?: string): string {
  const qs = new URLSearchParams();
  if (turi) qs.set("turi", turi);
  if (mahallaId) qs.set("mahallaId", mahallaId);
  const query = qs.toString();
  return `/elon-berish${query ? `?${query}` : ""}`;
}

export default async function ElonBerishPage({
  searchParams,
}: {
  searchParams: Promise<{ turi?: string; mahallaId?: string }>;
}) {
  const { turi, mahallaId } = await searchParams;
  const session = await getSession();

  if (!session || session.kind !== "fuqaro") {
    redirect(`/kirish?rol=fuqaro&next=${encodeURIComponent(nextPath(turi, mahallaId))}`);
  }

  const mahallas = await prisma.mahalla.findMany({ orderBy: { nomi: "asc" } });

  return (
    <section>
      <div className="wrap" style={{ maxWidth: 640 }}>
        <Reveal>
          <div className="section-head">
            <div className="section-eyebrow">E&apos;lon berish</div>
            <h2 className="section-title">Mahallangizga e&apos;lon joylang</h2>
            <p className="section-desc">
              E&apos;loningiz avval mahalla bankiriga tasdiqlash uchun tushadi, tasdiqlangach
              saytda umumiy ko&apos;rinishda chiqadi.
            </p>
          </div>
        </Reveal>
        <Reveal variant="scale" delay={100}>
          <div className="card">
            <CitizenListingForm
              mahallas={mahallas}
              defaultMahallaId={mahallaId}
              defaultTuri={turi}
              citizenName={session.name}
              defaultPhone={session.phone}
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
