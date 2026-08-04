import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MyListingsList from "@/components/MyListingsList";
import Reveal from "@/components/Reveal";

export const metadata = { title: "Mening e'lonlarim — Asaka Mahalla AI" };

export default async function MeningElonlarimPage() {
  const session = await getSession();
  if (!session || session.kind !== "fuqaro") redirect("/kirish");

  const listings = await prisma.listing.findMany({
    where: { source: "FUQARO", citizenPhone: session.phone },
    include: { mahalla: { select: { nomi: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section>
      <div className="wrap">
        <Reveal>
          <div className="section-head">
            <div className="section-eyebrow">Mening e&apos;lonlarim</div>
            <h2 className="section-title">Joylagan e&apos;lonlaringiz</h2>
            <p className="section-desc">
              Har bir e&apos;loningizning holati — kutilmoqda, tasdiqlangan yoki rad etilgan —
              shu yerda ko&apos;rinadi.
            </p>
          </div>
        </Reveal>
        <Reveal variant="scale" delay={100}>
          <MyListingsList listings={listings} />
        </Reveal>
      </div>
    </section>
  );
}
