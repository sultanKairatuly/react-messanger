import store from "../store/store";
import { SettingsOptionType } from "../types";
import SettingsOptionsList from "./SettingsOptionsList";

function SettingsControls() {
  const settingsControlsOptions: SettingsOptionType[] = [
    {
      title: "General Settings",
      icon: "fa-solid fa-gear",
      action() {
        store.resetAll();
        store.generalSettings = true;
      },
    },
    {
      title: "Notification",
      icon: "fa-regular fa-bell",
      action() {
        store.resetAll();
        store.notification = true;
      },
    },
    {
      title: "Privacy and Security",
      icon: "fa-solid fa-lock",
      action() {
        store.resetAll();
        store.privacyAndSecurity = true;
      },
    },
    {
      title: "Language",
      icon: "fa-solid fa-earth-africa",
      action() {
        store.resetAll();
        store.language = true;
      },
    },
    {
      title: "FAQ",
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
