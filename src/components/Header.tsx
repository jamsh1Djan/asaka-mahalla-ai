"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  FileText,
  Megaphone,
  Menu,
  X,
  Home,
  Wallet,
  Calculator,
  Sparkles,
  MapPin,
  LayoutDashboard,
} from "lucide-react";
import type { Session } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";
import LogoMark from "@/components/Logo";
import AiChatWidget from "@/components/AiChatWidget";

const PUBLIC_LINKS: [string, string][] = [
  ["/", "Bosh sahifa"],
  ["/kreditlar", "Kreditlar"],
  ["/kalkulyator", "Kalkulyator"],
  ["/biznes-reja", "Biznes yordamchi"],
  ["/mahallalar", "Mahallam"],
];

const LINK_ICONS: Record<string, typeof Home> = {
  "/": Home,
  "/kreditlar": Wallet,
  "/kalkulyator": Calculator,
  "/biznes-reja": Sparkles,
  "/mahallalar": MapPin,
  "/bankir": LayoutDashboard,
  "/admin": LayoutDashboard,
};

/** Bankers/admins get a single "back to their panel" link instead of the
 * client-facing nav — appending it to PUBLIC_LINKS is what used to overflow
 * the header onto a second line. This is purely a display convenience; the
 * actual authorization for every page/action is re-checked server-side (see
 * getSession() + isBanker()/isAdmin()), so this is never a security boundary. */
function navLinksFor(session: Session | null): [string, string][] {
  if (session?.kind === "banker") {
    return session.role === "ADMIN" ? [["/admin", "Boshqaruv paneli"]] : [["/bankir", "Bankir kabineti"]];
  }
  return PUBLIC_LINKS;
}

function roleLabel(session: Session | null): string | null {
  if (!session) return null;
  if (session.kind === "fuqaro") return "Fuqaro";
  return session.role === "ADMIN" ? "Super Admin" : "Bankir";
}

export default function Header({ session }: { session: Session | null }) {
  const pathname = usePathname();
  const links = navLinksFor(session);
  const label = roleLabel(session);
  const isStaff = session?.kind === "banker";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Closing on route change covers both an explicit link tap and any other
  // navigation (back/forward, programmatic redirect) that might happen while
  // the panel is open — a link-only onClick handler would miss those.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className={`site${scrolled ? " is-scrolled" : ""}`}>
      <div className="nav">
        <Link href="/" className="brand">
          <span className="mark"><LogoMark size={40} /></span>
          Asaka <span className="red">Mahalla</span>&nbsp;AI
        </Link>
        <nav className="navlinks">
          {links.map(([href, text]) => (
            <Link key={href} href={href} className={pathname === href || (isStaff && pathname.startsWith(href)) ? "active" : ""}>
              {text}
            </Link>
          ))}
        </nav>
        <div className="navactions">
          {session ? (
            <>
              <span
                className="small-muted hidden-mobile"
                style={{ display: "flex", alignItems: "center", gap: 8, maxWidth: 190 }}
              >
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {session.kind === "banker" ? session.ism : session.name}
                </span>
                {label && <span className="badge-role">{label}</span>}
              </span>
              {session.kind === "fuqaro" && (
                // Icon-only, not icon+label: .navlinks + .navactions already sit
                // at the edge of fitting one row between ~1031-1350px (see the
                // max-width:1030px breakpoint below), so a full extra button
                // with a text label reopened that overflow. An icon alone adds
                // ~30px instead of ~110px and stays inside the existing margin.
                <>
                  <Link
                    href="/arizalarim"
                    className={`btn btn-outline btn-sm hidden-mobile${pathname === "/arizalarim" ? " active" : ""}`}
                    style={{ padding: "8px 10px" }}
                    title="Arizalarim"
                    aria-label="Arizalarim"
                  >
                    <FileText size={15} />
                  </Link>
                  <Link
                    href="/mening-elonlarim"
                    className={`btn btn-outline btn-sm hidden-mobile${pathname === "/mening-elonlarim" ? " active" : ""}`}
                    style={{ padding: "8px 10px" }}
                    title="Mening e'lonlarim"
                    aria-label="Mening e'lonlarim"
                  >
                    <Megaphone size={15} />
                  </Link>
                </>
              )}
              <form action={logoutAction} className="hidden-mobile">
                <button className="btn btn-outline btn-sm" type="submit">
                  Chiqish
                </button>
              </form>
            </>
          ) : (
            <Link href="/kirish" className="btn btn-outline btn-sm hidden-mobile">
              Kirish
            </Link>
          )}
          {!isStaff && <AiChatWidget />}
          <button
            className="nav-burger"
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Menyu"
            aria-expanded={menuOpen}
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="mobile-menu-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              className="mobile-menu-panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mobile-menu-head">
                <span className="brand">
                  <span className="mark"><LogoMark size={34} /></span>
                  Asaka <span className="red">Mahalla</span>
                </span>
                <button className="mobile-menu-close" type="button" onClick={() => setMenuOpen(false)} aria-label="Yopish">
                  <X size={18} />
                </button>
              </div>
              <div className="mobile-menu-links">
                {links.map(([href, text]) => {
                  const Icon = LINK_ICONS[href] ?? Home;
                  const active = pathname === href || (isStaff && pathname.startsWith(href));
                  return (
                    <Link key={href} href={href} className={active ? "active" : ""}>
                      <Icon size={18} />
                      {text}
                    </Link>
                  );
                })}
                {session?.kind === "fuqaro" && (
                  <>
                    <Link href="/arizalarim" className={pathname === "/arizalarim" ? "active" : ""}>
                      <FileText size={18} />
                      Arizalarim
                    </Link>
                    <Link href="/mening-elonlarim" className={pathname === "/mening-elonlarim" ? "active" : ""}>
                      <Megaphone size={18} />
                      Mening e&apos;lonlarim
                    </Link>
                  </>
                )}
              </div>
              <div className="mobile-menu-footer">
                {session ? (
                  <>
                    <span className="small-muted" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {session.kind === "banker" ? session.ism : session.name}
                      {label && <span className="badge-role">{label}</span>}
                    </span>
                    <form action={logoutAction}>
                      <button className="btn btn-outline btn-sm" type="submit" style={{ width: "100%", justifyContent: "center" }}>
                        Chiqish
                      </button>
                    </form>
                  </>
                ) : (
                  <Link href="/kirish" className="btn btn-primary btn-sm" style={{ width: "100%", justifyContent: "center" }}>
                    Kirish
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
