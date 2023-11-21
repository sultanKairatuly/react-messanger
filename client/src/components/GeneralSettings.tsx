import { observer } from "mobx-react";
import "../styles/general.css";
import GeneralSettingsSection from "./GeneralSettingsSection";
import ChatWallpaper from "./ChatWallpaper";
import store from "../store/store";
import PageHeader from "./PageHeader";

const GeneralSettings = observer(() => {
  const allFalsy = !store.chatWallpaper;
  return (
    <div className="general_settings_container">
      {allFalsy && (
        <div>
          <PageHeader
            title="General Settings"
            handleBackClick={() => (store.generalSettings = false)}
          />
          <GeneralSettingsSection />
        </div>
      )}
      {store.chatWallpaper && <ChatWallpaper />}
    </div>
  );
});

export default GeneralSettings;
