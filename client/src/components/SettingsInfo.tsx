import { observer } from "mobx-react";
import { SettingsOptionType } from "../types";
import store from "../store/store";
import SettingsOptionsList from "./SettingsOptionsList";
import UserAvatar from "./UserAvatar";
const SettingsInfo = observer(function () {
  const settingsOptions: SettingsOptionType[] = [
    {
      title: store.user?.email ?? "Uknown",
      icon: "fa-regular fa-envelope",
      description: "Your email",
      action() {
        navigator.clipboard.writeText(store.user?.email || "").then(() => {
          store.setNotificationMessage("Email is copied!");
        });
      },
    },
    {
      title: store.user?.userId ?? "Uknown",
      icon: "fa-regular fa-user",
      description: "User ID",
      action() {
        navigator.clipboard.writeText(store.user?.userId || "").then(() => {
          store.setNotificationMessage("User ID is copied!");
        });
      },
    },
  ];
  return (
    <div className="settings_info_container">
      <div className="settings_container_avatar-wrapper">
        <UserAvatar fontSize="14rem" />
        <div className="settings_container_avatar_name">{store.user?.name}</div>
      </div>
      <SettingsOptionsList options={settingsOptions} />
    </div>
  );
});

export default SettingsInfo;
