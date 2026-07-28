import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site">
      <div className="girih-band dark" />
      <div className="wrap foot-grid">
        <div>
          <h5>Asaka Mahalla AI</h5>
          <p style={{ maxWidth: 280 }}>
            Mahalla bankiri uchun aqlli raqamli yordamchi. Yunusobod tumani Asakabank BXM uchun
            ishlab chiqilgan.
          </p>
        </div>
        <div>
          <h5>Bo&apos;limlar</h5>
          <Link href="/kreditlar">Kredit mahsulotlari</Link>
          <Link href="/kalkulyator">Kalkulyator</Link>
          <Link href="/oldindan">Oldindan tasdiq</Link>
          <Link href="/mahallalar">Mahallalar</Link>
        </div>
        <div>
          <h5>Bankirlar</h5>
          <Link href="/kirish?rol=banker">Bankir sifatida kirish</Link>
          <Link href="/vazifalar">Bankir vazifalari</Link>
        </div>
        <div>
          <h5>Aloqa</h5>
          <p>Yunusobod tumani, Toshkent</p>
          <p>Asakabank BXM</p>
        </div>
      </div>
      <div className="foot-bottom">© 2026 Asaka Mahalla AI — Asakabank platformasi</div>
    </footer>
  );
}
