import { Chat, GrayMenuItemType, Message, userPredicate, User } from "../types";
import { ChatPageContext } from "./ChatPage";
import {
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
  Dispatch,
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

type ChatPageHeadeProps = {
  chat: Chat;
  setIsUserInfo: Dispatch<SetStateAction<boolean>>;
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
  useEffect(() => {
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
    };
  }, []);
  const firstItem = useMemo(() => {
    if (store.user?.blockedContacts.includes(context.chatId)) {
      return {
        title: "Unblock user",
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
        title: "Block user",
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
  }, [store.user?.blockedContacts]);
  const secondItem = useMemo(() => {
    if (store.user?.mutedContacts.includes(context.chatId)) {
      return {
        title: "Unmute user",
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
        title: "Mute",
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
  }, [store.user?.mutedContacts]);
  const items: GrayMenuItemType[] = useMemo(
    () =>
      userPredicate(chat)
        ? [
            firstItem,
            secondItem,
            {
              title: "Video Call",
              icon: "fa-solid fa-video",
              id: uuidv4(),
              action: () => {},
            },
            {
              title: "Delete Chat",
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
              title: "Leave chat",
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
    [chat]
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
      <div className="chat_page_header">
        <AppModal isModal={isDeleteModal} setModal={setIsDeleteMenu}>
          <div className="chat_page_delete_modal">
            <h4
              className="chat_page_delete_option"
              onClick={() => deleteForMe()}
            >
              Delete only for me
            </h4>
            <h4
              className="chat_page_delete_option"
              onClick={() => deleteForBoth()}
            >
              Delete also for {chat.name}
            </h4>
            <h4
              className="chat_page_delete_option-blue chat_page_delete_option"
              onClick={() => setIsDeleteMenu(false)}
            >
              Cancel
            </h4>
          </div>
        </AppModal>
        <div
          className="chat_page_header_head"
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
            <h2 className="chat_page_header_title">{chat.name}</h2>
            {!typing.length && chat.name !== "Saved Messages" && (
              <div
                className={
                  userPredicate(chat) && chat.lastSeen === 0 ? "online" : ""
                }
              >
                {userPredicate(chat)
                  ? defineUserStatus(chat.lastSeen)
                  : `${chat.members.length} members`}
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
                <span>typing</span>
              </div>
            )}
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
            position={{ x: -90, y: 50 }}
            items={items}
            message={{} as Message}
            animationFrom="top right"
          />
        </div>
      </div>
    </>
  );
});

export default ChatPageHeader;
