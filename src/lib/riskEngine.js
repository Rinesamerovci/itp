import { daysUntil, monthsOverdue } from "./date";

export function calculateRisk(vaccines = [], milestones = []) {
  const missedVaccines = vaccines.filter((record) => record.status === "missed");
  const overdueMilestones = milestones
    .filter((record) => !record.achieved)
    .map((record) => ({ ...record, overdueMonths: monthsOverdue(record.dueDate) }))
    .filter((record) => record.overdueMonths > 0);

  let score = "LOW";
  if (missedVaccines.length >= 2 || overdueMilestones.some((item) => item.overdueMonths >= 3)) {
    score = "HIGH";
  } else if (missedVaccines.length >= 1 || overdueMilestones.some((item) => item.overdueMonths >= 1)) {
    score = "MEDIUM";
  }

  const reasons = [];
  missedVaccines.slice(0, 3).forEach((record) => {
    reasons.push({ type: "vaccineOverdue", vaccineId: record.id });
  });
  overdueMilestones.slice(0, 2).forEach((record) => {
    reasons.push({
      type: "milestoneOverdue",
      milestoneId: record.id,
      overdueMonths: record.overdueMonths,
    });
  });

  if (!reasons.length) {
    reasons.push({ type: "onTrack" });
  }

  return {
    score,
    reasons: reasons.slice(0, 4),
    missedVaccinesCount: missedVaccines.length,
    overdueMilestonesCount: overdueMilestones.length,
  };
}

export function calculateHealthScore(vaccines = [], milestones = []) {
  const total = vaccines.length + milestones.length;
  if (!total) {
    return 0;
  }

  const completedVaccines = vaccines.filter((record) => record.status === "given").length;
  const completedMilestones = milestones.filter((record) => record.achieved).length;
  return Math.round(((completedVaccines + completedMilestones) / total) * 100);
}

export function getNextUpcomingAction(vaccines = [], events = []) {
  const vaccineActions = vaccines
    .filter((record) => record.status === "upcoming" && record.dueDate)
    .map((record) => ({
      type: "vaccine",
      vaccineId: record.id,
      daysLeft: Math.max(daysUntil(record.dueDate), 0),
      date: record.dueDate,
    }));

  const eventActions = events
    .filter((event) => new Date(event.date) >= new Date())
    .map((event) => ({
      type: "event",
      title: event.title,
      titleKey: event.titleKey,
      date: event.date,
    }));

  return [...vaccineActions, ...eventActions].sort((a, b) => new Date(a.date) - new Date(b.date))[0] ?? null;
}

export function getStatusTone(status) {
  switch (status) {
    case "given":
    case "past":
    case "LOW":
      return "green";
    case "upcoming":
    case "MEDIUM":
      return "blue";
    case "missed":
    case "HIGH":
      return "red";
    default:
      return "slate";
  }
}
