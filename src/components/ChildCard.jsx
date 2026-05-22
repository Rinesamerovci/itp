import { CalendarClock, TriangleAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";
import { formatDate, getAgeLabel } from "../lib/date";
import { translateNextAction } from "../lib/localize";
import { buildAppPath } from "../lib/routes";
import HealthRing from "./HealthRing";
import StatusBadge from "./StatusBadge";

export default function ChildCard({ child }) {
  const { t } = useTranslation();

  return (
    <Link
      to={buildAppPath(`/child/${child.id}`)}
      className="group panel-card block rounded-[2rem] p-5 transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-teal">{getAgeLabel(child.dob)}</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">{child.name}</h3>
          <p className="mt-1 text-sm text-slate-500">{formatDate(child.dob)}</p>
        </div>
        <HealthRing score={child.healthScore} />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <StatusBadge value={child.riskScore} label={t(`common.${child.riskScore.toLowerCase()}`)} />
        <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          <TriangleAlert className="h-3.5 w-3.5" />
          {t("dashboard.healthScore")} {child.healthScore}%
        </div>
      </div>

      <div className="mt-5 rounded-[1.5rem] bg-gradient-to-br from-brand-sky/80 to-white p-4 ring-1 ring-sky-100">
        <div className="flex items-start gap-3">
          <CalendarClock className="mt-1 h-5 w-5 text-brand-teal" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-teal">{t("dashboard.nextAction")}</p>
            <p className="mt-1 text-sm font-medium leading-6 text-slate-700">{translateNextAction(child.nextAction, t)}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span className="rounded-full bg-slate-100 px-3 py-1">
          {t("common.lastSynced")}: {child.lastSyncedLabel}
        </span>
        <span className="font-medium text-brand-teal transition group-hover:translate-x-1">{t("dashboard.openProfile")}</span>
      </div>
    </Link>
  );
}
