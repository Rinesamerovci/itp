import { AlertTriangle, CheckCircle2, Clock3 } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";
import { formatDate } from "../lib/date";
import { translateEventNote, translateEventTitle } from "../lib/localize";

function iconForStatus(status) {
  if (status === "past") {
    return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
  }
  if (status === "missed") {
    return <AlertTriangle className="h-5 w-5 text-rose-600" />;
  }
  return <Clock3 className="h-5 w-5 text-sky-600" />;
}

export default function Timeline({ events }) {
  const { t } = useTranslation();

  return (
    <div className="max-h-[28rem] space-y-4 overflow-y-auto pr-2">
      {events.map((event) => (
        <div key={event.id} className="relative flex gap-4 rounded-3xl bg-white p-4 shadow-sm">
          <div className="relative flex flex-col items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50">
              {iconForStatus(event.status)}
            </div>
            <div className="mt-2 h-full w-px bg-slate-200" />
          </div>
          <div className="pb-4">
            <p className="text-sm font-semibold text-slate-950">{translateEventTitle(event, t)}</p>
            <p className="mt-1 text-sm text-slate-500">{formatDate(event.date)}</p>
            <p className="mt-2 text-sm text-slate-600">{event.providerName || t("common.provider")}</p>
            {event.notes || event.noteKey ? (
              <p className="mt-2 text-sm text-slate-500">{translateEventNote(event, t)}</p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
