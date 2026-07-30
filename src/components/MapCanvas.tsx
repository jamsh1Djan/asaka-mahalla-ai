"use client";

import { useState } from "react";
import Link from "next/link";
import { fmt } from "@/lib/format";
import { heatSteps } from "@/lib/voronoiMap";

export type MapCell = {
  id: string;
  nomi: string;
  aholi: number;
  tadbirkorlik: number;
  vakansiya: number;
  inactive: boolean;
  path: string;
  labelCx: number;
  labelCy: number;
  color: string;
};

const VIEW_W = 520;
const VIEW_H = 400;

export default function MapCanvas({ cells }: { cells: MapCell[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const hoveredCell = cells.find((c) => c.id === hovered) ?? null;

  return (
    <div style={{ position: "relative" }}>
      <svg
        className="map-svg-v2"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <defs>
          <pattern id="map-texture-v2" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="1.2" cy="1.2" r="1.1" fill="#0A1F44" opacity="0.035" />
          </pattern>
        </defs>
        <rect x="0" y="0" width={VIEW_W} height={VIEW_H} fill="url(#map-texture-v2)" rx="18" />

        {cells.map((c) => {
          const isHovered = hovered === c.id;
          const dimmed = hovered !== null && !isHovered;
          return (
            <Link key={c.id} href={`/mahallalar/${c.id}`}>
              <g
                className={`mv-cell ${isHovered ? "is-hovered" : ""} ${dimmed ? "is-dimmed" : ""}`}
                onMouseEnter={() => setHovered(c.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <path
                  className={`mv-plot ${c.inactive ? "inactive" : ""}`}
                  d={c.path}
                  fill={c.inactive ? "#c7ccd6" : c.color}
                  stroke={c.inactive ? "#9aa2b1" : "#8a1120"}
                  strokeWidth={isHovered ? 2.5 : 1.4}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeDasharray={c.inactive ? "5 4" : undefined}
                />
                <circle cx={c.labelCx} cy={c.labelCy - 15} r={3} fill="#fff" stroke="#0A1F44" strokeWidth={1.2} />
                <text
                  x={c.labelCx}
                  y={c.labelCy - 1}
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
                  y={c.labelCy + 15}
                  fontSize={10.5}
                  fontWeight={500}
                  fill="#5B6785"
                  textAnchor="middle"
                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                >
                  {fmt(c.aholi)} aholi{c.inactive ? " · faol emas" : ""}
                </text>
              </g>
            </Link>
          );
        })}
      </svg>

      {hoveredCell && (
        <div
          className="mv-tooltip"
          style={{
            left: `${(hoveredCell.labelCx / VIEW_W) * 100}%`,
            top: `${(hoveredCell.labelCy / VIEW_H) * 100}%`,
          }}
        >
          <b>{hoveredCell.nomi} MFY</b>
          <div className="mv-tooltip-row">
            <span>Aholi soni</span>
            <b>{fmt(hoveredCell.aholi)}</b>
          </div>
          <div className="mv-tooltip-row">
            <span>Tadbirkorlik subyektlari</span>
            <b>{fmt(hoveredCell.tadbirkorlik)}</b>
          </div>
          <div className="mv-tooltip-row">
            <span>Bo&apos;sh ish o&apos;rinlari</span>
            <b>{fmt(hoveredCell.vakansiya)}</b>
          </div>
        </div>
      )}

      <div className="mv-legend">
        <span>Kam</span>
        <div className="mv-legend-scale">
          {heatSteps().map((color, i) => (
            <i key={i} style={{ background: color }} />
          ))}
        </div>
        <span>Ko&apos;p</span>
        <span className="mv-legend-caption">— aholi soni bo&apos;yicha</span>
      </div>
    </div>
  );
}
