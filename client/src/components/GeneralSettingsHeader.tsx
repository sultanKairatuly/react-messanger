import { observer } from "mobx-react";
import store from "../store/store";

const GeneralSettingsHeader = observer(() => {
  return (
    <div className="general_settings_header">
      <div className="general_settings_header_head">
        <button
          className="back general_settings_header_button"
          onClick={() => (store.generalSettings = false)}
        >
          <i className="fa-solid fa-left-long general_settings_header-icon"></i>
        </button>
        <h1 className="general_settings_title">General Settings</h1>
      </div>
    </div>
  );
});

export default GeneralSettingsHeader;
