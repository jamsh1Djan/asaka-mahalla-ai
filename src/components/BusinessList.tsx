import { Store, Phone, MapPin, Briefcase } from "lucide-react";
import type { Business, Listing } from "@prisma/client";

type BusinessWithJobs = Business & { listings: Pick<Listing, "id" | "sarlavha">[] };

export default function BusinessList({ businesses }: { businesses: BusinessWithJobs[] }) {
  if (businesses.length === 0) return null;

  return (
    <div className="card" style={{ marginBottom: 26 }}>
      <h4 style={{ margin: "0 0 4px" }}>Faoliyat yurituvchi korxonalar</h4>
      <p className="small-muted" style={{ marginBottom: 16 }}>
        Mahallada ro&apos;yxatdan o&apos;tgan korxonalar — MChJ, YATT va boshqa tadbirkorlik
        subyektlari.
      </p>
      <div className="grid grid-2">
        {businesses.map((b) => (
          <div key={b.id} style={{ padding: 14, background: "rgba(15, 43, 108, 0.03)", borderRadius: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Store size={15} color="var(--navy)" />
                <b>{b.nomi}</b>
              </div>
              {b.listings.length > 0 && (
                <span
                  className="listing-source-tag"
                  style={{ background: "var(--green-soft)", color: "#2b7a43", marginLeft: 0 }}
                >
                  <Briefcase size={11} /> Ish bor
                </span>
              )}
            </div>
            <div className="small-muted" style={{ marginTop: 4 }}>
              {b.turi}
            </div>
            <div className="small-muted" style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6 }}>
              <MapPin size={12} /> {b.manzil}
            </div>
            {b.telefon && (
              <div className="small-muted" style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
                <Phone size={12} /> {b.telefon}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
