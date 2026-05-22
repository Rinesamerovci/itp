import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Download, LoaderCircle, RefreshCcw, Search, Send } from "lucide-react";
import EmptyState from "../components/EmptyState";
import ReportSummaryCard from "../components/ReportSummaryCard";
import SignaturePad from "../components/SignaturePad";
import { useRole } from "../context/RoleContext";
import { useToast } from "../hooks/useToast";
import { useTranslation } from "../hooks/useTranslation";
import { getPatientDirectory, submitHomeVisitReport } from "../lib/demoDb";
import { preventAccidentalEnterSubmit } from "../lib/forms";
import generateReportPDF from "../lib/generateReportPDF";
import { getStoredStaffProfile } from "../lib/localProfile";
import {
  canAccessHomeVisitReports,
  EPI_VACCINES,
  FOLLOW_UP_TYPES,
  GENERAL_APPEARANCE_OPTIONS,
  HOME_VISIT_REASON_OPTIONS,
  KOSOVO_MUNICIPALITIES,
} from "../lib/medicalData";

function getNowDate() {
  return new Date().toISOString().slice(0, 10);
}

function getNowTime() {
  return new Date().toTimeString().slice(0, 5);
}

function createInitialForm(profile = {}) {
  return {
    visitDate: getNowDate(),
    visitTime: getNowTime(),
    staffName: profile.name || "",
    staffRole: profile.specialisation || "",
    patientSearch: "",
    patientId: null,
    patientName: "",
    patientDob: "",
    guardianName: "",
    address: "",
    municipality: "",
    visitReasons: [],
    otherReason: "",
    generalAppearance: "",
    temperature: "",
    weight: "",
    height: "",
    symptoms: "",
    medicationsGiven: "",
    vaccinesAdministered: [],
    assessment: "",
    actionsTaken: "",
    followUpRequired: "",
    followUpDate: "",
    followUpType: "",
    referralDetails: "",
    signatureDataUrl: "",
  };
}

export default function HomeVisitReport() {
  const { currentRole } = useRole();
  const { push } = useToast();
  const { t } = useTranslation();
  const signatureRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState(null);
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState(createInitialForm());
  const [errors, setErrors] = useState({});
  const [draftSavedAt, setDraftSavedAt] = useState("");
  const [submittedReport, setSubmittedReport] = useState(null);

  const draftKey = "vitakid-home-visit-draft";

  useEffect(() => {
    async function loadFormData() {
      setLoading(true);
      try {
        const staffProfile = getStoredStaffProfile();
        const patientDirectory = await getPatientDirectory(staffProfile.clinicId);
        setProfile(staffProfile);
        setPatients(patientDirectory);

        const nextForm = createInitialForm(staffProfile);
        const savedDraft = localStorage.getItem(draftKey);
        if (savedDraft) {
          const parsedDraft = JSON.parse(savedDraft);
          setForm({ ...nextForm, ...parsedDraft });
          setDraftSavedAt(parsedDraft.__savedAt || "");
        } else {
          setForm(nextForm);
        }
      } catch (error) {
        push(t("reports.loadError"), "error");
      } finally {
        setLoading(false);
      }
    }

    loadFormData();
  }, [draftKey, push, t]);

  useEffect(() => {
    if (loading || submittedReport) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      const nextDraft = {
        ...form,
        __savedAt: new Date().toISOString(),
      };
      localStorage.setItem(draftKey, JSON.stringify(nextDraft));
      setDraftSavedAt(nextDraft.__savedAt);
    }, 30000);

    return () => window.clearInterval(interval);
  }, [draftKey, form, loading, submittedReport]);

  const suggestions = useMemo(() => {
    const query = form.patientSearch.trim().toLowerCase();
    if (!query) {
      return [];
    }
    if (form.patientId && query === form.patientName.trim().toLowerCase()) {
      return [];
    }
    return patients.filter((patient) => patient.name.toLowerCase().includes(query)).slice(0, 6);
  }, [form.patientId, form.patientName, form.patientSearch, patients]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoaderCircle className="h-8 w-8 animate-spin text-brand-teal" />
      </div>
    );
  }

  if (!canAccessHomeVisitReports(currentRole)) {
    return <EmptyState title={t("reports.accessDenied")} description={t("reports.accessDeniedHelp")} />;
  }

  function updateForm(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleMultiValue(key, value) {
    setForm((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((entry) => entry !== value)
        : [...current[key], value],
    }));
  }

  function applyPatient(patient) {
    setForm((current) => ({
      ...current,
      patientSearch: patient.name,
      patientId: patient.id,
      patientName: patient.name,
      patientDob: patient.dob || "",
      guardianName: patient.guardianName || "",
      address: patient.address || current.address,
      municipality: patient.municipality || current.municipality,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const signatureDataUrl = form.signatureDataUrl || signatureRef.current?.toDataURL() || "";
    const nextForm = { ...form, signatureDataUrl };
    setForm(nextForm);

    if (!validateWithForm(nextForm, setErrors, t)) {
      return;
    }

    setSubmitting(true);
    try {
      const report = await submitHomeVisitReport({
        ...nextForm,
        staffName: profile.name,
        staffRole: profile.specialisation,
        submittedBy: profile.name,
        followUpRequired: nextForm.followUpRequired === "yes",
        temperature: nextForm.temperature ? Number(nextForm.temperature) : null,
        weight: nextForm.weight ? Number(nextForm.weight) : null,
        height: nextForm.height ? Number(nextForm.height) : null,
      });
      localStorage.removeItem(draftKey);
      setSubmittedReport(report);
      setDraftSavedAt("");
      push(t("reports.submitSuccess"));
    } catch (error) {
      push(t("reports.submitError"), "error");
    } finally {
      setSubmitting(false);
    }
  }

  function handleNewReport() {
    localStorage.removeItem(draftKey);
    const nextForm = createInitialForm(profile || {});
    setForm(nextForm);
    setErrors({});
    setSubmittedReport(null);
    setDraftSavedAt("");
    signatureRef.current?.clear();
  }

  if (submittedReport) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-xl bg-[var(--color-background-success)] px-5 py-6 text-[var(--color-text-success)]">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-7 w-7" />
            <div>
              <h2 className="text-2xl font-semibold">{t("reports.successTitle")}</h2>
              <p className="text-sm">{t("reports.successSubtitle")}</p>
            </div>
          </div>
        </div>

        <ReportSummaryCard report={submittedReport} t={t} />

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => generateReportPDF(submittedReport, t)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-teal px-5 py-3 text-sm font-semibold text-white"
          >
            <Download className="h-4 w-4" />
            {t("reports.downloadPdf")}
          </button>
          <button
            type="button"
            onClick={handleNewReport}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700"
          >
            <RefreshCcw className="h-4 w-4" />
            {t("reports.startNew")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="mx-auto max-w-6xl space-y-6" onSubmit={handleSubmit} onKeyDown={preventAccidentalEnterSubmit}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-teal">{t("reports.mobileReady")}</p>
          <h1 className="mt-2 text-3xl font-semibold text-brand-primary">{t("reports.formTitle")}</h1>
        </div>
        <div className="rounded-full bg-white px-4 py-2 text-xs font-medium text-brand-secondary shadow-sm ring-1 ring-brand-border">
          {draftSavedAt ? `${t("reports.draftSaved")} ${new Date(draftSavedAt).toLocaleTimeString()}` : t("reports.draftPending")}
        </div>
      </div>

      <Section title={t("reports.sectionVisitInfo")}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label={t("reports.visitDate")} type="date" value={form.visitDate} error={errors.visitDate} onChange={(value) => updateForm("visitDate", value)} />
          <Field label={t("reports.visitTime")} type="time" value={form.visitTime} error={errors.visitTime} onChange={(value) => updateForm("visitTime", value)} />
          <Field label={t("reports.staffMember")} value={form.staffName} error={errors.staffName} onChange={(value) => updateForm("staffName", value)} />
          <Field label={t("reports.roleSpecialisation")} value={form.staffRole} error={errors.staffRole} onChange={(value) => updateForm("staffRole", value)} />
        </div>
      </Section>

      <Section title={t("reports.sectionPatientInfo")}>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={form.patientSearch}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                patientSearch: event.target.value,
                patientId: current.patientName === event.target.value ? current.patientId : null,
              }))
            }
            placeholder={t("reports.searchPatients")}
            className="field-shell w-full py-3 pl-11 pr-4 outline-none focus:border-brand-teal"
          />
          {suggestions.length ? (
            <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 rounded-xl border border-brand-border bg-white p-2 shadow-ek-card">
              {suggestions.map((patient) => (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => applyPatient(patient)}
                  className="flex w-full flex-col rounded-lg px-3 py-3 text-left hover:bg-slate-50"
                >
                  <span className="font-semibold text-brand-primary">{patient.name}</span>
                  <span className="text-xs text-brand-secondary">{patient.guardianName || t("reports.guardianUnavailable")}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field label={t("reports.patientFullName")} value={form.patientName} error={errors.patientName} onChange={(value) => updateForm("patientName", value)} />
          <Field label={t("reports.patientDob")} type="date" value={form.patientDob} error={errors.patientDob} onChange={(value) => updateForm("patientDob", value)} />
          <Field label={t("reports.guardianName")} value={form.guardianName} error={errors.guardianName} onChange={(value) => updateForm("guardianName", value)} />
          <Field label={t("reports.homeAddress")} value={form.address} error={errors.address} onChange={(value) => updateForm("address", value)} />
          <div>
            <label className="mb-2 block text-sm font-medium text-brand-secondary">{t("reports.municipality")}</label>
            <select
              value={form.municipality}
              onChange={(event) => updateForm("municipality", event.target.value)}
              className={`field-shell w-full px-4 py-3 outline-none ${errors.municipality ? "border-rose-300 bg-rose-50" : "focus:border-brand-teal"}`}
            >
              <option value="">{t("reports.selectMunicipality")}</option>
              {KOSOVO_MUNICIPALITIES.map((municipality) => (
                <option key={municipality} value={municipality}>
                  {municipality}
                </option>
              ))}
            </select>
            {errors.municipality ? <p className="mt-2 text-sm text-rose-600">{errors.municipality}</p> : null}
          </div>
        </div>
      </Section>

      <Section title={t("reports.sectionReason")}>
        <CheckboxGrid
          options={HOME_VISIT_REASON_OPTIONS}
          values={form.visitReasons}
          error={errors.visitReasons}
          t={t}
          onToggle={(value) => toggleMultiValue("visitReasons", value)}
        />
        {form.visitReasons.includes("Other") ? (
          <div className="mt-4">
            <Field label={t("reports.otherReason")} value={form.otherReason} error={errors.otherReason} onChange={(value) => updateForm("otherReason", value)} />
          </div>
        ) : null}
      </Section>

      <Section title={t("reports.sectionClinical")}>
        <div className="grid gap-4 lg:grid-cols-2">
          <RadioGroup
            label={t("reports.generalAppearance")}
            options={GENERAL_APPEARANCE_OPTIONS}
            value={form.generalAppearance}
            error={errors.generalAppearance}
            t={t}
            onChange={(value) => updateForm("generalAppearance", value)}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t("reports.temperature")} type="number" step="0.1" value={form.temperature} error={errors.temperature} onChange={(value) => updateForm("temperature", value)} />
            <Field label={t("reports.weight")} type="number" step="0.1" value={form.weight} error={errors.weight} onChange={(value) => updateForm("weight", value)} />
            <Field label={t("reports.height")} type="number" step="0.1" value={form.height} error={errors.height} onChange={(value) => updateForm("height", value)} />
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <TextArea
            label={t("reports.visibleSymptoms")}
            value={form.symptoms}
            placeholder={t("reports.visibleSymptomsPlaceholder")}
            onChange={(value) => updateForm("symptoms", value)}
          />
          <Field label={t("reports.medicationsGiven")} value={form.medicationsGiven} onChange={(value) => updateForm("medicationsGiven", value)} />
        </div>

        <div className="mt-4">
          <CheckboxGrid
            options={EPI_VACCINES}
            values={form.vaccinesAdministered}
            t={t}
            onToggle={(value) => toggleMultiValue("vaccinesAdministered", value)}
          />
        </div>
      </Section>

      <Section title={t("reports.sectionAssessment")}>
        <div className="grid gap-4 lg:grid-cols-2">
          <TextArea label={t("reports.assessmentNotes")} value={form.assessment} error={errors.assessment} onChange={(value) => updateForm("assessment", value)} />
          <TextArea label={t("reports.actionsTaken")} value={form.actionsTaken} error={errors.actionsTaken} onChange={(value) => updateForm("actionsTaken", value)} />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <RadioGroup
            label={t("reports.followUpRequired")}
            options={[
              { value: "yes", label: t("common.yes") },
              { value: "no", label: t("common.no") },
            ]}
            value={form.followUpRequired}
            error={errors.followUpRequired}
            onChange={(value) => updateForm("followUpRequired", value)}
          />
          {form.followUpRequired === "yes" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("reports.followUpDate")} type="date" value={form.followUpDate} error={errors.followUpDate} onChange={(value) => updateForm("followUpDate", value)} />
              <div>
                <label className="mb-2 block text-sm font-medium text-brand-secondary">{t("reports.followUpType")}</label>
                <select
                  value={form.followUpType}
                  onChange={(event) => updateForm("followUpType", event.target.value)}
                  className={`field-shell w-full px-4 py-3 outline-none ${errors.followUpType ? "border-rose-300 bg-rose-50" : "focus:border-brand-teal"}`}
                >
                  <option value="">{t("reports.selectFollowUpType")}</option>
                  {FOLLOW_UP_TYPES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {t(option.key)}
                    </option>
                  ))}
                </select>
                {errors.followUpType ? <p className="mt-2 text-sm text-rose-600">{errors.followUpType}</p> : null}
              </div>
            </div>
          ) : null}
        </div>

        {form.followUpType.includes("Referral") ? (
          <div className="mt-4">
            <TextArea label={t("reports.referralDetails")} value={form.referralDetails} error={errors.referralDetails} onChange={(value) => updateForm("referralDetails", value)} />
          </div>
        ) : null}
      </Section>

      <Section title={t("reports.sectionSignature")}>
        <SignaturePad
          ref={signatureRef}
          initialValue={form.signatureDataUrl}
          onDone={(value) => updateForm("signatureDataUrl", value)}
        />
        {errors.signatureDataUrl ? <p className="mt-3 text-sm text-rose-600">{errors.signatureDataUrl}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-teal px-5 py-4 text-base font-semibold text-white disabled:opacity-70"
        >
          {submitting ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          {t("reports.submitReport")}
        </button>
      </Section>
    </form>
  );
}

function validateWithForm(form, setErrors, t) {
  const nextErrors = {};

  if (!form.visitDate) nextErrors.visitDate = t("reports.validationVisitDate");
  if (!form.visitTime) nextErrors.visitTime = t("reports.validationVisitTime");
  if (!form.staffName.trim()) nextErrors.staffName = t("reports.validationStaffName");
  if (!form.staffRole.trim()) nextErrors.staffRole = t("reports.validationStaffRole");
  if (!form.patientName.trim()) nextErrors.patientName = t("reports.validationPatientName");
  if (!form.patientDob) nextErrors.patientDob = t("reports.validationPatientDob");
  if (!form.guardianName.trim()) nextErrors.guardianName = t("reports.validationGuardian");
  if (!form.address.trim()) nextErrors.address = t("reports.validationAddress");
  if (!form.municipality) nextErrors.municipality = t("reports.validationMunicipality");
  if (!form.visitReasons.length) nextErrors.visitReasons = t("reports.validationVisitReasons");
  if (form.visitReasons.includes("Other") && !form.otherReason.trim()) nextErrors.otherReason = t("reports.validationOtherReason");
  if (!form.generalAppearance) nextErrors.generalAppearance = t("reports.validationAppearance");
  if (form.temperature && (Number(form.temperature) < 35 || Number(form.temperature) > 42)) nextErrors.temperature = t("reports.validationTemperature");
  if (form.weight && Number(form.weight) <= 0) nextErrors.weight = t("reports.validationWeight");
  if (form.height && Number(form.height) <= 0) nextErrors.height = t("reports.validationHeight");
  if (!form.assessment.trim()) nextErrors.assessment = t("reports.validationAssessment");
  if (!form.actionsTaken.trim()) nextErrors.actionsTaken = t("reports.validationActionsTaken");
  if (!form.followUpRequired) nextErrors.followUpRequired = t("reports.validationFollowUpRequired");
  if (form.followUpRequired === "yes" && !form.followUpDate) nextErrors.followUpDate = t("reports.validationFollowUpDate");
  if (form.followUpRequired === "yes" && !form.followUpType) nextErrors.followUpType = t("reports.validationFollowUpType");
  if (form.followUpType.includes("Referral") && !form.referralDetails.trim()) nextErrors.referralDetails = t("reports.validationReferralDetails");
  if (!form.signatureDataUrl) nextErrors.signatureDataUrl = t("reports.validationSignature");

  setErrors(nextErrors);
  return Object.keys(nextErrors).length === 0;
}

function Section({ title, children }) {
  return (
    <section className="panel-card rounded-xl p-5 sm:p-6">
      <h2 className="text-xl font-semibold text-brand-primary">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({ label, value, onChange, error, type = "text", step }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-brand-secondary">{label}</label>
      <input
        type={type}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`field-shell w-full px-4 py-3 outline-none ${error ? "border-rose-300 bg-rose-50" : "focus:border-brand-teal"}`}
      />
      {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}

function TextArea({ label, value, onChange, error, placeholder }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-brand-secondary">{label}</label>
      <textarea
        rows={5}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder || label}
        className={`field-shell w-full px-4 py-3 outline-none ${error ? "border-rose-300 bg-rose-50" : "focus:border-brand-teal"}`}
      />
      {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}

function CheckboxGrid({ label, options, values, onToggle, error, t }) {
  return (
    <div>
      {label ? <p className="mb-3 text-sm font-medium text-brand-secondary">{label}</p> : null}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {options.map((option) => {
          const checked = values.includes(option.value);
          return (
            <label
              key={option.value}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
                checked ? "border-brand-teal bg-brand-mint text-brand-teal" : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              <input type="checkbox" checked={checked} onChange={() => onToggle(option.value)} className="h-4 w-4 accent-brand-teal" />
              {option.label ?? t(option.key)}
            </label>
          );
        })}
      </div>
      {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}

function RadioGroup({ label, options, value, onChange, error, t }) {
  return (
    <div>
      <p className="mb-3 text-sm font-medium text-brand-secondary">{label}</p>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => {
          const optionLabel = option.label ?? t(option.key);
          return (
            <label
              key={option.value}
              className={`flex items-center gap-3 rounded-full border px-4 py-3 text-sm ${
                value === option.value ? "border-brand-teal bg-brand-mint text-brand-teal" : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              <input type="radio" checked={value === option.value} onChange={() => onChange(option.value)} className="h-4 w-4 accent-brand-teal" />
              {optionLabel}
            </label>
          );
        })}
      </div>
      {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
