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
import { User, groupChatPredicate, userPredicate, Member } from "../types";
import $api from "../api";
import ChatItem from "./ChatItem";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import store from "../store/store";
import PunishMenu from "./PunishMenu";

type GroupInfoProps = {
  style: Record<string, unknown>;
  setIsGroupInfo: Dispatch<SetStateAction<boolean>>;
};

const GroupInfo = memo(function GroupInfo({
  setIsGroupInfo,
  style,
}: GroupInfoProps) {
  const { t } = useTranslation();

  const banTimes = [
    {
      value: 1,
      title: t("1day"),
    },
    {
      value: 3,
      title: t("3days"),
    },
    {
      value: 7,
      title: t("1week"),
    },
    {
      value: 14,
      title: t("2weeks"),
    },
    {
      value: 30,
      title: t("1month"),
    },
    {
      value: Infinity,
      title: t("Forever"),
    },
  ];

  const { chat } = useContext(ChatPageContext);
  const [members, setMembers] = useState<(User & Member)[]>([]);
  const [activeAdminMenu, setActiveAdminMenu] = useState("");
  const navigate = useNavigate();
  const [isBanMenu, setIsBanMenu] = useState(false);
  const [banTime, setBanTime] = useState(1);

  const [isMuteMenu, setIsMuteMenu] = useState(false);
  const [muteTime, setMuteTime] = useState(1);

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
  return groupChatPredicate(chat) ? (
    <div className="user_info_container" style={style}>
      <PunishMenu
        punish={() => {
          $api.post(`/ban-user?userId=${
            members.find((m) => m.id === activeAdminMenu)?.userId
          }&chatId=${chat.chatId}&time=${banTime}
      `);
          setActiveAdminMenu("");
        }}
        setIsMenu={setIsBanMenu}
        isMenu={isBanMenu}
        punishTime={banTime}
        setTime={setBanTime}
        punishmentType="ban"
        member={members.find((m) => m.id === activeAdminMenu)}
        options={banTimes}
      />
      <PunishMenu
        setIsMenu={setIsMuteMenu}
        punish={() => {
          $api.post(`/mute-user-group?userId=${
            members.find((m) => m.id === activeAdminMenu)?.userId
          }&chatId=${chat.chatId}&time=${muteTime}
        
      `);
          setActiveAdminMenu("");
        }}
        isMenu={isMuteMenu}
        punishTime={muteTime}
        setTime={setMuteTime}
        punishmentType="mute"
        member={members.find((m) => m.id === activeAdminMenu)}
        options={banTimes}
      />
      <GroupInfoHeader setIsGroupInfo={setIsGroupInfo} />
      <div className="user_info_body">
        <div className="user_info_avatar_wrapper">
          <UserAvatar
            url={chat.avatar}
            name={chat.name}
            color={chat.randomColor}
            userId={chat.chatId}
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
                members
                  .filter((member) => !member.banned.value)
                  .map((member) => (
                    <div
                      className="member"
                      onClick={() => {
                        setIsGroupInfo(false);
                        navigate(`/a/${member.userId}`);
                      }}
                    >
                      {member.userId !== store.user?.userId &&
                        members.find((m) => m.userId === store.user?.userId)
                          ?.role === "admin" && (
                          <div
                            className="ellipsis_btn"
                            onClick={(e) => {
                              e.stopPropagation();

                              activeAdminMenu === member.id
                                ? setActiveAdminMenu("")
                                : setActiveAdminMenu(member.id);
                            }}
                          >
                            <i className="fa-solid fa-ellipsis-vertical"></i>
                          </div>
                        )}
                      {activeAdminMenu === member.id &&
                        member.userId !== store.user?.userId &&
                        (member.role === "member" ? (
                          <div className="admin_menu">
                            <div
                              className="admin_menu_item"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsBanMenu(true);
                              }}
                            >
                              {t("Ban")}
                            </div>
                            {members.find((m) => m.userId === member?.userId)
                              ?.muted.value ? (
                              <div
                                className="admin_menu_item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  $api.post(
                                    `/unmute-user-group?userId=${member.userId}&chatId=${chat.chatId}`
                                  );
                                  setActiveAdminMenu("");
                                }}
                              >
                                {t("unmute")}
                              </div>
                            ) : (
                              <div
                                className="admin_menu_item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsMuteMenu(true);
                                }}
                              >
                                {t("Mute")}
                              </div>
                            )}
                            <div
                              className="admin_menu_item"
                              onClick={(e) => {
                                e.stopPropagation();
                                $api.post(
                                  `/give-admin?to=${member.userId}&chatId=${chat.chatId}`
                                );
                                setActiveAdminMenu("");
                              }}
                            >
                              {t("giveAdmin")}
                            </div>
                          </div>
                        ) : (
                          <div className="admin_menu">
                            <div
                              className="admin_menu_item"
                              onClick={(e) => {
                                e.stopPropagation();
                                $api.post(
                                  `/take-admin?from=${member.userId}&chatId=${chat.chatId}`
                                );
                                setActiveAdminMenu("");
                              }}
                            >
                              {t("takeAdmin")}
                            </div>
                          </div>
                        ))}
                      <ChatItem chat={member} topRightText={t(member.role)} />
                    </div>
                  ))}
            </div>
            {members.filter((m) => m.banned.value).length > 0 &&
              members.find((m) => m.userId === store.user?.userId)?.role ===
                "admin" &&
              groupChatPredicate(chat) && (
                <div>
                  <h1 className="members_title">{t("banneds")}</h1>
                  <div className="group_info_members">
                    {groupChatPredicate(chat) &&
                      members
                        .filter((member) => member.banned.value)
                        .map((member) => (
                          <div
                            className="member"
                            onClick={() => {
                              setIsGroupInfo(false);
                              navigate(`/a/${member.userId}`);
                            }}
                          >
                            {member.userId !== store.user?.userId && (
                              <div
                                className="ellipsis_btn"
                                onClick={(e) => {
                                  e.stopPropagation();

                                  activeAdminMenu === member.id
                                    ? setActiveAdminMenu("")
                                    : setActiveAdminMenu(member.id);
                                }}
                              >
                                <i className="fa-solid fa-ellipsis-vertical"></i>
                              </div>
                            )}
                            {activeAdminMenu === member.id &&
                              member.userId !== store.user?.userId &&
                              (member.role === "member" ? (
                                <div className="admin_menu">
                                  <div
                                    className="admin_menu_item"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      $api.post(
                                        `/unban-user?userId=${member.userId}&chatId=${chat.chatId}`
                                      );
                                      setActiveAdminMenu("");
                                    }}
                                  >
                                    {t("unban")}
                                  </div>
                                </div>
                              ) : (
                                <div className="admin_menu">
                                  <div
                                    className="admin_menu_item"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      $api.post(
                                        `/take-admin?from=${member.userId}&chatId=${chat.chatId}`
                                      );
                                      setActiveAdminMenu("");
                                    }}
                                  >
                                    {t("takeAdmin")}
                                  </div>
                                </div>
                              ))}
                            <ChatItem
                              chat={member}
                              topRightText={t(member.role)}
                            />
                          </div>
                        ))}
                  </div>
                </div>
              )}
          </>
        ) : null}
      </div>
    </div>
  ) : null;
});

export default GroupInfo;
