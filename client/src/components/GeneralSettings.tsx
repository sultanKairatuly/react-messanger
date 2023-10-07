import { observer } from "mobx-react";
import "../styles/general.css";
import GeneralSettingsHeader from "./GeneralSettingsHeader";
import GeneralSettingsSection from "./GeneralSettingsSection";
import ChatWallpaper from "./ChatWallpaper";
import store from "../store/store";

const GeneralSettings = observer(() => {
  const allFalsy = !store.chatWallpaper;
  return (
    <div className="general_settings_container">
      {allFalsy && (
        <div>
          <GeneralSettingsHeader />
          <GeneralSettingsSection />
        </div>
      )}
      <ChatWallpaper />
    </div>
  );
});

export default GeneralSettings;
