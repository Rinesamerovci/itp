import { useState } from "react";
import { LoaderCircle, Plus } from "lucide-react";
import ChildCard from "../components/ChildCard";
import EmptyState from "../components/EmptyState";
import { useChildren } from "../hooks/useChild";
import { useToast } from "../hooks/useToast";
import { useTranslation } from "../hooks/useTranslation";
import { preventAccidentalEnterSubmit } from "../lib/forms";
import { getParentViewer } from "../lib/localProfile";

const blankChild = {
  name: "",
  dob: "",
  bloodType: "",
  allergies: "",
  clinicId: "clinic-prishtina",
};

export default function ParentDashboard() {
  const parentViewer = getParentViewer();
  const { children, loading, create } = useChildren("parent");
  const { push } = useToast();
  const { t } = useTranslation();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(blankChild);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const nextErrors = {};
    if (!form.name.trim()) {
      nextErrors.name = t("login.validationName");
    }
    if (!form.dob) {
      nextErrors.dob = t("child.dobRequired");
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleCreate(event) {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      await create(form);
      setShowAdd(false);
      setForm(blankChild);
      push(t("child.successChild"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-[20px] border border-brand-border bg-[#f7f8fb] px-5 py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-teal">{t("dashboard.overview")}</p>
            <h1 className="mt-2 text-3xl font-semibold text-brand-primary">{t("dashboard.welcomeParent")}</h1>
            <p className="mt-2 max-w-2xl text-sm text-brand-secondary">
              {parentViewer.name} {"|"} {t("dashboard.trackedChildren", { count: String(children.length) })}
            </p>
            <p className="mt-3 max-w-2xl text-sm text-brand-secondary">{t("dashboard.overviewText")}</p>
          </div>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-teal px-4 py-3 text-sm font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            {t("common.addChild")}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <LoaderCircle className="h-8 w-8 animate-spin text-brand-teal" />
        </div>
      ) : children.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {children.map((child) => (
            <ChildCard key={child.id} child={child} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={t("dashboard.noChildren")}
          description={t("dashboard.addFirstChild")}
          action={
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="rounded-lg bg-brand-teal px-4 py-2 text-sm font-semibold text-white"
            >
              {t("common.addChild")}
            </button>
          }
        />
      )}

      {showAdd ? (
        <Modal title={t("child.addChildTitle")} onClose={() => setShowAdd(false)}>
          <form className="space-y-4" onSubmit={handleCreate} onKeyDown={preventAccidentalEnterSubmit}>
            <Input label={t("child.childName")} value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} error={errors.name} />
            <Input label={t("child.dob")} type="date" value={form.dob} onChange={(value) => setForm((current) => ({ ...current, dob: value }))} error={errors.dob} />
            <Input label={t("child.bloodType")} value={form.bloodType} onChange={(value) => setForm((current) => ({ ...current, bloodType: value }))} />
            <Input label={t("child.allergies")} value={form.allergies} onChange={(value) => setForm((current) => ({ ...current, allergies: value }))} />
            <Input label={t("child.clinic")} value={form.clinicId} onChange={(value) => setForm((current) => ({ ...current, clinicId: value }))} />
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-teal px-4 py-3 text-sm font-semibold text-white"
            >
              {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              {t("common.save")}
            </button>
          </form>
        </Modal>
      ) : null}
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

function Input({ label, value, onChange, error, type = "text" }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-brand-secondary">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`field-shell w-full px-4 py-3 outline-none ${
          error ? "border-rose-300 bg-rose-50" : "border-slate-200"
        } focus:border-brand-teal`}
      />
      {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
