import { AlertTriangle, ListChecks, TrendingUp, Users2, Wallet } from "lucide-react";
import type { BusinessIdea } from "@/actions/ai";

/** The full computed plan for one idea — cost breakdown, monthly operating
 * costs, a 12-month revenue-ramp projection, break-even, risks, and an
 * action checklist. Shown inline (toggled open) both on /biznes-reja and
 * the compact mahalla-page widget, so it lives in one place. */
export default function BusinessPlanDetail({ idea }: { idea: BusinessIdea }) {
  return (
    <div className="bp-detail">
      <section className="bp-detail-section">
        <h6>
          <Wallet size={14} /> Boshlang&apos;ich xarajatlar tafsiloti
        </h6>
        <div className="credit-rows">
          {idea.xarajat_tafsiloti.map((c) => (
            <div className="row" key={c.nomi}>
              <span>{c.nomi}</span>
              <b>{c.summa}</b>
            </div>
          ))}
        </div>
      </section>

      <section className="bp-detail-section">
        <h6>
          <Wallet size={14} /> Oylik operatsion xarajatlar (to&apos;liq quvvatda)
        </h6>
        <div className="credit-rows">
          {idea.oylik_xarajat_tafsiloti.map((c) => (
            <div className="row" key={c.nomi}>
              <span>{c.nomi}</span>
              <b>{c.summa}</b>
            </div>
          ))}
          <div className="row">
            <span>Sof oylik foyda</span>
            <b style={{ color: "var(--red)" }}>{idea.sof_oylik_foyda}</b>
          </div>
          <div className="row">
            <span>Investitsiya o&apos;zini qoplash muddati</span>
            <b>{idea.breakeven_oylar}</b>
          </div>
        </div>
      </section>

      <section className="bp-detail-section">
        <h6>
          <TrendingUp size={14} /> Birinchi yil prognozi
        </h6>
        <p className="small-muted" style={{ margin: "0 0 10px" }}>
          Yangi biznes odatda darhol to&apos;liq quvvatda ishlamaydi — daromad 1-3-oyda asta-sekin
          o&apos;sadi (40% → 65% → 85%), 4-oydan boshlab to&apos;liq quvvatga chiqadi deb hisoblangan.
        </p>
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Oy</th>
                <th>Daromad</th>
                <th>Xarajat</th>
                <th>Sof foyda</th>
                <th>Kumulyativ</th>
              </tr>
            </thead>
            <tbody>
              {idea.yillik_prognoz.map((m) => (
                <tr key={m.oy}>
                  <td>{m.oy}</td>
                  <td>{m.daromad}</td>
                  <td>{m.xarajat}</td>
                  <td>{m.sofFoyda}</td>
                  <td style={{ color: m.ustida ? "#2b7a43" : "var(--red)", fontWeight: 700 }}>{m.kumulyativ}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bp-detail-section">
        <h6>
          <Users2 size={14} /> Bozor va raqobat
        </h6>
        <p style={{ fontSize: 13.5, margin: 0 }}>{idea.raqobat}</p>
      </section>

      <section className="bp-detail-section">
        <h6>
          <AlertTriangle size={14} /> E&apos;tiborga olinadigan xavflar
        </h6>
        <ul className="bp-detail-list">
          {idea.xavflar.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </section>

      <section className="bp-detail-section">
        <h6>
          <ListChecks size={14} /> Boshlash uchun qadamlar
        </h6>
        <ol className="bp-detail-steps">
          {idea.qadamlar.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </section>
    </div>
  );
}
