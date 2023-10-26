import { userPredicate, type Chat, Message } from "../types";
import { useNavigate } from "react-router-dom";
import ChatItem from "./ChatItem";
import { useState, useEffect, useMemo, useCallback } from "react";
import $api from "../api";
import { observer } from "mobx-react";
import store from "../store/store";
import { getTimeFormatted } from "../utils";

type ChatsProps = {
  chats: Chat[];
};

const Chats = observer(function Chats({ chats }: ChatsProps) {
  const to = useCallback(
    (c: Chat) =>
      userPredicate(c)
        ? (store.user?.userId + c.userId).split("").sort().join("")
        : c.chatId,
    [store.user?.userId]
  );
  const navigate = useNavigate();
  const messageIds = useMemo(
    () =>
      chats.map((c) =>
        userPredicate(c)
          ? (c.userId + store.user?.userId).split("").sort().join("")
          : c.chatId
      ),
    [chats]
  );
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  useEffect(() => {
    const fetchMessages = async () => {
      const response = await $api<Message[][]>(
        `/get-all-messages?messageIds=${JSON.stringify(messageIds)}`
      );
      const mapped: Record<string, Message[]> = response.data.reduce(
        (acc, msgs, idx) => {
          const key = messageIds[idx];
          acc[key] = msgs;
          return acc;
        },
        {} as Record<string, Message[]>
      );
      typeof response.data === "object" && setMessages(mapped);
    };
    if (chats.length) {
      fetchMessages();
    }
  }, [chats]);
  console.log(messages);
  return (
    <div>
      {chats.map((c) => (
        <div key={c.id}>
          <ChatItem
            icon={
              store.user?.mutedContacts.includes(
                userPredicate(c) ? c.userId : c.chatId
              )
                ? "fa-solid fa-volume-xmark"
                : ""
            }
            topRightText={getTimeFormatted(
              messages[to(c)]?.[messages[to(c)]?.length - 1]?.createdAt,
              store.timeFormat
            )}
            onClick={() =>
              navigate(`/a/${userPredicate(c) ? c.userId : c.chatId}`)
            }
            chat={c}
          >
            {messages[to(c)]?.[messages[to(c)]?.length - 1]?.text}
          </ChatItem>
        </div>
      ))}
    </div>
  );
});

export default Chats;
