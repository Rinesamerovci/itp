import { calculateRisk } from "./riskEngine";

const API_URL = "https://api.anthropic.com/v1/messages";

function fallbackTip(record, language) {
  const risk = calculateRisk(record.vaccinesGiven ?? [], record.milestones ?? []);

  if (language === "en") {
    if (risk.score === "HIGH") {
      return "Focus on the next appointment and bring this record to the clinic. Small steps now can quickly get your child back on track.";
    }
    if (risk.score === "MEDIUM") {
      return "You are doing well, and one small catch-up step can make a big difference. Check the next vaccine or milestone this week.";
    }
    return "Your child is following the preventive plan nicely. Keep up the regular checkups and keep this passport close.";
  }

  if (risk.score === "HIGH") {
    return "Përqendrohuni te termini i radhës dhe merreni këtë kartelë me vete në klinikë. Hapat e vegjël tani mund ta rikthejnë shpejt fëmijën në ritmin e duhur.";
  }
  if (risk.score === "MEDIUM") {
    return "Jeni në rrugë të mirë, dhe një përditësim i vogël mund të ndihmojë shumë. Kontrolloni vaksinën ose zhvillimin e radhës këtë javë.";
  }
  return "Fëmija juaj po e ndjek mirë planin parandalues. Vazhdoni me kontrollet e rregullta dhe mbajeni këtë pasaportë afër.";
}

export async function getClaudeHealthTip(record, language) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  if (!apiKey) {
    return fallbackTip(record, language);
  }

  const promptLanguage =
    language === "en" ? "Respond in simple English." : "Respond in simple Albanian.";

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 180,
      messages: [
        {
          role: "user",
          content: `Given this child's health record: ${JSON.stringify(
            record,
          )}, write a 2-sentence personalized health tip for the parent in simple language. Be warm and encouraging. ${promptLanguage}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    return fallbackTip(record, language);
  }

  const data = await response.json();
  return data.content?.[0]?.text?.trim() || fallbackTip(record, language);
}
