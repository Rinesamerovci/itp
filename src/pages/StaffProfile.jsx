import { useEffect, useRef, useState } from "react";
import { Camera, Check, LoaderCircle, UserRound } from "lucide-react";
import { useToast } from "../hooks/useToast";
import { useTranslation } from "../hooks/useTranslation";
import { getStoredStaffProfile, saveStoredStaffProfile } from "../lib/localProfile";
import { STAFF_SPECIALISATIONS, WEEKDAYS } from "../lib/medicalData";

const initialForm = {
  name: "",
  phone: "+383 ",
  email: "",
  specialisation: "",
  activeDays: [],
  profilePhoto: null,
  isAvailable: false,
};

export default function StaffProfile() {
  const { push } = useToast();
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    const profile = getStoredStaffProfile();
    setForm({
      name: profile.name || "",
      phone: profile.phone || "+383 ",
      email: profile.email || "",
      specialisation: profile.specialisation || "",
      activeDays: profile.activeDays || [],
      profilePhoto: profile.profilePhoto || null,
      isAvailable: Boolean(profile.isAvailable),
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }

    saveStoredStaffProfile(form);
    setSavedNotice(true);
    const timeoutId = window.setTimeout(() => setSavedNotice(false), 1800);
    return () => window.clearTimeout(timeoutId);
  }, [form, loading]);

  function validate(nextForm) {
    const nextErrors = {};

    if (!nextForm.name.trim()) {
      nextErrors.name = t("staff.validationName");
    }
    if (!/\S+@\S+\.\S+/.test(nextForm.email)) {
      nextErrors.email = t("staff.validationEmail");
    }
    if (!nextForm.phone.trim() || !nextForm.phone.startsWith("+383")) {
      nextErrors.phone = t("staff.validationPhone");
    }
    if (!nextForm.specialisation) {
      nextErrors.specialisation = t("staff.validationSpecialisation");
    }
    if (!nextForm.activeDays.length) {
      nextErrors.activeDays = t("staff.validationActiveDays");
    }

    setErrors(nextErrors);
  }

  function updateForm(updates) {
    setForm((current) => {
      const nextForm = { ...current, ...updates };
      validate(nextForm);
      return nextForm;
    });
  }

  async function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const base64 = await readFileAsBase64(file);
      updateForm({ profilePhoto: base64 });
    } catch (error) {
      push(t("staff.photoError"), "error");
    }
  }

  function toggleActiveDay(value) {
    updateForm({
      activeDays: form.activeDays.includes(value)
        ? form.activeDays.filter((day) => day !== value)
        : [...form.activeDays, value],
    });
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoaderCircle className="h-8 w-8 animate-spin text-brand-teal" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-teal">{t("staff.profileTitle")}</p>
          <h1 className="mt-2 text-3xl font-semibold text-brand-primary">{form.name || t("staff.profileTitle")}</h1>
        </div>
        {savedNotice ? (
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-background-success)] px-4 py-2 text-sm font-medium text-[var(--color-text-success)]">
            <Check className="h-4 w-4" />
            {t("staff.savedLocally")}
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => updateForm({ isAvailable: !form.isAvailable })}
        className={`flex w-full items-center justify-between rounded-xl px-5 py-5 text-left transition ${
          form.isAvailable
            ? "bg-[var(--color-background-success)] text-[var(--color-text-success)]"
            : "bg-slate-200 text-slate-700"
        }`}
      >
        <div className="flex items-center gap-3">
          {form.isAvailable ? (
            <span className="relative flex h-4 w-4 items-center justify-center">
              <span className="absolute inline-flex h-4 w-4 animate-ping rounded-full bg-[var(--color-text-success)] opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--color-text-success)]" />
            </span>
          ) : (
            <span className="inline-flex h-4 w-4 rounded-full border-2 border-current" />
          )}
          <span className="text-lg font-semibold">
            {form.isAvailable ? t("staff.availableToggleOn") : t("staff.availableToggleOff")}
          </span>
        </div>
        {form.isAvailable ? <Check className="h-5 w-5" /> : null}
      </button>

      <section className="panel-card rounded-xl p-5 sm:p-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex justify-center lg:w-56 lg:justify-start">
            <div className="relative">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group relative h-36 w-36 overflow-hidden rounded-full bg-slate-100 ring-4 ring-white"
              >
                {form.profilePhoto ? (
                  <img src={form.profilePhoto} alt={form.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-400">
                    <UserRound className="h-12 w-12" />
                  </div>
                )}
                <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/0 text-white opacity-0 transition group-hover:bg-slate-950/55 group-hover:opacity-100">
                  <Camera className="h-5 w-5" />
                  <span className="text-sm font-medium">{t("staff.changePhoto")}</span>
                </span>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </div>
          </div>

          <div className="grid flex-1 gap-4 sm:grid-cols-2">
            <Field label={t("login.name")} value={form.name} onChange={(value) => updateForm({ name: value })} error={errors.name} />
            <Field label={t("staff.phone")} value={form.phone} onChange={(value) => updateForm({ phone: value || "+383 " })} error={errors.phone} />
            <Field label={t("login.email")} type="email" value={form.email} onChange={(value) => updateForm({ email: value })} error={errors.email} />
            <div>
              <label className="mb-2 block text-sm font-medium text-brand-secondary">{t("staff.specialisation")}</label>
              <select
                value={form.specialisation}
                onChange={(event) => updateForm({ specialisation: event.target.value })}
                className={`field-shell w-full px-4 py-3 outline-none ${
                  errors.specialisation ? "border-rose-300 bg-rose-50" : "focus:border-brand-teal"
                }`}
              >
                <option value="">{t("staff.selectSpecialisation")}</option>
                {STAFF_SPECIALISATIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.key)}
                  </option>
                ))}
              </select>
              {errors.specialisation ? <p className="mt-2 text-sm text-rose-600">{errors.specialisation}</p> : null}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium text-brand-secondary">{t("staff.activeDays")}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {WEEKDAYS.map((day) => {
              const checked = form.activeDays.includes(day.value);
              return (
                <label
                  key={day.value}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
                    checked ? "border-brand-teal bg-brand-mint text-brand-teal" : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleActiveDay(day.value)}
                    className="h-4 w-4 accent-brand-teal"
                  />
                  {t(day.key)}
                </label>
              );
            })}
          </div>
          {errors.activeDays ? <p className="mt-2 text-sm text-rose-600">{errors.activeDays}</p> : null}
        </div>
      </section>
    </div>
  );
}

function Field({ label, value, onChange, error, type = "text" }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-brand-secondary">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`field-shell w-full px-4 py-3 outline-none transition ${
          error ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-white focus:border-brand-teal"
        }`}
      />
      {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
