import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, QrCode } from "lucide-react";
import ChildCard from "../components/ChildCard";
import EmptyState from "../components/EmptyState";
import MilestoneGrid from "../components/MilestoneGrid";
import QRPassport from "../components/QRPassport";
import RiskPanel from "../components/RiskPanel";
import Timeline from "../components/Timeline";
import VaccineTable from "../components/VaccineTable";
import { useRole } from "../context/RoleContext";
import { useChild, useChildren } from "../hooks/useChild";
import { useToast } from "../hooks/useToast";
import { useTranslation } from "../hooks/useTranslation";
import { getAgeLabel } from "../lib/date";

export default function ChildFeatureHub({ section }) {
  const { currentRole } = useRole();
  const { push } = useToast();
  const { t } = useTranslation();
  const { children, loading } = useChildren(currentRole);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [qrOpen, setQrOpen] = useState(false);
  const { bundle, loading: childLoading, saveVaccine, saveMilestone } = useChild(selectedChildId, currentRole);

  useEffect(() => {
    if (!children.length) {
      setSelectedChildId("");
      return;
    }

    setSelectedChildId((current) => (current && children.some((child) => child.id === current) ? current : children[0].id));
  }, [children]);

  const pageTitle = useMemo(() => {
    switch (section) {
      case "timeline":
        return t("layout.nav.vaccineTimeline");
      case "vaccines":
        return currentRole === "doctor" ? t("layout.nav.vaccines") : t("layout.nav.vaccineTimeline");
      case "milestones":
        return t("layout.nav.milestones");
      case "qr":
        return t("layout.nav.qrPassport");
      case "reminders":
        return t("layout.nav.reminders");
      case "children":
        return t("layout.nav.children");
      default:
        return currentRole === "doctor" ? t("layout.nav.children") : t("layout.nav.myChildren");
    }
  }, [currentRole, section, t]);

  async function handleVaccineSave(vaccineId, updates) {
    await saveVaccine(vaccineId, updates);
    push(t("child.vaccineUpdated"));
  }

  async function handleMilestoneSave(milestoneId, updates) {
    await saveMilestone(milestoneId, updates);
    push(t("child.milestoneUpdated"));
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoaderCircle className="h-8 w-8 animate-spin text-brand-teal" />
      </div>
    );
  }

  if (!children.length) {
    return <EmptyState title={t("dashboard.noChildren")} description={t("dashboard.addFirstChild")} />;
  }

  const selectedChild = children.find((child) => child.id === selectedChildId);
  const readOnly = currentRole !== "doctor";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-teal">{pageTitle}</p>
          <h1 className="mt-2 text-3xl font-semibold text-brand-primary">{pageTitle}</h1>
        </div>

        {section !== "children" ? (
          <div className="w-full max-w-sm">
            <label className="mb-2 block text-sm font-medium text-brand-secondary">{t("layout.selectChild")}</label>
            <select
              value={selectedChildId}
              onChange={(event) => setSelectedChildId(event.target.value)}
              className="field-shell w-full px-4 py-3 outline-none focus:border-brand-teal"
            >
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name} {"|"} {getAgeLabel(child.dob)}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      {section === "children" ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {children.map((child) => (
            <ChildCard key={child.id} child={child} />
          ))}
        </div>
      ) : childLoading || !bundle || !selectedChild ? (
        <div className="flex justify-center py-16">
          <LoaderCircle className="h-8 w-8 animate-spin text-brand-teal" />
        </div>
      ) : (
        <div className="space-y-6">
          <section className="panel-card rounded-xl p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-brand-primary">{selectedChild.name}</h2>
                <p className="mt-1 text-sm text-brand-secondary">{getAgeLabel(selectedChild.dob)}</p>
              </div>
              {section === "qr" ? (
                <button
                  type="button"
                  onClick={() => setQrOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-teal px-4 py-3 text-sm font-semibold text-white"
                >
                  <QrCode className="h-4 w-4" />
                  {t("layout.openPassport")}
                </button>
              ) : null}
            </div>
          </section>

          {section === "vaccines" ? (
            <VaccineTable
              vaccines={bundle.child.vaccines}
              onSave={handleVaccineSave}
              savingId=""
              readOnly={readOnly}
            />
          ) : null}

          {section === "milestones" ? (
            <MilestoneGrid
              milestones={bundle.child.milestones}
              onSave={handleMilestoneSave}
              savingId=""
              readOnly={readOnly}
            />
          ) : null}

          {section === "qr" ? (
            <>
              <div className="panel-card rounded-xl p-6">
                <p className="text-sm text-brand-secondary">{t("child.passportOffline")}</p>
              </div>
              <QRPassport child={bundle.child} open={qrOpen} onClose={() => setQrOpen(false)} />
            </>
          ) : null}

          {section === "reminders" ? (
            <RiskPanel
              child={bundle.child}
              onRiskNotified={() => push(t("child.doctorNotified"))}
              onIssueSent={() => push(t("child.issueSent"))}
            />
          ) : null}

          {section === "timeline" ? <Timeline events={bundle.child.events} /> : null}
        </div>
      )}
    </div>
  );
}
