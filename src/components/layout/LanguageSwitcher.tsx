"use client";

import { useState, useEffect } from "react";
import { Languages } from "lucide-react";

type Language = "ar" | "en";

export function LanguageSwitcher() {
  const [lang, setLang] = useState<Language>("ar");

  useEffect(() => {
    const savedLang = localStorage.getItem("language") as Language | null;
    if (savedLang) {
      setLang(savedLang);
      updateDocumentDirection(savedLang);
    }
  }, []);

  const updateDocumentDirection = (language: Language) => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
      document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
      document.body.className = document.body.className.replace(
        /(rtl|ltr)/g,
        language === "ar" ? "rtl" : "ltr"
      );
      if (language === "ar") {
        document.body.classList.add("rtl");
        document.body.classList.remove("ltr");
      } else {
        document.body.classList.add("ltr");
        document.body.classList.remove("rtl");
      }
    }
  };

  const toggleLanguage = () => {
    const newLang = lang === "ar" ? "en" : "ar";
    setLang(newLang);
    localStorage.setItem("language", newLang);
    updateDocumentDirection(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Switch language"
    >
      <Languages className="w-5 h-5" />
      <span className="font-medium">{lang === "ar" ? "English" : "العربية"}</span>
    </button>
  );
}
