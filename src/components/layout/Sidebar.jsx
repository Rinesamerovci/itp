import { ShieldPlus, X } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useRole } from "../../context/RoleContext";
import { useTranslation } from "../../hooks/useTranslation";
import { buildAppPath } from "../../lib/routes";
import LanguageToggle from "../LanguageToggle";
import { doctorItems, isNavItemActive, parentItems } from "./navigation";

export default function Sidebar({ mobileOpen, onClose }) {
  const { currentRole } = useRole();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const items = currentRole === "doctor" ? doctorItems : parentItems;

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-950/45 transition md:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed left-0 top-[108px] z-40 flex h-[calc(100vh-108px)] w-[300px] flex-col border-r border-brand-border bg-white shadow-xl transition-transform md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between border-b border-brand-border px-5 py-5">
          <div className="border-l-4 border-brand-teal pl-4">
            <p className="text-lg font-semibold text-brand-navy">VitaKid</p>
            <p className="mt-1 text-sm text-brand-secondary">{t("layout.sidebarSubtitle")}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-border text-brand-navy"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-4 py-4">
          <button
            type="button"
            onClick={() => {
              navigate(buildAppPath());
              onClose?.();
            }}
            className="inline-flex w-full items-center justify-between rounded-lg bg-brand-navy px-4 py-3 text-sm font-medium text-white shadow-sm"
          >
            <span>{t("layout.openVitakid")}</span>
            <span aria-hidden="true">{">"}</span>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 pb-4">
          <div className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const active = isNavItemActive(location.pathname, item.to);

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => onClose?.()}
                  className={`flex h-10 items-center gap-3 rounded-r-lg border-l-4 px-4 text-sm font-medium transition ${
                    active
                      ? "border-brand-teal bg-brand-teal/10 text-brand-teal"
                      : "border-transparent text-brand-secondary hover:bg-slate-50 hover:text-brand-primary"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {t(item.key)}
                </NavLink>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-brand-border px-4 py-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">
            <ShieldPlus className="h-4 w-4" />
            {t("layout.languageToggle")}
          </div>
          <div className="mt-3">
            <LanguageToggle />
          </div>
        </div>
      </aside>
    </>
  );
}
