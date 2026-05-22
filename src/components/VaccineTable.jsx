import { useTranslation } from "../hooks/useTranslation";
import { translateVaccine } from "../lib/localize";
import StatusBadge from "./StatusBadge";

function getStatus(dateGiven, dueDate) {
  if (dateGiven) {
    return "given";
  }
  return new Date(dueDate) < new Date() ? "missed" : "upcoming";
}

export default function VaccineTable({ vaccines, onSave, savingId, readOnly = false }) {
  const { t } = useTranslation();

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50 text-sm text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">{t("child.eventName")}</th>
              <th className="px-4 py-3 font-medium">{t("child.recommendedAge")}</th>
              <th className="px-4 py-3 font-medium">{t("child.dateGiven")}</th>
              <th className="px-4 py-3 font-medium">{t("child.status")}</th>
            </tr>
          </thead>
          <tbody>
            {vaccines.map((vaccine) => (
              <tr key={vaccine.id} className="border-t border-slate-100 text-sm">
                <td className="px-4 py-4 font-semibold text-slate-900">{translateVaccine(vaccine, t)}</td>
                <td className="px-4 py-4 text-slate-600">{vaccine.recommendedAge}</td>
                <td className="px-4 py-4">
                  <input
                    type="date"
                    disabled={readOnly}
                    value={vaccine.dateGiven ? vaccine.dateGiven.slice(0, 10) : ""}
                    onChange={(event) =>
                      onSave(vaccine.id, {
                        dateGiven: event.target.value,
                        status: getStatus(event.target.value, vaccine.dueDate),
                      })
                    }
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 outline-none disabled:bg-slate-50 disabled:text-slate-500 focus:border-brand-teal"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <StatusBadge value={vaccine.status} label={t(`common.${vaccine.status}`)} />
                    {savingId === vaccine.id ? <span className="text-xs text-slate-400">{t("common.saving")}</span> : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
