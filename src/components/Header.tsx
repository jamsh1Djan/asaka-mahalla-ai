"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import type { Session } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";
import LogoMark from "@/components/Logo";
import NationalOrnament from "@/components/NationalOrnament";

const PUBLIC_LINKS: [string, string][] = [
  ["/", "Bosh sahifa"],
  ["/kreditlar", "Kreditlar"],
  ["/kalkulyator", "Kalkulyator"],
  ["/oldindan", "Oldindan tasdiq"],
  ["/mahallalar", "Mahallam"],
];

/** Role → extra nav entries, on top of PUBLIC_LINKS every visitor sees.
 * This is purely a display convenience — the actual authorization for every
 * page/action behind these links is re-checked server-side (see getSession()
 * + isBanker()/isAdmin() in each page and server action), so a link showing
 * up here is never itself a security boundary. */
function roleNavLinks(session: Session | null): [string, string][] {
  if (session?.kind !== "banker") return [];
  return session.role === "ADMIN" ? [["/admin", "Admin panel"]] : [["/bankir", "Bankir kabineti"]];
}

function roleLabel(session: Session | null): string | null {
  if (!session) return null;
  if (session.kind === "fuqaro") return "Fuqaro";
  return session.role === "ADMIN" ? "Super Admin" : "Bankir";
}

export default function Header({ session }: { session: Session | null }) {
  const pathname = usePathname();
  const extraLinks = roleNavLinks(session);
  const label = roleLabel(session);

  return (
    <header className="site">
      <div className="nav">
        <Link href="/" className="brand">
          <span className="mark"><LogoMark size={20} /></span>
          Asaka<span className="red">Mahalla</span>&nbsp;AI
        </Link>
        <nav className="navlinks">
          {PUBLIC_LINKS.map(([href, text]) => (
            <Link key={href} href={href} className={pathname === href ? "active" : ""}>
              {text}
            </Link>
          ))}
          {extraLinks.map(([href, text]) => (
            <Link key={href} href={href} className={pathname.startsWith(href) ? "active" : ""}>
              {text}
            </Link>
          ))}
        </nav>
        <div className="navactions">
          {session ? (
            <>
              <span
                className="small-muted hidden-mobile"
                style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, maxWidth: 150 }}
              >
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>
                  {session.kind === "banker" ? session.ism : session.name}
                </span>
                {label && (
                  <span className="badge-role" style={{ whiteSpace: "nowrap" }}>
                    {label}
                  </span>
                )}
              </span>
              <form action={logoutAction}>
                <button className="btn btn-outline btn-sm" type="submit">
                  Chiqish
                </button>
              </form>
            </>
          ) : (
            <Link href="/kirish" className="btn btn-outline btn-sm">
              Kirish
            </Link>
          )}
          <Link href="/mahallalar" className="btn btn-primary btn-sm hidden-mobile">
            <Sparkles size={15} />
            AI bilan suhbat
          </Link>
        </div>
      </div>
      <NationalOrnament />
    </header>
  );
}
