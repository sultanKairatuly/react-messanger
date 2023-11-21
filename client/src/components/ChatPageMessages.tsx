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
} from "../types";
import { observer } from "mobx-react";
import $api from "../api";
import { socket } from "../socket";
import { useParams } from "react-router-dom";
import ForwardMessage from "./ForwardMessage";
import ChatPageMessage from "./ChatPageMessage";
import { formatTimeDate } from "../utils";
import { hasDifference } from "../utils";
import { createPortal } from "react-dom";
import SearchMessages from "./SearchMessages";
import store from "../store/store";
import { v4 as uuidv4 } from "uuid";
import { ChatPageContext } from "./ChatPage";
import GrayMenu from "./GrayMenu";

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
}: ChatPageMessagesProps) {
  const { chatId } = useParams();
  const [contextMenu, setContextMenu] = useState<string>("");

  const [contextPosition, setContexPosition] = useState({ x: 0, y: 0 });
  const [messages, setMessages] = useState<Message[]>([]);
  const groupedMessages = useMemo(() => {
    return groupMessages(messages);
  }, [messages]);
  useEffect(() => {
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

    return () => {
      document.removeEventListener("click", onClickOutside);
    };
  }, []);
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
              setReplyMessage(message.replyMessage);
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
            style={{
              top: contextPosition.y,
              transform: `translateX(${contextPosition.x - 300}px)`,
            }}
          >
            <GrayMenu
              isMenu={contextMenu === message.id}
              message={message}
              items={[...commonContextMenuItems, ...personalContextMenuItems]}
            />
          </div>
        );
      } else {
        return (
          <div
            className={"context_menu_wrapper"}
            style={{
              top: contextPosition.y,
              transform: `translateX(${contextPosition.x - 300}px)`,
            }}
          >
            <GrayMenu
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
      const equal =
        JSON.stringify(messages).split("").sort().join() ===
        JSON.stringify(data).split("").sort().join();
      if (data && to === id && !equal) {
        setMessages(data);
      }
    });

    socket.on("notify", async (data) => {
      let notification: Notification | null = null;
      function sendNotification() {
        // Check if there is an existing notification
        if (notification) {
          notification.close();
          // Notification is already open, do nothing
          return;
        }
        // Request permission if not granted
        if (Notification.permission !== "granted") {
          Notification.requestPermission().then(function (permission) {
            if (permission === "granted") {
              createNotification();
            }
          });
        } else {
          // Permission already granted
          createNotification();
        }
      }

      function createNotification() {
        // Create and show the notification
        notification = new Notification(data.chat.name, {
          body: data.text,
        });

        // You can add additional logic or event listeners here if needed
      }
      if (store.webNotifications && data) {
        sendNotification();
      }
    });

    () => {
      socket.off("update-messages");
      socket.off("notify");
    };
  }, []);

  useEffect(() => {
    async function fetchMessages() {
      const { data } = await $api(`/messages?chatId=${to}`);
      console.log(messages);
      setMessages(data);
    }
    fetchMessages();
  }, [chatId, chat]);

  return (
    <>
      <ForwardMessage />
      {containerRef &&
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
                    formatTimeDate(msgsArr[0]?.createdAt)}
                </div>
                {msgsArr.map((e) => {
                  return (
                    <ChatPageMessage
                      messages={messages}
                      key={e.id}
                      message={e}
                      setContextMenu={setContextMenu}
                      setContexPosition={setContexPosition}
                      contextMenu={contextMenu}
                      contextPosition={contextPosition}
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
