import { Clock4 } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";
import { monthsOverdue } from "../lib/date";
import { translateMilestone } from "../lib/localize";

const groups = ["0-3m", "3-6m", "6-12m", "1-2y", "2-5y", "5-10y"];

export default function MilestoneGrid({ milestones, onSave, savingId, readOnly = false }) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {groups.map((group) => {
        const items = milestones.filter((milestone) => milestone.ageGroup === group);
        return (
          <section key={group} className="rounded-[1.75rem] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">{group}</h3>
              <span className="text-xs uppercase tracking-[0.2em] text-brand-teal">{items.length} items</span>
            </div>
            <div className="mt-4 space-y-3">
              {items.map((milestone) => {
                const overdueMonths = !milestone.achieved ? monthsOverdue(milestone.dueDate) : 0;
                return (
                  <label
                    key={milestone.id}
                    className={`flex items-start gap-3 rounded-2xl border px-4 py-3 transition ${
                      overdueMonths ? "border-amber-200 bg-amber-50/70" : "border-slate-200 bg-slate-50/70"
                    }`}
                  >
                    <input
                      type="checkbox"
                      disabled={readOnly}
                      checked={milestone.achieved}
                      onChange={(event) =>
                        onSave(milestone.id, {
                          achieved: event.target.checked,
                          achievedDate: event.target.checked ? new Date().toISOString() : "",
                        })
                      }
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-teal focus:ring-brand-teal disabled:opacity-60"
                    />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-slate-900">{translateMilestone(milestone, t)}</p>
                        {overdueMonths ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-700">
                            <Clock4 className="h-3 w-3" />
                            {t("child.overdue")}
                          </span>
                        ) : null}
                        {savingId === milestone.id ? <span className="text-xs text-slate-400">{t("common.saving")}</span> : null}
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {milestone.achieved ? t("child.achieved") : t("child.notYet")}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
