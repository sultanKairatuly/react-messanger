import { Chat, GrayMenuItemType, Message, userPredicate, User } from "../types";
import { ChatPageContext } from "./ChatPage";
import {
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
  Dispatch,
  useRef,
  SetStateAction,
} from "react";
import GrayMenu from "./GrayMenu";
import { v4 as uuidv4 } from "uuid";
import $api from "../api";
import store from "../store/store";
import { observer } from "mobx-react";
import AppModal from "./AppModal";
import { useParams } from "react-router-dom";
import { socket } from "../socket";
import { defineUserStatus } from "../utils";
import UserAvatar from "./UserAvatar";
import ChatPageHeaderSearch from "./ChatPageHeaderSearch";
import { useTranslation } from "react-i18next";

type ChatPageHeadeProps = {
  chat: Chat;
  setIsUserInfo: Dispatch<SetStateAction<boolean>>;
  setSearchingPattern: Dispatch<SetStateAction<string>>;
};

const ChatPageHeader = observer(function ChatPageHeader({
  chat,
  setIsUserInfo,
}: ChatPageHeadeProps) {
  const [typing, setTyping] = useState<User[]>([]);
  const context = useContext(ChatPageContext);
  const [isMenu, setIsMenu] = useState(false);
  const [isDeleteModal, setIsDeleteMenu] = useState(false);
  const { chatId } = useParams();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const inputRef = useRef<null | HTMLInputElement>(null);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    setTimeout(() => {
      console.log(inputRef.current);
      inputRef.current?.focus();
    }, 1000);
    function handleWindowResize(e: UIEvent) {
      if (
        e.target &&
        "innerWidth" in e.target &&
        typeof e.target.innerWidth === "number"
      ) {
        setWindowWidth(e.target.innerWidth);
      }
    }

    window.addEventListener("resize", handleWindowResize);

    socket.on("typing", (data: unknown) => {
      if (userPredicate(data)) {
        const candidate = typing.find((i) => i.userId === data.userId);
        if (candidate) return;
        if (data.userId === chatId) {
          setTyping((pv) => [...pv, data]);
        }
      }
    });

    socket.on("stopped-typing", (data: unknown) => {
      if (userPredicate(data)) {
        if (data.userId === chatId) {
          setTyping((pv) => pv.filter((user) => user.userId !== data.userId));
        }
      }
    });

    return () => {
      socket.off("typing");
      socket.off("stopped-typing");
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);
  const firstItem = useMemo(() => {
    if (store.user?.blockedContacts.includes(context.chatId)) {
      return {
        title: t("unblockUser"),
        icon: "fa-regular fa-user",
        id: uuidv4(),
        action: async () => {
          const chatId = userPredicate(chat) ? chat.userId : chat.chatId;
          const response = await $api.post(
            `/unblock-user?blocked=${chatId}&blocker=${store.user?.userId}`
          );
          if (userPredicate(response.data)) {
            store.setUser(response.data);
          }
          setIsMenu(false);
          store.setNotificationMessage(`User ${chatId} was unblocked`);
        },
      };
    } else {
      return {
        title: t("blockUser"),
        icon: "fa-regular fa-hand",
        id: uuidv4(),
        action: async () => {
          const chatId = userPredicate(chat) ? chat.userId : chat.chatId;
          setIsMenu(false);
          const response = await $api.post(
            `/block-user?blocked=${chatId}&blocker=${store.user?.userId}`
          );
          if (userPredicate(response.data)) {
            store.setUser(response.data);
          }
          store.setNotificationMessage(`User ${chatId} was blocked`);
        },
      };
    }
  }, [store.user?.blockedContacts, i18n.language]);
  const secondItem = useMemo(() => {
    if (store.user?.mutedContacts.includes(context.chatId)) {
      return {
        title: t("unmute"),
        icon: "fa-regular fa-bell",
        id: uuidv4(),
        action: async () => {
          const chatId = userPredicate(chat) ? chat.userId : chat.chatId;
          setIsMenu(() => false);
          const response = await $api.post(
            `/unmute-user?muted=${chatId}&muter=${store.user?.userId}`
          );
          if (userPredicate(response.data)) {
            store.setUser(response.data);
          }
        },
      };
    } else {
      return {
        title: t("Mute"),
        icon: "fa-regular fa-bell-slash",
        id: uuidv4(),
        action: async () => {
          const chatId = userPredicate(chat) ? chat.userId : chat.chatId;
          setIsMenu(() => false);
          const response = await $api.post(
            `/mute-user?muted=${chatId}&muter=${store.user?.userId}`
          );
          if (userPredicate(response.data)) {
            store.setUser(response.data);
          }
        },
      };
    }
  }, [store.user?.mutedContacts, i18n.language]);
  const items: GrayMenuItemType[] = useMemo(
    () =>
      userPredicate(chat)
        ? [
            firstItem,
            secondItem,
            {
              title: t("videoCall"),
              icon: "fa-solid fa-video",
              id: uuidv4(),
              action: () => {},
            },
            {
              title: t("deleteChat"),
              icon: "fa-solid fa-trash",
              id: uuidv4(),
              action: async () => {
                setIsDeleteMenu(true);
              },
            },
          ]
        : [
            secondItem,
            {
              title: t("leaveChat"),
              icon: "fa-solid fa-person-walking-arrow-right",
              id: uuidv4(),
              action: async () => {
                if (store.user) {
                  store.user.chats = store.user.chats.filter(
                    (c) => c !== chat.chatId
                  );
                  const member = chat.members.find(
                    (u) => u.userId === store.user?.userId
                  );
                  if (member) {
                    await $api.post(
                      `/leave-group?chatId=${chat.chatId}&liver=${member.userId}&role=${member.role}`
                    );
                  }
                }
              },
            },
          ],
    [chat, i18n.language]
  );
  const deleteForMe = useCallback(
    async function () {
      $api.post(
        `/delete-for-user-only?userId=${store.user?.userId}&deletingId=${chatId}`
      );
      setIsDeleteMenu(false);
      setIsMenu(false);
      store.user &&
        (store.user.chats = store.user.chats.filter((c) => c !== chatId));
    },

    [chatId]
  );
  const deleteForBoth = useCallback(
    async function () {
      $api.post(
        `/delete-for-both?userId=${store.user?.userId}&deletingId=${chatId}`
      );
      setIsDeleteMenu(false);
      setIsMenu(false);
      store.user &&
        (store.user.chats = store.user.chats.filter((c) => c !== chatId));
    },
    [chatId]
  );

  return (
    <>
      {context.isSearchMessages && windowWidth < 500 ? (
        <ChatPageHeaderSearch />
      ) : (
        <div className="chat_page_header">
          <AppModal isModal={isDeleteModal} setModal={setIsDeleteMenu}>
            <div className="chat_page_delete_modal">
              <h4
                className="chat_page_delete_option"
                onClick={() => deleteForMe()}
              >
                {t("deleteOnlyForMe")}
              </h4>
              <h4
                className="chat_page_delete_option"
                onClick={() => deleteForBoth()}
              >
                {t("deleteAlso")} {chat.name}
              </h4>
              <h4
                className="chat_page_delete_option-blue chat_page_delete_option"
                onClick={() => setIsDeleteMenu(false)}
              >
                {t("cancel")}
              </h4>
            </div>
          </AppModal>
          <div className="chat_page_header_head">
            <button
              onClick={() => (store.isSidebar = !store.isSidebar)}
              className={
                (store.isSidebar
                  ? "sidebar_control_btn_active"
                  : "sidebar_control_btn_inactive") + " sidebar_control_btn"
              }
              style={{
                display: windowWidth < 1024 ? "flex" : "none",
              }}
            >
              <span className="sidebar_control_btn_bar"></span>
              <span className="sidebar_control_btn_bar"></span>
              <span className="sidebar_control_btn_bar"></span>
            </button>
            <div
              className="clickable_header"
              onClick={() => {
                setIsUserInfo(true);
                context.setIsSearchMessages(false);
              }}
            >
              <div className="avatar_double">
                <div className="chat_page_header_avatar_wrapper">
                  <UserAvatar
                    url={chat.avatar}
                    name={chat.name}
                    color={chat.randomColor}
                  />
                </div>
                {userPredicate(chat) && chat.lastSeen === 0 && (
                  <div className="online-point"></div>
                )}
              </div>
              <div className="chat_page_header_text">
                <h2 className="chat_page_header_title">
                  {chat.name === "Saved Messages"
                    ? t("Saved Messages")
                    : chat.name}
                </h2>
                {!typing.length && chat.name !== "Saved Messages" && (
                  <div
                    className={
                      userPredicate(chat) && chat.lastSeen === 0 ? "online" : ""
                    }
                  >
                    {userPredicate(chat)
                      ? defineUserStatus(chat.lastSeen)
                      : `${chat.members.length} ${t("membersInGroup")}`}
                  </div>
                )}
                {typing.length > 0 && chat.name !== "Saved Messages" && (
                  <div className="typing_container">
                    <div className="typing_animation_container">
                      <div className="typing_animation"></div>
                      <div className="typing_animation"></div>
                      <div className="typing_animation"></div>
                    </div>
                    {typing.map((user) => (
                      <h3 key={user.userId}>{user.name}</h3>
                    ))}
                    <span>{t("typing")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="chat_page_header_tail">
            <button
              className="chat_header_tail_button"
              onClick={() => {
                context.setIsSearchMessages(true);
                setIsUserInfo(false);
              }}
            >
              <i className="fa-solid fa-magnifying-glass chat_header_tail_icon"></i>
            </button>
            {chat.name !== "Saved Messages" && (
              <button
                className="chat_header_tail_button"
                onClick={() => setIsMenu(!isMenu)}
              >
                <i className="fa-solid fa-ellipsis-vertical chat_header_tail_icon"></i>
              </button>
            )}
            <GrayMenu
              isMenu={isMenu}
              x="right"
              position={{ x: 0, y: 50 }}
              items={items}
              message={{} as Message}
              animationFrom="top right"
            />
          </div>
        </div>
      )}
    </>
  );
});

export default ChatPageHeader;
