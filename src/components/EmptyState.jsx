export default function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-brand-teal/25 bg-white/80 px-6 py-10 text-center shadow-soft">
      <svg viewBox="0 0 240 140" className="mx-auto mb-5 h-28 w-auto">
        <rect x="22" y="32" width="196" height="84" rx="20" fill="#DDF2EB" />
        <circle cx="72" cy="72" r="18" fill="#0F6E56" opacity="0.18" />
        <circle cx="120" cy="60" r="26" fill="#BA7517" opacity="0.15" />
        <circle cx="168" cy="78" r="20" fill="#0F6E56" opacity="0.18" />
        <path d="M75 88h90" stroke="#0F6E56" strokeWidth="8" strokeLinecap="round" opacity="0.5" />
        <path d="M90 55h58" stroke="#0F6E56" strokeWidth="8" strokeLinecap="round" opacity="0.35" />
      </svg>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
