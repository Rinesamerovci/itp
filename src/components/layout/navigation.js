import {
  Baby,
  BellRing,
  ChartColumn,
  ClipboardPlus,
  FolderKanban,
  House,
  Map,
  QrCode,
  Sparkles,
  Syringe,
  UserRound,
  Users,
} from "lucide-react";
import { APP_BASE, buildAppPath } from "../../lib/routes";

export const doctorItems = [
  { to: buildAppPath(), icon: House, key: "layout.nav.dashboard" },
  { to: buildAppPath("/children"), icon: Baby, key: "layout.nav.children" },
  { to: buildAppPath("/vaccines"), icon: Syringe, key: "layout.nav.vaccines" },
  { to: buildAppPath("/home-visit-report"), icon: ClipboardPlus, key: "layout.nav.homeVisitReport" },
  { to: buildAppPath("/visit-reports"), icon: FolderKanban, key: "layout.nav.visitHistory" },
  { to: buildAppPath("/staff-directory"), icon: Users, key: "layout.nav.staffDirectory" },
  { to: buildAppPath("/staff-profile"), icon: UserRound, key: "layout.nav.myProfile" },
  { to: buildAppPath("/outbreak"), icon: Map, key: "layout.nav.outbreakMap" },
  { to: buildAppPath("/coverage-analytics"), icon: ChartColumn, key: "layout.nav.coverageAnalytics" },
];

export const parentItems = [
  { to: buildAppPath(), icon: House, key: "layout.nav.myChildren" },
  { to: buildAppPath("/vaccines"), icon: Syringe, key: "layout.nav.vaccineTimeline" },
  { to: buildAppPath("/milestones"), icon: Sparkles, key: "layout.nav.milestones" },
  { to: buildAppPath("/qr-passport"), icon: QrCode, key: "layout.nav.qrPassport" },
  { to: buildAppPath("/reminders"), icon: BellRing, key: "layout.nav.reminders" },
];

export function isNavItemActive(pathname, to) {
  if (to === APP_BASE) {
    return pathname === APP_BASE || pathname.startsWith(`${APP_BASE}/child/`);
  }

  return pathname === to || pathname.startsWith(`${to}/`);
}
