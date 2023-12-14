import {
  Dispatch,
  useMemo,
  SetStateAction,
  useEffect,
  useState,
  useCallback,
  useContext,
} from "react";
import {
  Chat,
  Message,
  SystemMessage,
  GrayMenuItemType,
  textMessagePredicate,
  imageMessagePredicate,
  replyMessagePredicate,
  ReplyMessage,
  groupChatPredicate,
} from "../types";
import { observer } from "mobx-react";
import $api from "../api";
import { socket } from "../socket";
import { useParams } from "react-router-dom";
import ForwardMessage from "./ForwardMessage";
import ChatPageMessage from "./ChatPageMessage";
import { formatTimeDate, hasDifference } from "../utils";
import { createPortal } from "react-dom";
import SearchMessages from "./SearchMessages";
import store from "../store/store";
import { v4 as uuidv4 } from "uuid";
import { ChatPageContext } from "./ChatPage";
import GrayMenu from "./GrayMenu";
import ChatPageFooterSearch from "./ChatPageFooterSearch";
import { useTranslation } from "react-i18next";

const keys = { 37: 1, 38: 1, 39: 1, 40: 1 };

function preventDefault(e: Event) {
  e.preventDefault();
}

function preventDefaultForScrollKeys(e: KeyboardEvent) {
  if (keys[e.keyCode as keyof typeof keys]) {
    preventDefault(e);
    return false;
  }
}

let supportsPassive = false;
window.addEventListener(
  "test",
  null as unknown as EventListenerOrEventListenerObject,
  Object.defineProperty({}, "passive", {
    get: function () {
      supportsPassive = true;
    },
  })
);

const wheelOpt = supportsPassive ? { passive: false } : false;
const wheelEvent =
  "onwheel" in document.createElement("div") ? "wheel" : "mousewheel";
function disableScroll() {
  window.addEventListener("DOMMouseScroll", preventDefault, false); // older FF
  window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
  window.addEventListener("touchmove", preventDefault, wheelOpt); // mobile
  window.addEventListener("keydown", preventDefaultForScrollKeys, false);
}

function enableScroll() {
  window.removeEventListener("DOMMouseScroll", preventDefault, false);
  window.removeEventListener(
    wheelEvent,
    preventDefault,
    wheelOpt as EventListenerOptions
  );
  window.removeEventListener(
    "touchmove",
    preventDefault,
    wheelOpt as EventListenerOptions
  );
  window.removeEventListener("keydown", preventDefaultForScrollKeys, false);
}

type ChatPageMessagesProps = {
  type: "contact" | "group";
  to: string;
  isSearchMessages: boolean;
  messageText: string;
  setSelectedMessages: Dispatch<
    SetStateAction<Exclude<Message, SystemMessage>[]>
  >;
  isSelectedMessages: boolean;
  selectedMessages: Exclude<Message, SystemMessage>[];
  chat: Chat;
  containerRef: HTMLDivElement | null;
  setReplyMessage: Dispatch<
    SetStateAction<ReplyMessage["replyMessage"] | null>
  >;
  footerSearchContainer: HTMLDivElement | null;
};
function groupMessages(messages: Message[]) {
  const d: Message[][] = [];
  let stack = [];
  let i = 0;
  let counter = 0;
  while (i < messages?.length || 0) {
    const cirteria = hasDifference(messages[i], messages[i - 1]);
    if (cirteria) {
      counter++;
      if (counter === 2) {
        d.push(stack);
        stack = [];
        counter = 1;
        stack.push(messages[i]);
      } else {
        stack.push(messages[i]);
      }
    } else {
      stack.push(messages[i]);
    }
    i++;
  }
  d.push(stack);
  return d;
}

const ChatPageMessages = observer(function ChatPageMessages({
  to,
  setSelectedMessages,
  isSelectedMessages,
  selectedMessages,
  chat,
  isSearchMessages,
  containerRef,
  setReplyMessage,
  footerSearchContainer,
}: ChatPageMessagesProps) {
  const { chatId } = useParams();
  const [contextMenu, setContextMenu] = useState<string>("");
  const [contextPosition, setContexPosition] = useState({ x: 0, y: 0 });
  const [messages, setMessages] = useState<Message[]>([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const { i18n } = useTranslation();
  const page = useMemo(
    () => (messages.length === 0 ? 1 : Math.ceil(messages.length / 25)),
    [messages]
  );

  const groupedMessages = useMemo(() => {
    return groupMessages(messages);
  }, [messages]);
  const context = useContext(ChatPageContext);
  const renderMessageContextMenu = useCallback(
    (message: Message) => {
      if (message.type === "system") return;
      const commonContextMenuItems: GrayMenuItemType[] = [
        {
          title: "Reply",
          icon: "fa-solid fa-reply",
          id: uuidv4(),
          action(message) {
            if (
              textMessagePredicate(message) ||
              imageMessagePredicate(message)
            ) {
              setReplyMessage(message);
            } else if (replyMessagePredicate(message)) {
              setReplyMessage(message);
            }
            setContextMenu("");
            enableScroll();
          },
        },
        {
          title: "Forward",
          icon: "fa-solid fa-share",
          id: uuidv4(),
          action(message) {
            context.setIsForwardMessage(true);
            message && context.setActiveMessages([message]);
            setContextMenu("");
            enableScroll();
          },
        },
        {
          title: "Select",
          icon: "fa-solid fa-circle-check",
          id: uuidv4(),
          action(message) {
            setContextMenu("");
            textMessagePredicate(message) &&
              setSelectedMessages((msgs) => [...msgs, message]);
            enableScroll();
          },
        },
        {
          title: "Copy Text",
          icon: "fa-solid fa-clone",
          id: uuidv4(),
          action(message) {
            navigator.clipboard.writeText(message?.text || "").then(() => {
              store.setNotificationMessage("Text is copied!");
            });
            setContextMenu("");
            enableScroll();
          },
        },
      ];
      const personalContextMenuItems: GrayMenuItemType[] = [
        {
          title: "Delete",
          icon: "fa-solid fa-trash",
          id: uuidv4(),
          async action(message) {
            setMessages((messages) =>
              messages.filter((m) => m.id !== message?.id)
            );
            store.setNotificationMessage("Message was deleted!");
            await $api.post(
              `/delete-message?to=${to}&messageId=${message?.id}&user1=${store.user?.userId}&user2=${chatId}`
            );
            setContextMenu("");
            enableScroll();
          },
        },
      ];
      if (message.author.userId === store.user?.userId) {
        return (
          <div
            className={
              (contextMenu === message.id
                ? "context_menu_wrapper_active"
                : "") + " context_menu_wrapper"
            }
          >
            <GrayMenu
              isMenu={contextMenu === message.id}
              message={message}
              items={[...commonContextMenuItems, ...personalContextMenuItems]}
              transform={true}
            />
          </div>
        );
      } else {
        return (
          <div className={"context_menu_wrapper"}>
            <GrayMenu
              transform={true}
              isMenu={contextMenu === message.id}
              message={message}
              items={commonContextMenuItems}
            />
          </div>
        );
      }
    },
    [contextMenu]
  );
  useEffect(() => {
    socket.on("update-messages", async ({ data, id }) => {
      let isBanned = false;
      if (groupChatPredicate(chat)) {
        const member = chat.members.find(
          (m) => m.userId === store.user?.userId
        );
        if (member && member.banned.value) {
          isBanned = true;
        }
      }
      const equal =
        JSON.stringify(messages).split("").sort().join() ===
        JSON.stringify(data).split("").sort().join();
      if (data && to === id && !equal && !isBanned) {
        setMessages(data);
        localStorage.setItem(to, JSON.stringify(data));
      } else {
        console.log("You do get no message");
      }
    });

    socket.on("notify", async (data) => {
      let notification: Notification | null = null;
      function sendNotification() {
        if (notification) {
          notification.close();
          return;
        }
        if (Notification.permission !== "granted") {
          Notification.requestPermission().then(function (permission) {
            if (permission === "granted") {
              createNotification();
            }
          });
        } else {
          createNotification();
        }
      }

      function createNotification() {
        notification = new Notification(data.chat.name, {
          body: data.text,
        });
      }
      if (store.webNotifications && data) {
        sendNotification();
      }
    });

    const handleWindowResize = (e: UIEvent) => {
      if (
        e.target &&
        "innerWidth" in e.target &&
        typeof e.target.innerWidth === "number"
      ) {
        setWindowWidth(e.target.innerWidth);
      }
    };
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target;
      if (target instanceof HTMLElement) {
        if (!target.closest(".context_menu_wrapper")) {
          setContextMenu("");
          enableScroll();
        }
      }
    };
    document.addEventListener("click", onClickOutside);
    window.addEventListener("resize", handleWindowResize);
    return () => {
      socket.off("update-messages");
      window.removeEventListener("resize", handleWindowResize);
      socket.off("notify");
      document.removeEventListener("click", onClickOutside);
    };
  }, []);

  useEffect(() => {
    async function fetchMessages() {
      const { data } = await $api(`/messages?chatId=${to}&page=${page}`);
      setMessages(data);
    }

    fetchMessages();
  }, [chatId, chat, page]);

  const fetchMoreMessages = async (newPage: number) => {
    const { data } = await $api(`/messages?chatId=${to}&page=${newPage}`);
    setMessages(data);
  };
  return (
    <>
      <ForwardMessage />
      {containerRef &&
        windowWidth > 500 &&
        createPortal(
          <SearchMessages
            messages={messages}
            chat={chat}
            style={{
              width: isSearchMessages ? "70%" : "0%",
            }}
          />,
          containerRef as Element
        )}
      {footerSearchContainer &&
        createPortal(
          <ChatPageFooterSearch messages={messages} />,
          footerSearchContainer
        )}
      <div
        className="chat_page_messages"
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="chat_page_messages_content">
          {groupedMessages.map((msgsArr) => {
            return (
              <div
                className="group_messages"
                key={new Date(msgsArr[0]?.createdAt)
                  .toLocaleString()
                  .match(/[A-Za-z0-9/.]*,/gi)?.[0]
                  ?.replace(",", "")}
              >
                <div
                  data-date={new Date(msgsArr[0]?.createdAt)
                    .toLocaleString()
                    .match(/[A-Za-z0-9/.]*,/gi)?.[0]
                    ?.replace(",", "")}
                  className={msgsArr[0]?.createdAt ? "message_date" : ""}
                >
                  {msgsArr[0]?.createdAt &&
                    formatTimeDate(
                      msgsArr[0]?.createdAt,
                      i18n.language as "ru" | "en"
                    )}
                </div>
                {msgsArr.map((e, i) => {
                  return (
                    <div id="chat_page_message_container" key={e.id}>
                      <ChatPageMessage
                        messages={messages}
                        i={i}
                        message={e}
                        setContextMenu={setContextMenu}
                        setContexPosition={setContexPosition}
                        contextMenu={contextMenu}
                        contextPosition={contextPosition}
                        fetchMoreMessages={fetchMoreMessages}
                        enableScroll={enableScroll}
                        disableScroll={disableScroll}
                        to={to}
                        chatId={chatId || ""}
                        setSelectedMessages={setSelectedMessages}
                        isSelectedMessages={isSelectedMessages}
                        selectedMessages={selectedMessages}
                        chat={chat}
                        renderMessageContextMenu={renderMessageContextMenu}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
});

export default ChatPageMessages;
