import HeatMap from "../components/HeatMap";
import { useTranslation } from "../hooks/useTranslation";

const municipalities = [
  { name: "Pristina", coverage: 87, atRiskChildren: 12 },
  { name: "Prizren", coverage: 72, atRiskChildren: 18 },
  { name: "Peja", coverage: 91, atRiskChildren: 5 },
  { name: "Mitrovica", coverage: 64, atRiskChildren: 21 },
  { name: "Gjilan", coverage: 78, atRiskChildren: 11 },
  { name: "Ferizaj", coverage: 83, atRiskChildren: 9 },
  { name: "Gjakova", coverage: 69, atRiskChildren: 14 },
];

export default function OutbreakMap() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-teal">{t("map.title")}</p>
        <h1 className="mt-2 text-3xl font-semibold text-brand-primary">{t("map.title")}</h1>
        <p className="mt-2 text-sm text-brand-secondary">{t("map.subtitle")}</p>
      </div>
      <HeatMap municipalities={municipalities} />
    </div>
  );
}
