import { addDays, addMonths, subtractMonths, subtractYears, toIsoDate } from "./date";

export const STORAGE_KEY = "vitakid-demo-db";
export const FIRESTORE_SEEDED_KEY = "vitakid-firestore-seeded";

export const DEMO_ACCOUNTS = {
  parent: {
    email: "demo@parent.com",
    password: "demo123",
    uid: "demo-parent-uid",
    role: "parent",
    name: "Elira Berisha",
    clinicId: "clinic-prishtina",
  },
  provider: {
    email: "demo@doctor.com",
    password: "demo123",
    uid: "demo-doctor-uid",
    role: "provider",
    name: "Dr. Dren Kelmendi",
    clinicId: "clinic-prishtina",
    phone: "+383 44 123 456",
    specialisation: "Medical Helper",
    activeDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    isAvailable: true,
  },
};

const vaccineTemplates = [
  { id: "bcg", name: "BCG", recommendedAge: "0m", dueMonths: 0 },
  { id: "hepb", name: "HepB", recommendedAge: "0m, 1m, 6m", dueMonths: 6 },
  { id: "dtp", name: "DTP", recommendedAge: "2m, 4m, 6m, 18m", dueMonths: 18 },
  { id: "hib", name: "Hib", recommendedAge: "2m, 4m, 6m", dueMonths: 6 },
  { id: "ipv", name: "IPV", recommendedAge: "2m, 4m, 6m", dueMonths: 6 },
  { id: "pcv", name: "PCV", recommendedAge: "2m, 4m, 12m", dueMonths: 12 },
  { id: "mmr", name: "MMR", recommendedAge: "12m", dueMonths: 12 },
  { id: "varicella", name: "Varicella", recommendedAge: "15m", dueMonths: 15 },
];

const milestoneTemplates = [
  { id: "head-control", name: "Controls head steadily", ageGroup: "0-3m", dueMonths: 3 },
  { id: "roll-over", name: "Rolls over", ageGroup: "3-6m", dueMonths: 6 },
  { id: "sits-alone", name: "Sits without support", ageGroup: "6-12m", dueMonths: 9 },
  { id: "walks-alone", name: "Walks independently", ageGroup: "1-2y", dueMonths: 18 },
  { id: "two-word", name: "Uses two-word phrases", ageGroup: "2-5y", dueMonths: 24 },
  { id: "school-ready", name: "Ready for school tasks", ageGroup: "5-10y", dueMonths: 60 },
];

function createVaccineRecords(dob, overrides = {}) {
  return Object.fromEntries(
    vaccineTemplates.map((vaccine) => {
      const dueDate = addMonths(new Date(dob), vaccine.dueMonths);
      const baseRecord = {
        ...vaccine,
        dateGiven: "",
        dueDate: dueDate.toISOString(),
        status: dueDate > new Date() ? "upcoming" : "missed",
      };
      const custom = overrides[vaccine.id] ?? {};
      return [
        vaccine.id,
        {
          ...baseRecord,
          ...custom,
        },
      ];
    }),
  );
}

function createMilestoneRecords(dob, overrides = {}) {
  return Object.fromEntries(
    milestoneTemplates.map((milestone) => {
      const dueDate = addMonths(new Date(dob), milestone.dueMonths);
      const baseRecord = {
        ...milestone,
        achieved: false,
        achievedDate: "",
        dueDate: dueDate.toISOString(),
      };
      const custom = overrides[milestone.id] ?? {};
      return [milestone.id, { ...baseRecord, ...custom }];
    }),
  );
}

function createEvents() {
  const today = new Date();
  return {
    "event-arta-1": {
      id: "event-arta-1",
      childId: "child-arta",
      type: "checkup",
      date: subtractMonths(today, 4).toISOString(),
      title: "18m developmental review",
      titleKey: "eighteenMonthReview",
      providerId: DEMO_ACCOUNTS.provider.uid,
      providerName: "Dr. Dren Kelmendi",
      noteKey: "speechFollowup",
      notes: "Speech milestone follow-up advised",
      status: "missed",
    },
    "event-arta-2": {
      id: "event-arta-2",
      childId: "child-arta",
      type: "vaccine",
      date: addDays(today, 3).toISOString(),
      title: "MMR vaccine catch-up",
      titleKey: "mmrCatchup",
      providerId: DEMO_ACCOUNTS.provider.uid,
      providerName: "Dr. Dren Kelmendi",
      notes: "",
      status: "upcoming",
    },
    "event-liri-1": {
      id: "event-liri-1",
      childId: "child-liri",
      type: "visit",
      date: subtractMonths(today, 2).toISOString(),
      title: "Wellness visit completed",
      titleKey: "wellnessVisit",
      providerId: DEMO_ACCOUNTS.provider.uid,
      providerName: "Dr. Dren Kelmendi",
      notes: "",
      status: "past",
    },
    "event-liri-2": {
      id: "event-liri-2",
      childId: "child-liri",
      type: "vaccine",
      date: addDays(today, 14).toISOString(),
      title: "MMR booster review",
      titleKey: "mmrBoosterReview",
      providerId: DEMO_ACCOUNTS.provider.uid,
      providerName: "Dr. Dren Kelmendi",
      notes: "",
      status: "upcoming",
    },
    "event-jon-1": {
      id: "event-jon-1",
      childId: "child-jon",
      type: "visit",
      date: subtractMonths(today, 1).toISOString(),
      title: "6 month checkup",
      titleKey: "sixMonthCheckup",
      providerId: DEMO_ACCOUNTS.provider.uid,
      providerName: "Dr. Dren Kelmendi",
      noteKey: "growingWell",
      notes: "Growing well",
      status: "past",
    },
    "event-jon-2": {
      id: "event-jon-2",
      childId: "child-jon",
      type: "vaccine",
      date: addDays(today, 25).toISOString(),
      title: "PCV follow-up",
      titleKey: "pcvFollowup",
      providerId: DEMO_ACCOUNTS.provider.uid,
      providerName: "Dr. Dren Kelmendi",
      notes: "",
      status: "upcoming",
    },
  };
}

export function createSeedDatabase() {
  const now = new Date();
  const artaDob = toIsoDate(subtractYears(now, 2));
  const liriDob = toIsoDate(subtractYears(now, 4));
  const jonDob = toIsoDate(subtractMonths(now, 8));

  return {
    users: {
      [DEMO_ACCOUNTS.parent.uid]: {
        uid: DEMO_ACCOUNTS.parent.uid,
        role: "parent",
        name: DEMO_ACCOUNTS.parent.name,
        email: DEMO_ACCOUNTS.parent.email,
        password: DEMO_ACCOUNTS.parent.password,
        clinicId: "clinic-prishtina",
        profilePhoto: "",
        phone: "",
        specialisation: "",
        activeDays: [],
        isAvailable: false,
        availableUpdatedAt: "",
      },
      [DEMO_ACCOUNTS.provider.uid]: {
        uid: DEMO_ACCOUNTS.provider.uid,
        role: "provider",
        name: DEMO_ACCOUNTS.provider.name,
        email: DEMO_ACCOUNTS.provider.email,
        password: DEMO_ACCOUNTS.provider.password,
        clinicId: "clinic-prishtina",
        profilePhoto: "",
        phone: DEMO_ACCOUNTS.provider.phone,
        specialisation: DEMO_ACCOUNTS.provider.specialisation,
        activeDays: DEMO_ACCOUNTS.provider.activeDays,
        isAvailable: DEMO_ACCOUNTS.provider.isAvailable,
        availableUpdatedAt: now.toISOString(),
      },
    },
    children: {
      "child-arta": {
        id: "child-arta",
        parentUid: DEMO_ACCOUNTS.parent.uid,
        name: "Arta Berisha",
        dob: artaDob,
        bloodType: "A+",
        allergies: "Penicillin",
        clinicId: "clinic-prishtina",
        riskScore: "HIGH",
        createdAt: subtractYears(now, 2).toISOString(),
        lastSyncedAt: subtractMonths(now, 0).toISOString(),
      },
      "child-liri": {
        id: "child-liri",
        parentUid: DEMO_ACCOUNTS.parent.uid,
        name: "Liri Berisha",
        dob: liriDob,
        bloodType: "O+",
        allergies: "",
        clinicId: "clinic-prishtina",
        riskScore: "MEDIUM",
        createdAt: subtractYears(now, 4).toISOString(),
        lastSyncedAt: subtractMonths(now, 0).toISOString(),
      },
      "child-jon": {
        id: "child-jon",
        parentUid: DEMO_ACCOUNTS.parent.uid,
        name: "Jon Gashi",
        dob: jonDob,
        bloodType: "B+",
        allergies: "Egg",
        clinicId: "clinic-prishtina",
        riskScore: "LOW",
        createdAt: subtractMonths(now, 8).toISOString(),
        lastSyncedAt: subtractMonths(now, 0).toISOString(),
      },
    },
    vaccines: {
      "child-arta": createVaccineRecords(artaDob, {
        bcg: { dateGiven: artaDob, status: "given" },
        hepb: { dateGiven: toIsoDate(addMonths(new Date(artaDob), 6)), status: "given" },
        dtp: { dateGiven: toIsoDate(addMonths(new Date(artaDob), 18)), status: "given" },
        hib: { dateGiven: toIsoDate(addMonths(new Date(artaDob), 6)), status: "given" },
        ipv: { dateGiven: toIsoDate(addMonths(new Date(artaDob), 6)), status: "given" },
        pcv: { dateGiven: toIsoDate(addMonths(new Date(artaDob), 12)), status: "given" },
        mmr: { status: "missed" },
        varicella: { status: "missed" },
      }),
      "child-liri": createVaccineRecords(liriDob, {
        bcg: { dateGiven: liriDob, status: "given" },
        hepb: { dateGiven: toIsoDate(addMonths(new Date(liriDob), 6)), status: "given" },
        dtp: { dateGiven: toIsoDate(addMonths(new Date(liriDob), 18)), status: "given" },
        hib: { dateGiven: toIsoDate(addMonths(new Date(liriDob), 6)), status: "given" },
        ipv: { dateGiven: toIsoDate(addMonths(new Date(liriDob), 6)), status: "given" },
        pcv: { dateGiven: toIsoDate(addMonths(new Date(liriDob), 12)), status: "given" },
        mmr: { status: "missed" },
        varicella: { dateGiven: toIsoDate(addMonths(new Date(liriDob), 15)), status: "given" },
      }),
      "child-jon": createVaccineRecords(jonDob, {
        bcg: { dateGiven: jonDob, status: "given" },
        hepb: { dateGiven: toIsoDate(addMonths(new Date(jonDob), 6)), status: "given" },
        dtp: { dateGiven: toIsoDate(addMonths(new Date(jonDob), 6)), status: "given" },
        hib: { dateGiven: toIsoDate(addMonths(new Date(jonDob), 6)), status: "given" },
        ipv: { dateGiven: toIsoDate(addMonths(new Date(jonDob), 6)), status: "given" },
        pcv: { status: "upcoming", dueDate: addDays(now, 25).toISOString() },
        mmr: { status: "upcoming", dueDate: addMonths(now, 4).toISOString() },
        varicella: { status: "upcoming", dueDate: addMonths(now, 7).toISOString() },
      }),
    },
    milestones: {
      "child-arta": createMilestoneRecords(artaDob, {
        "head-control": { achieved: true, achievedDate: toIsoDate(addMonths(new Date(artaDob), 2)) },
        "roll-over": { achieved: true, achievedDate: toIsoDate(addMonths(new Date(artaDob), 5)) },
        "sits-alone": { achieved: true, achievedDate: toIsoDate(addMonths(new Date(artaDob), 7)) },
        "walks-alone": { achieved: true, achievedDate: toIsoDate(addMonths(new Date(artaDob), 15)) },
        "two-word": { achieved: false, dueDate: subtractMonths(now, 4).toISOString() },
      }),
      "child-liri": createMilestoneRecords(liriDob, {
        "head-control": { achieved: true, achievedDate: toIsoDate(addMonths(new Date(liriDob), 2)) },
        "roll-over": { achieved: true, achievedDate: toIsoDate(addMonths(new Date(liriDob), 4)) },
        "sits-alone": { achieved: true, achievedDate: toIsoDate(addMonths(new Date(liriDob), 8)) },
        "walks-alone": { achieved: true, achievedDate: toIsoDate(addMonths(new Date(liriDob), 16)) },
        "two-word": { achieved: true, achievedDate: toIsoDate(addMonths(new Date(liriDob), 22)) },
      }),
      "child-jon": createMilestoneRecords(jonDob, {
        "head-control": { achieved: true, achievedDate: toIsoDate(addMonths(new Date(jonDob), 2)) },
        "roll-over": { achieved: true, achievedDate: toIsoDate(addMonths(new Date(jonDob), 5)) },
        "sits-alone": { achieved: false, dueDate: addDays(now, 20).toISOString() },
      }),
    },
    events: createEvents(),
    notifications: {},
    homeVisitReports: {},
  };
}

export function createBlankChildRecords(dob) {
  return {
    vaccines: createVaccineRecords(dob),
    milestones: createMilestoneRecords(dob),
  };
}
