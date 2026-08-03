"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Users,
  Briefcase,
  ClipboardList,
  UserRound,
  Info,
  Scissors,
  Factory,
  Home,
  Store,
  ShoppingBag,
  ShoppingCart,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
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
  cx: number;
  cy: number;
  order: number;
  color: string;
};

/** One representative icon per mahalla, picked from its real faoliyatTurlari
 * (Otchopar-1 leads with "Sartaroshxona", Otchopar-2 is manufacturing-heavy,
 * etc.) — not decoration picked at random. */
const MAHALLA_ICON: Record<string, LucideIcon> = {
  otchopar1: Scissors,
  otchopar2: Factory,
  muruvvat: Home,
  oqtepa: Store,
  yurtobod: ShoppingBag,
  posira: ShoppingCart,
  yangiariq: UtensilsCrossed,
};

const VIEW_W = 520;
const VIEW_H = 400;

export default function MapCanvas({
  cells,
  buckets,
  totalAholi,
}: {
  cells: MapCell[];
  buckets: PopulationBucket[];
  totalAholi: number;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const selectedCell = cells.find((c) => c.id === selected) ?? null;

  function toggle(id: string) {
    setSelected((prev) => (prev === id ? null : id));
  }

  return (
    <div>
      <div className="map-hex-toprow">
        <div className="map-hex-pill">
          <Users size={14} />
          <div>
            <b>{fmt(totalAholi)}</b>
            <span>Jami aholi soni</span>
          </div>
        </div>
      </div>

      <div className="map-hex-wrap">
        <svg className="map-hex-svg" viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}>
          <defs>
            <pattern id="map-texture-v2" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="1.2" cy="1.2" r="1.1" fill="#0A1F44" opacity="0.035" />
            </pattern>
          </defs>
          {cells.map((c) => {
            const isHovered = hovered === c.id;
            const isSelected = selected === c.id;
            const isDimmed = selected !== null && !isSelected;
            return (
              <path
                key={c.id}
                className={`mv-plot ${c.inactive ? "inactive" : ""} ${isHovered ? "is-hovered" : ""} ${isDimmed ? "is-dimmed" : ""}`}
                d={c.path}
                fill={c.inactive ? "#c7ccd6" : isSelected ? "#B01E3A" : c.color}
                stroke="#fff"
                strokeWidth={isSelected ? 5 : 3.5}
                strokeLinejoin="round"
                strokeDasharray={c.inactive ? "5 4" : undefined}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHovered(c.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => toggle(c.id)}
              />
            );
          })}
        </svg>

        <div className="map-hex-overlay">
          {cells.map((c) => {
            const Icon = MAHALLA_ICON[c.id] ?? Store;
            const isSelected = selected === c.id;
            const isDimmed = selected !== null && !isSelected;
            return (
              <div
                key={c.id}
                className={`map-hex-cell ${isDimmed ? "is-dimmed" : ""}`}
                style={{ left: `${(c.cx / VIEW_W) * 100}%`, top: `${(c.cy / VIEW_H) * 100}%` }}
              >
                <span className="map-hex-badge">{c.order}</span>
                <Icon size={18} color={isSelected ? "#fff" : "var(--red)"} />
                <b style={{ color: isSelected ? "#fff" : undefined }}>{c.nomi}</b>
                <span style={{ color: isSelected ? "rgba(255,255,255,.85)" : undefined }}>{fmt(c.aholi)} aholi</span>
                <button
                  type="button"
                  className="map-hex-arrow"
                  aria-label={`${c.nomi} tafsilotlari`}
                  onClick={() => toggle(c.id)}
                >
                  <ArrowRight size={13} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

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
      <p className="map-hex-hint">
        <Info size={12} /> Mahallani tanlang yoki ustiga sichqonchani olib boring
      </p>

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
