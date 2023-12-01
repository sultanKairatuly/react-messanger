import { useEffect, useState, useMemo, useContext } from "react";
import {
  Chat as ChatType,
  chatPredicate,
  EmittingData,
  userPredicate,
} from "../types";
import store from "../store/store";
import { observer } from "mobx-react";
import $api from "../api";
import ChatItem from "./ChatItem";
import "../styles/forwardMessage.css";
import { v4 as uuidv4 } from "uuid";
import { ChatPageContext } from "./ChatPage";
import { socket } from "../socket";
const ForwardMessage = observer(function ForwardMessages() {
  const [chats, setChats] = useState<ChatType[]>([]);
  const [chatQuery, setQueryChat] = useState("");

  function filterForwardingChats(e: React.ChangeEvent<HTMLInputElement>) {
    setQueryChat(e.target.value);
  }
  const context = useContext(ChatPageContext);
  const filteredChats = useMemo(() => {
    return chats.filter((chat) => chat.name.startsWith(chatQuery));
  }, [chats, chatQuery]);

  async function forwardMessageToChat(chat: ChatType) {
    const chatId = userPredicate(chat) ? chat.userId : chat.chatId;
    const isBlocked = store.user
      ? store.user.blockedContacts.includes(chatId)
        ? true
        : false
      : true;
    if (isBlocked) return;
    const promises = [];
    if (store.user) {
      for (const activeMessage of context.activeMessages) {
        const newMessage = {
          ...activeMessage,
          createdAt: Date.now(),
          id: uuidv4(),
          status: "pending",
          author: store.user,
        } as const;
        const emittingData: EmittingData = {
          to:
            (chat?.type === "contact"
              ? (store.user.userId + chat.userId).split("").sort().join("")
              : chat?.chatId) || "",
          user1: store.user.userId,
          user2: userPredicate(chat) ? chat.userId : chat.chatId,
          message: newMessage,
          type: chat.type,
          socketId: socket.id,
        };
        promises.push($api.post("/send-message", emittingData));
      }
      await Promise.all(promises);
      store.setNotificationMessage("Message was forwarded");
      context.setIsForwardMessage(false);
    }
  }
  useEffect(() => {
    const fetchChats = async () => {
      const result: ChatType[] = [];
      for (const chat of store.user?.chats || []) {
        const response = await $api(`/chat?chatId=${chat}`);
        if (chatPredicate(response.data)) {
          result.push(response.data);
        }
      }
      setChats(result);
    };
    fetchChats();
  }, [store.user?.chats]);

  return (
    <div
      className="forward_message_background"
      style={{
        opacity: !context.isForwardMessage ? 0 : 1,
        visibility: !context.isForwardMessage ? "hidden" : "visible",
      }}
    >
      <div
        className={
          (!context.isForwardMessage ? "" : "forward_message_active") +
          " forward_message"
        }
      >
        <header className="forward_message_header">
          <i
            className="fa-solid fa-xmark forward_message_close"
            onClick={() => {
              context.setIsForwardMessage(false);
            }}
          ></i>
          <input
            type="text"
            value={chatQuery}
            className="forward_message_input"
            placeholder="Forward to..."
            onChange={filterForwardingChats}
          />
        </header>
        <div className="forward_message_chats">
          {filteredChats.map((chat) => (
            <ChatItem
              chat={chat}
              onClick={() => forwardMessageToChat(chat)}
              key={chat.id}
            />
          ))}
          {!filteredChats.length && (
            <div
              style={{
                textAlign: "center",
                marginTop: "30px",
                fontSize: "20px",
              }}
            >
              We didn't find any chats
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default ForwardMessage;
