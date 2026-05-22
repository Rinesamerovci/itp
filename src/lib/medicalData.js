export const WEEKDAYS = [
  { value: "Monday", key: "staff.days.monday" },
  { value: "Tuesday", key: "staff.days.tuesday" },
  { value: "Wednesday", key: "staff.days.wednesday" },
  { value: "Thursday", key: "staff.days.thursday" },
  { value: "Friday", key: "staff.days.friday" },
  { value: "Saturday", key: "staff.days.saturday" },
  { value: "Sunday", key: "staff.days.sunday" },
];

export const STAFF_SPECIALISATIONS = [
  { value: "General Practitioner", key: "staff.specialisations.generalPractitioner" },
  { value: "Pediatrician", key: "staff.specialisations.pediatrician" },
  { value: "Nurse", key: "staff.specialisations.nurse" },
  { value: "Community Health Worker", key: "staff.specialisations.communityHealthWorker" },
  { value: "Medical Helper", key: "staff.specialisations.medicalHelper" },
  { value: "Public Health Officer", key: "staff.specialisations.publicHealthOfficer" },
  { value: "Other", key: "staff.specialisations.other" },
];

export const HOME_VISIT_ALLOWED_SPECIALISATIONS = [
  "Medical Helper",
  "Nurse",
  "Community Health Worker",
];

export const AVAILABILITY_FILTERS = [
  { value: "all", key: "staff.filters.allAvailability" },
  { value: "available", key: "staff.filters.availableNow" },
  { value: "unavailable", key: "staff.filters.unavailable" },
];

export const HOME_VISIT_REASON_OPTIONS = [
  { value: "Vaccine administration", key: "reports.reasons.vaccineAdministration" },
  { value: "Post-vaccination follow-up", key: "reports.reasons.postVaccinationFollowUp" },
  { value: "Developmental milestone check", key: "reports.reasons.developmentalMilestoneCheck" },
  { value: "Illness / acute complaint", key: "reports.reasons.illnessAcuteComplaint" },
  { value: "Chronic condition monitoring", key: "reports.reasons.chronicConditionMonitoring" },
  { value: "Mental health check", key: "reports.reasons.mentalHealthCheck" },
  { value: "Nutrition assessment", key: "reports.reasons.nutritionAssessment" },
  { value: "Wound care / dressing", key: "reports.reasons.woundCareDressing" },
  { value: "Medication administration", key: "reports.reasons.medicationAdministration" },
  { value: "Parental guidance / education", key: "reports.reasons.parentalGuidanceEducation" },
  { value: "Other", key: "reports.reasons.other" },
];

export const GENERAL_APPEARANCE_OPTIONS = [
  { value: "Good", key: "reports.appearance.good" },
  { value: "Concerning", key: "reports.appearance.concerning" },
  { value: "Critical", key: "reports.appearance.critical" },
];

export const EPI_VACCINES = [
  { value: "BCG", key: "health.vaccines.bcg" },
  { value: "HepB", key: "health.vaccines.hepb" },
  { value: "DTP", key: "health.vaccines.dtp" },
  { value: "Hib", key: "health.vaccines.hib" },
  { value: "IPV", key: "health.vaccines.ipv" },
  { value: "PCV", key: "health.vaccines.pcv" },
  { value: "MMR", key: "health.vaccines.mmr" },
  { value: "Varicella", key: "health.vaccines.varicella" },
  { value: "Booster", key: "reports.vaccines.booster" },
];

export const FOLLOW_UP_TYPES = [
  { value: "Clinic visit", key: "reports.followUpTypes.clinicVisit" },
  { value: "Another home visit", key: "reports.followUpTypes.anotherHomeVisit" },
  { value: "Referral to specialist", key: "reports.followUpTypes.referralToSpecialist" },
  { value: "Emergency referral", key: "reports.followUpTypes.emergencyReferral" },
];

export const KOSOVO_MUNICIPALITIES = [
  "Pristina",
  "Prizren",
  "Peja",
  "Mitrovica",
  "Gjilan",
  "Ferizaj",
  "Gjakova",
  "Podujeva",
  "Vushtrri",
  "Suhareka",
  "Rahovec",
  "Malisheva",
  "Kamenica",
  "Viti",
  "Decan",
  "Istog",
  "Klina",
  "Skenderaj",
  "Zubin Potok",
  "Zvecan",
  "Leposavic",
  "Novo Brdo",
  "Ranilug",
  "Partesh",
  "Gracanica",
  "Lipjan",
  "Fushe Kosove",
  "Obilic",
  "Drenas",
  "Shtime",
  "Shterpce",
  "Kacanik",
  "Hani i Elezit",
];

export function canAccessHomeVisitReports(subject) {
  const role = typeof subject === "string" ? subject : subject?.currentRole ?? subject?.role;
  return role === "doctor" || role === "provider";
}

export function getSpecialisationLabel(value, t) {
  const match = STAFF_SPECIALISATIONS.find((item) => item.value === value);
  return match ? t(match.key) : value || t("staff.specialisationEmpty");
}

export function getWeekdayLabel(value, t) {
  const match = WEEKDAYS.find((item) => item.value === value);
  return match ? t(match.key) : value;
}

export function getVisitReasonLabel(value, t) {
  const match = HOME_VISIT_REASON_OPTIONS.find((item) => item.value === value);
  return match ? t(match.key) : value;
}

export function getAppearanceLabel(value, t) {
  const match = GENERAL_APPEARANCE_OPTIONS.find((item) => item.value === value);
  return match ? t(match.key) : value;
}

export function getFollowUpTypeLabel(value, t) {
  const match = FOLLOW_UP_TYPES.find((item) => item.value === value);
  return match ? t(match.key) : value;
}
