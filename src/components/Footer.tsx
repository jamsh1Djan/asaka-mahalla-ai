import Link from "next/link";
import { Mail, Send } from "lucide-react";
import LogoMark from "@/components/Logo";

/** Simplified stand-in for the Asakabank corporate mark (red square, white
 * diagonal "A" cut) — not the trademark file itself, just a small credit
 * icon for the footer sign-off next to "Asakabank" text. */
function AsakabankMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="1" y="1" width="22" height="22" rx="6" fill="#D71920" />
      <path d="M7 17 12 6l1.8 4-3.2 7H7Z" fill="#fff" />
      <path d="M13.4 11.2 16 17h-2.6l-1.3-3Z" fill="#fff" />
    </svg>
  );
}

function FacebookIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34v7.03C18.34 21.21 22 17.06 22 12.06Z" />
    </svg>
  );
}

function InstagramIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="site">
      <div className="foot-contact wrap">
        <div className="foot-contact-brand">
          <div className="foot-contact-logo">
            <span className="mark">
              <LogoMark size={30} />
            </span>
            <span>Asaka Mahalla AI</span>
          </div>
          <a href="mailto:info@asakabank.uz" className="foot-contact-email">
            <Mail size={13} /> info@asakabank.uz
          </a>
          <p>Biz ijtimoiy tarmoqlarda:</p>
          <div className="social">
            <a href="#" aria-label="Telegram">
              <Send size={15} />
            </a>
            <a href="#" aria-label="Facebook">
              <FacebookIcon />
            </a>
            <a href="#" aria-label="Instagram">
              <InstagramIcon />
            </a>
          </div>
        </div>
        <div className="foot-contact-numbers">
          <div className="foot-contact-row">
            <span>24/7 aloqa markazi:</span>
            <a href="tel:1152" className="foot-contact-big">
              1152
            </a>
          </div>
          <div className="foot-contact-row">
            <span>Boshqa davlatlardan qo&apos;ng&apos;iroqlar uchun:</span>
            <a href="tel:+998555144108">(+998 55) 514-41-08</a>
          </div>
          <div className="foot-contact-row">
            <span>Ishonch telefoni:</span>
            <a href="tel:+998712005522">(+998 71) 200-55-22</a>
          </div>
          <p className="foot-contact-hours">9.00 dan 17.00 gacha (13.00-14.00 tushlik) dushanba-juma</p>
        </div>
      </div>

      <div className="wrap foot-grid">
        <div>
          <h5>Tezkor havolalar</h5>
          <Link href="/kreditlar">Kreditlar</Link>
          <Link href="/kalkulyator">Kalkulyator</Link>
          <Link href="/kirish?rol=banker">Mahalla bankiri</Link>
          <Link href="/biznes-reja">Biznes reja yordamchisi</Link>
        </div>
        <div>
          <h5>Yordam</h5>
          <Link href="/mahallalar">Savol-javoblar</Link>
          <Link href="/vazifalar">Bankir vazifalari</Link>
          <Link href="/mahallalar">Mahallalar</Link>
        </div>
        <div>
          <h5>Biz haqimizda</h5>
          <p style={{ maxWidth: 260 }}>
            Mahallangizdan turib barcha bank xizmatlariga oson va tezkor kirish imkoniyati.
          </p>
        </div>
      </div>

      <div className="foot-bottom">
        <span>© 2026 Asaka Mahalla AI — Asakabank platformasi</span>
        <span className="foot-asakabank">
          <AsakabankMark size={16} /> Asakabank
        </span>
      </div>
    </footer>
  );
}
