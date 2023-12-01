import SettingsOptionsList from "./SettingsOptionsList";
import {
  Dispatch,
  SetStateAction,
  useContext,
  useMemo,
  memo,
  useState,
  useEffect,
} from "react";
import UserAvatar from "./UserAvatar";
import GroupInfoHeader from "./GroupInfoHeader";
import "../styles/userInfo.css";
import { ChatPageContext } from "./ChatPage";
import { User, groupChatPredicate, userPredicate } from "../types";
import $api from "../api";
import ChatItem from "./ChatItem";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

type GroupInfoProps = {
  style: Record<string, unknown>;
  setIsUserInfo: Dispatch<SetStateAction<boolean>>;
};

const GroupInfo = memo(function GroupInfo({
  setIsUserInfo,
  style,
}: GroupInfoProps) {
  const { t } = useTranslation();
  const { chat } = useContext(ChatPageContext);
  const [members, setMembers] = useState<
    (User & { role: "member" | "admin" })[]
  >([]);
  const navigate = useNavigate();
  const userInfoOptions = useMemo(
    () => [
      {
        title: chat.bio || t("noBio"),
        icon: "fa-solid fa-circle-info",
        description: t("Info"),
        action() {},
      },
    ],
    [chat]
  );

  useEffect(() => {
    async function fetchMembers() {
      if (groupChatPredicate(chat)) {
        const stringifiedChats = JSON.stringify(chat.members);
        const { data } = await $api(
          `/get-members?membersId=${stringifiedChats}`
        );
        if (data.length && userPredicate(data[0])) {
          setMembers(data);
        }
      }
    }
    fetchMembers();
  }, [chat]);

  return (
    <div className="user_info_container" style={style}>
      <GroupInfoHeader setIsUserInfo={setIsUserInfo} />
      <div className="user_info_body">
        <div className="user_info_avatar_wrapper">
          <UserAvatar
            url={chat.avatar}
            name={chat.name}
            color={chat.randomColor}
            fontSize="12rem"
          />
        </div>
        {chat.name !== "Saved Messages" ? (
          <>
            <SettingsOptionsList options={userInfoOptions} />
            <h1
              className="members_title"
              style={{ textTransform: "capitalize" }}
            >
              {t("members")}
            </h1>
            <div className="group_info_members">
              {groupChatPredicate(chat) &&
                members.map((member) => (
                  <div
                    className="member"
                    onClick={() => navigate(`/a/${member.userId}`)}
                  >
                    <ChatItem chat={member} topRightText={t(member.role)} />
                  </div>
                ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
});

export default GroupInfo;
