import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Users, Home, Briefcase, Wrench, Building2, ClipboardList, Plus, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { fmt, initials } from "@/lib/format";
import { getSession } from "@/lib/auth";
import { canEditMahalla } from "@/lib/authz";
import { getSystemSettings } from "@/lib/settings";
import type { Banker } from "@prisma/client";
import ArizaForm from "@/components/ArizaForm";
import AiPlanner from "@/components/AiPlanner";
import MahallaEditPanel from "@/components/MahallaEditPanel";
import ArizalarTable from "@/components/ArizalarTable";
import PublicListings from "@/components/PublicListings";
import BusinessList from "@/components/BusinessList";
import BusinessManager from "@/components/BusinessManager";
import Reveal from "@/components/Reveal";

export default async function MahallaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Each round trip to the (remote) Neon database costs real, fixed latency
  // (300ms-1.5s was measured per query here — this app's users are far from
  // its us-east-1 region), so the only lever that actually helps is
  // collapsing every independent query into one wave instead of paying that
  // latency once per sequential stage. getSession() is cookie-only, no DB,
  // so it resolves first and everything else — including canEditMahalla's
  // own DB check, and the banker lookup that used to be BankerInfo's own
  // separate nested-component fetch — fires together in a single batch.
  const session = await getSession();
  const [mahalla, canEdit, listings, settings, bankerLink, businesses] = await Promise.all([
    prisma.mahalla.findUnique({ where: { id } }),
    canEditMahalla(session, id),
    prisma.listing.findMany({
      where: {
        mahallaId: id,
        status: "TASDIQLANGAN",
        OR: [{ amalMuddati: null }, { amalMuddati: { gte: new Date() } }],
      },
      include: { banker: { select: { ism: true } }, business: { select: { nomi: true } } },
      orderBy: { createdAt: "desc" },
    }),
    getSystemSettings(),
    prisma.bankerMahalla.findFirst({ where: { mahallaId: id }, include: { banker: true } }),
    prisma.business.findMany({
      where: { mahallaId: id },
      include: {
        listings: {
          where: { turi: "ISH", status: "TASDIQLANGAN" },
          select: { id: true, sarlavha: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  if (!mahalla) notFound();

  // Only staff (canEdit) ever see this, and it needs canEdit's result first,
  // so it's the one genuinely sequential fetch left.
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
        <Reveal>
          <div className="section-eyebrow">Yunusobod tumani · {mahalla.sector}</div>
          <h2 className="section-title" style={{ fontSize: 32 }}>
            {mahalla.nomi} MFY
          </h2>
          <p className="section-desc">
            Mahalla {mahalla.tashkil}-yilda tashkil etilgan. Asosiy yo&apos;nalish:{" "}
            <b>{mahalla.drayver}</b>
          </p>
        </Reveal>

        {mahalla.image && (
          <div style={{ position: "relative", width: "100%", height: 280, borderRadius: 24, overflow: "hidden", margin: "18px 0" }}>
            <Image src={mahalla.image} alt={mahalla.nomi} fill style={{ objectFit: "cover" }} />
          </div>
        )}

        <div className="pill-row">
          <div className="pill">
            <div className="ic" style={{ background: "var(--rose-soft)" }}><Users size={17} color="var(--red)" /></div>
            <b>{fmt(mahalla.aholi)}</b>
            <span>
              Jami aholi ({fmt(mahalla.erkak)} erkak, {fmt(mahalla.ayol)} ayol)
            </span>
          </div>
          <div className="pill">
            <div className="ic" style={{ background: "var(--blue-soft)" }}><Home size={17} color="var(--navy)" /></div>
            <b>{fmt(mahalla.xonadon)}</b>
            <span>Xonadonlar soni</span>
          </div>
          <div className="pill">
            <div className="ic" style={{ background: "var(--green-soft)" }}><Briefcase size={17} color="#2b7a43" /></div>
            <b>{fmt(mahalla.tadbirkorlik)}</b>
            <span>Jami tadbirkorlik subyektlari</span>
          </div>
          <div className="pill">
            <div className="ic" style={{ background: "var(--green-soft)" }}><Wrench size={17} color="#2b7a43" /></div>
            <b>{fmt(mahalla.yatt)}</b>
            <span>YATT</span>
          </div>
          <div className="pill">
            <div className="ic" style={{ background: "var(--blue-soft)" }}><Building2 size={17} color="var(--navy)" /></div>
            <b>{fmt(mahalla.mchj)}</b>
            <span>MChJ</span>
          </div>
          <div className="pill">
            <div className="ic" style={{ background: "var(--gold-soft)" }}><ClipboardList size={17} color="#8a6a1e" /></div>
            <b>{fmt(mahalla.vakansiya)}</b>
            <span>Bo&apos;sh ish o&apos;rinlari</span>
          </div>
        </div>

        {/* Yagona milliy vakansiyalar bazasi (ish.mehnat.uz) hudud bo'yicha
            filtrlashni ulashiladigan URL parametr orqali qo'llab-quvvatlamaydi
            (real brauzerda tekshirilgan — filtr client-side/ichki API orqali
            ishlaydi, natija URL'ga aks etmaydi), shuning uchun oddiy havola —
            foydalanuvchi o'zi "Yunusobod" tumanini tanlaydi. */}
        <div style={{ marginBottom: 26 }}>
          <a
            href="https://ish.mehnat.uz/vacancies"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
          >
            <ExternalLink size={14} /> Yunusobod tumani bo&apos;yicha barcha vakansiyalar
          </a>
          <p className="small-muted" style={{ marginTop: 8 }}>
            Bandlikni ta&apos;minlash agentligining rasmiy milliy vakansiyalar bazasi — u yerda
            hududni &quot;Yunusobod&quot; deb tanlang.
          </p>
        </div>

        {mahalla.faoliyatTurlari && (
          <div className="card" style={{ marginBottom: 26 }}>
            <h4 style={{ margin: "0 0 10px" }}>Mahalladagi tadbirkorlik joylari</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {mahalla.faoliyatTurlari.split(",").map((t) => (
                <span key={t} className="chip" style={{ borderColor: "var(--line)", background: "var(--sand2)", color: "var(--ink)" }}>
                  {t.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        <BusinessList businesses={businesses} />

        <div className="grid grid-2" style={{ marginBottom: 10 }}>
          <div className="card">
            <h4 style={{ margin: "0 0 12px" }}>Mahalla bankiri</h4>
            <BankerInfo banker={bankerLink?.banker ?? null} />
            <hr className="soft" />
            <ArizaForm
              mahallaId={mahalla.id}
              mahallaNomi={mahalla.nomi}
              loggedIn={session?.kind === "fuqaro"}
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

        {session?.kind === "fuqaro" && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
            <Link href={`/elon-berish?mahallaId=${mahalla.id}`} className="btn btn-outline btn-sm">
              <Plus size={14} /> E&apos;lon berish
            </Link>
          </div>
        )}
        <PublicListings listings={listings} />

        {settings.aiPlannerYoqilgan ? (
          <AiPlanner mahallaId={mahalla.id} drayver={mahalla.drayver} nomi={mahalla.nomi} />
        ) : (
          <div className="card small-muted">
            AI biznes-reja tavsiyachisi hozircha administrator tomonidan o&apos;chirilgan.
          </div>
        )}

        {canEdit && (
          <>
            <MahallaEditPanel mahalla={mahalla} />
            <BusinessManager mahallaId={mahalla.id} businesses={businesses} />
            <ArizalarTable applications={applications} title={`Arizalar (${mahalla.nomi})`} />
          </>
        )}
      </div>
    </section>
  );
}

function BankerInfo({ banker: b }: { banker: Banker | null }) {
  if (!b) {
    return <p className="small-muted">Bankir hali biriktirilmagan</p>;
  }
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
