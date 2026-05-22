export function translateVaccine(record, t) {
  return t(`health.vaccines.${record.id}`) || record.name;
}

export function translateMilestone(record, t) {
  return t(`health.milestones.${record.id}`) || record.name;
}

export function translateEventTitle(event, t) {
  return event.titleKey ? t(`health.events.${event.titleKey}`) : event.title;
}

export function translateEventNote(event, t) {
  return event.noteKey ? t(`health.notes.${event.noteKey}`) : event.notes;
}

export function translateRiskReason(reason, t) {
  if (reason.type === "vaccineOverdue") {
    return t("health.reasons.vaccineOverdue", { item: t(`health.vaccines.${reason.vaccineId}`) });
  }
  if (reason.type === "milestoneOverdue") {
    return t("health.reasons.milestoneOverdue", {
      item: t(`health.milestones.${reason.milestoneId}`),
      months: String(reason.overdueMonths),
    });
  }
  return t("health.reasons.onTrack");
}

export function translateMissingItem(item, t) {
  if (item.kind === "vaccine") {
    return t(`health.vaccines.${item.id}`);
  }
  if (item.kind === "milestone") {
    return t(`health.milestones.${item.id}`);
  }
  return item.label;
}

export function translateNextAction(action, t) {
  if (!action) {
    return t("dashboard.allUpToDate");
  }
  if (action.type === "vaccine") {
    return t("health.nextAction.vaccineDue", {
      item: t(`health.vaccines.${action.vaccineId}`),
      days: String(action.daysLeft),
    });
  }
  if (action.type === "event" && action.titleKey) {
    return t(`health.events.${action.titleKey}`);
  }
  return action.title;
}
