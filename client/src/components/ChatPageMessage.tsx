import { observer } from "mobx-react";
import {
  useRef,
  useCallback,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
} from "react";
import { Message, GrayMenuItemType } from "../types";
import store from "../store/store";
import $api from "../api";
import { v4 as uuidv4 } from "uuid";
import { getTimeFormatted } from "../utils";
import { ChatPageContext } from "./ChatPage";
import GrayMenu from "./GrayMenu";
import "../styles/chatPage.css";
type ChatPageMessageProps = {
  setSelectedMessages: Dispatch<SetStateAction<Message[]>>;
  selectedMessages: Message[];
  isSelectedMessages: boolean;
  disableScroll: () => void;
  enableScroll: () => void;
  message: Message;
  contextMenu: string;
  setContexPosition: Dispatch<SetStateAction<{ x: number; y: number }>>;
  setContextMenu: Dispatch<SetStateAction<string>>;
  to: string;
  chatId: string;
  contextPosition: { x: number; y: number };
};

const ChatPageMessage = observer(function ({
  setSelectedMessages,
  selectedMessages,
  isSelectedMessages,
  disableScroll,
  message: e,
  setContexPosition,
  setContextMenu,
  contextMenu,
  to,
  chatId,
  enableScroll,
  contextPosition,
}: ChatPageMessageProps) {
  const context = useContext(ChatPageContext);
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
  const renderMessageContextMenu = useCallback(
    function renderMessageContextMenu(message: Message) {
      const commonContextMenuItems: GrayMenuItemType[] = [
        {
          title: "Reply",
          icon: "fa-solid fa-reply",
          id: uuidv4(),
          action() {
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
            message && setSelectedMessages((msgs) => [...msgs, message]);
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
            await $api.post(
              `/delete-message?to=${to}&messageId=${message?.id}&user1=${store.user?.userId}&user2=${chatId}`
            );
            store.setNotificationMessage("Message was deleted!");
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
    []
  );
  const observers = useRef<IntersectionObserver[]>([]);
  const handleMessageClick = useCallback(
    (message: Message) => {
      if (isSelectedMessages) {
        const selected = selectedMessages.some((e) => e.id === message.id);
        if (selected) {
          setSelectedMessages((pv) => pv.filter((e) => e.id !== message.id));
        } else {
          setSelectedMessages((pv) => [...pv, message]);
        }
      }
    },
    [selectedMessages, isSelectedMessages]
  );
  const onContextMenu = useCallback(
    (ev: React.MouseEvent<HTMLDivElement, MouseEvent>, e: Message) => {
      ev.preventDefault();
      disableScroll();
      const container = document.querySelector(".chat_page_container");
      if (container instanceof HTMLElement) {
        const y = window.innerHeight - ev.clientY < 250 ? -200 : 20;
        const x =
          ev.clientX - 250 - parseInt(getComputedStyle(container).width);
        setContexPosition({
          x: x < -650 ? x + 200 : x,
          y,
        });
        setContextMenu(() => e.id);
      }
    },
    []
  );
  return (
    <div>
      <div
        data-id={e.id}
        onContextMenu={(ev) => onContextMenu(ev, e)}
        key={e.id + e.createdAt + e.text}
        onClick={() => handleMessageClick(e)}
        style={{
          cursor: isSelectedMessages ? "pointer" : "default",
        }}
        className={
          (contextMenu === e.id || selectedMessages.some((m) => m.id === e.id)
            ? "contexed_message"
            : "") +
          (e.author.userId === store.user?.userId
            ? " self_message"
            : " opossite_message") +
          " chat_page_message"
        }
      >
        <div
          className={
            (e.author.userId === store.user?.userId
              ? "self_message"
              : "opossite_message") + " chat_page_message_content_wrapper"
          }
        >
          <div
            className={
              (isSelectedMessages
                ? "active_checkbox_wrapper"
                : "inactive_checkbox_wrapper") + " checkbox_wrapper"
            }
          >
            {selectedMessages.some((m) => m.id === e.id) ? (
              <div className="active_selected_checkbox selected_checkbox">
                <i className="fa-solid fa-check active_selected_checkbox_icon"></i>
              </div>
            ) : (
              <div className="inactive_selected_checkbox selected_checkbox"></div>
            )}
          </div>
          <div
            className={
              (e.author.userId === store.user?.userId
                ? ""
                : "chat_page_message_content-opossite") +
              " chat_page_message_content"
            }
          >
            <div className="chat_page_message_text">
              {
                <div>
                  {e.text.split("\n").map((t, i) => {
                    if (
                      e.status !== "read" &&
                      e.author.userId !== store.user?.userId
                    ) {
                      const observer = new IntersectionObserver(([entry]) => {
                        if (entry.isIntersecting) {
                          $api.post(
                            `read-message?to=${to}&messageId=${e.id}&user2=${chatId}`
                          );
                        }
                      });
                      const messageElement = document.querySelector(
                        `[data-id="${e.id}"]`
                      );
                      messageElement && observer.observe(messageElement);
                      observers.current.push(observer);
                    }
                    return (
                      <div
                        key={t + i * Math.random() * 10000}
                        style={{
                          wordBreak: "break-word",
                          fontSize: `${store.messageSize}px`,
                        }}
                      >
                        {t}
                      </div>
                    );
                  })}
                </div>
              }
            </div>
            {e.author.userId === store.user?.userId &&
              (e.status === "pending" ? (
                <i className="fa-solid fa-check message_icon"></i>
              ) : e.status === "received" ? (
                <i className="fa-solid fa-check-double message_icon"></i>
              ) : (
                <i className="fa-solid fa-check-double message_icon message_icon-read"></i>
              ))}
            <div className="chat_page_message_time">
              {getTimeFormatted(e.createdAt, store.timeFormat)}
            </div>
          </div>
        </div>
        {contextMenu === e.id && renderMessageContextMenu(e)}
      </div>
    </div>
  );
});

export default ChatPageMessage;
