import { useTranslation } from "../hooks/useTranslation";

export default function LanguageToggle() {
  const { language, setLanguage } = useTranslation();

  return (
    <div className="inline-flex rounded-lg border border-brand-border bg-white p-1 shadow-sm">
      {[
        { key: "al", label: "AL" },
        { key: "sr", label: "SR" },
      ].map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => setLanguage(option.key)}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
            language === option.key
              ? "bg-brand-navy text-white"
              : "text-brand-secondary hover:text-brand-navy"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
