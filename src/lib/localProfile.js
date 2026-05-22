import { DEMO_ACCOUNTS } from "./seedData";

export const STAFF_PROFILE_KEY = "vitakid_staff_profile";

export const DEFAULT_STAFF_PROFILE = {
  name: "Dr. Arben Krasniqi",
  phone: "+383 44 123 456",
  email: "a.krasniqi@qkmf-pristine.ks",
  specialisation: "Pediatrician",
  activeDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  isAvailable: true,
  profilePhoto: null,
  clinicId: DEMO_ACCOUNTS.provider.clinicId,
};

export function getStoredStaffProfile() {
  const savedProfile = localStorage.getItem(STAFF_PROFILE_KEY);

  if (savedProfile) {
    return {
      ...DEFAULT_STAFF_PROFILE,
      ...JSON.parse(savedProfile),
    };
  }

  localStorage.setItem(STAFF_PROFILE_KEY, JSON.stringify(DEFAULT_STAFF_PROFILE));
  return DEFAULT_STAFF_PROFILE;
}

export function saveStoredStaffProfile(profile) {
  const nextProfile = {
    ...DEFAULT_STAFF_PROFILE,
    ...profile,
  };

  localStorage.setItem(STAFF_PROFILE_KEY, JSON.stringify(nextProfile));
  return nextProfile;
}

export function updateStoredStaffProfile(updates) {
  return saveStoredStaffProfile({
    ...getStoredStaffProfile(),
    ...updates,
  });
}

export function getParentViewer() {
  return {
    uid: DEMO_ACCOUNTS.parent.uid,
    role: "parent",
    name: DEMO_ACCOUNTS.parent.name,
    clinicId: DEMO_ACCOUNTS.parent.clinicId,
  };
}

export function getDoctorViewer() {
  const profile = getStoredStaffProfile();

  return {
    uid: "local-doctor-profile",
    role: "provider",
    name: profile.name,
    clinicId: profile.clinicId || DEMO_ACCOUNTS.provider.clinicId,
    email: profile.email,
    phone: profile.phone,
    specialisation: profile.specialisation,
    activeDays: profile.activeDays,
    isAvailable: profile.isAvailable,
    profilePhoto: profile.profilePhoto,
  };
}

export function getViewerForRole(currentRole) {
  return currentRole === "doctor" ? getDoctorViewer() : getParentViewer();
}
