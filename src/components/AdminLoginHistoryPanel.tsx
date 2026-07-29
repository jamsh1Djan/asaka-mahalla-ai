import { prisma } from "@/lib/prisma";
import { fmtDateTime } from "@/lib/format";

function shortUserAgent(ua: string | null) {
  if (!ua) return "—";
  if (ua.length <= 46) return ua;
  return ua.slice(0, 46) + "…";
}

export default async function AdminLoginHistoryPanel({
  from,
  to,
}: {
  from?: string;
  to?: string;
}) {
  const where: { loginAt?: { gte?: Date; lte?: Date } } = {};
  if (from || to) {
    where.loginAt = {};
    if (from) where.loginAt.gte = new Date(`${from}T00:00:00`);
    if (to) where.loginAt.lte = new Date(`${to}T23:59:59`);
  }

  const logs = await prisma.loginLog.findMany({
    where,
    include: { banker: { select: { ism: true, login: true, role: true } } },
    orderBy: { loginAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <form method="get" className="card" style={{ marginBottom: 18, display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
        <input type="hidden" name="tab" value="kirish-tarixi" />
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
        {(from || to) && (
          <a className="btn btn-outline btn-sm" href="/admin?tab=kirish-tarixi">
            Tozalash
          </a>
        )}
      </form>

      <div className="card">
        {logs.length === 0 ? (
          <div className="empty">Hozircha yozuvlar yo&apos;q</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Foydalanuvchi</th>
                <th>Rol</th>
                <th>Kirgan vaqt</th>
                <th>Chiqqan vaqt</th>
                <th>IP manzil</th>
                <th>Qurilma/brauzer</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.banker.ism} ({log.banker.login})</td>
                  <td className="small-muted">{log.banker.role === "ADMIN" ? "Super Admin" : "Bankir"}</td>
                  <td className="small-muted">{fmtDateTime(log.loginAt)}</td>
                  <td className="small-muted">
                    {log.logoutAt ? (
                      fmtDateTime(log.logoutAt)
                    ) : (
                      <span className="status-badge status-bog">hali faol</span>
                    )}
                  </td>
                  <td className="small-muted">{log.ipAddress ?? "—"}</td>
                  <td className="small-muted" title={log.userAgent ?? undefined}>
                    {shortUserAgent(log.userAgent)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
