import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ROLE_STORAGE_KEY = "vitakid-current-role";
const RoleContext = createContext(null);

function readInitialRole() {
  const savedRole = localStorage.getItem(ROLE_STORAGE_KEY);
  return savedRole === "doctor" ? "doctor" : "parent";
}

export function RoleProvider({ children }) {
  const [currentRole, setCurrentRole] = useState(readInitialRole);

  useEffect(() => {
    localStorage.setItem(ROLE_STORAGE_KEY, currentRole);
  }, [currentRole]);

  const value = useMemo(
    () => ({
      currentRole,
      setCurrentRole,
    }),
    [currentRole],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);

  if (!context) {
    throw new Error("useRole must be used within RoleProvider");
  }

  return context;
}
