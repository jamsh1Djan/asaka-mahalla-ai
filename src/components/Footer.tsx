import Link from "next/link";
import { Phone, Mail, Send, Globe } from "lucide-react";
import LogoMark from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="site">
      <div className="wrap foot-grid">
        <div>
          <h5 style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="mark" style={{ width: 30, height: 30 }}>
              <LogoMark size={16} />
            </span>
            Asaka Mahalla AI
          </h5>
          <p style={{ maxWidth: 280 }}>
            Mahallangizdan turib barcha bank xizmatlariga oson va tezkor kirish imkoniyati.
          </p>
        </div>
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
          <h5>Biz bilan bog&apos;laning</h5>
          <a href="tel:+998712004446" style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Phone size={13.5} /> +998 71 200 44 46
          </a>
          <a href="mailto:info@asakabank.uz" style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Mail size={13.5} /> info@asakabank.uz
          </a>
          <div className="social">
            <a href="#" aria-label="Telegram"><Send size={15} /></a>
            <a href="#" aria-label="Veb-sayt"><Globe size={15} /></a>
          </div>
        </div>
      </div>
      <div className="foot-bottom">
        <span>© 2026 Asaka Mahalla AI — Asakabank platformasi</span>
      </div>
    </footer>
  );
}
