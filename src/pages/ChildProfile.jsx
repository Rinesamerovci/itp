import { useEffect, useState } from "react";
import { LoaderCircle, PencilLine, QrCode, UserRound } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import MilestoneGrid from "../components/MilestoneGrid";
import QRPassport from "../components/QRPassport";
import RiskPanel from "../components/RiskPanel";
import Timeline from "../components/Timeline";
import VaccineTable from "../components/VaccineTable";
import { useRole } from "../context/RoleContext";
import { useChild } from "../hooks/useChild";
import { useToast } from "../hooks/useToast";
import { useTranslation } from "../hooks/useTranslation";
import { preventAccidentalEnterSubmit } from "../lib/forms";
import { formatDate } from "../lib/date";
import { buildAppPath } from "../lib/routes";

const tabs = ["timeline", "vaccines", "milestones"];

const blankChildForm = {
  name: "",
  dob: "",
  bloodType: "",
  allergies: "",
  chronicIllnesses: "",
  clinicId: "",
};

export default function ChildProfile() {
  const { childId } = useParams();
  const navigate = useNavigate();
  const { currentRole } = useRole();
  const { bundle, loading, error, saveVaccine, saveMilestone, saveChild } = useChild(childId, currentRole);
  const { push } = useToast();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("timeline");
  const [qrOpen, setQrOpen] = useState(false);
  const [savingId, setSavingId] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [savingChild, setSavingChild] = useState(false);
  const [childForm, setChildForm] = useState(blankChildForm);

  useEffect(() => {
    if (bundle?.child) {
      setChildForm({
        name: bundle.child.name,
        dob: bundle.child.dob,
        bloodType: bundle.child.bloodType,
        allergies: bundle.child.allergies,
        chronicIllnesses: bundle.child.chronicIllnesses || "",
        clinicId: bundle.child.clinicId,
      });
    }
  }, [bundle?.child]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoaderCircle className="h-8 w-8 animate-spin text-brand-teal" />
      </div>
    );
  }

  if (error || !bundle) {
    return (
      <EmptyState
        title={t("child.accessDenied")}
        description={t("child.accessHelp")}
        action={
          <button
            type="button"
            onClick={() => navigate(currentRole === "doctor" ? buildAppPath("/children") : buildAppPath())}
            className="rounded-lg bg-brand-navy px-4 py-2 text-sm font-semibold text-white"
          >
            {t("child.backToDashboard")}
          </button>
        }
      />
    );
  }

  const { child, siblings } = bundle;
  const highRiskSibling = siblings.find((sibling) => sibling.riskScore === "HIGH");

  async function handleVaccineSave(vaccineId, updates) {
    setSavingId(vaccineId);
    try {
      await saveVaccine(vaccineId, updates);
      push(t("child.vaccineUpdated"));
    } finally {
      setSavingId("");
    }
  }

  async function handleMilestoneSave(milestoneId, updates) {
    setSavingId(milestoneId);
    try {
      await saveMilestone(milestoneId, updates);
      push(t("child.milestoneUpdated"));
    } finally {
      setSavingId("");
    }
  }

  async function handleChildSave(event) {
    event.preventDefault();
    setSavingChild(true);
    try {
      await saveChild(childForm);
      setEditOpen(false);
      push(t("child.childUpdated"));
    } finally {
      setSavingChild(false);
    }
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate(currentRole === "doctor" ? buildAppPath("/children") : buildAppPath())}
        className="text-sm font-medium text-brand-navy"
      >
        {"<-"} {t("child.backToDashboard")}
      </button>

      {highRiskSibling && child.riskScore !== "HIGH" ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-800">
          {t("child.siblingAlert", { name: highRiskSibling.name.split(" ")[0] })}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.45fr,0.55fr]">
        <div className="space-y-6">
          <section className="panel-card overflow-hidden rounded-xl">
            <div className="page-hero px-5 py-6 text-white">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-white/12 text-white ring-1 ring-white/20">
                    <UserRound className="h-10 w-10" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/70">{t("child.photoPlaceholder")}</p>
                    <h1 className="mt-2 text-3xl font-semibold">{child.name}</h1>
                    <p className="mt-1 text-sm text-white/80">{t("child.dob")}: {formatDate(child.dob)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setEditOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-brand-navy"
                  >
                    <PencilLine className="h-4 w-4" />
                    {t("common.edit")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setQrOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-teal px-4 py-3 text-sm font-semibold text-white"
                  >
                    <QrCode className="h-4 w-4" />
                    {t("child.qrButton")}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 bg-white p-5 sm:grid-cols-3">
              <InfoCard label={t("child.bloodType")} value={child.bloodType || "--"} />
              <InfoCard label={t("child.allergies")} value={child.allergies || t("common.none")} />
              <InfoCard label={t("child.clinic")} value={child.clinicId} />
            </div>
          </section>

          <section className="panel-card rounded-xl p-5">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium capitalize ${
                    activeTab === tab ? "bg-brand-navy text-white" : "bg-slate-100 text-brand-secondary"
                  }`}
                >
                  {t(`common.${tab}`)}
                </button>
              ))}
            </div>
          </section>

          {activeTab === "timeline" ? <Timeline events={child.events} /> : null}
          {activeTab === "vaccines" ? (
            <VaccineTable vaccines={child.vaccines} onSave={handleVaccineSave} savingId={savingId} />
          ) : null}
          {activeTab === "milestones" ? (
            <MilestoneGrid milestones={child.milestones} onSave={handleMilestoneSave} savingId={savingId} />
          ) : null}
        </div>

        <RiskPanel
          child={child}
          onRiskNotified={() => push(t("child.doctorNotified"))}
          onIssueSent={() => push(t("child.issueSent"))}
        />
      </div>

      {editOpen ? (
        <Modal title={t("child.editChild")} onClose={() => setEditOpen(false)}>
          <form className="space-y-4" onSubmit={handleChildSave} onKeyDown={preventAccidentalEnterSubmit}>
            <Input label={t("child.childName")} value={childForm.name} onChange={(value) => setChildForm((current) => ({ ...current, name: value }))} />
            <Input label={t("child.dob")} type="date" value={childForm.dob} onChange={(value) => setChildForm((current) => ({ ...current, dob: value }))} />
            <Input label={t("child.bloodType")} value={childForm.bloodType} onChange={(value) => setChildForm((current) => ({ ...current, bloodType: value }))} />
            <Input label={t("child.allergies")} value={childForm.allergies} onChange={(value) => setChildForm((current) => ({ ...current, allergies: value }))} />
            <Input label={t("child.chronicIllnesses")} value={childForm.chronicIllnesses} onChange={(value) => setChildForm((current) => ({ ...current, chronicIllnesses: value }))} />
            <Input label={t("child.clinic")} value={childForm.clinicId} onChange={(value) => setChildForm((current) => ({ ...current, clinicId: value }))} />
            <button
              type="submit"
              disabled={savingChild}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-teal px-4 py-3 text-sm font-semibold text-white disabled:opacity-70"
            >
              {savingChild ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              {t("common.save")}
            </button>
          </form>
        </Modal>
      ) : null}

      <QRPassport child={child} open={qrOpen} onClose={() => setQrOpen(false)} />
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-secondary">{label}</p>
      <p className="mt-2 text-sm font-semibold text-brand-primary">{value}</p>
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

function Input({ label, value, onChange, type = "text" }) {
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
