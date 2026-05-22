import { BellRing, MessageSquareText, Sparkles } from "lucide-react";
import { useState } from "react";
import { useRole } from "../context/RoleContext";
import { useRiskScore } from "../hooks/useRiskScore";
import { useTranslation } from "../hooks/useTranslation";
import { getDoctorViewer } from "../lib/localProfile";
import { createNotificationRecord } from "../lib/demoDb";
import { preventAccidentalEnterSubmit } from "../lib/forms";
import { translateRiskReason } from "../lib/localize";
import StatusBadge from "./StatusBadge";

export default function RiskPanel({ child, onRiskNotified, onIssueSent }) {
  const { currentRole } = useRole();
  const { t, language } = useTranslation();
  const { score, reasons, tip, loadingTip } = useRiskScore(child, language);
  const [notifying, setNotifying] = useState(false);
  const [sendingIssue, setSendingIssue] = useState(false);
  const [issueText, setIssueText] = useState("");
  const doctorViewer = getDoctorViewer();

  async function handleNotify() {
    setNotifying(true);
    try {
      await createNotificationRecord({
        childId: child.id,
        parentUid: child.parentUid,
        providerId: doctorViewer.uid,
        type: "risk_alert",
        title: t("common.notifyDoctor"),
        message: `${child.name} needs follow-up based on current risk assessment.`,
      });
      onRiskNotified?.();
    } finally {
      setNotifying(false);
    }
  }

  async function handleIssueSubmit(event) {
    event.preventDefault();
    if (!issueText.trim()) {
      return;
    }

    setSendingIssue(true);
    try {
      await createNotificationRecord({
        childId: child.id,
        parentUid: child.parentUid,
        providerId: doctorViewer.uid,
        type: "parent_issue",
        title: t("child.issueTitle"),
        message: issueText.trim(),
      });
      setIssueText("");
      onIssueSent?.();
    } finally {
      setSendingIssue(false);
    }
  }

  return (
    <aside className="overflow-hidden rounded-[2rem] border border-brand-teal/20 bg-[#f4fbf7] text-brand-primary shadow-soft">
      <div className="bg-gradient-to-br from-[#dff5eb] via-[#ccebdd] to-[#b8e0cf] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">{t("common.riskScore")}</p>
        <div className="mt-4">
          <StatusBadge value={score} label={t(`common.${score.toLowerCase()}`)} />
        </div>

        <ul className="mt-5 space-y-3 text-sm text-brand-primary">
          {reasons.map((reason) => (
            <li
              key={`${reason.type}-${reason.vaccineId ?? reason.milestoneId ?? "ok"}`}
              className="rounded-2xl border border-brand-teal/10 bg-white/75 px-4 py-3 shadow-sm"
            >
              {translateRiskReason(reason, t)}
            </li>
          ))}
        </ul>
      </div>

      {currentRole === "parent" ? (
        <div className="space-y-4 bg-white/70 p-5">
          <button
            type="button"
            onClick={handleNotify}
            disabled={notifying}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-amber px-4 py-3 text-sm font-semibold text-white disabled:opacity-70"
          >
            <BellRing className="h-4 w-4" />
            {notifying ? t("common.saving") : t("common.notifyDoctor")}
          </button>

          <form
            className="rounded-[1.5rem] border border-brand-teal/10 bg-[#eef8f3] p-4"
            onSubmit={handleIssueSubmit}
            onKeyDown={preventAccidentalEnterSubmit}
          >
            <div className="flex items-center gap-2 text-brand-teal">
              <MessageSquareText className="h-4 w-4" />
              <p className="text-sm font-semibold">{t("child.issueTitle")}</p>
            </div>
            <p className="mt-2 text-xs text-brand-secondary">{t("child.issueHelp")}</p>
            <textarea
              value={issueText}
              onChange={(event) => setIssueText(event.target.value)}
              placeholder={t("child.issuePlaceholder")}
              rows={4}
              className="mt-4 w-full rounded-[1.25rem] border border-brand-teal/15 bg-white px-4 py-3 text-sm text-brand-primary outline-none placeholder:text-brand-secondary/70 focus:border-brand-teal"
            />
            <button
              type="submit"
              disabled={sendingIssue || !issueText.trim()}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-teal/14 px-4 py-3 text-sm font-semibold text-brand-teal disabled:opacity-60"
            >
              <MessageSquareText className="h-4 w-4" />
              {sendingIssue ? t("common.saving") : t("common.send")}
            </button>
          </form>
        </div>
      ) : null}

      <div className="border-t border-brand-teal/10 bg-white/70 p-5">
        <div className="rounded-[1.5rem] border border-brand-teal/10 bg-[#eef8f3] p-4">
          <div className="flex items-center gap-2 text-brand-teal">
            <Sparkles className="h-4 w-4" />
            <p className="text-sm font-semibold">{t("common.healthTip")}</p>
          </div>
          <p className="mt-3 text-sm leading-6 text-brand-primary">
            {loadingTip ? t("common.generating") : tip}
          </p>
        </div>
      </div>
    </aside>
  );
}
