import { fmt } from "@/lib/format";
import type { Mahalla } from "@prisma/client";

function centerOf(points: string) {
  const coords = points.split(" ").map((p) => p.split(",").map(Number));
  const cx = coords.reduce((s, [x]) => s + x, 0) / coords.length;
  const cy = coords.reduce((s, [, y]) => s + y, 0) / coords.length;
  return { cx, cy };
}

export default function MahallaMap({ mahallas }: { mahallas: Mahalla[] }) {
  return (
    <div className="map-card">
      <h4>Yunusobod tumani — mahallalar xaritasi</h4>
      <p>Mahallani tanlang va batafsil ma&apos;lumotni ko&apos;ring</p>
      <svg className="map-svg" viewBox="0 0 520 400" style={{ width: "100%", height: "auto" }}>
        {mahallas.map((m) => (
          <a key={m.id} href={`/mahallalar/${m.id}`}>
            <polygon
              className="plot"
              points={m.mapPoints}
              fill={m.color}
              fillOpacity={0.16}
              stroke={m.color}
              strokeWidth={2}
            />
          </a>
        ))}
        {mahallas.map((m) => {
          const { cx, cy } = centerOf(m.mapPoints);
          return (
            <a key={m.id} href={`/mahallalar/${m.id}`}>
              <text x={cx} y={cy - 4} fontSize={12} fontWeight={800} fill={m.color} textAnchor="middle">
                {m.nomi}
              </text>
              <text x={cx} y={cy + 11} fontSize={10} fill="#5B6270" textAnchor="middle">
                {fmt(m.aholi)} aholi
              </text>
            </a>
          );
        })}
      </svg>
      <div className="map-legend">
        {mahallas.map((m) => (
          <span key={m.id}>
            <i style={{ background: m.color }} />
            {m.nomi}
          </span>
        ))}
      </div>
    </div>
  );
}
