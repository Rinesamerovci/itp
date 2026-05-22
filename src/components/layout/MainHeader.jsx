import { Bell, Menu } from "lucide-react";
import EKosovaLogo from "../EKosovaLogo";
import RoleSwitcher from "../RoleSwitcher";

const headerLinks = [
  { label: "Kryesore", active: false },
  { label: "Sh\u00ebrbime", active: true },
  { label: "Informata", active: false },
];

export default function MainHeader({ onMenuToggle, showNavigation = true, showRoleSwitcher = true }) {
  return (
    <header className="sticky top-0 z-30 h-[72px] border-b border-brand-border bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
      <div className="mx-auto flex h-full max-w-[1240px] items-center justify-between gap-6 px-4 md:px-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onMenuToggle}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-brand-border text-brand-navy md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <EKosovaLogo compact />
        </div>

        {showNavigation ? (
          <nav className="hidden items-center gap-10 lg:flex">
            {headerLinks.map((item) => (
              <span
                key={item.label}
                className="group inline-flex cursor-default items-center gap-2 text-sm font-medium text-brand-navy"
              >
                <span className="text-base text-brand-navy/70">{">"}</span>
                <span
                  className={`border-b transition group-hover:border-brand-navy ${
                    item.active ? "border-brand-navy font-semibold" : "border-transparent"
                  }`}
                >
                  {item.label}
                </span>
              </span>
            ))}
          </nav>
        ) : (
          <div className="hidden flex-1 lg:block" />
        )}

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-border bg-white text-brand-navy shadow-sm"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-navy px-1 text-[10px] font-semibold text-white">
              0
            </span>
          </button>
          {showRoleSwitcher ? <RoleSwitcher /> : null}
        </div>
      </div>
    </header>
  );
}
