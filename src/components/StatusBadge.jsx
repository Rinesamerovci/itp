const tones = {
  LOW: "bg-emerald-100 text-emerald-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  HIGH: "bg-rose-100 text-rose-700",
  given: "bg-emerald-100 text-emerald-700",
  upcoming: "bg-sky-100 text-sky-700",
  missed: "bg-rose-100 text-rose-700",
};

export default function StatusBadge({ value, label }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
        tones[value] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {label ?? value}
    </span>
  );
}
