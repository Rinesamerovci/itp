import { useEffect, useMemo, useState } from "react";
import { Download, Eye, LoaderCircle } from "lucide-react";
import EmptyState from "../components/EmptyState";
import ReportSummaryCard from "../components/ReportSummaryCard";
import { useRole } from "../context/RoleContext";
import { useToast } from "../hooks/useToast";
import { useTranslation } from "../hooks/useTranslation";
import { formatDate } from "../lib/date";
import { getHomeVisitReportsByStaff } from "../lib/demoDb";
import generateReportPDF from "../lib/generateReportPDF";
import { getStoredStaffProfile } from "../lib/localProfile";
import { canAccessHomeVisitReports, getVisitReasonLabel, KOSOVO_MUNICIPALITIES } from "../lib/medicalData";

export default function VisitReportHistory() {
  const { currentRole } = useRole();
  const { push } = useToast();
  const { t } = useTranslation();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    municipality: "all",
  });

  useEffect(() => {
    async function loadReports() {
      setLoading(true);
      try {
        const profile = getStoredStaffProfile();
        const records = await getHomeVisitReportsByStaff(profile.name);
        setReports(records);
      } catch (error) {
        push(t("reports.historyLoadError"), "error");
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, [push, t]);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const reportDate = report.visitDate || "";
      const matchesStart = filters.startDate ? reportDate >= filters.startDate : true;
      const matchesEnd = filters.endDate ? reportDate <= filters.endDate : true;
      const matchesMunicipality = filters.municipality === "all" ? true : report.municipality === filters.municipality;
      return matchesStart && matchesEnd && matchesMunicipality;
    });
  }, [filters, reports]);

  if (!canAccessHomeVisitReports(currentRole)) {
    return <EmptyState title={t("reports.accessDenied")} description={t("reports.accessDeniedHelp")} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-teal">{t("reports.historyTitle")}</p>
        <h1 className="mt-2 text-3xl font-semibold text-brand-primary">{t("reports.historyTitle")}</h1>
        <p className="mt-2 text-sm text-brand-secondary">{t("reports.historySubtitle")}</p>
      </div>

      <section className="panel-card rounded-xl p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label={t("reports.startDate")} type="date" value={filters.startDate} onChange={(value) => setFilters((current) => ({ ...current, startDate: value }))} />
          <Field label={t("reports.endDate")} type="date" value={filters.endDate} onChange={(value) => setFilters((current) => ({ ...current, endDate: value }))} />
          <div>
            <label className="mb-2 block text-sm font-medium text-brand-secondary">{t("reports.municipality")}</label>
            <select
              value={filters.municipality}
              onChange={(event) => setFilters((current) => ({ ...current, municipality: event.target.value }))}
              className="field-shell w-full px-4 py-3 outline-none focus:border-brand-teal"
            >
              <option value="all">{t("common.all")}</option>
              {KOSOVO_MUNICIPALITIES.map((municipality) => (
                <option key={municipality} value={municipality}>
                  {municipality}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center py-16">
          <LoaderCircle className="h-8 w-8 animate-spin text-brand-teal" />
        </div>
      ) : filteredReports.length ? (
        <section className="panel-card overflow-hidden rounded-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-brand-secondary">
                <tr>
                  <th className="px-4 py-3 font-medium">{t("reports.visitDate")}</th>
                  <th className="px-4 py-3 font-medium">{t("reports.patientFullName")}</th>
                  <th className="px-4 py-3 font-medium">{t("reports.municipality")}</th>
                  <th className="px-4 py-3 font-medium">{t("reports.reasonForVisit")}</th>
                  <th className="px-4 py-3 font-medium">{t("reports.followUpRequired")}</th>
                  <th className="px-4 py-3 font-medium">{t("reports.actionsTaken")}</th>
                  <th className="px-4 py-3 font-medium">{t("dashboard.action")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.id} className="border-t border-brand-border align-top">
                    <td className="px-4 py-4 text-brand-secondary">{formatDate(report.visitDate)}</td>
                    <td className="px-4 py-4 font-semibold text-brand-primary">{report.patientName}</td>
                    <td className="px-4 py-4 text-brand-secondary">{report.municipality || "--"}</td>
                    <td className="px-4 py-4 text-brand-secondary">
                      {(report.visitReasons || []).slice(0, 2).map((reason) => getVisitReasonLabel(reason, t)).join(", ")}
                    </td>
                    <td className="px-4 py-4 text-brand-secondary">{report.followUpRequired ? t("common.yes") : t("common.no")}</td>
                    <td className="px-4 py-4 text-brand-secondary">{report.actionsTaken || "--"}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedReport(report)}
                          className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700"
                        >
                          <Eye className="h-4 w-4" />
                          {t("common.view")}
                        </button>
                        <button
                          type="button"
                          onClick={() => generateReportPDF(report, t)}
                          className="inline-flex items-center gap-2 rounded-lg bg-brand-teal px-4 py-2 text-xs font-semibold text-white"
                        >
                          <Download className="h-4 w-4" />
                          {t("reports.downloadPdf")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <EmptyState title={t("reports.noReports")} description={t("reports.noReportsHelp")} />
      )}

      {selectedReport ? (
        <Modal title={t("reports.viewReport")} closeLabel={t("common.close")} onClose={() => setSelectedReport(null)}>
          <div className="space-y-5">
            <ReportSummaryCard report={selectedReport} t={t} />
            <div className="grid gap-4 md:grid-cols-2">
              <DetailBlock title={t("reports.visibleSymptoms")} value={selectedReport.symptoms || t("common.none")} />
              <DetailBlock title={t("reports.medicationsGiven")} value={selectedReport.medicationsGiven || t("common.none")} />
              <DetailBlock title={t("reports.assessmentNotes")} value={selectedReport.assessment || t("common.none")} />
              <DetailBlock title={t("reports.referralDetails")} value={selectedReport.referralDetails || t("common.none")} />
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-brand-secondary">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="field-shell w-full px-4 py-3 outline-none focus:border-brand-teal"
      />
    </div>
  );
}

function Modal({ title, closeLabel, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4">
      <div className="panel-card max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-xl p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-brand-primary">{title}</h3>
          <button type="button" onClick={onClose} className="text-sm font-medium text-brand-secondary">
            {closeLabel}
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

function DetailBlock({ title, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-5">
      <p className="text-sm font-semibold text-brand-primary">{title}</p>
      <p className="mt-2 text-sm leading-6 text-brand-secondary">{value}</p>
    </div>
  );
}
