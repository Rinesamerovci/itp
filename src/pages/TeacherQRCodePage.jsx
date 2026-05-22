import { useEffect, useMemo, useRef, useState } from "react";
import { Download, LoaderCircle, QrCode } from "lucide-react";
import QRCode from "qrcode";
import EmptyState from "../components/EmptyState";
import { useToast } from "../hooks/useToast";
import { useChildren } from "../hooks/useChild";
import { useTranslation } from "../hooks/useTranslation";
import { getAgeLabel } from "../lib/date";
import { updateChildProfile } from "../lib/demoDb";

export default function TeacherQRCodePage() {
  const { t } = useTranslation();
  const { push } = useToast();
  const { children, loading, reload } = useChildren("parent");
  const [selectedChildId, setSelectedChildId] = useState("");
  const [chronicIllnesses, setChronicIllnesses] = useState("");
  const [saving, setSaving] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!children.length) {
      setSelectedChildId("");
      return;
    }

    setSelectedChildId((current) => (current && children.some((child) => child.id === current) ? current : children[0].id));
  }, [children]);

  const selectedChild = useMemo(
    () => children.find((child) => child.id === selectedChildId) ?? children[0] ?? null,
    [children, selectedChildId],
  );

  useEffect(() => {
    setChronicIllnesses(selectedChild?.chronicIllnesses || "");
  }, [selectedChild]);

  const teacherQrData = useMemo(
    () =>
      selectedChild
        ? {
            name: selectedChild.name,
            bloodType: selectedChild.bloodType || "",
            allergies: selectedChild.allergies || "",
            chronicIllnesses: selectedChild.chronicIllnesses || "",
          }
        : null,
    [selectedChild],
  );

  useEffect(() => {
    if (!selectedChild || !teacherQrData || !canvasRef.current) {
      return;
    }

    QRCode.toCanvas(canvasRef.current, JSON.stringify(teacherQrData), {
      width: 220,
      margin: 2,
      color: { dark: "#0F6E56", light: "#FFFFFF" },
    });
  }, [selectedChild, teacherQrData]);

  function handleDownload() {
    if (!selectedChild || !canvasRef.current) {
      return;
    }

    const url = canvasRef.current.toDataURL("image/png");
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${selectedChild.name.replace(/\s+/g, "-").toLowerCase()}-teacher-qr.png`;
    anchor.click();
  }

  async function handleChronicIllnessesSave() {
    if (!selectedChild) {
      return;
    }

    setSaving(true);
    try {
      await updateChildProfile(selectedChild.id, {
        chronicIllnesses: chronicIllnesses.trim(),
      });
      await reload();
      push(t("child.childUpdated"));
    } finally {
      setSaving(false);
    }
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

  if (!selectedChild) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-teal">{t("child.teacherQrBadge")}</p>
          <h1 className="mt-2 text-3xl font-semibold text-brand-primary">{t("layout.teacherQrCode")}</h1>
          <p className="mt-2 max-w-2xl text-sm text-brand-secondary">{t("child.teacherQrSummary")}</p>
        </div>

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
      </div>

      <section className="panel-card rounded-[1.75rem] p-6">
        <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
          <div className="rounded-[1.75rem] bg-brand-sand/60 p-5 text-center">
            <div className="flex items-center justify-center gap-2 text-brand-teal">
              <QrCode className="h-5 w-5" />
              <span className="font-semibold">{selectedChild.name}</span>
            </div>
            <canvas ref={canvasRef} className="mx-auto mt-5 rounded-3xl bg-white p-3 shadow-sm" />
            <p className="mt-4 text-sm text-slate-600">{t("child.teacherQrOffline")}</p>
            <button
              type="button"
              onClick={handleDownload}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-teal px-4 py-2 text-sm font-medium text-white"
            >
              <Download className="h-4 w-4" />
              {t("common.download")}
            </button>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("common.name")} value={selectedChild.name} />
              <Field label={t("child.bloodType")} value={selectedChild.bloodType || t("child.optionalEmpty")} />
              <Field label={t("child.allergies")} value={selectedChild.allergies || t("child.optionalEmpty")} />
              <EditableField
                label={t("child.chronicIllnesses")}
                value={chronicIllnesses}
                onChange={setChronicIllnesses}
                onSave={handleChronicIllnessesSave}
                saving={saving}
                placeholder={t("child.chronicIllnessesPlaceholder")}
                saveLabel={t("common.save")}
              />
            </div>

            <div className="mt-5 rounded-2xl bg-brand-teal/5 p-4 text-sm text-brand-secondary">
              <p className="font-medium text-brand-primary">{t("child.teacherQrDocumentTitle")}</p>
              <p className="mt-2">{t("child.teacherQrDocumentNote")}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

function EditableField({ label, value, onChange, onSave, saving, placeholder, saveLabel }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        placeholder={placeholder}
        className="mt-3 min-h-[96px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-teal"
      />
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-brand-teal px-4 py-2 text-sm font-medium text-white disabled:opacity-70"
        >
          {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          {saveLabel}
        </button>
      </div>
    </div>
  );
}
