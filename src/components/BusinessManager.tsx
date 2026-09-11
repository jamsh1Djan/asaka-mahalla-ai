"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { deleteBusinessAction } from "@/actions/businesses";
import BusinessForm from "@/components/BusinessForm";
import type { Business } from "@prisma/client";

export default function BusinessManager({
  mahallaId,
  businesses,
}: {
  mahallaId: string;
  businesses: Business[];
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="card" style={{ marginTop: 26 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <h4 style={{ margin: 0 }}>
          Faoliyat yurituvchi korxonalar <span className="badge-role">Bankir/Admin</span>
        </h4>
        <button className="btn btn-outline btn-sm" onClick={() => setShowAdd((v) => !v)}>
          {showAdd ? (
            "Bekor qilish"
          ) : (
            <>
              <Plus size={14} /> Korxona qo&apos;shish
            </>
          )}
        </button>
      </div>
      <p className="small-muted" style={{ marginBottom: 16 }}>
        Bu ro&apos;yxat mahalla sahifasidagi &quot;Faoliyat yurituvchi korxonalar&quot; bo&apos;limida
        barchaga ko&apos;rinadi.
      </p>

      {showAdd && (
        <div className="card" style={{ marginBottom: 16 }}>
          <BusinessForm mahallaId={mahallaId} onDone={() => setShowAdd(false)} />
        </div>
      )}

      {businesses.length === 0 ? (
        <div className="empty">Hozircha korxona qo&apos;shilmagan</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {businesses.map((b) =>
            editingId === b.id ? (
              <div key={b.id} className="card">
                <BusinessForm mahallaId={mahallaId} business={b} onDone={() => setEditingId(null)} />
              </div>
            ) : (
              <div
                key={b.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  background: "rgba(15, 43, 108, 0.03)",
                  borderRadius: 12,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>{b.nomi}</div>
                  <div className="small-muted">
                    {b.turi} · {b.manzil}
                    {b.telefon ? ` · ${b.telefon}` : ""}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => setEditingId(b.id)}>
                    Tahrirlash
                  </button>
                  <button
                    className="btn btn-outline btn-sm"
                    disabled={isPending}
                    onClick={() => {
                      if (!confirm(`"${b.nomi}" korxonasini o'chirishni tasdiqlaysizmi?`)) return;
                      startTransition(() => deleteBusinessAction(b.id));
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
