import {
  ArrowUp,
  ChevronRight,
  Instagram,
  Mail,
  MapPinHouse,
  Phone,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../hooks/useTranslation";
import { buildAppPath } from "../../lib/routes";
import MainHeader from "./MainHeader";
import Sidebar from "./Sidebar";
import TopUtilityBar from "./TopUtilityBar";

const categoryKeys = [
  "portal.filters.all",
  "portal.filters.familyPlanning",
  "portal.filters.pregnancy",
  "portal.filters.birth",
  "portal.filters.childCare",
];

const serviceCardIds = [
  "vitakid",
  "familyPlanning",
  "safeMotherhood",
  "reproductiveInfections",
  "dysmenorrhea",
  "pelvicInflammation",
  "reproductiveCancerPrevention",
  "pregnancyTest",
  "educationRooms",
  "care1000Days",
  "homeVisits",
  "breastExam",
  "ultrasound",
  "gynecologyExam",
  "smearCollection",
  "ambulatoryVisits",
  "colposcopy",
  "earlyCare",
  "childEducation",
  "educationSixMonthsToSixYears",
  "educationTwoToSevenYears",
];

export default function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const cards = useMemo(
    () =>
      serviceCardIds.map((id) => ({
        id,
        title: t(`portal.cards.${id}.title`),
        description: t(`portal.cards.${id}.description`),
      })),
    [t],
  );

  const featuredCard = cards[0];
  const listCards = cards.slice(1);

  function openVitaKidPage() {
    navigate(buildAppPath());
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-brand-primary">
      <TopUtilityBar />
      <MainHeader onMenuToggle={() => setMobileOpen((value) => !value)} />
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <main className="pb-12">
        <div className="mx-auto max-w-[1238px] px-4 py-9 md:px-6">
          <div className="mx-auto max-w-[940px]">
            <section className="rounded-[18px] bg-[#f5f5f6] px-7 py-10 shadow-[0_0_0_1px_rgba(229,231,235,0.5)]">
              <div className="max-w-[1040px]">
                <h1 className="text-[2.15rem] font-light leading-tight tracking-[-0.02em] text-brand-primary">
                  {t("portal.title")}
                </h1>
                <p className="mt-7 text-[1.02rem] leading-[1.55] text-[#5e6674]">{t("portal.description")}</p>
                <div className="mt-7 h-px bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.95),rgba(255,255,255,0))]" />
                <p className="mt-4 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-[#d7d7d7]">
                  {t("portal.secondaryDescription")}
                </p>
              </div>

              <div className="mt-7 flex justify-center">
                <button
                  type="button"
                  className="rounded-md bg-[#1f5d9f] px-[4.2rem] py-3 text-base font-medium text-white shadow-sm transition hover:bg-[#1c538e]"
                >
                  {t("portal.showMore")}
                </button>
              </div>

              <div className="mt-8 max-w-[274px]">
                <label className="mb-3 block text-[1.02rem] font-medium text-brand-primary">{t("portal.childrenLabel")}</label>
                <select className="h-[64px] w-full rounded-[10px] border border-[#d7dce2] bg-white px-5 text-[1.05rem] text-brand-primary outline-none">
                  <option>{t("portal.selectOption")}</option>
                </select>
              </div>

              <div className="mt-4 border-t border-[#d2d3d5] pt-7">
                <div className="rounded-[18px] bg-white px-4 py-6 shadow-[0_8px_18px_rgba(0,0,0,0.17)]">
                  <div className="flex flex-wrap gap-3">
                    {categoryKeys.map((key, index) => (
                      <button
                        key={key}
                        type="button"
                        className={`rounded-[10px] border px-4 py-3 text-[0.98rem] transition ${
                          index === 0
                            ? "border-[#1f5d9f] bg-[#1f5d9f] text-white"
                            : "border-[#2a66a9] bg-white text-[#1f5d9f] hover:bg-slate-50"
                        }`}
                      >
                        {t(key)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-7 rounded-[18px] bg-white px-4 py-7 shadow-[0_8px_18px_rgba(0,0,0,0.17)]">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <label className="min-w-[238px] text-[1.02rem] font-medium text-brand-primary">{t("portal.searchLabel")}</label>
                    <div className="relative w-full max-w-[366px]">
                      <input
                        type="text"
                        readOnly
                        placeholder={t("portal.searchPlaceholder")}
                        className="h-[64px] w-full rounded-[10px] border border-[#d7dce2] bg-white px-5 pr-14 text-[1.02rem] outline-none"
                      />
                      <Search className="absolute right-5 top-1/2 h-7 w-7 -translate-y-1/2 text-[#8b95a3]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <article
                  role="button"
                  tabIndex={0}
                  onClick={openVitaKidPage}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openVitaKidPage();
                    }
                  }}
                  className="cursor-pointer rounded-[18px] bg-white px-5 py-5 shadow-[0_8px_20px_rgba(0,0,0,0.18)] ring-2 ring-brand-teal/30"
                >
                  <h2 className="text-[1rem] font-semibold leading-[1.25] text-[#1f5d9f]">{featuredCard.title}</h2>
                  <p className="mt-7 text-[0.99rem] leading-[1.9] text-brand-primary">{featuredCard.description}</p>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm text-[#6f7683]">{t("portal.featuredService")}</span>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        openVitaKidPage();
                      }}
                      className="inline-flex items-center gap-2 rounded-md bg-brand-teal px-4 py-2 text-sm font-semibold text-white"
                    >
                      {t("portal.serviceCardHint")}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </article>

                <div className="mt-10 grid gap-8 md:grid-cols-2">
                  {listCards.map((card) => (
                    <article
                      key={card.id}
                      className="rounded-[18px] bg-white px-5 py-5 shadow-[0_8px_20px_rgba(0,0,0,0.18)]"
                    >
                      <h2 className="text-[1rem] font-semibold leading-[1.25] text-[#1f5d9f]">{card.title}</h2>
                      <p className="mt-7 text-[0.99rem] leading-[1.9] text-brand-primary">{card.description}</p>
                      <div className="mt-6 flex items-center justify-between gap-3">
                        <span className="text-sm text-[#6f7683]">{t("portal.serviceCardHint")}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <PortalFooter />
      <ScrollTopButton />
    </div>
  );
}

function PortalFooter() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-[#d4d6d9] bg-white">
      <div className="mx-auto grid max-w-[1238px] gap-10 px-4 py-10 md:grid-cols-[1.2fr,0.7fr,0.8fr,0.95fr] md:px-6">
        <div className="space-y-5 text-[#6f7683]">
          <div className="flex items-center gap-8">
            <ShieldMark />
            <AshiMark />
          </div>
          <div className="space-y-2 text-sm leading-7">
            <p>{t("portal.footer.projectBy")}</p>
            <p>{t("portal.footer.agency")}</p>
            <p>{t("portal.footer.government")}</p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-[#6f7683]">
          <p className="text-[1.02rem] text-brand-secondary">{t("portal.footer.about")}</p>
          <p>{t("portal.footer.privacy")}</p>
          <p>{t("portal.footer.accessibility")}</p>
        </div>

        <div className="space-y-4">
          <p className="text-[1.02rem] text-brand-secondary">{t("portal.footer.alsoOn")}</p>
          <StoreBadge label="Google Play" subtitle="GET IT ON" />
          <StoreBadge label="App Store" subtitle="Download on the" />
        </div>

        <div className="space-y-4 text-[#6f7683]">
          <p className="text-[1.02rem] text-brand-secondary">{t("portal.footer.followUs")}</p>
          <div className="flex items-center gap-3 text-black">
            <SocialBadge label="f" />
            <SocialBadge label="X" />
            <SocialBadge icon={<Instagram className="h-5 w-5" />} />
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-black" />
              <span>{t("portal.footer.callCenter")}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPinHouse className="h-5 w-5 text-black" />
              <span>{t("portal.footer.altPhone")}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-black" />
              <span>{t("portal.footer.email")}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function StoreBadge({ subtitle, label }) {
  return (
    <div className="inline-flex h-[50px] w-[150px] items-center gap-3 rounded-md bg-black px-4 text-white shadow-sm">
      <div className="h-6 w-6 rounded-sm bg-white/90" />
      <div>
        <p className="text-[0.56rem] uppercase tracking-[0.08em] text-white/75">{subtitle}</p>
        <p className="text-lg font-semibold leading-none">{label}</p>
      </div>
    </div>
  );
}

function SocialBadge({ label, icon }) {
  return (
    <div className="inline-flex h-8 w-8 items-center justify-center rounded-sm bg-black text-sm font-semibold text-white">
      {icon ?? label}
    </div>
  );
}

function ShieldMark() {
  return (
    <svg viewBox="0 0 74 84" className="h-[54px] w-auto" aria-hidden="true">
      <path d="M37 2 68 13v26c0 20-15 32-31 41C21 71 6 59 6 39V13L37 2Z" fill="#1f5d9f" />
      <path d="M37 10 60 18v20c0 14-10 23-23 31-13-8-23-17-23-31V18l23-8Z" fill="#f5c542" />
      <path d="M37 18 43 30h13l-10 8 4 12-10-7-10 7 4-12-10-8h13Z" fill="#1f5d9f" />
    </svg>
  );
}

function AshiMark() {
  return (
    <svg viewBox="0 0 110 56" className="h-[54px] w-auto" aria-hidden="true">
      <path
        d="M19 28c0-5.2 4.2-9.4 9.4-9.4.8 0 1.6.1 2.4.3 1.4-4.5 5.6-7.8 10.6-7.8 5.8 0 10.8 4.5 11.2 10.2 4.8.3 8.7 4.3 8.7 9.2 0 5.2-4.2 9.4-9.4 9.4H28.7C23.4 39.9 19 35.4 19 30.1c0-.7.1-1.4.3-2.1Z"
        fill="#2c65a8"
      />
      <text x="0" y="50" fontSize="26" fontWeight="700" fill="#2f3542" fontFamily="Segoe UI, sans-serif">
        ASHI
      </text>
    </svg>
  );
}

function ScrollTopButton() {
  function handleClick() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="fixed bottom-7 right-6 z-20 inline-flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#1f5d9f] text-white shadow-[0_10px_24px_rgba(31,93,159,0.35)] transition hover:bg-[#184d85]"
      aria-label="Back to top"
    >
      <ArrowUp className="h-6 w-6" />
    </button>
  );
}
