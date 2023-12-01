import store from "../store/store";
import { SettingsOptionType } from "../types";
import SettingsOptionsList from "./SettingsOptionsList";
import { useTranslation } from "react-i18next";

function SettingsControls() {
  const { t } = useTranslation()
  const settingsControlsOptions: SettingsOptionType[] = [
    {
      title: t("General Settings"),
      icon: "fa-solid fa-gear",
      action() {
        store.resetAll();
        store.generalSettings = true;
      },
    },
    {
      title: t("Notifications"),
      icon: "fa-regular fa-bell",
      action() {
        store.resetAll();
        store.notification = true;
      },
    },
    {
      title: t("Privacy and Security"),
      icon: "fa-solid fa-lock",
      action() {
        store.resetAll();
        store.privacyAndSecurity = true;
      },
    },
    {
      title: t("language"),
      icon: "fa-solid fa-earth-africa",
      action() {
        store.resetAll();
        store.language = true;
      },
    },
    {
      title: t("FAQ"),
      icon: "fa-solid fa-question",
      action() {
        store.resetAll();
        store.faq = true;
      },
    },
  ];
  return (
    <div className="settings_controls_container">
      <SettingsOptionsList options={settingsControlsOptions} />
    </div>
  );
}

export default SettingsControls;
