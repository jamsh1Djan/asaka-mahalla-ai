"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Home,
  Users,
  Landmark,
  Bot,
  MapPin,
  X,
  ExternalLink,
  ArrowRight,
  UserRound,
  Briefcase,
} from "lucide-react";
import { fmt } from "@/lib/format";

export type DashboardCell = {
  id: string;
  nomi: string;
  aholi: number;
  oila: number;
  xonadon: number;
  tadbirkorlik: number;
  vakansiya: number;
  drayver: string;
  image: string | null;
  yandexUrl: string | null;
  bankerName: string | null;
  inactive: boolean;
  path: string;
  labelCx: number;
  labelCy: number;
  color: string;
};

export type DashboardStats = {
  mahallaCount: number;
  totalAholi: number;
  creditProductCount: number;
  ideaCount: number;
};

type TypicalCredit = { nomi: string; miqdori: string; foiz: string };

const VIEW_W = 520;
const VIEW_H = 400;

// Legend swatches pulled from the same 5-step scale voronoiMap.ts colors
// cells with, condensed to the 3 tiers the spec calls for (Kam/O'rta/Yuqori)
// instead of introducing a second, separate color system.
const LEGEND = [
  { label: "Kam", color: "#E8F5E9" },
  { label: "O'rta", color: "#7FCB8C" },
  { label: "Yuqori", color: "#1F7A3D" },
];

export default function MapDashboardCanvas({
  cells,
  stats,
  typicalCredit,
}: {
  cells: DashboardCell[];
  stats: DashboardStats;
  typicalCredit: TypicalCredit;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const selectedCell = cells.find((c) => c.id === selected) ?? null;

  const filteredCells = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cells;
    return cells.filter((c) => c.nomi.toLowerCase().includes(q));
  }, [cells, query]);

  function select(id: string) {
    setSelected((prev) => (prev === id ? null : id));
  }

  return (
    <div className="mdash">
      <div className="mdash-left">
        <div className="mdash-search">
          <Search size={15} />
          <input
            type="text"
            placeholder="Mahalla nomini qidirish..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="mdash-stat-card">
          <div className="mdash-stat-ic mdash-ic-navy">
            <Home size={18} />
          </div>
          <div>
            <b>{stats.mahallaCount}</b>
            <span>Mahallalar soni</span>
          </div>
        </div>
        <div className="mdash-stat-card">
          <div className="mdash-stat-ic mdash-ic-green">
            <Users size={18} />
          </div>
          <div>
            <b>{fmt(stats.totalAholi)}</b>
            <span>Umumiy aholi soni</span>
          </div>
        </div>
        <div className="mdash-stat-card">
          <div className="mdash-stat-ic mdash-ic-gold">
            <Landmark size={18} />
          </div>
          <div>
            <b>{stats.creditProductCount}</b>
            <span>Asaka Bank kredit turlari</span>
          </div>
        </div>
        <div className="mdash-stat-card">
          <div className="mdash-stat-ic mdash-ic-red">
            <Bot size={18} />
          </div>
          <div>
            <b>{stats.ideaCount}+</b>
            <span>AI biznes tavsiyalari</span>
          </div>
        </div>
      </div>

      <div className="mdash-center">
        <div className="mdash-map-badge">
          <MapPin size={13} />
          <div>
            <b>Yunusobod tumani</b>
            <span>Toshkent shahri</span>
          </div>
        </div>

        <svg
          className="mdash-svg"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          role="group"
          aria-label="Yunusobod tumani mahallalar xaritasi"
        >
          <defs>
            <pattern id="mdash-texture" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="1.2" cy="1.2" r="1.1" fill="#0A1F44" opacity="0.035" />
            </pattern>
          </defs>
          <rect x="0" y="0" width={VIEW_W} height={VIEW_H} fill="url(#mdash-texture)" rx="18" />

          {cells.map((c) => {
            const isHovered = hovered === c.id;
            const isSelected = selected === c.id;
            const isDimmed = selected !== null && !isSelected;
            const isSearchMatch = filteredCells.some((f) => f.id === c.id);
            return (
              <g
                key={c.id}
                className={`mdash-cell ${isHovered ? "is-hovered" : ""} ${isDimmed || !isSearchMatch ? "is-dimmed" : ""}`}
                role="button"
                tabIndex={0}
                aria-label={`${c.nomi} MFY, ${fmt(c.aholi)} aholi`}
                onMouseEnter={() => setHovered(c.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => select(c.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    select(c.id);
                  }
                }}
              >
                <path
                  className={`mdash-plot ${c.inactive ? "inactive" : ""}`}
                  d={c.path}
                  fill={c.inactive ? "#c7ccd6" : c.color}
                  stroke={c.inactive ? "#9aa2b1" : "#1a5c30"}
                  strokeWidth={isSelected ? 2.6 : 1.4}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeDasharray={c.inactive ? "5 4" : undefined}
                />
                <text
                  x={c.labelCx}
                  y={c.labelCy - 2}
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
                  y={c.labelCy + 13}
                  fontSize={10.5}
                  fontWeight={600}
                  fill="#2c3e2f"
                  textAnchor="middle"
                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                >
                  {fmt(c.aholi)} aholi
                </text>
              </g>
            );
          })}

          <circle cx={VIEW_W / 2} cy={VIEW_H / 2} r={5} fill="#fff" stroke="#0A1F44" strokeWidth={2} />
        </svg>

        <div className="mdash-center-badge">
          <span className="dot" /> Yunusobod tumani markazi
        </div>

        <div className="mdash-legend">
          {LEGEND.map((l) => (
            <div key={l.label} className="mdash-legend-item">
              <i style={{ background: l.color }} />
              <span>{l.label}</span>
            </div>
          ))}
          <span className="mdash-legend-caption">aholi soni bo&apos;yicha ko&apos;rsatkich</span>
        </div>
      </div>

      <div className="mdash-right">
        {selectedCell ? (
          <div className="mdash-panel">
            <div className="mdash-panel-head">
              <h5>Tanlangan mahalla</h5>
              <button aria-label="Yopish" onClick={() => setSelected(null)}>
                <X size={16} />
              </button>
            </div>
            {selectedCell.image && (
              <div className="mdash-panel-photo">
                <Image src={selectedCell.image} alt={selectedCell.nomi} fill sizes="300px" style={{ objectFit: "cover" }} />
              </div>
            )}
            <h4>{selectedCell.nomi} MFY</h4>
            <div className="mdash-panel-rows">
              <div>
                <span>Aholi soni</span>
                <b>{fmt(selectedCell.aholi)} kishi</b>
              </div>
              <div>
                <span>Oilalar soni</span>
                <b>{fmt(selectedCell.oila)} ta</b>
              </div>
              <div>
                <span>Xonadonlar soni</span>
                <b>{fmt(selectedCell.xonadon)} ta</b>
              </div>
              <div>
                <span>Tadbirkorlik subyektlari</span>
                <b>{fmt(selectedCell.tadbirkorlik)} ta</b>
              </div>
              <div>
                <span>Faoliyat yo&apos;nalishi</span>
                <b>{selectedCell.drayver}</b>
              </div>
              <div>
                <span>Mahalla bankiri</span>
                <b>{selectedCell.bankerName ?? "Biriktirilmagan"}</b>
              </div>
              <div>
                <span>Mos kredit</span>
                <b>
                  {typicalCredit.nomi} ({typicalCredit.miqdori}, {typicalCredit.foiz})
                </b>
              </div>
            </div>
            <div className="mdash-ai-note">
              <Bot size={14} />
              <span>
                Ushbu mahallaning asosiy ixtisoslashuvi — <b>{selectedCell.drayver}</b>. Shu
                yo&apos;nalishdagi biznes g&apos;oyalari eng yuqori muvaffaqiyat ehtimoliga ega.
              </span>
            </div>
            <div className="mdash-panel-actions">
              {selectedCell.yandexUrl && (
                <a
                  href={selectedCell.yandexUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                  style={{ justifyContent: "center" }}
                >
                  <MapPin size={14} /> Xaritada ko&apos;rish <ExternalLink size={12} />
                </a>
              )}
              <Link
                href={`/mahallalar/${selectedCell.id}`}
                className="btn btn-outline btn-sm"
                style={{ justifyContent: "center" }}
              >
                Mahalla haqida batafsil <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="mdash-panel mdash-panel-empty">
            <Briefcase size={26} />
            <p>Batafsil ma&apos;lumot uchun xaritadan yoki ro&apos;yxatdan mahallani tanlang.</p>
          </div>
        )}
      </div>

      <div className="mdash-list">
        <h5>Mahallalar ro&apos;yxati</h5>
        <div className="mdash-list-row">
          {filteredCells.map((c) => (
            <button
              key={c.id}
              className={`mdash-chip ${selected === c.id ? "active" : ""}`}
              onClick={() => select(c.id)}
              style={selected === c.id ? { borderColor: c.color, background: `${c.color}33` } : undefined}
            >
              <UserRound size={13} />
              <span>{c.nomi}</span>
              <b>{fmt(c.aholi)}</b>
            </button>
          ))}
          {filteredCells.length === 0 && <span className="small-muted">Mahalla topilmadi</span>}
        </div>
      </div>
    </div>
  );
}
