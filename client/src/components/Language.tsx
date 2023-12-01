import store from "../store/store";
import "../styles/language.css";
import AppCheckbox from "./AppCheckbox";
import PageHeader from "./PageHeader";
import { useTranslation } from "react-i18next";
type LanguageType = {
  title: string;
  enTitle: string;
  locale: string;
};

const languages: LanguageType[] = [
  {
    title: "Русский",
    enTitle: "Russian",
    locale: "ru",
  },
  {
    title: "English",
    enTitle: "English",
    locale: "en",
  },
];

function Language() {
  const { i18n, t } = useTranslation();

  return (
    <div className="language_container">
      <PageHeader
        handleBackClick={() => (store.language = false)}
        title={t("language")}
      />
      <div className="languages_list">
        {languages.map((l) => (
          <div>
            <AppCheckbox
              handleClick={() => {
                i18n.changeLanguage(l.locale);
                localStorage.setItem("locale", l.locale);
              }}
              checked={i18n.language === l.locale}
              title={l.title}
              description={l.enTitle}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Language;
