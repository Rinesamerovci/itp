import { useEffect, useState } from "react";
import {
  addChild,
  createNotificationRecord,
  getChildBundle,
  getProviderChildren,
  getChildrenByParent,
  updateChildProfile,
  updateMilestone,
  updateVaccine,
} from "../lib/demoDb";
import { getParentViewer, getViewerForRole } from "../lib/localProfile";

export function useChildren(currentRole = "parent") {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  async function reload() {
    setLoading(true);
    const records =
      currentRole === "doctor"
        ? await getProviderChildren(getViewerForRole("doctor").clinicId)
        : await getChildrenByParent(getParentViewer().uid);
    setChildren(records);
    setLoading(false);
  }

  useEffect(() => {
    reload();
  }, [currentRole]);

  return {
    children,
    loading,
    reload,
    async create(values) {
      await addChild(getParentViewer().uid, values);
      await reload();
    },
  };
}

export function useChild(childId, currentRole = "parent") {
  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const viewer = getViewerForRole(currentRole);

  async function reload() {
    if (!childId) {
      return;
    }
    setLoading(true);
    try {
      const data = await getChildBundle(childId, viewer);
      setBundle(data);
      setError("");
    } catch (nextError) {
      setBundle(null);
      setError(nextError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, [childId, currentRole]);

  return {
    bundle,
    loading,
    error,
    reload,
    async saveVaccine(vaccineId, updates) {
      await updateVaccine(childId, vaccineId, updates);
      await reload();
    },
    async saveMilestone(milestoneId, updates) {
      await updateMilestone(childId, milestoneId, updates);
      await reload();
    },
    async saveChild(updates) {
      await updateChildProfile(childId, updates);
      await reload();
    },
    async sendIssue(payload) {
      await createNotificationRecord(payload);
      await reload();
    },
  };
}
