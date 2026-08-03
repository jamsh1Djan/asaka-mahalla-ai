"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  Briefcase,
  Layers,
  Maximize,
  Minimize,
  Sparkles,
} from "lucide-react";
import { fmt } from "@/lib/format";
import { bucketColorFor } from "@/lib/voronoiMap";
import { MAHALLA_ICON } from "@/lib/hexMap";

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
};

export type DashboardStats = {
  mahallaCount: number;
  totalAholi: number;
  creditProductCount: number;
  ideaCount: number;
};

type TypicalCredit = { nomi: string; miqdori: string; foiz: string };
type Metric = "aholi" | "tadbirkorlik";

const VIEW_W = 520;
const VIEW_H = 400;

const METRIC_LABEL: Record<Metric, string> = {
  aholi: "Aholi soni",
  tadbirkorlik: "Tadbirkorlik subyektlari",
};
const METRIC_UNIT: Record<Metric, string> = {
  aholi: "aholi",
  tadbirkorlik: "tadbirkor",
};

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
  const [metric, setMetric] = useState<Metric>("aholi");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onChange() {
      setIsFullscreen(document.fullscreenElement === mapWrapRef.current);
    }
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      mapWrapRef.current?.requestFullscreen();
    }
  }

  const selectedCell = cells.find((c) => c.id === selected) ?? null;

  const filteredCells = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cells;
    return cells.filter((c) => c.nomi.toLowerCase().includes(q));
  }, [cells, query]);

  const metricValues = useMemo(() => cells.map((c) => c[metric]), [cells, metric]);

  // Real numeric legend ranges (not just static labels) — same
  // bucketColorFor scale each cell is actually colored with, sampled at
  // representative points so the swatches never disagree with the map.
  const legend = useMemo(() => {
    const lo = Math.min(...metricValues);
    const hi = Math.max(...metricValues);
    const span = (hi - lo) / 3 || 1;
    return [
      { label: "Kam", range: `${fmt(lo)}–${fmt(Math.round(lo + span))}`, color: bucketColorFor(lo, metricValues) },
      {
        label: "O'rta",
        range: `${fmt(Math.round(lo + span))}–${fmt(Math.round(lo + span * 2))}`,
        color: bucketColorFor(lo + span * 1.5, metricValues),
      },
      { label: "Yuqori", range: `${fmt(Math.round(lo + span * 2))}+`, color: bucketColorFor(hi, metricValues) },
    ];
  }, [metricValues]);

  function select(id: string) {
    setSelected((prev) => (prev === id ? null : id));
  }

  return (
    <div className="mdash">
      <div className="mdash-pills">
        <div className="mdash-pill">
          <Home size={14} />
          <b>{stats.mahallaCount} ta</b>
          <span>Mahalla</span>
        </div>
        <div className="mdash-pill">
          <Users size={14} />
          <b>{fmt(stats.totalAholi)}</b>
          <span>Umumiy aholi</span>
        </div>
        <div className="mdash-pill">
          <Landmark size={14} />
          <b>{stats.creditProductCount} ta</b>
          <span>Bank kredit turlari</span>
        </div>
        <div className="mdash-pill mdash-pill-gold">
          <Sparkles size={14} />
          <b>{stats.ideaCount}+</b>
          <span>AI tavsiyalar</span>
        </div>
      </div>

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
          <div className="mdash-stat-ic">
            <Home size={18} />
          </div>
          <div>
            <b>{stats.mahallaCount}</b>
            <span>Mahallalar soni</span>
          </div>
        </div>
        <div className="mdash-stat-card">
          <div className="mdash-stat-ic">
            <Users size={18} />
          </div>
          <div>
            <b>{fmt(stats.totalAholi)}</b>
            <span>Umumiy aholi soni</span>
          </div>
        </div>
        <div className="mdash-stat-card">
          <div className="mdash-stat-ic">
            <Landmark size={18} />
          </div>
          <div>
            <b>{stats.creditProductCount}</b>
            <span>Asaka Bank kredit turlari</span>
          </div>
        </div>
        <div className="mdash-stat-card mdash-stat-ai">
          <div className="mdash-stat-ic">
            <Bot size={18} />
          </div>
          <div>
            <b>{stats.ideaCount}+</b>
            <span>AI biznes tavsiyalari</span>
          </div>
        </div>
        <Link href="/biznes-reja" className="mdash-promo">
          <Bot size={20} />
          <div>
            <b>Asaka AI bilan biznesingizni quring</b>
            <span>Bepul so&apos;rovnoma orqali mahallangizga mos g&apos;oya va kredit oling</span>
          </div>
        </Link>
      </div>

      <div className="mdash-center" ref={mapWrapRef}>
        <div className="mdash-map-toprow">
          <div className="mdash-map-badge">
            <MapPin size={13} />
            <div>
              <b>Yunusobod tumani</b>
              <span>Toshkent shahri</span>
            </div>
          </div>

          <div className="mdash-map-controls">
            <button
              type="button"
              title="Ko'rsatkichni almashtirish (aholi / tadbirkorlik)"
              aria-label="Ko'rsatkichni almashtirish"
              onClick={() => setMetric((m) => (m === "aholi" ? "tadbirkorlik" : "aholi"))}
            >
              <Layers size={15} />
            </button>
            <button type="button" title="To'liq ekran" aria-label="To'liq ekran" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
            </button>
          </div>
        </div>

        <div className="mdash-hexbox">
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
            <rect x="0" y="0" width={VIEW_W} height={VIEW_H} fill="url(#mdash-texture)" />

            {cells.map((c) => {
              const isHovered = hovered === c.id;
              const isSelected = selected === c.id;
              const isDimmed = selected !== null && !isSelected;
              const isSearchMatch = filteredCells.some((f) => f.id === c.id);
              const color = c.inactive ? "#c7ccd6" : isSelected ? "#B01E3A" : bucketColorFor(c[metric], metricValues);
              return (
                <path
                  key={c.id}
                  className={`mdash-plot ${c.inactive ? "inactive" : ""} ${isHovered ? "is-hovered" : ""} ${isDimmed || !isSearchMatch ? "is-dimmed" : ""}`}
                  d={c.path}
                  fill={color}
                  stroke={c.inactive ? "#9aa2b1" : "#fff"}
                  strokeWidth={c.inactive ? 1.4 : isSelected ? 6 : 5}
                  strokeLinejoin="round"
                  strokeDasharray={c.inactive ? "5 4" : undefined}
                  style={{ cursor: "pointer" }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${c.nomi} MFY, ${fmt(c[metric])} ${METRIC_UNIT[metric]}`}
                  onMouseEnter={() => setHovered(c.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => select(c.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      select(c.id);
                    }
                  }}
                />
              );
            })}
          </svg>

          <div className="mdash-hex-overlay">
            {cells.map((c) => {
              const Icon = MAHALLA_ICON[c.id] ?? Landmark;
              const isSelected = selected === c.id;
              const isDimmed = selected !== null && !isSelected;
              const isSearchMatch = filteredCells.some((f) => f.id === c.id);
              return (
                <div
                  key={c.id}
                  className={`mdash-hex-cell ${isDimmed || !isSearchMatch ? "is-dimmed" : ""}`}
                  style={{ left: `${(c.labelCx / VIEW_W) * 100}%`, top: `${(c.labelCy / VIEW_H) * 100}%` }}
                >
                  <Icon size={22} color={isSelected ? "#fff" : "var(--red)"} />
                  <b style={{ color: isSelected ? "#fff" : undefined }}>{c.nomi}</b>
                  <span style={{ color: isSelected ? "rgba(255,255,255,.85)" : undefined }}>
                    {fmt(c[metric])} {METRIC_UNIT[metric]}
                  </span>
                  <button
                    type="button"
                    className="mdash-hex-arrow"
                    aria-label={`${c.nomi} tafsilotlari`}
                    onClick={() => select(c.id)}
                  >
                    <ArrowRight size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mdash-legend">
          <span className="mdash-legend-caption">{METRIC_LABEL[metric]} bo&apos;yicha ko&apos;rsatkich:</span>
          {legend.map((l) => (
            <div key={l.label} className="mdash-legend-item">
              <i style={{ background: l.color }} />
              <span>
                {l.label} ({l.range})
              </span>
            </div>
          ))}
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
        <h5>Barcha mahallalar</h5>
        <div className="mdash-list-row">
          {filteredCells.map((c) => (
            <button
              key={c.id}
              className={`mdash-chip ${selected === c.id ? "active" : ""}`}
              onClick={() => select(c.id)}
            >
              <span className="mdash-chip-ic">
                <Landmark size={14} />
              </span>
              <span className="mdash-chip-text">
                <b>{c.nomi}</b>
                <em>{fmt(c[metric])}</em>
              </span>
            </button>
          ))}
          {filteredCells.length === 0 && <span className="small-muted">Mahalla topilmadi</span>}
        </div>
      </div>
    </div>
  );
}
