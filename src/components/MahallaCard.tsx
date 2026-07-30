import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { fmt } from "@/lib/format";
import type { Mahalla } from "@prisma/client";

export default function MahallaCard({ m }: { m: Mahalla }) {
  return (
    <Link href={`/mahallalar/${m.id}`} className="card mh-card">
      <div className="mh-cover">
        {m.image && <Image src={m.image} alt={m.nomi} fill sizes="360px" style={{ objectFit: "cover" }} />}
        <span className="mh-sector">{m.sector}</span>
      </div>
      <div className="mh-body">
        <h4>{m.nomi} MFY</h4>
        <div className="drayver">{m.drayver}</div>
        <div className="mh-stats">
          <div>
            <b>{fmt(m.aholi)}</b>
            <span>aholi</span>
          </div>
          <div>
            <b>{fmt(m.tadbirkorlik)}</b>
            <span>tadbirkor</span>
          </div>
          <div>
            <b>{fmt(m.vakansiya)}</b>
            <span>vakansiya</span>
          </div>
        </div>
        <span className="btn btn-primary btn-sm" style={{ width: "100%", justifyContent: "center" }}>
          Batafsil <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  );
}
