import { useEffect, useMemo, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import { useRole } from "../context/RoleContext";
import { useTranslation } from "../hooks/useTranslation";
import { getProviderChildren } from "../lib/demoDb";
import { formatDate, getAgeLabel } from "../lib/date";
import { getDoctorViewer } from "../lib/localProfile";
import { translateMissingItem } from "../lib/localize";

export default function CoverageAnalytics() {
  const { currentRole } = useRole();
  const { t } = useTranslation();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      try {
        const doctorViewer = getDoctorViewer();
        const records = await getProviderChildren(doctorViewer.clinicId);
        setChildren(records);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  const coveragePercent = useMemo(() => {
    const totals = children.reduce(
      (accumulator, child) => {
        accumulator.done += child.vaccines.filter((item) => item.status === "given").length;
        accumulator.total += child.vaccines.length;
        return accumulator;
      },
      { done: 0, total: 0 },
    );

    return totals.total ? Math.round((totals.done / totals.total) * 100) : 0;
  }, [children]);

  if (currentRole !== "doctor") {
    return <EmptyState title={t("layout.doctorAccessTitle")} description={t("layout.doctorAccessDescription")} />;
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoaderCircle className="h-8 w-8 animate-spin text-brand-teal" />
      </div>
    );
  }

  const chartData = [{ name: t("dashboard.coverage"), value: coveragePercent }];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-teal">{t("layout.nav.coverageAnalytics")}</p>
        <h1 className="mt-2 text-3xl font-semibold text-brand-primary">{t("layout.nav.coverageAnalytics")}</h1>
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        <StatCard label={t("dashboard.totalRegistered")} value={children.length} />
        <StatCard label={t("dashboard.coverage")} value={`${coveragePercent}%`} />
        <StatCard label={t("dashboard.highRiskCount")} value={children.filter((child) => child.riskScore === "HIGH").length} />
      </section>

      <section className="panel-card rounded-xl p-5">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="value" fill="#1B3A6B" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel-card overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-brand-secondary">
              <tr>
                <th className="px-4 py-3 font-medium">{t("common.name")}</th>
                <th className="px-4 py-3 font-medium">{t("common.age")}</th>
                <th className="px-4 py-3 font-medium">{t("common.riskScore")}</th>
                <th className="px-4 py-3 font-medium">{t("dashboard.lastSeen")}</th>
                <th className="px-4 py-3 font-medium">{t("dashboard.missingItems")}</th>
              </tr>
            </thead>
            <tbody>
              {children.map((child) => (
                <tr key={child.id} className="border-t border-brand-border">
                  <td className="px-4 py-4 font-semibold text-brand-primary">{child.name}</td>
                  <td className="px-4 py-4 text-brand-secondary">{getAgeLabel(child.dob)}</td>
                  <td className="px-4 py-4">
                    <StatusBadge value={child.riskScore} label={t(`common.${child.riskScore.toLowerCase()}`)} />
                  </td>
                  <td className="px-4 py-4 text-brand-secondary">{child.lastSeen ? formatDate(child.lastSeen) : t("dashboard.noVisit")}</td>
                  <td className="px-4 py-4 text-brand-secondary">
                    {child.missingItems.length
                      ? child.missingItems.map((item) => translateMissingItem(item, t)).join(", ")
                      : t("common.none")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="panel-card rounded-xl p-5">
      <p className="text-sm font-medium text-brand-secondary">{label}</p>
      <p className="mt-3 text-4xl font-semibold text-brand-primary">{value}</p>
    </div>
  );
}
