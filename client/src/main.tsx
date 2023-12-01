import ReactDOM from "react-dom/client";
import router from "./router/router";
import { RouterProvider } from "react-router-dom";
import "./styles/global.css";
import { configure } from "mobx";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translations from "./assets/translations.json";

const localLocale = localStorage.getItem("locale");
i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    // the translations
    // (tip move them in a JSON file and import them,
    // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
    resources: translations,
    lng: localLocale || "en", // if you're using a language detector, do not define the lng option
    fallbackLng: "en",

    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
  });

configure({
  enforceActions: "never",
});
ReactDOM.createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
