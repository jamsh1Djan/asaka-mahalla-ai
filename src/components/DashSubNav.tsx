import Link from "next/link";

/** The admin/bankir tab strip — a distinct sub-navigation bar sitting below
 * the header (own white background, own border), not part of the navbar
 * itself. Rendered as the first thing after <Header/> so the page's 24px
 * top margin creates a real gap instead of the tabs feeling glued on. */
export default function DashSubNav({
  tabs,
  activeKey,
  basePath,
}: {
  tabs: readonly (readonly [string, string])[];
  activeKey: string;
  basePath: string;
}) {
  return (
    <div className="subnav">
      <div className="wrap">
        <div className="dash-tabs">
          {tabs.map(([key, label]) => (
            <Link key={key} href={`${basePath}?tab=${key}`} className={activeKey === key ? "active" : ""}>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
