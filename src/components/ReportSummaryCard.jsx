import { CalendarDays, ClipboardList, MapPin, UserRound } from "lucide-react";
import { formatDate } from "../lib/date";
import { getVisitReasonLabel } from "../lib/medicalData";

export default function ReportSummaryCard({ report, t }) {
  return (
    <div className="panel-card rounded-xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-teal">{t("reports.summary")}</p>
          <h3 className="mt-2 text-2xl font-semibold text-brand-primary">{report.patientName}</h3>
          <p className="mt-1 text-sm text-brand-secondary">
            {report.visitDate ? formatDate(report.visitDate) : "--"} | {report.visitTime || "--"}
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-[var(--color-text-success)]">
          {t("reports.submittedStatus")}
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <Detail icon={<UserRound className="h-4 w-4" />} label={t("reports.staffMember")} value={report.staffName || "--"} />
        <Detail icon={<ClipboardList className="h-4 w-4" />} label={t("reports.roleSpecialisation")} value={report.staffRole || "--"} />
        <Detail icon={<MapPin className="h-4 w-4" />} label={t("reports.municipality")} value={report.municipality || "--"} />
        <Detail
          icon={<CalendarDays className="h-4 w-4" />}
          label={t("reports.followUpRequired")}
          value={report.followUpRequired ? t("common.yes") : t("common.no")}
        />
      </div>

      <div className="mt-5">
        <p className="text-sm font-semibold text-brand-primary">{t("reports.reasonForVisit")}</p>
        <p className="mt-2 text-sm leading-6 text-brand-secondary">
          {report.visitReasons?.length ? report.visitReasons.map((reason) => getVisitReasonLabel(reason, t)).join(", ") : t("common.none")}
        </p>
      </div>

      <div className="mt-5">
        <p className="text-sm font-semibold text-brand-primary">{t("reports.actionsTaken")}</p>
        <p className="mt-2 text-sm leading-6 text-brand-secondary">{report.actionsTaken || t("common.none")}</p>
      </div>
    </div>
  );
}

function Detail({ icon, label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-brand-teal">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-[0.18em]">{label}</span>
      </div>
      <p className="mt-3 text-sm font-medium text-brand-secondary">{value}</p>
    </div>
  );
}
