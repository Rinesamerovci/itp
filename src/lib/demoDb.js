import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db, firebaseEnabled } from "./firebase";
import {
  createBlankChildRecords,
  createSeedDatabase,
  DEMO_ACCOUNTS,
  FIRESTORE_SEEDED_KEY,
  STORAGE_KEY,
} from "./seedData";
import { calculateHealthScore, calculateRisk, getNextUpcomingAction } from "./riskEngine";
import { formatDate } from "./date";
import { getStoredStaffProfile } from "./localProfile";

const defaultUserFields = {
  profilePhoto: "",
  phone: "",
  specialisation: "",
  activeDays: [],
  isAvailable: false,
  availableUpdatedAt: "",
};

function toIsoOrEmpty(value) {
  if (!value) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return "";
}

function normalizeUserRecord(user = {}) {
  return {
    ...defaultUserFields,
    ...user,
    activeDays: Array.isArray(user.activeDays) ? user.activeDays : [],
    isAvailable: Boolean(user.isAvailable),
    availableUpdatedAt: toIsoOrEmpty(user.availableUpdatedAt),
  };
}

function normalizeDatabase(data) {
  const children = data.children ?? {};
  const blankRecordsByChild = Object.fromEntries(
    Object.entries(children).map(([childId, child]) => [childId, createBlankChildRecords(child.dob)]),
  );

  return {
    users: Object.fromEntries(
      Object.entries(data.users ?? {}).map(([uid, user]) => [uid, normalizeUserRecord(user)]),
    ),
    children,
    vaccines: Object.fromEntries(
      Object.entries(children).map(([childId]) => [
        childId,
        {
          ...(blankRecordsByChild[childId]?.vaccines ?? {}),
          ...(data.vaccines?.[childId] ?? {}),
        },
      ]),
    ),
    milestones: Object.fromEntries(
      Object.entries(children).map(([childId]) => [
        childId,
        {
          ...(blankRecordsByChild[childId]?.milestones ?? {}),
          ...(data.milestones?.[childId] ?? {}),
        },
      ]),
    ),
    events: data.events ?? {},
    notifications: data.notifications ?? {},
    homeVisitReports: data.homeVisitReports ?? {},
  };
}

function buildPublicUser(user) {
  const record = normalizeUserRecord(user);
  return {
    uid: record.uid,
    email: record.email,
    role: record.role,
    name: record.name,
    clinicId: record.clinicId,
    profilePhoto: record.profilePhoto,
    phone: record.phone,
    specialisation: record.specialisation,
    activeDays: record.activeDays,
    isAvailable: record.isAvailable,
    availableUpdatedAt: record.availableUpdatedAt,
  };
}

function readDb() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const normalized = normalizeDatabase(JSON.parse(saved));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  }
  const seeded = normalizeDatabase(createSeedDatabase());
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

function writeDb(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function buildEventStatus(dateValue) {
  const today = new Date().setHours(0, 0, 0, 0);
  const eventDate = new Date(dateValue).setHours(0, 0, 0, 0);
  return eventDate < today ? "past" : "upcoming";
}

function canAccessChild(child, viewer, users) {
  if (!viewer || !child) {
    return false;
  }

  if (viewer.role === "parent") {
    return child.parentUid === viewer.uid;
  }

  if (viewer.role === "provider") {
    const viewerClinicId = viewer.clinicId || users[viewer.uid]?.clinicId;
    return child.clinicId && child.clinicId === viewerClinicId;
  }

  return false;
}

export function ensureDemoSeed() {
  readDb();
}

export async function maybeSeedFirestore() {
  if (!firebaseEnabled || !db || localStorage.getItem(FIRESTORE_SEEDED_KEY)) {
    return;
  }

  const demoDoc = await getDoc(doc(db, "users", DEMO_ACCOUNTS.parent.uid));
  if (demoDoc.exists()) {
    localStorage.setItem(FIRESTORE_SEEDED_KEY, "1");
    return;
  }

  const data = readDb();
  const batch = writeBatch(db);

  Object.values(data.users).forEach((user) => {
    batch.set(doc(db, "users", user.uid), {
      role: user.role,
      name: user.name,
      email: user.email,
      clinicId: user.clinicId ?? null,
      profilePhoto: user.profilePhoto ?? "",
      phone: user.phone ?? "",
      specialisation: user.specialisation ?? "",
      activeDays: user.activeDays ?? [],
      isAvailable: Boolean(user.isAvailable),
      availableUpdatedAt: user.availableUpdatedAt ? new Date(user.availableUpdatedAt) : null,
    });
  });

  Object.values(data.children).forEach((child) => {
    batch.set(doc(db, "children", child.id), child);
  });

  Object.entries(data.vaccines).forEach(([childId, records]) => {
    Object.entries(records).forEach(([vaccineId, record]) => {
      batch.set(doc(db, "vaccines", childId, "records", vaccineId), record);
    });
  });

  Object.entries(data.milestones).forEach(([childId, records]) => {
    Object.entries(records).forEach(([milestoneId, record]) => {
      batch.set(doc(db, "milestones", childId, "records", milestoneId), record);
    });
  });

  Object.values(data.events).forEach((event) => {
    batch.set(doc(db, "events", event.id), event);
  });

  await batch.commit();
  localStorage.setItem(FIRESTORE_SEEDED_KEY, "1");
}


function buildChildSummary(child, vaccines, milestones, events) {
  const vaccineList = Object.values(vaccines ?? {});
  const milestoneList = Object.values(milestones ?? {});
  const eventList = Object.values(events ?? {}).filter((event) => event.childId === child.id);
  const risk = calculateRisk(vaccineList, milestoneList);
  const nextAction = getNextUpcomingAction(vaccineList, eventList);

  return {
    ...child,
    vaccines: vaccineList,
    milestones: milestoneList,
    events: eventList.sort((a, b) => new Date(a.date) - new Date(b.date)),
    riskScore: risk.score,
    riskReasons: risk.reasons,
    healthScore: calculateHealthScore(vaccineList, milestoneList),
    nextAction,
    lastSeen: eventList
      .filter((event) => new Date(event.date) <= new Date())
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.date,
    missingItems: [
      ...vaccineList.filter((item) => item.status === "missed").map((item) => ({ kind: "vaccine", id: item.id })),
      ...milestoneList
        .filter((item) => !item.achieved && new Date(item.dueDate) < new Date())
        .map((item) => ({ kind: "milestone", id: item.id })),
    ],
    lastSyncedLabel: formatDate(child.lastSyncedAt),
  };
}

export async function getChildrenByParent(parentUid) {
  const data = readDb();
  return Object.values(data.children)
    .filter((child) => child.parentUid === parentUid)
    .map((child) => buildChildSummary(child, data.vaccines[child.id], data.milestones[child.id], data.events));
}

export async function getChildBundle(childId, viewer) {
  const data = readDb();
  const child = data.children[childId];
  if (!child) {
    throw new Error("Child not found");
  }
  if (viewer && !canAccessChild(child, viewer, data.users)) {
    throw new Error("access_denied");
  }

  const summary = buildChildSummary(child, data.vaccines[childId], data.milestones[childId], data.events);
  const siblings = Object.values(data.children)
    .filter((entry) => entry.parentUid === child.parentUid && entry.id !== child.id)
    .map((entry) => buildChildSummary(entry, data.vaccines[entry.id], data.milestones[entry.id], data.events));

  return {
    child: summary,
    siblings,
    parent: data.users[child.parentUid],
  };
}

export async function addChild(parentUid, values) {
  const data = readDb();
  const childId = crypto.randomUUID();
  const clinicId = values.clinicId || DEMO_ACCOUNTS.parent.clinicId;
  const child = {
    id: childId,
    parentUid,
    name: values.name,
    dob: values.dob,
    bloodType: values.bloodType || "--",
    allergies: values.allergies || "",
    chronicIllnesses: values.chronicIllnesses || "",
    clinicId,
    riskScore: "LOW",
    createdAt: new Date().toISOString(),
    lastSyncedAt: new Date().toISOString(),
  };
  const blankRecords = createBlankChildRecords(values.dob);
  data.children[childId] = child;
  data.vaccines[childId] = blankRecords.vaccines;
  data.milestones[childId] = blankRecords.milestones;
  writeDb(data);
  return buildChildSummary(child, blankRecords.vaccines, blankRecords.milestones, data.events);
}

export async function updateVaccine(childId, vaccineId, updates) {
  const data = readDb();
  data.vaccines[childId][vaccineId] = {
    ...data.vaccines[childId][vaccineId],
    ...updates,
  };
  data.children[childId].lastSyncedAt = new Date().toISOString();
  writeDb(data);
}

export async function updateMilestone(childId, milestoneId, updates) {
  const data = readDb();
  data.milestones[childId][milestoneId] = {
    ...data.milestones[childId][milestoneId],
    ...updates,
  };
  data.children[childId].lastSyncedAt = new Date().toISOString();
  writeDb(data);
}

export async function updateChildProfile(childId, updates) {
  const data = readDb();
  data.children[childId] = {
    ...data.children[childId],
    ...updates,
    lastSyncedAt: new Date().toISOString(),
  };
  writeDb(data);
}

export async function saveVisitEvent({ childId, providerId, providerName, date, title, notes }) {
  const data = readDb();
  const existing = Object.values(data.events).find(
    (event) => event.childId === childId && event.type === "visit" && event.status === "upcoming",
  );

  const id = existing?.id ?? crypto.randomUUID();
  data.events[id] = {
    id,
    childId,
    type: "visit",
    date,
    title,
    providerId,
    providerName,
    notes,
    status: buildEventStatus(date),
  };
  data.children[childId].lastSyncedAt = new Date().toISOString();
  writeDb(data);
  return data.events[id];
}

export async function createNotificationRecord(payload) {
  const data = readDb();
  const id = crypto.randomUUID();
  data.notifications[id] = {
    id,
    type: payload.type ?? "general",
    title: payload.title ?? "",
    ...payload,
    sentAt: new Date().toISOString(),
    status: "sent",
  };
  writeDb(data);

  if (firebaseEnabled && db) {
    await addDoc(collection(db, "notifications"), {
      childId: payload.childId,
      parentUid: payload.parentUid,
      providerId: payload.providerId,
      type: payload.type ?? "general",
      title: payload.title ?? "",
      message: payload.message,
      sentAt: new Date().toISOString(),
      status: "sent",
    });
  }

  return data.notifications[id];
}

export async function getProviderChildren(clinicId) {
  const data = readDb();
  return Object.values(data.children)
    .filter((child) => child.clinicId === clinicId)
    .map((child) => buildChildSummary(child, data.vaccines[child.id], data.milestones[child.id], data.events));
}

export async function getClinicNotifications(clinicId, type = null) {
  const data = readDb();

  return Object.values(data.notifications)
    .filter((notification) => {
      const child = data.children[notification.childId];
      if (!child || child.clinicId !== clinicId) {
        return false;
      }
      return type ? notification.type === type : true;
    })
    .map((notification) => ({
      ...notification,
      childName: data.children[notification.childId]?.name ?? "--",
      parentName: data.users[notification.parentUid]?.name ?? "--",
    }))
    .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
}

function hydrateUserRecord(uid, user, existingUser = null) {
  return normalizeUserRecord({
    ...existingUser,
    ...user,
    uid,
  });
}

function getLocalStaffRecords() {
  const data = readDb();
  return Object.values(data.users)
    .map((user) => normalizeUserRecord(user))
    .filter((user) => user.role !== "parent");
}

function sortStaffRecords(records) {
  return [...records].sort((left, right) => {
    if (left.isAvailable !== right.isAvailable) {
      return left.isAvailable ? -1 : 1;
    }
    return left.name.localeCompare(right.name);
  });
}

async function getFirestoreUsersMap() {
  if (!firebaseEnabled || !db) {
    return new Map();
  }

  const snapshot = await getDocs(collection(db, "users"));
  const usersMap = new Map();
  snapshot.forEach((record) => {
    usersMap.set(record.id, hydrateUserRecord(record.id, record.data()));
  });
  return usersMap;
}

export async function getStaffDirectoryRecords() {
  const localUsers = new Map(getLocalStaffRecords().map((user) => [user.uid, user]));

  if (firebaseEnabled && db) {
    const remoteUsers = await getFirestoreUsersMap();
    remoteUsers.forEach((value, key) => {
      localUsers.set(key, hydrateUserRecord(key, value, localUsers.get(key)));
    });
  }

  const currentProfile = getStoredStaffProfile();
  localUsers.set("local-staff-profile", {
    uid: "local-staff-profile",
    role: "provider",
    name: currentProfile.name,
    email: currentProfile.email,
    clinicId: currentProfile.clinicId ?? DEMO_ACCOUNTS.provider.clinicId,
    profilePhoto: currentProfile.profilePhoto ?? "",
    phone: currentProfile.phone ?? "",
    specialisation: currentProfile.specialisation ?? "",
    activeDays: currentProfile.activeDays ?? [],
    isAvailable: Boolean(currentProfile.isAvailable),
    availableUpdatedAt: new Date().toISOString(),
  });

  return sortStaffRecords(
    [...localUsers.values()].map((user) => ({
      ...buildPublicUser(user),
      phone: user.phone ?? "",
      email: user.email ?? "",
      isCurrentUser: user.uid === "local-staff-profile",
    })),
  );
}

export async function getPatientDirectory(clinicId = null) {
  const data = readDb();
  const userMap = Object.fromEntries(
    Object.values(data.users).map((user) => [user.uid, normalizeUserRecord(user)]),
  );
  const patients = Object.values(data.children)
    .filter((child) => (clinicId ? child.clinicId === clinicId : true))
    .map((child) => ({
      id: child.id,
      name: child.name,
      dob: child.dob,
      guardianName: userMap[child.parentUid]?.name ?? "",
      clinicId: child.clinicId ?? "",
      address: child.address ?? "",
      municipality: child.municipality ?? "",
    }));

  if (!firebaseEnabled || !db) {
    return patients.sort((left, right) => left.name.localeCompare(right.name));
  }

  const [childrenSnapshot, usersMap] = await Promise.all([
    getDocs(collection(db, "children")),
    getFirestoreUsersMap(),
  ]);
  const patientMap = new Map(patients.map((patient) => [patient.id, patient]));

  childrenSnapshot.forEach((record) => {
    const child = record.data();
    if (clinicId && child.clinicId !== clinicId) {
      return;
    }

    patientMap.set(record.id, {
      id: record.id,
      name: child.name ?? "",
      dob: child.dob ?? "",
      guardianName: usersMap.get(child.parentUid)?.name ?? userMap[child.parentUid]?.name ?? "",
      clinicId: child.clinicId ?? "",
      address: child.address ?? "",
      municipality: child.municipality ?? "",
    });
  });

  return [...patientMap.values()].sort((left, right) => left.name.localeCompare(right.name));
}

function normalizeReportRecord(record = {}) {
  return {
    id: record.id ?? "",
    submittedBy: record.submittedBy ?? "",
    staffName: record.staffName ?? "",
    staffRole: record.staffRole ?? "",
    visitDate: record.visitDate ?? "",
    visitTime: record.visitTime ?? "",
    patientId: record.patientId ?? null,
    patientName: record.patientName ?? "",
    patientDob: record.patientDob ?? "",
    guardianName: record.guardianName ?? "",
    address: record.address ?? "",
    municipality: record.municipality ?? "",
    visitReasons: Array.isArray(record.visitReasons) ? record.visitReasons : [],
    generalAppearance: record.generalAppearance ?? "",
    temperature: record.temperature ?? null,
    weight: record.weight ?? null,
    height: record.height ?? null,
    symptoms: record.symptoms ?? "",
    medicationsGiven: record.medicationsGiven ?? "",
    vaccinesAdministered: Array.isArray(record.vaccinesAdministered) ? record.vaccinesAdministered : [],
    assessment: record.assessment ?? "",
    actionsTaken: record.actionsTaken ?? "",
    followUpRequired: Boolean(record.followUpRequired),
    followUpDate: record.followUpDate ?? "",
    followUpType: record.followUpType ?? "",
    referralDetails: record.referralDetails ?? "",
    signatureDataUrl: record.signatureDataUrl ?? "",
    submittedAt: toIsoOrEmpty(record.submittedAt),
    status: record.status ?? "submitted",
    otherReason: record.otherReason ?? "",
  };
}

export async function submitHomeVisitReport(payload) {
  const data = readDb();
  const reportId = payload.id ?? crypto.randomUUID();
  const localRecord = normalizeReportRecord({
    ...payload,
    id: reportId,
    submittedAt: new Date().toISOString(),
    status: "submitted",
  });

  data.homeVisitReports[reportId] = localRecord;
  writeDb(data);

  if (firebaseEnabled && db) {
    await setDoc(doc(db, "homeVisitReports", reportId), {
      ...localRecord,
      submittedAt: serverTimestamp(),
    });
  }

  return localRecord;
}

export async function getHomeVisitReportsByStaff(staffName) {
  const data = readDb();
  const reportsMap = new Map(
    Object.values(data.homeVisitReports)
      .filter((report) => report.staffName === staffName || report.submittedBy === staffName)
      .map((report) => [report.id, normalizeReportRecord(report)]),
  );

  if (firebaseEnabled && db) {
    const snapshot = await getDocs(query(collection(db, "homeVisitReports"), where("staffName", "==", staffName)));
    snapshot.forEach((record) => {
      reportsMap.set(record.id, normalizeReportRecord({ id: record.id, ...record.data() }));
    });
  }

  return [...reportsMap.values()].sort((left, right) => new Date(right.submittedAt) - new Date(left.submittedAt));
}

export async function getHomeVisitReportById(reportId) {
  const data = readDb();
  const localRecord = data.homeVisitReports[reportId];

  if (firebaseEnabled && db) {
    const snapshot = await getDoc(doc(db, "homeVisitReports", reportId));
    if (snapshot.exists()) {
      return normalizeReportRecord({ id: snapshot.id, ...snapshot.data() });
    }
  }

  return localRecord ? normalizeReportRecord(localRecord) : null;
}
