import { useState } from "react";
import { useTranslation } from "../hooks/useTranslation";

function getColor(coverage) {
  if (coverage > 90) {
    return "bg-emerald-500";
  }
  if (coverage >= 70) {
    return "bg-amber-400";
  }
  return "bg-rose-500";
}

export default function HeatMap({ municipalities }) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(municipalities[0]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr,0.8fr]">
      <div className="grid grid-cols-2 gap-4 rounded-[2rem] bg-white p-5 shadow-soft sm:grid-cols-3">
        {municipalities.map((municipality) => (
          <button
            key={municipality.name}
            type="button"
            onClick={() => setSelected(municipality)}
            className={`rounded-[1.5rem] p-5 text-left text-white shadow-sm transition hover:-translate-y-1 ${getColor(
              municipality.coverage,
            )}`}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.2em] opacity-90">{municipality.name}</p>
            <p className="mt-4 text-3xl font-bold">{municipality.coverage}%</p>
          </button>
        ))}
      </div>

      <div className="rounded-[2rem] bg-slate-950 p-5 text-white shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">{selected.name}</p>
        <h3 className="mt-3 text-3xl font-semibold">{selected.coverage}%</h3>
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl bg-white/8 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("map.coveragePercent")}</p>
            <p className="mt-2 text-lg font-semibold">{selected.coverage}%</p>
          </div>
          <div className="rounded-2xl bg-white/8 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("map.atRiskCount")}</p>
            <p className="mt-2 text-lg font-semibold">{selected.atRiskChildren}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
