import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fmtDateTime } from "@/lib/format";
import Reveal from "@/components/Reveal";
import type { ApplicationStatus } from "@prisma/client";

export const metadata = { title: "Arizalarim — Asaka Mahalla AI" };

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  YANGI: "Yangi",
  KORIB: "Ko'rib chiqilmoqda",
  BOG: "Bog'lanildi",
};
const STATUS_CLASS: Record<ApplicationStatus, string> = {
  YANGI: "status-yangi",
  KORIB: "status-korib",
  BOG: "status-bog",
};

export default async function ArizalarimPage() {
  const session = await getSession();
  if (!session || session.kind !== "fuqaro") redirect("/kirish");

  const applications = await prisma.application.findMany({
    where: { citizenId: session.citizenId },
    include: { mahalla: { select: { nomi: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section>
      <div className="wrap">
        <Reveal>
          <div className="section-head">
            <div className="section-eyebrow">Mening arizalarim</div>
            <h2 className="section-title">Yuborilgan arizalaringiz</h2>
            <p className="section-desc">
              Har bir arizangizning qachon yuborilgani va hozirgi holati shu yerda ko&apos;rinib
              turadi.
            </p>
          </div>
        </Reveal>

        {applications.length === 0 ? (
          <Reveal variant="scale" delay={100}>
            <div className="card">
              <div className="empty">
                Hozircha ariza yubormagansiz.
                <br />
                <Link href="/mahallalar" className="btn btn-primary btn-sm" style={{ marginTop: 14 }}>
                  Mahallamni tanlash
                </Link>
              </div>
            </div>
          </Reveal>
        ) : (
          <Reveal variant="scale" delay={100}>
            <div className="card">
              <table className="table">
                <thead>
                  <tr>
                    <th>Mahalla</th>
                    <th>Kredit turi</th>
                    <th>Izoh</th>
                    <th>Yuborilgan</th>
                    <th>Holati</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((a) => (
                    <tr key={a.id}>
                      <td>{a.mahalla.nomi}</td>
                      <td>{a.kredit}</td>
                      <td className="small-muted">{a.izoh || "—"}</td>
                      <td className="small-muted">{fmtDateTime(a.createdAt)}</td>
                      <td>
                        <span className={`status-badge ${STATUS_CLASS[a.status]}`}>
                          {STATUS_LABEL[a.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
