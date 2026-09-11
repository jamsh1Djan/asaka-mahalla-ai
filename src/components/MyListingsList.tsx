"use client";

import Image from "next/image";
import { useTransition } from "react";
import { Home, Briefcase, Megaphone, AlertCircle } from "lucide-react";
import { deleteOwnListingAction } from "@/actions/listings";
import { fmt, fmtDateTime } from "@/lib/format";
import type { Business, Listing, Mahalla } from "@prisma/client";

function maoshLine(l: Pick<Listing, "maoshMin" | "maoshMax">): string | null {
  if (l.maoshMin != null && l.maoshMax != null) return `${fmt(l.maoshMin)} – ${fmt(l.maoshMax)} so'm`;
  if (l.maoshMin != null) return `${fmt(l.maoshMin)} so'mdan`;
  if (l.maoshMax != null) return `${fmt(l.maoshMax)} so'mgacha`;
  return null;
}

const TYPE_ICONS: Record<string, typeof Home> = {
  IJARA: Home,
  ISH: Briefcase,
  BOSHQA: Megaphone,
};
const TYPE_LABELS: Record<string, string> = {
  IJARA: "Ijara",
  ISH: "Ish o'rni",
  BOSHQA: "Boshqa",
};
const STATUS_LABEL: Record<string, string> = {
  KUTILMOQDA: "Kutilmoqda",
  TASDIQLANGAN: "Tasdiqlangan",
  RAD_ETILGAN: "Rad etildi",
};
const STATUS_CLASS: Record<string, string> = {
  KUTILMOQDA: "status-korib",
  TASDIQLANGAN: "status-bog",
  RAD_ETILGAN: "status-yangi",
};

type Row = Listing & { mahalla: Pick<Mahalla, "nomi">; business: Pick<Business, "nomi"> | null };

export default function MyListingsList({ listings }: { listings: Row[] }) {
  const [isPending, startTransition] = useTransition();

  if (listings.length === 0) {
    return (
      <div className="card">
        <div className="empty">Hozircha e&apos;lon bermagansiz.</div>
      </div>
    );
  }

  return (
    <div className="grid grid-2">
      {listings.map((l) => {
        const Icon = TYPE_ICONS[l.turi];
        return (
          <div key={l.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
              <span className="listing-type-tag">
                <Icon size={12} />
                {TYPE_LABELS[l.turi]}
              </span>
              <span className={`status-badge ${STATUS_CLASS[l.status]}`}>{STATUS_LABEL[l.status]}</span>
            </div>

            {l.images.length > 0 && (
              <div style={{ position: "relative", width: "100%", height: 130, borderRadius: 12, overflow: "hidden", margin: "10px 0" }}>
                <Image src={l.images[0]} alt={l.sarlavha} fill style={{ objectFit: "cover" }} />
              </div>
            )}

            <h4 style={{ margin: "10px 0 4px" }}>{l.sarlavha}</h4>
            <p className="small-muted" style={{ marginBottom: 8 }}>{l.mahalla.nomi} mahallasi</p>
            <p style={{ fontSize: 13.5, marginBottom: 8 }}>{l.tavsif}</p>
            {l.narx != null && <div className="small-muted">Narx/maosh: {fmt(l.narx)} so&apos;m</div>}
            {maoshLine(l) && <div className="small-muted">Maosh: {maoshLine(l)}</div>}
            {l.business && <div className="small-muted">Korxona: {l.business.nomi}</div>}
            {l.talablar && <div className="small-muted">Talablar: {l.talablar}</div>}
            <div className="small-muted">Manzil: {l.manzil}</div>
            <div className="small-muted">Yuborilgan: {fmtDateTime(l.createdAt)}</div>

            {l.status === "RAD_ETILGAN" && (
              <div className="err" style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 10 }}>
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>Sabab: {l.rejectReason || "Ko'rsatilmagan"}</span>
              </div>
            )}

            <div style={{ marginTop: 12 }}>
              <button
                className="btn btn-outline btn-sm"
                disabled={isPending}
                onClick={() => {
                  if (!confirm("E'lonni o'chirishni tasdiqlaysizmi?")) return;
                  startTransition(() => deleteOwnListingAction(l.id));
                }}
              >
                O&apos;chirish
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
