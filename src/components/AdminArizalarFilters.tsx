import type { Mahalla } from "@prisma/client";

const STATUS_OPTIONS = [
  ["", "Barcha holatlar"],
  ["YANGI", "Yangi"],
  ["KORIB", "Ko'rib chiqilmoqda"],
  ["BOG", "Bog'lanildi"],
] as const;

export default function AdminArizalarFilters({
  mahallas,
  mahallaId,
  status,
  from,
  to,
}: {
  mahallas: Pick<Mahalla, "id" | "nomi">[];
  mahallaId?: string;
  status?: string;
  from?: string;
  to?: string;
}) {
  const hasFilter = mahallaId || status || from || to;

  return (
    <form method="get" className="card" style={{ marginBottom: 18, display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
      <input type="hidden" name="tab" value="arizalar" />
      <div className="field" style={{ margin: 0 }}>
        <label>Mahalla</label>
        <select name="mahallaId" defaultValue={mahallaId ?? ""}>
          <option value="">Barcha mahallalar</option>
          {mahallas.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nomi}
            </option>
          ))}
        </select>
      </div>
      <div className="field" style={{ margin: 0 }}>
        <label>Holati</label>
        <select name="status" defaultValue={status ?? ""}>
          {STATUS_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="field" style={{ margin: 0 }}>
        <label>Sanadan</label>
        <input type="date" name="from" defaultValue={from} />
      </div>
      <div className="field" style={{ margin: 0 }}>
        <label>Sanagacha</label>
        <input type="date" name="to" defaultValue={to} />
      </div>
      <button className="btn btn-outline btn-sm" type="submit">
        Filtrlash
      </button>
      {hasFilter && (
        <a className="btn btn-outline btn-sm" href="/admin?tab=arizalar">
          Tozalash
        </a>
      )}
    </form>
  );
}
