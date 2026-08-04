import { Home, Briefcase, Megaphone, Users, Wallet, MapPin, Phone } from "lucide-react";
import { fmt, initials } from "@/lib/format";
import ListingImageLightbox from "@/components/ListingImageLightbox";
import type { Listing, Banker } from "@prisma/client";

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

type ListingWithBanker = Listing & { banker: Pick<Banker, "ism"> | null };

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
                <span>
                  <MapPin size={13} /> {l.manzil}
                </span>
                <span>
                  <Phone size={13} /> {l.telefon}
                </span>
              </div>

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
