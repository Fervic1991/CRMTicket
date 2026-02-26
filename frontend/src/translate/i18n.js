import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import { messages } from "./languages";

// Obtém o idioma salvo e normaliza para códigos simples (ex: pt-BR -> pt)
const normalizeLang = (lang) => (lang ? lang.split("-")[0] : "");
const savedLang = normalizeLang(localStorage.getItem('i18nextLng'));

i18n.use(LanguageDetector).init({
	debug: false,
	defaultNS: ["translations"],
	fallbackLng: savedLang || "pt", // Usa o idioma salvo como fallback
	ns: ["translations"],
	supportedLngs: ["pt", "en", "es", "it", "ar", "tr"],
	nonExplicitSupportedLngs: true,
	resources: messages,
	detection: {
		order: ['localStorage', 'navigator'], // Prioriza localStorage
		caches: ['localStorage'],
		lookupLocalStorage: 'i18nextLng',
	},
});

export { i18n };
