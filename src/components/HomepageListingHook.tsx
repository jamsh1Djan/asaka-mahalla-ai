import Link from "next/link";
import { Briefcase, Home, Megaphone, ArrowRight } from "lucide-react";
import { getSession } from "@/lib/auth";
import Reveal from "@/components/Reveal";

const CARDS = [
  {
    turi: "ISH",
    icon: Briefcase,
    tone: "rose",
    title: "Bo'sh ish o'rni bormi?",
    desc: "Xodim qidiryapsizmi? Mahalladagilar ko'rsin.",
  },
  {
    turi: "IJARA",
    icon: Home,
    tone: "blue",
    title: "Ijaraga bino yoki uy bormi?",
    desc: "Do'kon, ombor, kvartira — kimga kerak bo'lsa topadi.",
  },
  {
    turi: "BOSHQA",
    icon: Megaphone,
    tone: "green",
    title: "Boshqa e'loningiz bormi?",
    desc: "Xizmat, tovar, taklif — nima bo'lsa ham joylang.",
  },
] as const;

const TONE_BG: Record<string, string> = {
  rose: "var(--rose-soft)",
  blue: "var(--blue-soft)",
  green: "var(--green-soft)",
};
const TONE_FG: Record<string, string> = {
  rose: "var(--red)",
  blue: "var(--navy)",
  green: "#2b7a43",
};

export default async function HomepageListingHook() {
  const session = await getSession();
  const loggedInCitizen = session?.kind === "fuqaro";

  function hrefFor(turi: string): string {
    const target = `/elon-berish?turi=${turi}`;
    return loggedInCitizen ? target : `/kirish?rol=fuqaro&next=${encodeURIComponent(target)}`;
  }

  return (
    <section>
      <div className="wrap">
        <Reveal onView>
          <div className="section-head">
            <div className="section-eyebrow">E&apos;lonlar</div>
            <h2 className="section-title">Sizda e&apos;lon bormi?</h2>
            <p className="section-desc">
              Mahallangizga tegishli e&apos;loningizni bepul joylang — bankir tasdiqlagach,
              minglab qo&apos;shnilaringiz ko&apos;radi.
            </p>
          </div>
        </Reveal>
        <div className="grid grid-3">
          {CARDS.map((c, i) => (
            <Reveal key={c.turi} variant="scale" onView delay={i * 90}>
              <div className="card hook-card">
                <div className="ic" style={{ background: TONE_BG[c.tone], color: TONE_FG[c.tone] }}>
                  <c.icon size={20} />
                </div>
                <h4 style={{ margin: "12px 0 6px" }}>{c.title}</h4>
                <p className="small-muted" style={{ marginBottom: 16 }}>
                  {c.desc}
                </p>
                <Link href={hrefFor(c.turi)} className="btn btn-primary btn-sm">
                  E&apos;lon berish <ArrowRight size={14} />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
