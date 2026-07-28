export const metadata = { title: "Bankir va agent vazifalari — Asaka Mahalla AI" };

export default function VazifalarPage() {
  return (
    <section>
      <div className="wrap" style={{ maxWidth: 760 }}>
        <div className="section-head">
          <div className="section-eyebrow">Ma&apos;lumot</div>
          <h2 className="section-title">
            &quot;Mahalla bankiri&quot; va &quot;Yordamchi agent&quot; vazifalari
          </h2>
        </div>
        <div className="card">
          <h4>Mahalla bankiri</h4>
          <ul>
            <li>
              Mahallaning tadbirkorlik imkoniyatlarini o&apos;rganish, aholi bilan muloqotda
              bo&apos;lish, yangi ish o&apos;rinlarini yaratish choralarini ko&apos;rish
            </li>
            <li>
              Aholini kredit olish, biznesni yo&apos;lga qo&apos;yish va mahsulot sotishga
              o&apos;rgatish
            </li>
            <li>
              Oilaviy tadbirkorlik dasturlari doirasida kredit olgan fuqarolarga moliyaviy
              maslahat berish
            </li>
            <li>Aholi va tadbirkorlar takliflarini bank rahbariyatiga yetkazish</li>
          </ul>
          <hr className="soft" />
          <h4>Yordamchi agent</h4>
          <ul>
            <li>
              Aholini tadbirkorlikka jalb qilish, bandlikni ta&apos;minlashda mahalla bankiriga
              ko&apos;maklashish
            </li>
            <li>Moliyaviy savodxonlikni oshirish bo&apos;yicha faoliyat olib borish</li>
            <li>Aholi takliflari va qiyinchiliklarini o&apos;rganib, xulosalarni yetkazish</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
