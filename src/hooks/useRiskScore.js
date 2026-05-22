import { useEffect, useMemo, useState } from "react";
import { getClaudeHealthTip } from "../lib/claudeApi";
import { calculateRisk } from "../lib/riskEngine";

export function useRiskScore(child, language) {
  const [tip, setTip] = useState("");
  const [loadingTip, setLoadingTip] = useState(false);

  const risk = useMemo(
    () => calculateRisk(child?.vaccines ?? [], child?.milestones ?? []),
    [child?.id, child?.lastSyncedAt],
  );

  useEffect(() => {
    let active = true;

    async function loadTip() {
      if (!child) {
        return;
      }

      setLoadingTip(true);
      const nextTip = await getClaudeHealthTip(
        {
          childId: child.id,
          name: child.name,
          dob: child.dob,
          vaccinesGiven: child.vaccines,
          milestones: child.milestones,
          events: child.events,
          risk,
        },
        language,
      );
      if (active) {
        setTip(nextTip);
        setLoadingTip(false);
      }
    }

    loadTip();
    return () => {
      active = false;
    };
  }, [child?.id, child?.lastSyncedAt, language]);

  return { ...risk, tip, loadingTip };
}
