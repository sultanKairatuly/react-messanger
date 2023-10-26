import "../styles/settings.css";
import store from "../store/store";
import { observer } from "mobx-react";
import GeneralSettings from "./GeneralSettings";
import SettingsMain from "./SettingsMain";
import EditProfile from "./EditProfile";

const Settings = observer(function Settings() {
  const allFalsy =
    !store.notification &&
    !store.askQuestion &&
    !store.language &&
    !store.privacyAndSecurity &&
    !store.faq &&
    !store.generalSettings &&
    !store.edit;

  return (
    <div>
      {allFalsy && <SettingsMain />}
      {store.generalSettings && <GeneralSettings />}
      {store.edit && <EditProfile />}
    </div>
  );
});

export default Settings;
