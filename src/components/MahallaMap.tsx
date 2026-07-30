import { fmt } from "@/lib/format";
import type { Mahalla } from "@prisma/client";

function centerOf(points: string) {
  const coords = points.split(" ").map((p) => p.split(",").map(Number));
  const cx = coords.reduce((s, [x]) => s + x, 0) / coords.length;
  const cy = coords.reduce((s, [, y]) => s + y, 0) / coords.length;
  return { cx, cy };
}

export default function MahallaMap({ mahallas: allMahallas }: { mahallas: Mahalla[] }) {
  // Admin-added mahallas have no hand-drawn polygon yet — they simply don't
  // appear on the map (still fully visible in the grid/list views).
  const mahallas = allMahallas.filter(
    (m): m is Mahalla & { mapPoints: string } => !!m.mapPoints
  );

  return (
    <div className="map-card">
      <h4>Yunusobod tumani — mahallalar xaritasi</h4>
      <p>Mahallani tanlang va batafsil ma&apos;lumotni ko&apos;ring</p>
      <svg className="map-svg" viewBox="0 0 520 400" style={{ width: "100%", height: "auto" }}>
        <defs>
          <pattern id="map-texture" width="18" height="18" patternUnits="userSpaceOnUse">
            <circle cx="1.2" cy="1.2" r="1.2" fill="var(--navy)" opacity="0.05" />
          </pattern>
          <filter id="map-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0f2b6c" floodOpacity="0.16" />
          </filter>
        </defs>
        <rect x="0" y="0" width="520" height="400" fill="url(#map-texture)" rx="18" />
        {mahallas.map((m) => (
          <a key={m.id} href={`/mahallalar/${m.id}`}>
            <polygon
              className={`plot ${m.status === "FAOL_EMAS" ? "inactive" : ""}`}
              points={m.mapPoints}
              fill={m.color}
              fillOpacity={0.22}
              stroke={m.color}
              strokeWidth={2.5}
              strokeLinejoin="round"
              filter="url(#map-shadow)"
            />
          </a>
        ))}
        {mahallas.map((m) => {
          const { cx, cy } = centerOf(m.mapPoints);
          return (
            <a key={m.id} href={`/mahallalar/${m.id}`}>
              <circle cx={cx} cy={cy - 15} r={4} fill={m.color} stroke="#fff" strokeWidth={1.4} />
              <text x={cx} y={cy - 1} fontSize={13} fontWeight={800} fill={m.color} textAnchor="middle">
                {m.nomi}
              </text>
              <text x={cx} y={cy + 15} fontSize={10.5} fill="#5B6270" textAnchor="middle">
                {fmt(m.aholi)} aholi{m.status === "FAOL_EMAS" ? " · faol emas" : ""}
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
