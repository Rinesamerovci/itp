import { Bell } from "lucide-react";
import { useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useRole } from "../../context/RoleContext";
import { useTranslation } from "../../hooks/useTranslation";
import RoleSwitcher from "../RoleSwitcher";
import MainHeader from "./MainHeader";
import Sidebar from "./Sidebar";
import TopUtilityBar from "./TopUtilityBar";
import { doctorItems, isNavItemActive, parentItems } from "./navigation";

export default function VitaKidShell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentRole } = useRole();
  const { t } = useTranslation();
  const location = useLocation();
  const items = currentRole === "doctor" ? doctorItems : parentItems;

  const currentNavLabel = useMemo(() => {
    const activeItem = items.find((item) => isNavItemActive(location.pathname, item.to));
    return activeItem ? t(activeItem.key) : "VitaKid";
  }, [items, location.pathname, t]);

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-brand-primary">
      <TopUtilityBar />
      <MainHeader onMenuToggle={() => setMobileOpen((value) => !value)} />
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <main className="pb-12">
        <div className="mx-auto max-w-[1238px] px-4 py-9 md:px-6">
          <div className="mx-auto max-w-[940px]">
            <section className="rounded-[18px] bg-white px-5 py-6 shadow-[0_8px_20px_rgba(0,0,0,0.12)] md:px-6">
              <div className="mb-5 flex justify-end">
                <div className="flex items-center gap-2 rounded-2xl border border-brand-border bg-white px-2 py-2 shadow-sm">
                  <button
                    type="button"
                    className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-border bg-white text-brand-navy shadow-sm"
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-navy px-1 text-[10px] font-semibold text-white">
                      0
                    </span>
                  </button>
                  <RoleSwitcher />
                </div>
              </div>

              <div className="border-b border-brand-border pb-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-teal">{t("portal.workspaceBadge")}</p>
                    <h1 className="mt-2 text-[1.8rem] font-semibold text-brand-primary">{currentNavLabel}</h1>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-brand-secondary">{t("portal.workspaceDescription")}</p>
                  </div>
                  <div className="rounded-full bg-brand-teal/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">
                    {currentRole === "doctor" ? t("layout.roles.doctor") : t("layout.roles.parent")}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const active = isNavItemActive(location.pathname, item.to);

                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={`inline-flex items-center gap-2 rounded-[10px] border px-4 py-2.5 text-sm font-medium transition ${
                          active
                            ? "border-brand-teal bg-brand-teal/10 text-brand-teal"
                            : "border-brand-border bg-white text-brand-secondary hover:border-brand-navy/20 hover:text-brand-navy"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {t(item.key)}
                      </NavLink>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6">{children}</div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
