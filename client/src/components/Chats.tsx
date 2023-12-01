import { userPredicate, type Chat, Message } from "../types";
import { useNavigate } from "react-router-dom";
import ChatItem from "./ChatItem";
import { useState, useEffect, useMemo, useCallback } from "react";
import $api from "../api";
import { observer } from "mobx-react";
import store from "../store/store";
import { getTimeFormatted, compareArrays } from "../utils";
import HiddenLoader from "./HiddenLoader";
import { socket } from "../socket";
type ChatsProps = {
  chats: Chat[];
};

const Chats = observer(function Chats({ chats }: ChatsProps) {
  const [loading, setLoading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

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
  const [messages, setMessages] = useState<Record<string, Message[]>>(
    JSON.parse(localStorage.getItem("chatMessages") as string) || {}
  );

  useEffect(() => {
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

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);
  useEffect(() => {
    socket.on("update-messages", ({ data, id }) => {
      setMessages((m) => ({ ...m, [id]: data }));
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    });

    const fetchMessages = async () => {
      try {
        if (!Object.keys(messages).length) {
          setLoading(true);
        }

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
        if (typeof response.data === "object" && response.data != null) {
          const isEqual = compareArrays(messages, mapped);
          if (!isEqual) {
            setMessages(() => mapped);
            localStorage.setItem("chatMessages", JSON.stringify(mapped));
          }
        }
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
        <div
          key={c.id}
          onClick={() => windowWidth < 500 && (store.isSidebar = false)}
        >
          <ChatItem
            icon={
              store.user?.mutedContacts.includes(
                userPredicate(c) ? c.userId : c?.chatId
              )
                ? "fa-solid fa-volume-xmark"
                : ""
            }
            topRightText={
              messages[to(c)]?.[messages[to(c)]?.length - 1]?.createdAt
                ? getTimeFormatted(
                    messages[to(c)]?.[messages[to(c)]?.length - 1]?.createdAt,
                    store.timeFormat
                  )
                : ""
            }
            onClick={() =>
              navigate(`/a/${userPredicate(c) ? c.userId : c?.chatId}`)
            }
            chat={c}
          >
            {messages[to(c)]?.[messages[to(c)]?.length - 1] &&
            messages[to(c)]?.[messages[to(c)]?.length - 1].type === "image"
              ? "Photo"
              : messages[to(c)]?.[messages[to(c)]?.length - 1]?.text}
          </ChatItem>
        </div>
      ))}
    </div>
  );
});

export default Chats;
