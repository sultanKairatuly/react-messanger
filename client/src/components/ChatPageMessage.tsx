import { observer } from "mobx-react";
import {
  useRef,
  useCallback,
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
} from "react";
import {
  Message,
  Chat,
  SystemMessage,
  notSystemMessagePredicate,
} from "../types";
import "../styles/chatPage.css";
import GroupMessage from "./GroupMessage";
import ContactMessage from "./ContactMessage";
import SysMessage from "./SysMessage";

type ChatPageMessageProps = {
  setSelectedMessages: Dispatch<
    SetStateAction<Exclude<Message, SystemMessage>[]>
  >;
  selectedMessages: Exclude<Message, SystemMessage>[];
  isSelectedMessages: boolean;
  disableScroll: () => void;
  enableScroll: () => void;
  message: Message;
  contextMenu: string;
  setContexPosition: Dispatch<SetStateAction<{ x: number; y: number }>>;
  setContextMenu: Dispatch<SetStateAction<string>>;
  to: string;
  chatId: string;
  chat: Chat;
  contextPosition: { x: number; y: number };
  messages: Message[];
  renderMessageContextMenu: (message: Message) => JSX.Element | undefined;
  i: number;
  fetchMoreMessages: (newPage: number) => Promise<void>;
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
  chat,
  chatId,
  i,
  enableScroll,
  fetchMoreMessages,
  messages,
  renderMessageContextMenu,
}: ChatPageMessageProps) {
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
    if ((i + 25) % 25 === 0) {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          const page =
            messages.length === 0 ? 1 : Math.ceil(messages.length / 25);
          const newPage = Math.ceil((i + 25) / 25) + 1;
          if (newPage > page) {
            console.log("fetch more");
            fetchMoreMessages(newPage);
          }
        }
      });
      const observingElement = document.createElement("div");
      const container = document.querySelector("#chat_page_message_container");
      container?.appendChild(observingElement);
      observer.observe(observingElement);
    }
    return () => {
      document.removeEventListener("click", onClickOutside);
    };
  }, []);
  const observers = useRef<IntersectionObserver[]>([]);
  const handleMessageClick = useCallback(
    (message: Message) => {
      if (isSelectedMessages && message.type !== "system") {
        const selected = selectedMessages.some((e) => e.id === message.id);
        if (selected) {
          setSelectedMessages((pv) => pv.filter((e) => e.id !== message.id));
        } else {
          setSelectedMessages((pv) => [...pv, message]);
        }
      }
    },
    [isSelectedMessages, selectedMessages, setSelectedMessages]
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
        setContextMenu(e.id);
      }
    },
    []
  );
  const messagesWithoutSystem = useMemo<
    Exclude<Message, SystemMessage>[]
  >(() => {
    return messages.filter(notSystemMessagePredicate);
  }, [messages]);
  return (
    <div>
      {e.type !== "system" && (
        <div>
          {chat.type === "group" && (
            <GroupMessage
              messages={messagesWithoutSystem}
              message={e}
              onContextMenu={onContextMenu}
              contextMenu={contextMenu}
              renderMessageContextMenu={renderMessageContextMenu}
              observers={observers}
              to={to}
              chatId={chatId}
              isSelectedMessages={isSelectedMessages}
              handleMessageClick={handleMessageClick}
              selectedMessages={selectedMessages}
            />
          )}
          {chat.type === "contact" && (
            <ContactMessage
              isName={false}
              message={e}
              onContextMenu={onContextMenu}
              contextMenu={contextMenu}
              renderMessageContextMenu={renderMessageContextMenu}
              observers={observers}
              to={to}
              chatId={chatId}
              isSelectedMessages={isSelectedMessages}
              handleMessageClick={handleMessageClick}
              selectedMessages={selectedMessages}
            />
          )}
        </div>
      )}
      {e.type === "system" && <SysMessage message={e} />}
    </div>
  );
});

export default ChatPageMessage;
