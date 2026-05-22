import { createContext, useContext, useEffect, useMemo, useState } from "react";
import al from "../i18n/al";
import en from "../i18n/en";
import sr from "../i18n/sr";

const TranslationContext = createContext(null);

const dictionaries = { al, sr, en };

function readInitialLanguage() {
  const saved = localStorage.getItem("vitakid-language");
  if (saved === "en") return "al";
  return saved && dictionaries[saved] ? saved : "al";
}

function lookup(obj, path) {
  return path.split(".").reduce((value, key) => value?.[key], obj) ?? path;
}

export function TranslationProvider({ children }) {
  const [language, setLanguage] = useState(readInitialLanguage);

  useEffect(() => {
    localStorage.setItem("vitakid-language", language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key, params = {}) => {
        const template = lookup(dictionaries[language], key);
        return Object.entries(params).reduce(
          (output, [paramKey, paramValue]) => output.replace(`{${paramKey}}`, paramValue),
          template,
        );
      },
    }),
    [language],
  );

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
}

export function useTranslation() {
  const context = useContext(TranslationContext);

  if (!context) {
    throw new Error("useTranslation must be used within TranslationProvider");
  }

  return context;
}
