import "../styles/settings.css";
import store from "../store/store";
import { observer } from "mobx-react";
import GeneralSettings from "./GeneralSettings";
import SettingsMain from "./SettingsMain";
import EditProfile from "./EditProfile";
import Language from "./Language";

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
      {store.language && <Language />}
    </div>
  );
});

export default Settings;
