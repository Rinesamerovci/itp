import { useEffect, useMemo, useRef } from "react";
import QRCode from "qrcode";
import { Download, QrCode, X } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";
import { formatDate } from "../lib/date";

export default function QRPassport({ child, open, onClose, inline = false }) {
  const { t } = useTranslation();
  const canvasRef = useRef(null);
  const isVisible = inline || open;

  const passportData = useMemo(
    () => ({
      childId: child?.id,
      name: child?.name,
      dob: child?.dob,
      bloodType: child?.bloodType,
      allergies: child?.allergies,
      vaccinesGiven: child?.vaccines?.filter((item) => item.status === "given").map((item) => item.name),
      lastCheckup: child?.lastSeen,
    }),
    [child],
  );

  useEffect(() => {
    if (!isVisible || !canvasRef.current || !child) {
      return;
    }

    QRCode.toCanvas(canvasRef.current, JSON.stringify(passportData), {
      width: 220,
      margin: 2,
      color: { dark: "#0F6E56", light: "#FFFFFF" },
    });
  }, [child, isVisible, passportData]);

  if (!isVisible || !child) {
    return null;
  }

  function handleDownload() {
    const url = canvasRef.current.toDataURL("image/png");
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${child.name.replace(/\s+/g, "-").toLowerCase()}-passport.png`;
    anchor.click();
  }

  const content = (
    <div className={`${inline ? "panel-card rounded-[1.75rem] p-6" : "max-h-full w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl"}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">{t("child.qrPassport")}</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">{t("child.scanLabel")}</h3>
          {inline ? <p className="mt-2 max-w-2xl text-sm text-brand-secondary">{t("child.passportSummary")}</p> : null}
        </div>
        {!inline ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px,1fr]">
        <div className="rounded-[1.75rem] bg-brand-sand/60 p-5 text-center">
          <div className="flex items-center justify-center gap-2 text-brand-teal">
            <QrCode className="h-5 w-5" />
            <span className="font-semibold">{child.name}</span>
          </div>
          <canvas ref={canvasRef} className="mx-auto mt-5 rounded-3xl bg-white p-3 shadow-sm" />
          <p className="mt-4 text-sm text-slate-600">{t("child.passportOffline")}</p>
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
            <Field label={t("common.name")} value={child.name} />
            <Field label={t("child.dob")} value={formatDate(child.dob)} />
            <Field label={t("child.bloodType")} value={child.bloodType || t("child.documentUnknown")} />
            <Field label={t("child.allergies")} value={child.allergies || t("common.none")} />
            <Field label={t("child.lastCheckup")} value={formatDate(child.lastSeen)} />
            <Field label={t("common.vaccines")} value={passportData.vaccinesGiven?.join(", ") || "--"} />
          </div>

          {inline ? (
            <div className="mt-5 rounded-2xl bg-brand-teal/5 p-4 text-sm text-brand-secondary">
              <p className="font-medium text-brand-primary">{t("child.documentTitle")}</p>
              <p className="mt-2">{t("child.documentNote")}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  if (inline) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 px-4 py-6">
      {content}
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
