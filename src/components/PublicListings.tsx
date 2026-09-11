import { Home, Briefcase, Megaphone, Users, Wallet, MapPin, Phone, Store, ClipboardList } from "lucide-react";
import { fmt, initials } from "@/lib/format";
import ListingImageLightbox from "@/components/ListingImageLightbox";
import type { Listing, Banker, Business } from "@prisma/client";

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

type ListingWithBanker = Listing & {
  banker: Pick<Banker, "ism"> | null;
  business: Pick<Business, "nomi"> | null;
};

function maoshLine(l: Pick<Listing, "maoshMin" | "maoshMax">): string | null {
  if (l.maoshMin != null && l.maoshMax != null) return `${fmt(l.maoshMin)} – ${fmt(l.maoshMax)} so'm`;
  if (l.maoshMin != null) return `${fmt(l.maoshMin)} so'mdan`;
  if (l.maoshMax != null) return `${fmt(l.maoshMax)} so'mgacha`;
  return null;
}

export default function PublicListings({ listings }: { listings: ListingWithBanker[] }) {
  // Defense in depth — the page query already filters by status, but a
  // moderation queue leaking into the public list here would be a real
  // privacy/trust problem, not just a display glitch.
  const visible = listings.filter((l) => l.status === "TASDIQLANGAN");
  if (visible.length === 0) return null;

  return (
    <div style={{ marginBottom: 26 }}>
      <h4 style={{ margin: "0 0 14px" }}>Mahalladagi e&apos;lonlar</h4>
      <div className="grid grid-2">
        {visible.map((l) => {
          const Icon = TYPE_ICONS[l.turi];
          return (
            <div key={l.id} className="card listing-card">
              <div className="listing-image-area">
                {l.images.length > 0 ? (
                  <ListingImageLightbox images={l.images} alt={l.sarlavha} />
                ) : (
                  <div className="listing-image-placeholder">
                    <Icon size={30} />
                  </div>
                )}
                <span className="listing-type-tag listing-type-tag-overlay">
                  <Icon size={12} />
                  {TYPE_LABELS[l.turi]}
                </span>
              </div>

              <h3 className="listing-title">{l.sarlavha}</h3>
              <p className="listing-desc">{l.tavsif}</p>

              <div className="listing-meta">
                {l.narx != null && (
                  <span>
                    <Wallet size={13} /> {fmt(l.narx)} so&apos;m
                  </span>
                )}
                {maoshLine(l) && (
                  <span>
                    <Wallet size={13} /> {maoshLine(l)}
                  </span>
                )}
                {l.business && (
                  <span>
                    <Store size={13} /> {l.business.nomi}
                  </span>
                )}
                <span>
                  <MapPin size={13} /> {l.manzil}
                </span>
                <span>
                  <Phone size={13} /> {l.telefon}
                </span>
              </div>
              {l.talablar && (
                <p className="small-muted" style={{ display: "flex", gap: 6, alignItems: "flex-start", marginTop: -4, marginBottom: 10 }}>
                  <ClipboardList size={13} style={{ flexShrink: 0, marginTop: 2 }} /> {l.talablar}
                </p>
              )}

              <hr className="soft" />
              <div className="listing-poster">
                {l.source === "FUQARO" ? (
                  <>
                    <div className="chat-avatar" style={{ background: "var(--sub2)" }}>
                      {initials(l.citizenName || "?")}
                    </div>
                    <span>Qo&apos;shni: {l.citizenName}</span>
                    <span className="listing-source-tag">
                      <Users size={11} /> Qo&apos;shni tomonidan
                    </span>
                  </>
                ) : (
                  <>
                    <div className="chat-avatar" style={{ background: "var(--navy)" }}>
                      {initials(l.banker?.ism || "?")}
                    </div>
                    <span>Bankir: {l.banker?.ism}</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
