"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Users, Briefcase, ClipboardList, UserRound } from "lucide-react";
import { fmt } from "@/lib/format";
import type { PopulationBucket } from "@/lib/voronoiMap";

export type MapCell = {
  id: string;
  nomi: string;
  aholi: number;
  tadbirkorlik: number;
  vakansiya: number;
  bankerName: string | null;
  inactive: boolean;
  path: string;
  labelCx: number;
  labelCy: number;
  color: string;
};

const VIEW_W = 520;
const VIEW_H = 400;

export default function MapCanvas({
  cells,
  buckets,
  outline,
}: {
  cells: MapCell[];
  buckets: PopulationBucket[];
  outline: string;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const selectedCell = cells.find((c) => c.id === selected) ?? null;

  return (
    <div>
      <svg
        className="map-svg-v2"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <defs>
          <pattern id="map-texture-v2" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="1.2" cy="1.2" r="1.1" fill="#0A1F44" opacity="0.035" />
          </pattern>
          <clipPath id="map-outline-v2">
            <path d={outline} />
          </clipPath>
        </defs>
        <path d={outline} fill="url(#map-texture-v2)" />

        <g clipPath="url(#map-outline-v2)">
        {cells.map((c) => {
          const isHovered = hovered === c.id;
          const isSelected = selected === c.id;
          const isDimmed = selected !== null && !isSelected;
          return (
            <g
              key={c.id}
              className={`mv-cell ${isHovered ? "is-hovered" : ""} ${isDimmed ? "is-dimmed" : ""}`}
              onMouseEnter={() => setHovered(c.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setSelected(isSelected ? null : c.id)}
            >
              <path
                className={`mv-plot ${c.inactive ? "inactive" : ""}`}
                d={c.path}
                fill={c.inactive ? "#c7ccd6" : c.color}
                stroke={c.inactive ? "#9aa2b1" : "#fff"}
                strokeWidth={c.inactive ? 1.4 : isSelected ? 6 : 5}
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeDasharray={c.inactive ? "5 4" : undefined}
              />
              <circle cx={c.labelCx} cy={c.labelCy - 9} r={2.6} fill="#fff" stroke="#0A1F44" strokeWidth={1.1} />
              <text
                x={c.labelCx}
                y={c.labelCy + 4}
                fontSize={13}
                fontWeight={700}
                fill="#0A1F44"
                textAnchor="middle"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                {c.nomi}
              </text>
              <text
                x={c.labelCx}
                y={c.labelCy + 16}
                fontSize={10}
                fontWeight={500}
                fill="#5B6785"
                textAnchor="middle"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                {fmt(c.aholi)} aholi{c.inactive ? " · faol emas" : ""}
              </text>
            </g>
          );
        })}
        </g>
      </svg>

      <div className="mv-legend">
        {buckets.map((b, i) => (
          <div key={i} className="mv-legend-item">
            <i style={{ background: b.color }} />
            <span>
              {fmt(b.min)}–{fmt(b.max)}
            </span>
          </div>
        ))}
        <span className="mv-legend-caption">aholi soni bo&apos;yicha</span>
      </div>

      {selectedCell && (
        <div className="mv-detail">
          <div className="mv-detail-head">
            <h5>{selectedCell.nomi} MFY</h5>
            <button className="link-btn" onClick={() => setSelected(null)}>
              Yopish
            </button>
          </div>
          <div className="mv-detail-stats">
            <div>
              <Users size={15} />
              <b>{fmt(selectedCell.aholi)}</b>
              <span>aholi</span>
            </div>
            <div>
              <Briefcase size={15} />
              <b>{fmt(selectedCell.tadbirkorlik)}</b>
              <span>tadbirkor</span>
            </div>
            <div>
              <ClipboardList size={15} />
              <b>{fmt(selectedCell.vakansiya)}</b>
              <span>vakansiya</span>
            </div>
            <div>
              <UserRound size={15} />
              <b style={{ fontSize: 12.5 }}>{selectedCell.bankerName ?? "Biriktirilmagan"}</b>
              <span>bankir</span>
            </div>
          </div>
          <Link href={`/mahallalar/${selectedCell.id}`} className="btn btn-primary btn-sm">
            Batafsil <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
