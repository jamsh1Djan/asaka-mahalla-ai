"use client";

import { useState, useTransition } from "react";
import { deleteListingAction } from "@/actions/listings";
import { fmt, fmtDate } from "@/lib/format";
import ListingForm from "@/components/ListingForm";
import type { Listing, Mahalla } from "@prisma/client";

const TYPE_LABELS: Record<string, string> = {
  IJARA: "🏠 Ijara",
  ISH: "💼 Ish o'rni",
  BOSHQA: "📢 Boshqa",
};

type ListingWithMahalla = Listing & { mahalla: Pick<Mahalla, "nomi"> };

export default function ListingsManager({
  listings,
  mahallas,
}: {
  listings: ListingWithMahalla[];
  mahallas: Pick<Mahalla, "id" | "nomi">[];
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h4 style={{ margin: 0 }}>E&apos;lonlarim</h4>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd((v) => !v)}>
          {showAdd ? "Bekor qilish" : "+ Yangi e'lon"}
        </button>
      </div>

      {showAdd && (
        <div className="card" style={{ marginBottom: 18 }}>
          <ListingForm mahallas={mahallas} onDone={() => setShowAdd(false)} />
        </div>
      )}

      {listings.length === 0 ? (
        <div className="card">
          <div className="empty">Hozircha e&apos;lonlar yo&apos;q</div>
        </div>
      ) : (
        <div className="grid grid-2">
          {listings.map((l) =>
            editingId === l.id ? (
              <div key={l.id} className="card">
                <ListingForm mahallas={mahallas} listing={l} onDone={() => setEditingId(null)} />
              </div>
            ) : (
              <div key={l.id} className="card">
                <span className="tag" style={{ background: "var(--navy)" }}>
                  {TYPE_LABELS[l.turi]}
                </span>
                <h4 style={{ margin: "10px 0 4px" }}>{l.sarlavha}</h4>
                <p className="small-muted" style={{ marginBottom: 8 }}>{l.mahalla.nomi} mahallasi</p>
                <p style={{ fontSize: 13.5, marginBottom: 8 }}>{l.tavsif}</p>
                {l.narx != null && (
                  <div className="small-muted">Narx/maosh: {fmt(l.narx)} so&apos;m</div>
                )}
                <div className="small-muted">Manzil: {l.manzil}</div>
                <div className="small-muted">Tel: {l.telefon}</div>
                {l.amalMuddati && (
                  <div className="small-muted">
                    Amal qiladi: {fmtDate(l.amalMuddati)}
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => setEditingId(l.id)}>
                    Tahrirlash
                  </button>
                  <button
                    className="btn btn-outline btn-sm"
                    disabled={isPending}
                    onClick={() => {
                      if (!confirm("E'lonni o'chirishni tasdiqlaysizmi?")) return;
                      startTransition(() => deleteListingAction(l.id));
                    }}
                  >
                    O&apos;chirish
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
