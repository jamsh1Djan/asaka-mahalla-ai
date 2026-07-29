"use client";

import { useTransition } from "react";
import { updateArizaStatusAction } from "@/actions/applications";
import { fmtDate } from "@/lib/format";
import type { Application, ApplicationStatus, Mahalla } from "@prisma/client";

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  YANGI: "Yangi",
  KORIB: "Ko'rib chiqilmoqda",
  BOG: "Bog'lanildi",
};

type Row = Application & { mahalla: Pick<Mahalla, "nomi"> };

export default function ArizalarTable({
  applications,
  title,
}: {
  applications: Row[];
  title: string;
}) {
  const [isPending, startTransition] = useTransition();

  if (applications.length === 0) {
    return (
      <div className="card" style={{ marginTop: 18 }}>
        <div className="empty">Hozircha arizalar yo&apos;q</div>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginTop: 18 }}>
      <h4 style={{ margin: "0 0 14px" }}>{title}</h4>
      <table className="table">
        <thead>
          <tr>
            <th>F.I.O</th>
            <th>Telefon</th>
            <th>Kredit turi</th>
            <th>Mahalla</th>
            <th>Sana</th>
            <th>Holati</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((a) => (
            <tr key={a.id}>
              <td>{a.fio}</td>
              <td>{a.phone}</td>
              <td>{a.kredit}</td>
              <td>{a.mahalla.nomi}</td>
              <td className="small-muted">{fmtDate(a.createdAt)}</td>
              <td>
                <select
                  defaultValue={a.status}
                  disabled={isPending}
                  onChange={(e) =>
                    startTransition(() =>
                      updateArizaStatusAction(a.id, e.target.value as ApplicationStatus)
                    )
                  }
                >
                  {(Object.keys(STATUS_LABEL) as ApplicationStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
