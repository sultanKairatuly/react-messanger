import {
  userPredicate,
  type Chat,
  Message,
  textMessagePredicate,
} from "../types";
import { useNavigate } from "react-router-dom";
import ChatItem from "./ChatItem";
import { useState, useEffect, useMemo, useCallback } from "react";
import $api from "../api";
import { observer } from "mobx-react";
import store from "../store/store";
import { getTimeFormatted } from "../utils";
import HiddenLoader from "./HiddenLoader";
import { socket } from "../socket";
type ChatsProps = {
  chats: Chat[];
};

const Chats = observer(function Chats({ chats }: ChatsProps) {
  const [loading, setLoading] = useState(false);

  const to = useCallback(
    (c: Chat) =>
      userPredicate(c)
        ? (store.user?.userId + c.userId).split("").sort().join("")
        : c?.chatId,
    [store.user?.userId]
  );
  const navigate = useNavigate();
  const messageIds = useMemo(
    () =>
      chats.map((c) =>
        userPredicate(c)
          ? (c.userId + store.user?.userId).split("").sort().join("")
          : c?.chatId
      ),
    [chats]
  );
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  useEffect(() => {
    socket.on("update-messages", ({ data, id }) => {
      setMessages((m) => ({ ...m, [id]: data }));
    });

    const fetchMessages = async () => {
      try {
        setLoading(true);
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
        typeof response.data === "object" && setMessages(() => mapped);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };
    if (chats.length) {
      fetchMessages();
    }
  }, [chats]);
  return (
    <div>
      {loading && <HiddenLoader />}
      {!messageIds && <HiddenLoader />}
      {chats.map((c) => (
        <div key={c.id}>
          <ChatItem
            icon={
              store.user?.mutedContacts.includes(
                userPredicate(c) ? c.userId : c?.chatId
              )
                ? "fa-solid fa-volume-xmark"
                : ""
            }
            topRightText={`${getTimeFormatted(
              messages[to(c)]?.[messages[to(c)]?.length - 1]?.createdAt,
              store.timeFormat
            )} ${
              messages[to(c)]?.filter(
                (m) =>
                  textMessagePredicate(m) &&
                  m.status === "received" &&
                  m.author.userId === store.user?.userId
              ).length
            }`}
            onClick={() =>
              navigate(`/a/${userPredicate(c) ? c.userId : c?.chatId}`)
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
