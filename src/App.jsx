import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import VitaKidShell from "./components/layout/VitaKidShell";
import { useRole } from "./context/RoleContext";
import ChildFeatureHub from "./pages/ChildFeatureHub";
import ChildProfile from "./pages/ChildProfile";
import CoverageAnalytics from "./pages/CoverageAnalytics";
import HomeVisitReport from "./pages/HomeVisitReport";
import OutbreakMap from "./pages/OutbreakMap";
import ParentDashboard from "./pages/ParentDashboard";
import ProviderDashboard from "./pages/ProviderDashboard";
import StaffDirectory from "./pages/StaffDirectory";
import StaffProfile from "./pages/StaffProfile";
import VisitReportHistory from "./pages/VisitReportHistory";
import { useTranslation } from "./hooks/useTranslation";
import { ensureDemoSeed, maybeSeedFirestore } from "./lib/demoDb";
import { buildAppPath } from "./lib/routes";

function DoctorOnlySection({ children }) {
  const { currentRole } = useRole();
  const { t } = useTranslation();

  if (currentRole !== "doctor") {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="w-full max-w-lg rounded-xl border border-brand-border bg-white p-8 text-center shadow-ek-card">
          <h2 className="text-2xl font-semibold text-brand-primary">{t("layout.doctorAccessTitle")}</h2>
          <p className="mt-3 text-sm leading-6 text-brand-secondary">{t("layout.doctorAccessDescription")}</p>
        </div>
      </div>
    );
  }

  return children;
}

function HomeRoute() {
  const { currentRole } = useRole();

  return currentRole === "doctor" ? (
    <DoctorOnlySection>
      <ProviderDashboard />
    </DoctorOnlySection>
  ) : (
    <ParentDashboard />
  );
}

function VaccinesRoute() {
  const { currentRole } = useRole();
  return currentRole === "doctor" ? (
    <DoctorOnlySection>
      <ChildFeatureHub section="vaccines" />
    </DoctorOnlySection>
  ) : (
    <ChildFeatureHub section="timeline" />
  );
}

export default function App() {
  useEffect(() => {
    ensureDemoSeed();
    maybeSeedFirestore().catch(() => null);
  }, []);

  return (
    <Routes>
      <Route path="/" element={<AppShell />} />
      <Route
        path={buildAppPath()}
        element={
          <VitaKidShell>
            <HomeRoute />
          </VitaKidShell>
        }
      />
      <Route
        path={buildAppPath("/children")}
        element={
          <VitaKidShell>
            <DoctorOnlySection>
              <ChildFeatureHub section="children" />
            </DoctorOnlySection>
          </VitaKidShell>
        }
      />
      <Route
        path={buildAppPath("/vaccines")}
        element={
          <VitaKidShell>
            <VaccinesRoute />
          </VitaKidShell>
        }
      />
      <Route
        path={buildAppPath("/milestones")}
        element={
          <VitaKidShell>
            <ChildFeatureHub section="milestones" />
          </VitaKidShell>
        }
      />
      <Route
        path={buildAppPath("/qr-passport")}
        element={
          <VitaKidShell>
            <ChildFeatureHub section="qr" />
          </VitaKidShell>
        }
      />
      <Route
        path={buildAppPath("/reminders")}
        element={
          <VitaKidShell>
            <ChildFeatureHub section="reminders" />
          </VitaKidShell>
        }
      />
      <Route
        path={buildAppPath("/child/:childId")}
        element={
          <VitaKidShell>
            <ChildProfile />
          </VitaKidShell>
        }
      />
      <Route
        path={buildAppPath("/staff-profile")}
        element={
          <VitaKidShell>
            <DoctorOnlySection>
              <StaffProfile />
            </DoctorOnlySection>
          </VitaKidShell>
        }
      />
      <Route
        path={buildAppPath("/staff-directory")}
        element={
          <VitaKidShell>
            <DoctorOnlySection>
              <StaffDirectory />
            </DoctorOnlySection>
          </VitaKidShell>
        }
      />
      <Route
        path={buildAppPath("/home-visit-report")}
        element={
          <VitaKidShell>
            <DoctorOnlySection>
              <HomeVisitReport />
            </DoctorOnlySection>
          </VitaKidShell>
        }
      />
      <Route
        path={buildAppPath("/visit-reports")}
        element={
          <VitaKidShell>
            <DoctorOnlySection>
              <VisitReportHistory />
            </DoctorOnlySection>
          </VitaKidShell>
        }
      />
      <Route
        path={buildAppPath("/outbreak")}
        element={
          <VitaKidShell>
            <DoctorOnlySection>
              <OutbreakMap />
            </DoctorOnlySection>
          </VitaKidShell>
        }
      />
      <Route
        path={buildAppPath("/coverage-analytics")}
        element={
          <VitaKidShell>
            <DoctorOnlySection>
              <CoverageAnalytics />
            </DoctorOnlySection>
          </VitaKidShell>
        }
      />
    </Routes>
  );
}
