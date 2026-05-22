import { ArrowLeft, ChevronRight, Clock3, FileText, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import MainHeader from "../components/layout/MainHeader";
import Sidebar from "../components/layout/Sidebar";
import TopUtilityBar from "../components/layout/TopUtilityBar";
import RoleSwitcher from "../components/RoleSwitcher";
import { useRole } from "../context/RoleContext";
import { useTranslation } from "../hooks/useTranslation";
import { buildAppPath } from "../lib/routes";
import { serviceCardIds } from "../lib/portalServices";

export default function PortalServiceDetail() {
  const { serviceId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentRole } = useRole();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isKnownService = serviceCardIds.includes(serviceId);

  if (!isKnownService) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] text-brand-primary">
        <PortalChrome mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <div className="mx-auto max-w-[940px] px-4 py-10 md:px-6">
          <EmptyState
            title={t("portal.detail.notFoundTitle")}
            description={t("portal.detail.notFoundDescription")}
            action={
              <button
                type="button"
                onClick={() => navigate("/")}
                className="rounded-lg bg-brand-navy px-4 py-2 text-sm font-semibold text-white"
              >
                {t("common.back")}
              </button>
            }
          />
        </div>
      </div>
    );
  }

  const title = t(`portal.cards.${serviceId}.title`);
  const description = t(`portal.cards.${serviceId}.description`);
  const isVitaKid = serviceId === "vitakid";
  const vitaKidNextStep =
    currentRole === "doctor" ? t("portal.detail.vitakidDoctorNextStep") : t("portal.detail.vitakidParentNextStep");

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-brand-primary">
      <PortalChrome mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <main className="pb-12">
        <div className="mx-auto max-w-[1238px] px-4 py-9 md:px-6">
          <div className="mx-auto max-w-[940px]">
            <section className="relative rounded-[18px] bg-white px-5 py-6 shadow-[0_8px_20px_rgba(0,0,0,0.12)] md:px-7 md:py-8">
              {isVitaKid ? (
                <div className="mb-5 flex justify-end lg:absolute lg:right-7 lg:top-7 lg:mb-0">
                  <RoleSwitcher />
                </div>
              ) : null}

              <div className="flex flex-col gap-5 border-b border-brand-border pb-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-teal">
                    {t("portal.detail.badge")}
                  </p>
                  <h1 className="mt-3 text-3xl font-semibold leading-tight text-brand-primary">{title}</h1>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-brand-secondary">{description}</p>
                </div>
                {!isVitaKid ? (
                  <div className="shrink-0 rounded-full bg-brand-teal/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">
                    {t("portal.serviceBadge")}
                  </div>
                ) : null}
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <DetailCard icon={FileText} title={t("portal.detail.infoTitle")} text={t("portal.detail.infoText")} />
                <DetailCard icon={Clock3} title={t("portal.detail.processTitle")} text={t("portal.detail.processText")} />
                <DetailCard icon={ShieldCheck} title={t("portal.detail.supportTitle")} text={t("portal.detail.supportText")} />
              </div>

              <div className="mt-7 rounded-xl border border-brand-border bg-[#f7f8fb] p-5">
                <h2 className="text-xl font-semibold text-brand-primary">{t("portal.detail.nextStepTitle")}</h2>
                <p className="mt-2 text-sm leading-6 text-brand-secondary">
                  {isVitaKid ? vitaKidNextStep : t("portal.detail.generalNextStep")}
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  {isVitaKid ? (
                    <Link
                      to={buildAppPath()}
                      className="inline-flex items-center gap-2 rounded-lg bg-brand-teal px-4 py-3 text-sm font-semibold text-white"
                    >
                      {t("portal.openService")}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  ) : null}
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 rounded-lg border border-brand-border bg-white px-4 py-3 text-sm font-semibold text-brand-navy"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {t("portal.detail.backToServices")}
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function PortalChrome({ mobileOpen, setMobileOpen }) {
  return (
    <>
      <TopUtilityBar />
      <MainHeader
        showNavigation={false}
        showRoleSwitcher={false}
        onMenuToggle={() => setMobileOpen((value) => !value)}
      />
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}

function DetailCard({ icon: Icon, title, text }) {
  return (
    <div className="rounded-xl border border-brand-border bg-white p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-teal/10 text-brand-teal">
        <Icon className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-sm font-semibold text-brand-primary">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-brand-secondary">{text}</p>
    </div>
  );
}
