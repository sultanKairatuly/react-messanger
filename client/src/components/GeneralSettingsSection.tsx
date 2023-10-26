import { observer } from "mobx-react";
import "../styles/generalSection.css";
import AppRange from "./AppRange";
import SettingsOption from "./SettingsOptions";
import AppCheckbox from "./AppCheckbox";
import store from "../store/store";

const GeneralSettingsSection = observer(() => {
  const option = {
    title: "Chat Wallpaper",
    icon: "fa-solid fa-image",
    action() {
      store.chatWallpaper = true;
    },
  };

  return (
    <div className="general_settings_section">
      <div className="general_settings_section_container">
        <div className="general_settings_section_title">Settings</div>
        <AppRange
          title="Message Text Size"
          min={12}
          max={19}
          value={store.messageSize}
          onChange={(value) => {
            store.messageSize = Number(value);
          }}
          step={1}
        />
        <SettingsOption option={option} />
      </div>
      <div className="general_settings_section_container">
        <div className="general_settings_section_title">Theme</div>
        <AppCheckbox
          handleClick={() => {
            store.theme = "light";
          }}
          title="Light"
          checked={store.theme === "light"}
        />
        <AppCheckbox
          handleClick={() => {
            store.theme = "dark";
          }}
          title="Dark"
          checked={store.theme === "dark"}
        />
      </div>
      <div className="general_settings_section_container">
        <div className="general_settings_section_title">Time Format</div>
        <AppCheckbox
          handleClick={() => {
            store.timeFormat = 12;
            localStorage.setItem("timeFormat", "12");
          }}
          title="12-hour"
          checked={store.timeFormat === 12}
        />
        <AppCheckbox
          handleClick={() => {
            store.timeFormat = 24;
            localStorage.setItem("timeFormat", "24");
          }}
          title="24-hour"
          checked={store.timeFormat === 24}
        />
      </div>
      <div className="general_settings_section_container">
        <div className="general_settings_section_title">Keyboard</div>
        <AppCheckbox
          handleClick={() => {
            store.sendMode = "ctrl";
            localStorage.setItem("sendMode", "ctrl");
          }}
          title="Send With Ctrl + Enter"
          checked={store.sendMode === "ctrl"}
        />
        <AppCheckbox
          handleClick={() => {
            store.sendMode = "enter";
            localStorage.setItem("sendMode", "enter");
          }}
          title="Send With Enter"
          checked={store.sendMode === "enter"}
        />
      </div>
    </div>
  );
});

export default GeneralSettingsSection;
