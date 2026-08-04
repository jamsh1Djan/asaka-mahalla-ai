"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { Plus, Home, Briefcase, Megaphone, Users, Check, X as XIcon } from "lucide-react";
import {
  deleteListingAction,
  approveListingAction,
  rejectListingAction,
} from "@/actions/listings";
import { fmt, fmtDate, fmtDateTime, initials } from "@/lib/format";
import ListingForm from "@/components/ListingForm";
import type { Listing, Mahalla } from "@prisma/client";

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

  const pending = useMemo(() => listings.filter((l) => l.status === "KUTILMOQDA"), [listings]);
  const active = useMemo(() => listings.filter((l) => l.status !== "KUTILMOQDA"), [listings]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h4 style={{ margin: 0 }}>E&apos;lonlarim</h4>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd((v) => !v)}>
          {showAdd ? "Bekor qilish" : <><Plus size={14} /> Yangi e&apos;lon</>}
        </button>
      </div>

      {showAdd && (
        <div className="card" style={{ marginBottom: 18 }}>
          <ListingForm mahallas={mahallas} onDone={() => setShowAdd(false)} />
        </div>
      )}

      {pending.length > 0 && (
        <div style={{ marginBottom: 26 }}>
          <h4 style={{ margin: "0 0 14px" }}>
            Tasdiqlash kutilayotgan e&apos;lonlar
            <span className="status-badge status-korib" style={{ marginLeft: 10 }}>
              {pending.length}
            </span>
          </h4>
          <div className="grid grid-2">
            {pending.map((l) => {
              const Icon = TYPE_ICONS[l.turi];
              return (
                <div key={l.id} className="card" style={{ borderColor: "rgba(201,154,46,0.4)" }}>
                  <span className="listing-type-tag">
                    <Icon size={12} />
                    {TYPE_LABELS[l.turi]}
                  </span>
                  {l.images.length > 0 && (
                    <div style={{ position: "relative", width: "100%", height: 130, borderRadius: 12, overflow: "hidden", margin: "10px 0" }}>
                      <Image src={l.images[0]} alt={l.sarlavha} fill style={{ objectFit: "cover" }} />
                    </div>
                  )}
                  <h4 style={{ margin: "10px 0 4px" }}>{l.sarlavha}</h4>
                  <p className="small-muted" style={{ marginBottom: 8 }}>{l.mahalla.nomi} mahallasi</p>
                  <p style={{ fontSize: 13.5, marginBottom: 8 }}>{l.tavsif}</p>
                  {l.narx != null && <div className="small-muted">Narx/maosh: {fmt(l.narx)} so&apos;m</div>}
                  <div className="small-muted">Manzil: {l.manzil}</div>
                  <div className="small-muted" style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                    <Users size={13} /> {l.citizenName} · {l.citizenPhone}
                  </div>
                  <div className="small-muted">Yuborilgan: {fmtDateTime(l.createdAt)}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button
                      className="btn btn-primary btn-sm"
                      disabled={isPending}
                      onClick={() => startTransition(() => approveListingAction(l.id))}
                    >
                      <Check size={14} /> Tasdiqlash
                    </button>
                    <button
                      className="btn btn-outline btn-sm"
                      disabled={isPending}
                      onClick={() => {
                        const reason = window.prompt(
                          "Rad etish sababi (ixtiyoriy, bo'sh qoldirsangiz ham bo'ladi):"
                        );
                        if (reason === null) return; // cancelled — don't reject at all
                        startTransition(() => rejectListingAction(l.id, reason || undefined));
                      }}
                    >
                      <XIcon size={14} /> Rad etish
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <h4 style={{ margin: "0 0 14px" }}>Faol e&apos;lonlar</h4>
      {active.length === 0 ? (
        <div className="card">
          <div className="empty">Hozircha e&apos;lonlar yo&apos;q</div>
        </div>
      ) : (
        <div className="grid grid-2">
          {active.map((l) =>
            editingId === l.id ? (
              <div key={l.id} className="card">
                <ListingForm mahallas={mahallas} listing={l} onDone={() => setEditingId(null)} />
              </div>
            ) : (
              <div key={l.id} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                  <span className="listing-type-tag">
                    {(() => { const Icon = TYPE_ICONS[l.turi]; return <Icon size={12} />; })()}
                    {TYPE_LABELS[l.turi]}
                  </span>
                  {l.status === "RAD_ETILGAN" && <span className="status-badge status-yangi">Rad etilgan</span>}
                </div>
                {l.images.length > 0 && (
                  <div style={{ position: "relative", width: "100%", height: 130, borderRadius: 12, overflow: "hidden", margin: "10px 0" }}>
                    <Image src={l.images[0]} alt={l.sarlavha} fill style={{ objectFit: "cover" }} />
                  </div>
                )}
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
                <div className="small-muted" style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                  {l.source === "FUQARO" ? (
                    <>
                      <Users size={13} /> Qo&apos;shni: {l.citizenName}
                    </>
                  ) : (
                    <>
                      <span className="chat-avatar" style={{ width: 20, height: 20, fontSize: 9, background: "var(--navy)" }}>
                        {initials(l.mahalla.nomi)}
                      </span>
                      Bankir e&apos;loni
                    </>
                  )}
                </div>
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
