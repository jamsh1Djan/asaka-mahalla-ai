import { prisma } from "@/lib/prisma";
import { fmt } from "@/lib/format";

const STATUS_LABELS: Record<string, string> = {
  YANGI: "Yangi",
  KORIB: "Ko'rib chiqilmoqda",
  BOG: "Bog'lanildi",
};

export default async function AdminStatsPanel() {
  const [mahallas, applicationsByStatus, applicationsByMahalla, bankerCount, listingCount] =
    await Promise.all([
      prisma.mahalla.findMany(),
      prisma.application.groupBy({ by: ["status"], _count: { status: true } }),
      prisma.application.groupBy({ by: ["mahallaId"], _count: { mahallaId: true } }),
      prisma.banker.count({ where: { role: "BANKER" } }),
      prisma.listing.count(),
    ]);

  const totalAholi = mahallas.reduce((s, m) => s + m.aholi, 0);
  const totalTadbirkor = mahallas.reduce((s, m) => s + m.tadbirkorlik, 0);
  const totalVakansiya = mahallas.reduce((s, m) => s + m.vakansiya, 0);
  const totalApplications = applicationsByStatus.reduce((s, g) => s + g._count.status, 0);

  const mahallaNameById = Object.fromEntries(mahallas.map((m) => [m.id, m.nomi]));
  const byMahallaSorted = [...applicationsByMahalla].sort(
    (a, b) => b._count.mahallaId - a._count.mahallaId
  );

  return (
    <div>
      <div className="grid grid-3" style={{ marginBottom: 22 }}>
        <div className="pill">
          <span>Jami mahallalar</span>
          <b>{mahallas.length}</b>
        </div>
        <div className="pill">
          <span>Jami aholi</span>
          <b>{fmt(totalAholi)}</b>
        </div>
        <div className="pill">
          <span>Tadbirkorlik subyektlari</span>
          <b>{fmt(totalTadbirkor)}</b>
        </div>
        <div className="pill">
          <span>Bo&apos;sh ish o&apos;rinlari</span>
          <b>{fmt(totalVakansiya)}</b>
        </div>
        <div className="pill">
          <span>Bankirlar soni</span>
          <b>{bankerCount}</b>
        </div>
        <div className="pill">
          <span>Jami e&apos;lonlar</span>
          <b>{listingCount}</b>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h4 style={{ margin: "0 0 14px" }}>Arizalar holati bo&apos;yicha (jami: {totalApplications})</h4>
          {applicationsByStatus.length === 0 ? (
            <div className="empty">Hozircha arizalar yo&apos;q</div>
          ) : (
            <table className="table">
              <tbody>
                {applicationsByStatus.map((g) => (
                  <tr key={g.status}>
                    <td>{STATUS_LABELS[g.status] ?? g.status}</td>
                    <td style={{ textAlign: "right", fontWeight: 800 }}>{g._count.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h4 style={{ margin: "0 0 14px" }}>Mahalla bo&apos;yicha arizalar</h4>
          {byMahallaSorted.length === 0 ? (
            <div className="empty">Hozircha arizalar yo&apos;q</div>
          ) : (
            <table className="table">
              <tbody>
                {byMahallaSorted.map((g) => (
                  <tr key={g.mahallaId}>
                    <td>{mahallaNameById[g.mahallaId] ?? g.mahallaId}</td>
                    <td style={{ textAlign: "right", fontWeight: 800 }}>{g._count.mahallaId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
