import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { fmt, initials } from "@/lib/format";
import { getSession } from "@/lib/auth";
import { canEditMahalla } from "@/lib/authz";
import ArizaForm from "@/components/ArizaForm";
import AiPlanner from "@/components/AiPlanner";
import MahallaEditPanel from "@/components/MahallaEditPanel";
import ArizalarTable from "@/components/ArizalarTable";

export default async function MahallaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mahalla = await prisma.mahalla.findUnique({ where: { id } });
  if (!mahalla) notFound();

  const session = await getSession();
  const canEdit = await canEditMahalla(session, id);

  const applications = canEdit
    ? await prisma.application.findMany({
        where: { mahallaId: id },
        include: { mahalla: { select: { nomi: true } } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const citizenName = session?.kind === "fuqaro" ? session.name : undefined;
  const citizenPhone = session?.kind === "fuqaro" ? session.phone : undefined;

  return (
    <section style={{ paddingBottom: 0 }}>
      <div className="wrap">
        <div className="section-eyebrow">Yunusobod tumani · {mahalla.sector}</div>
        <h2 className="section-title" style={{ fontSize: 32 }}>
          {mahalla.nomi} MFY
        </h2>
        <p className="section-desc">
          Mahalla {mahalla.tashkil}-yilda tashkil etilgan. Asosiy yo&apos;nalish:{" "}
          <b>{mahalla.drayver}</b>
        </p>

        {mahalla.image && (
          <div style={{ position: "relative", width: "100%", height: 280, borderRadius: 18, overflow: "hidden", margin: "18px 0" }}>
            <Image src={mahalla.image} alt={mahalla.nomi} fill style={{ objectFit: "cover" }} />
          </div>
        )}

        <div className="pill-row">
          <div className="pill">
            <div className="ic" style={{ background: "var(--rose-soft)" }}>👥</div>
            <b>{fmt(mahalla.aholi)}</b>
            <span>
              Jami aholi ({fmt(mahalla.erkak)} erkak, {fmt(mahalla.ayol)} ayol)
            </span>
          </div>
          <div className="pill">
            <div className="ic" style={{ background: "var(--blue-soft)" }}>🏠</div>
            <b>{fmt(mahalla.xonadon)}</b>
            <span>Xonadonlar soni</span>
          </div>
          <div className="pill">
            <div className="ic" style={{ background: "var(--green-soft)" }}>💼</div>
            <b>{fmt(mahalla.tadbirkorlik)}</b>
            <span>Tadbirkorlik subyektlari (YATT: {mahalla.yatt})</span>
          </div>
          <div className="pill">
            <div className="ic" style={{ background: "var(--gold-soft)" }}>📋</div>
            <b>{fmt(mahalla.vakansiya)}</b>
            <span>Bo&apos;sh ish o&apos;rinlari</span>
          </div>
        </div>

        <div className="grid grid-2" style={{ marginBottom: 10 }}>
          <div className="card">
            <h4 style={{ margin: "0 0 12px" }}>Mahalla bankiri</h4>
            <BankerInfo mahallaId={mahalla.id} />
            <hr className="soft" />
            <ArizaForm
              mahallaId={mahalla.id}
              mahallaNomi={mahalla.nomi}
              defaultName={citizenName}
              defaultPhone={citizenPhone}
            />
          </div>
          <div className="card">
            <h4 style={{ margin: "0 0 12px" }}>Mahalla agenti</h4>
            <p style={{ fontSize: 14, margin: "0 0 8px" }}>
              <b>{mahalla.agent}</b>
            </p>
            <p className="small-muted">
              Aholini tadbirkorlikka jalb qilish, moliyaviy savodxonlik va bandlikni
              ta&apos;minlash bo&apos;yicha ko&apos;maklashadi.
            </p>
          </div>
        </div>

        <AiPlanner mahallaId={mahalla.id} drayver={mahalla.drayver} nomi={mahalla.nomi} />

        {canEdit && (
          <>
            <MahallaEditPanel mahalla={mahalla} />
            <ArizalarTable applications={applications} title={`Arizalar (${mahalla.nomi})`} />
          </>
        )}
      </div>
    </section>
  );
}

async function BankerInfo({ mahallaId }: { mahallaId: string }) {
  const link = await prisma.bankerMahalla.findFirst({
    where: { mahallaId },
    include: { banker: true },
  });
  if (!link) {
    return <p className="small-muted">Bankir hali biriktirilmagan</p>;
  }
  const b = link.banker;
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <div className="chat-avatar" style={{ background: "var(--navy)", width: 44, height: 44, fontSize: 16 }}>
        {initials(b.ism)}
      </div>
      <div>
        <div style={{ fontWeight: 800 }}>{b.ism}</div>
        <div className="small-muted">
          {b.telefon || "Telefon ko'rsatilmagan"}
          {b.ishVaqti ? ` · ${b.ishVaqti}` : ""}
        </div>
      </div>
    </div>
  );
}
