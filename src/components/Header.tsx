"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import type { Session } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";
import LogoMark from "@/components/Logo";

const PUBLIC_LINKS: [string, string][] = [
  ["/", "Bosh sahifa"],
  ["/kreditlar", "Kreditlar"],
  ["/kalkulyator", "Kalkulyator"],
  ["/biznes-reja", "Biznes yordamchi"],
  ["/mahallalar", "Mahallam"],
];

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

  return (
    <header className="site">
      <div className="nav">
        <Link href="/" className="brand">
          <span className="mark"><LogoMark size={20} /></span>
          Asaka<span className="red">Mahalla</span>&nbsp;AI
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
          {!isStaff && (
            <Link href="/mahallalar" className="btn btn-primary btn-sm hidden-mobile">
              <Sparkles size={15} />
              AI bilan suhbat
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
