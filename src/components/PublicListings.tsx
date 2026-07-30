import Image from "next/image";
import { Home, Briefcase, Megaphone } from "lucide-react";
import { fmt } from "@/lib/format";
import type { Listing } from "@prisma/client";

const TYPE_ICONS: Record<string, typeof Home> = {
  IJARA: Home,
  ISH: Briefcase,
  BOSHQA: Megaphone,
};
const TYPE_LABELS: Record<string, string> = {
  IJARA: "Ijaraga beriladi",
  ISH: "Bo'sh ish o'rni",
  BOSHQA: "E'lon",
};

export default function PublicListings({ listings }: { listings: Listing[] }) {
  if (listings.length === 0) return null;

  return (
    <div style={{ marginBottom: 26 }}>
      <h4 style={{ margin: "0 0 14px" }}>Mahalladagi e&apos;lonlar</h4>
      <div className="grid grid-2">
        {listings.map((l) => {
          const Icon = TYPE_ICONS[l.turi];
          return (
          <div key={l.id} className="card">
            {l.image && (
              <div style={{ position: "relative", width: "100%", height: 140, borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
                <Image src={l.image} alt={l.sarlavha} fill style={{ objectFit: "cover" }} />
              </div>
            )}
            <span className="tag" style={{ background: "var(--navy)", display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Icon size={12} />
              {TYPE_LABELS[l.turi]}
            </span>
            <h4 style={{ margin: "10px 0 6px" }}>{l.sarlavha}</h4>
            <p style={{ fontSize: 13.5, marginBottom: 8 }}>{l.tavsif}</p>
            {l.narx != null && (
              <div className="small-muted">Narx/maosh: {fmt(l.narx)} so&apos;m</div>
            )}
            <div className="small-muted">Manzil: {l.manzil}</div>
            <div className="small-muted">Tel: {l.telefon}</div>
          </div>
          );
        })}
      </div>
    </div>
  );
}
