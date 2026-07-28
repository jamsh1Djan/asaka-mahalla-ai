"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Session } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";

const LINKS: [string, string][] = [
  ["/", "Bosh sahifa"],
  ["/kreditlar", "Kreditlar"],
  ["/kalkulyator", "Kalkulyator"],
  ["/oldindan", "Oldindan tasdiq"],
  ["/mahallalar", "Mahallam"],
];

export default function Header({ session }: { session: Session | null }) {
  const pathname = usePathname();
  const isBanker = session?.kind === "banker";
  const isAdmin = isBanker && session.role === "ADMIN";

  return (
    <header className="site">
      <div className="nav">
        <Link href="/" className="brand">
          <span className="mark">AM</span>
          Asaka<span className="red">Mahalla</span>&nbsp;AI
        </Link>
        <nav className="navlinks">
          {LINKS.map(([href, label]) => (
            <Link key={href} href={href} className={pathname === href ? "active" : ""}>
              {label}
            </Link>
          ))}
          {isBanker && (
            <Link
              href={isAdmin ? "/admin" : "/bankir"}
              className={pathname.startsWith(isAdmin ? "/admin" : "/bankir") ? "active" : ""}
            >
              {isAdmin ? "Admin panel" : "Bankir kabineti"}
            </Link>
          )}
        </nav>
        <div className="navactions">
          {session ? (
            <>
              <span className="small-muted hidden-mobile">
                {session.kind === "banker" ? session.ism : session.name}
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
            ✨ AI bilan suhbat
          </Link>
        </div>
      </div>
      <div className="girih-band" />
    </header>
  );
}
