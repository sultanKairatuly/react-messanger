import { Chat, GrayMenuItemType, Message, userPredicate } from "../types";
import { ChatPageContext } from "./ChatPage";
import { useContext, useState, useMemo } from "react";
import GrayMenu from "./GrayMenu";
import { v4 as uuidv4 } from "uuid";
import $api from "../api";
import store from "../store/store";
import { observer } from "mobx-react";

type ChatPageHeadeProps = {
  chat: Chat;
};

const ChatPageHeader = observer(function ChatPageHeader({
  chat,
}: ChatPageHeadeProps) {
  const context = useContext(ChatPageContext);
  const [isMenu, setIsMenu] = useState(false);
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
            console.log(response.data);
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
            console.log(response.data);
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
  const items: GrayMenuItemType[] = [
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
        await $api.post(
          `/delete-chat?chatId=${
            userPredicate(chat) ? chat.userId : chat.chatId
          }?deleter=${store.user?.userId}`
        );
      },
    },
  ];
  return (
    <>
      <div className="chat_page_header">
        <div className="chat_page_header_head">
          <div className="chat_page_header_avatar_wrapper">
            <img src={chat.avatar} alt="" className="chat_page_header_avatar" />
          </div>
          <h2 className="chat_page_header_title">{chat.name}</h2>
        </div>
        <div className="chat_page_header_tail">
          <button
            className="chat_header_tail_button"
            onClick={() => context.setIsSearchMessages(true)}
          >
            <i className="fa-solid fa-magnifying-glass chat_header_tail_icon"></i>
          </button>
          <button
            className="chat_header_tail_button"
            onClick={() => setIsMenu(!isMenu)}
          >
            <i className="fa-solid fa-ellipsis-vertical chat_header_tail_icon"></i>
          </button>
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
