import { useEffect, useMemo, useState } from "react";
import { CalendarPlus2, LoaderCircle, MessageSquareMore } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import { useToast } from "../hooks/useToast";
import { useTranslation } from "../hooks/useTranslation";
import { formatDate, getAgeLabel } from "../lib/date";
import { getClinicNotifications, getProviderChildren, saveVisitEvent } from "../lib/demoDb";
import { preventAccidentalEnterSubmit } from "../lib/forms";
import { getDoctorViewer } from "../lib/localProfile";
import { translateMissingItem } from "../lib/localize";

const filters = ["all", "high", "medium", "unseen"];

export default function ProviderDashboard() {
  const doctorViewer = getDoctorViewer();
  const { push } = useToast();
  const { t } = useTranslation();
  const [children, setChildren] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedChild, setSelectedChild] = useState(null);
  const [savingVisit, setSavingVisit] = useState(false);
  const [visitForm, setVisitForm] = useState({
    date: "",
    title: "",
    notes: "",
  });

  async function loadDashboard() {
    setLoading(true);
    const [records, clinicMessages] = await Promise.all([
      getProviderChildren(doctorViewer.clinicId),
      getClinicNotifications(doctorViewer.clinicId, "parent_issue"),
    ]);
    setChildren(records);
    setMessages(clinicMessages);
    setLoading(false);
  }

  useEffect(() => {
    loadDashboard();
  }, [doctorViewer.clinicId]);

  const filteredChildren = useMemo(() => {
    if (filter === "high") {
      return children.filter((child) => child.riskScore === "HIGH");
    }
    if (filter === "medium") {
      return children.filter((child) => child.riskScore === "MEDIUM");
    }
    if (filter === "unseen") {
      return children.filter((child) => {
        if (!child.lastSeen) {
          return true;
        }
        return Date.now() - new Date(child.lastSeen).getTime() > 1000 * 60 * 60 * 24 * 180;
      });
    }
    return children;
  }, [children, filter]);

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

  const chartData = [{ name: t("dashboard.coverage"), value: coveragePercent }];

  function openVisitModal(child) {
    setSelectedChild(child);
    setVisitForm({
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString().slice(0, 10),
      title: t("dashboard.defaultVisitTitle"),
      notes: "",
    });
  }

  async function handleVisitSave(event) {
    event.preventDefault();
    if (!selectedChild) {
      return;
    }

    setSavingVisit(true);
    try {
      await saveVisitEvent({
        childId: selectedChild.id,
        providerId: doctorViewer.uid,
        providerName: doctorViewer.name,
        date: visitForm.date,
        title: visitForm.title,
        notes: visitForm.notes,
      });
      push(t("dashboard.visitSaved"));
      setSelectedChild(null);
      await loadDashboard();
    } finally {
      setSavingVisit(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[20px] border border-brand-border bg-[#f7f8fb] px-5 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-teal">{t("dashboard.welcomeProvider")}</p>
        <h1 className="mt-2 text-3xl font-semibold text-brand-primary">{doctorViewer.name}</h1>
        <p className="mt-2 text-sm text-brand-secondary">{doctorViewer.clinicId}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <LoaderCircle className="h-8 w-8 animate-spin text-brand-teal" />
        </div>
      ) : (
        <div className="space-y-6">
          <section className="grid gap-5 xl:grid-cols-[0.9fr,1.2fr,0.9fr]">
            <StatCard label={t("dashboard.totalRegistered")} value={children.length} accent="bg-brand-mint text-brand-teal" />
            <div className="panel-card rounded-xl p-5">
              <p className="text-sm font-semibold text-brand-primary">{t("dashboard.coverage")}</p>
              <div className="mt-4 h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#1B3A6B" radius={[12, 12, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <StatCard
              label={t("dashboard.highRiskCount")}
              value={children.filter((child) => child.riskScore === "HIGH").length}
              accent="bg-rose-50 text-rose-600"
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.35fr,0.65fr]">
            <div className="panel-card rounded-xl p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-teal">{t("dashboard.atRiskChildren")}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-brand-primary">{t("dashboard.clinicWatchlist")}</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filters.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFilter(key)}
                      className={`rounded-lg px-4 py-2 text-sm font-medium ${
                        filter === key ? "bg-brand-navy text-white" : "bg-slate-100 text-brand-secondary"
                      }`}
                    >
                      {labelForFilter(key, t)}
                    </button>
                  ))}
                </div>
              </div>

              {filteredChildren.length ? (
                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="text-brand-secondary">
                      <tr>
                        <th className="px-3 py-3 font-medium">{t("common.name")}</th>
                        <th className="px-3 py-3 font-medium">{t("common.age")}</th>
                        <th className="px-3 py-3 font-medium">{t("common.riskScore")}</th>
                        <th className="px-3 py-3 font-medium">{t("dashboard.lastSeen")}</th>
                        <th className="px-3 py-3 font-medium">{t("dashboard.missingItems")}</th>
                        <th className="px-3 py-3 font-medium">{t("dashboard.action")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredChildren.map((child) => (
                        <tr key={child.id} className="border-t border-brand-border">
                          <td className="px-3 py-4 font-semibold text-brand-primary">{child.name}</td>
                          <td className="px-3 py-4 text-brand-secondary">{getAgeLabel(child.dob)}</td>
                          <td className="px-3 py-4">
                            <StatusBadge value={child.riskScore} label={t(`common.${child.riskScore.toLowerCase()}`)} />
                          </td>
                          <td className="px-3 py-4 text-brand-secondary">
                            {child.lastSeen ? formatDate(child.lastSeen) : t("dashboard.noVisit")}
                          </td>
                          <td className="px-3 py-4 text-brand-secondary">
                            {child.missingItems.length
                              ? child.missingItems.map((item) => translateMissingItem(item, t)).join(", ")
                              : t("common.none")}
                          </td>
                          <td className="px-3 py-4">
                            <div className="flex flex-col gap-2">
                              <button
                                type="button"
                                onClick={() => openVisitModal(child)}
                                className="rounded-lg bg-brand-teal px-4 py-2 text-xs font-semibold text-white"
                              >
                                {t("dashboard.scheduleVisit")}
                              </button>
                              <button
                                type="button"
                                onClick={() => push(t("dashboard.reminderSent"))}
                                className="rounded-lg bg-brand-amber px-4 py-2 text-xs font-semibold text-white"
                              >
                                {t("dashboard.sendReminder")}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mt-6">
                  <EmptyState title={t("dashboard.noMatchingChildren")} description={t("dashboard.adjustFilter")} />
                </div>
              )}
            </div>

            <div className="panel-card rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-mint text-brand-teal">
                  <MessageSquareMore className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-teal">{t("dashboard.parentIssues")}</p>
                  <h2 className="mt-1 text-xl font-semibold text-brand-primary">{messages.length}</h2>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {messages.length ? (
                  messages.slice(0, 6).map((message) => (
                    <article key={message.id} className="rounded-xl bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-semibold text-brand-primary">{message.childName}</p>
                        <span className="text-xs text-brand-secondary">{formatDate(message.sentAt)}</span>
                      </div>
                      <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-brand-teal">{message.parentName}</p>
                      <p className="mt-3 text-sm leading-6 text-brand-secondary">{message.message}</p>
                    </article>
                  ))
                ) : (
                  <EmptyState title={t("dashboard.parentIssues")} description={t("dashboard.noParentIssues")} />
                )}
              </div>
            </div>
          </section>
        </div>
      )}

      {selectedChild ? (
        <Modal title={`${t("dashboard.scheduleVisit")} - ${selectedChild.name}`} onClose={() => setSelectedChild(null)}>
          <form className="space-y-4" onSubmit={handleVisitSave} onKeyDown={preventAccidentalEnterSubmit}>
            <Field label={t("dashboard.visitDate")} type="date" value={visitForm.date} onChange={(value) => setVisitForm((current) => ({ ...current, date: value }))} />
            <Field label={t("dashboard.visitTitle")} value={visitForm.title} onChange={(value) => setVisitForm((current) => ({ ...current, title: value }))} />
            <div>
              <label className="mb-2 block text-sm font-medium text-brand-secondary">{t("dashboard.visitNotes")}</label>
              <textarea
                rows={4}
                value={visitForm.notes}
                onChange={(event) => setVisitForm((current) => ({ ...current, notes: event.target.value }))}
                className="field-shell w-full px-4 py-3 outline-none focus:border-brand-teal"
              />
            </div>
            <button
              type="submit"
              disabled={savingVisit}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-teal px-4 py-3 text-sm font-semibold text-white disabled:opacity-70"
            >
              {savingVisit ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CalendarPlus2 className="h-4 w-4" />}
              {t("common.save")}
            </button>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="panel-card rounded-xl p-5">
      <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${accent}`}>
        {label}
      </div>
      <p className="mt-5 text-4xl font-semibold text-brand-primary">{value}</p>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4">
      <div className="panel-card w-full max-w-lg rounded-xl p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-brand-primary">{title}</h3>
          <button type="button" onClick={onClose} className="text-sm font-medium text-brand-secondary">
            {t("common.close")}
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
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

function labelForFilter(key, t) {
  switch (key) {
    case "high":
      return t("dashboard.highRiskOnly");
    case "medium":
      return t("dashboard.mediumRiskOnly");
    case "unseen":
      return t("dashboard.unseenSixMonths");
    default:
      return t("common.all");
  }
}
