import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { fmtDateTime } from "@/lib/format";

const ACTION_LABELS: Record<string, string> = {
  login: "Kirish",
  logout: "Chiqish",
  mahalla_tahrirlandi: "Mahalla tahrirlandi",
  ariza_korildi: "Ariza holati o'zgartirildi",
  banker_qoshildi: "Bankir qo'shildi",
  banker_ozgartirildi: "Bankir o'zgartirildi",
  banker_ochirildi: "Bankir o'chirildi",
  profil_yangilandi: "Profil yangilandi",
  mahalla_qoshildi: "Mahalla qo'shildi",
  mahalla_ochirildi: "Mahalla o'chirildi",
  parol_reset_qilindi: "Parol reset qilindi",
  parol_ozgartirildi: "Parol o'zgartirildi",
  "2fa_yoqildi": "2FA yoqildi",
  "2fa_ochirildi": "2FA o'chirildi",
  tizim_sozlamasi_ozgartirildi: "Tizim sozlamasi o'zgartirildi",
};

export default async function AdminActivityLogPanel({ actionFilter }: { actionFilter?: string }) {
  const where = actionFilter && actionFilter in ACTION_LABELS ? { action: actionFilter } : {};

  const [logs, todayLogins, grouped] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      include: { banker: { select: { ism: true, login: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.activityLog.count({
      where: {
        action: "login",
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
    prisma.activityLog.groupBy({
      by: ["bankerId"],
      where: { bankerId: { not: null } },
      _count: { bankerId: true },
      orderBy: { _count: { bankerId: "desc" } },
      take: 1,
    }),
  ]);

  const mostActive = grouped[0]
    ? await prisma.banker.findUnique({ where: { id: grouped[0].bankerId! }, select: { ism: true } })
    : null;

  return (
    <div>
      <div className="pill-row" style={{ gridTemplateColumns: "repeat(2,1fr)", marginBottom: 22 }}>
        <div className="pill">
          <span>Bugun kirganlar soni</span>
          <b>{todayLogins}</b>
        </div>
        <div className="pill">
          <span>Eng faol bankir</span>
          <b style={{ fontSize: 15 }}>
            {mostActive ? `${mostActive.ism} (${grouped[0]._count.bankerId} amal)` : "—"}
          </b>
        </div>
      </div>

      <div className="dash-tabs">
        <Link href="/admin?tab=jurnal" className={!actionFilter ? "active" : ""}>
          Hammasi
        </Link>
        {Object.entries(ACTION_LABELS).map(([key, label]) => (
          <Link
            key={key}
            href={`/admin?tab=jurnal&logAction=${key}`}
            className={actionFilter === key ? "active" : ""}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="card">
        {logs.length === 0 ? (
          <div className="empty">Hozircha yozuvlar yo&apos;q</div>
        ) : (
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Kim</th>
                  <th>Nima qildi</th>
                  <th>Izoh</th>
                  <th>Qachon</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.banker ? `${log.banker.ism} (${log.banker.login})` : "—"}</td>
                    <td>{ACTION_LABELS[log.action] ?? log.action}</td>
                    <td className="small-muted table-wrap-cell">{log.detail ?? "—"}</td>
                    <td className="small-muted">{fmtDateTime(log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
