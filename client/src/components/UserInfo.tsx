import { observer } from "mobx-react";
import "../styles/userInfo.css";
import UserInfoHeader from "./UserInfoHeader";
import { Dispatch, SetStateAction, useContext, useMemo } from "react";
import { ChatPageContext } from "./ChatPage";
import UserAvatar from "./UserAvatar";
import SettingsOptionsList from "./SettingsOptionsList";
import store from "../store/store";
import { useTranslation } from "react-i18next";

type UserInfo = {
  setIsUserInfo: Dispatch<SetStateAction<boolean>>;
  style: Record<string, unknown>;
};
const UserInfo = observer(function UserInfo({
  setIsUserInfo,
  style,
}: UserInfo) {
  const { t, i18n } = useTranslation();
  const { chat } = useContext(ChatPageContext);
  const userInfoOptions = useMemo(() => {
    const bioOption = {
      title: chat.bio,
      icon: "fa-solid fa-circle-info",
      description: t("Info"),
      action() {},
    };
    if (chat.type === "contact") {
      const chatOptions = [
        {
          title: chat.email ?? "Uknown",
          icon: "fa-solid fa-envelope",
          description: "Email",
          action() {
            navigator.clipboard.writeText(chat.email || "").then(() => {
              store.setNotificationMessage("Email is copied!");
            });
          },
        },
        {
          title: chat.userId ?? "Uknown",
          icon: "fa-solid fa-user",
          description: t("userId"),
          action() {
            navigator.clipboard.writeText(store.user?.userId || "").then(() => {
              store.setNotificationMessage("User ID is copied!");
            });
          },
        },
      ];
      if (chat.bio.length > 0) {
        chatOptions.push(bioOption);
      }
      return chatOptions;
    } else {
      return [bioOption];
    }
  }, [chat, i18n.language]);
  return (
    <div className="user_info_container" style={style}>
      <UserInfoHeader setIsUserInfo={setIsUserInfo} />
      <div className="user_info_body">
        <div className="user_info_avatar_wrapper">
          <UserAvatar
            url={chat.avatar}
            name={chat.name}
            color={chat.randomColor}
          />
        </div>
        <SettingsOptionsList options={userInfoOptions} />
      </div>
    </div>
  );
});

export default UserInfo;
