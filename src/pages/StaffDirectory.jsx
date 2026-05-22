import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, Search, SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import StaffCard from "../components/StaffCard";
import { useToast } from "../hooks/useToast";
import { useTranslation } from "../hooks/useTranslation";
import { getStaffDirectoryRecords } from "../lib/demoDb";
import { AVAILABILITY_FILTERS, STAFF_SPECIALISATIONS } from "../lib/medicalData";
import { buildAppPath } from "../lib/routes";

export default function StaffDirectory() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { push } = useToast();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    specialisation: "all",
    availability: "all",
  });

  useEffect(() => {
    async function loadDirectory() {
      setLoading(true);
      try {
        const records = await getStaffDirectoryRecords();
        setStaff(records);
      } catch (error) {
        push(t("staff.loadError"), "error");
      } finally {
        setLoading(false);
      }
    }

    loadDirectory();
  }, [push, t]);

  const filteredStaff = useMemo(() => {
    return staff.filter((member) => {
      const matchesSearch = filters.search
        ? member.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          member.email.toLowerCase().includes(filters.search.toLowerCase())
        : true;
      const matchesSpecialisation =
        filters.specialisation === "all" ? true : member.specialisation === filters.specialisation;
      const matchesAvailability =
        filters.availability === "all"
          ? true
          : filters.availability === "available"
            ? member.isAvailable
            : !member.isAvailable;

      return matchesSearch && matchesSpecialisation && matchesAvailability;
    });
  }, [filters, staff]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-teal">{t("staff.directoryTitle")}</p>
        <h1 className="mt-2 text-3xl font-semibold text-brand-primary">{t("staff.directoryTitle")}</h1>
        <p className="mt-2 text-sm text-brand-secondary">{t("staff.directorySubtitle")}</p>
      </div>

      <section className="panel-card rounded-xl p-5">
        <div className="flex items-center gap-2 text-brand-teal">
          <SlidersHorizontal className="h-5 w-5" />
          <h2 className="text-lg font-semibold text-brand-primary">{t("staff.filtersTitle")}</h2>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr,0.9fr,0.9fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              placeholder={t("staff.searchPlaceholder")}
              className="field-shell w-full py-3 pl-11 pr-4 outline-none focus:border-brand-teal"
            />
          </div>
          <select
            value={filters.specialisation}
            onChange={(event) => setFilters((current) => ({ ...current, specialisation: event.target.value }))}
            className="field-shell w-full px-4 py-3 outline-none focus:border-brand-teal"
          >
            <option value="all">{t("common.all")}</option>
            {STAFF_SPECIALISATIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.key)}
              </option>
            ))}
          </select>
          <select
            value={filters.availability}
            onChange={(event) => setFilters((current) => ({ ...current, availability: event.target.value }))}
            className="field-shell w-full px-4 py-3 outline-none focus:border-brand-teal"
          >
            {AVAILABILITY_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.key)}
              </option>
            ))}
          </select>
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center py-16">
          <LoaderCircle className="h-8 w-8 animate-spin text-brand-teal" />
        </div>
      ) : filteredStaff.length ? (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredStaff.map((member) => (
            <StaffCard
              key={member.uid}
              staff={member}
              t={t}
              action={
                member.isCurrentUser ? (
                  <button
                    type="button"
                    onClick={() => navigate(buildAppPath("/staff-profile"))}
                    className="rounded-lg bg-brand-navy px-4 py-2 text-sm font-semibold text-white"
                  >
                    {t("common.edit")}
                  </button>
                ) : null
              }
            />
          ))}
        </section>
      ) : (
        <EmptyState title={t("staff.noDirectoryResults")} description={t("staff.tryDifferentFilters")} />
      )}
    </div>
  );
}
