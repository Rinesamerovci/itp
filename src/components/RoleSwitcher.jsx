import { useEffect, useRef, useState } from "react";
import { ChevronDown, Stethoscope, UserRound } from "lucide-react";
import { useRole } from "../context/RoleContext";
import { useTranslation } from "../hooks/useTranslation";

export default function RoleSwitcher() {
  const { currentRole, setCurrentRole } = useRole();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const label = currentRole === "doctor" ? t("layout.roles.doctor") : t("layout.roles.parent");

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-3 rounded-xl border border-brand-border bg-white px-3.5 py-2 text-sm font-medium text-brand-navy shadow-sm transition hover:border-brand-navy/30"
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-brand-navy/10 bg-brand-navy/[0.06] text-brand-navy">
          {currentRole === "doctor" ? <Stethoscope className="h-4 w-4" /> : <UserRound className="h-4 w-4" />}
        </span>
        <span className="max-w-[148px] truncate text-left">{label}</span>
        <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-40 min-w-[240px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
          <RoleOption
            active={currentRole === "parent"}
            icon={<UserRound className="h-4 w-4" />}
            label={t("layout.parentView")}
            onClick={() => {
              setCurrentRole("parent");
              setOpen(false);
            }}
          />
          <RoleOption
            active={currentRole === "doctor"}
            icon={<Stethoscope className="h-4 w-4" />}
            label={t("layout.doctorView")}
            onClick={() => {
              setCurrentRole("doctor");
              setOpen(false);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

function RoleOption({ active, icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition ${
        active ? "bg-brand-teal/8 text-brand-teal" : "text-slate-700 hover:bg-slate-50"
      }`}
    >
      <span className="text-current">{icon}</span>
      {label}
    </button>
  );
}
