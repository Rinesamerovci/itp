import { CalendarDays, CheckCircle2, Mail, Phone, UserRound } from "lucide-react";
import { getSpecialisationLabel, getWeekdayLabel } from "../lib/medicalData";

export default function StaffCard({ staff, t, action }) {
  const activeDaysLabel = staff.activeDays?.length
    ? staff.activeDays.map((day) => getWeekdayLabel(day, t)).join(", ")
    : t("staff.noActiveDays");

  return (
    <article className="panel-card rounded-xl p-5">
      <div className="flex items-start gap-4">
        <Avatar profilePhoto={staff.profilePhoto} name={staff.name} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-slate-950">{staff.name || t("staff.unknownStaff")}</h3>
                {staff.isCurrentUser ? (
                  <span className="rounded-full bg-brand-navy/8 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-navy">
                    {t("staff.currentProfile")}
                  </span>
                ) : null}
              </div>
              <span className="mt-2 inline-flex rounded-full bg-brand-mint px-3 py-1 text-xs font-semibold text-brand-teal">
                {getSpecialisationLabel(staff.specialisation, t)}
              </span>
            </div>
            <AvailabilityBadge isAvailable={staff.isAvailable} t={t} />
          </div>

          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <InfoRow icon={<CalendarDays className="h-4 w-4" />} text={activeDaysLabel} />
            <InfoRow icon={<Phone className="h-4 w-4" />} text={staff.phone || t("staff.phoneEmpty")} />
            <InfoRow icon={<Mail className="h-4 w-4" />} text={staff.email || t("staff.emailEmpty")} />
          </div>

          {action ? <div className="mt-4">{action}</div> : null}
        </div>
      </div>
    </article>
  );
}

function Avatar({ profilePhoto, name }) {
  if (profilePhoto) {
    return <img src={profilePhoto} alt={name} className="h-16 w-16 rounded-full object-cover ring-4 ring-brand-mint" />;
  }

  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500 ring-4 ring-white">
      <UserRound className="h-7 w-7" />
    </div>
  );
}

function AvailabilityBadge({ isAvailable, t }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
        isAvailable ? "bg-emerald-50 text-[var(--color-text-success)]" : "bg-slate-100 text-slate-500"
      }`}
    >
      {isAvailable ? <CheckCircle2 className="h-4 w-4" /> : <span className="h-2.5 w-2.5 rounded-full bg-current opacity-70" />}
      {isAvailable ? t("staff.available") : t("staff.unavailable")}
    </span>
  );
}

function InfoRow({ icon, text }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-brand-teal">{icon}</span>
      <span className="min-w-0 break-words">{text}</span>
    </div>
  );
}
