import {
  Dispatch,
  useMemo,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { Message } from "../types";
import { observer } from "mobx-react";
import $api from "../api";
import { socket } from "../socket";
import { useParams } from "react-router-dom";
import ForwardMessage from "./ForwardMessage";
import ChatPageMessage from "./ChatPageMessage";
import { formatTimeDate } from "../utils";

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

const hasDifference = (
  messageOne: Message | undefined,
  messageTwo: Message | undefined
): boolean => {
  if (!messageOne || !messageTwo) return true;
  const dateOne = messageOne.createdAt;
  const dateTwo = messageTwo.createdAt;
  const days = new Date(dateOne).getDay() !== new Date(dateTwo).getDay();
  const months = new Date(dateOne).getMonth() !== new Date(dateTwo).getMonth();
  const years =
    new Date(dateOne).getFullYear() !== new Date(dateTwo).getFullYear();
  return days || years || months ? true : false;
};

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

function groupMessages(messages: Message[]) {
  const d: Message[][] = [];
  let stack = [];
  let i = 0;
  let counter = 0;
  while (i < messages.length) {
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

type ChatPageMessagesProps = {
  type: "contact" | "group";
  to: string;
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  messageText: string;
  setSelectedMessages: Dispatch<SetStateAction<Message[]>>;
  isSelectedMessages: boolean;
  selectedMessages: Message[];
};

const ChatPageMessages = observer(function ChatPageMessages({
  type,
  to,
  messages,
  setMessages,
  setSelectedMessages,
  isSelectedMessages,
  selectedMessages,
}: ChatPageMessagesProps) {
  const { chatId } = useParams();

  const [contextMenu, setContextMenu] = useState<string>("");
  const [contextPosition, setContexPosition] = useState({ x: 0, y: 0 });
  const container = useRef<HTMLDivElement | null>(null);
  const groupedMessages = useMemo(() => {
    return groupMessages(messages);
  }, [messages]);
  useEffect(() => {
    console.log(`contextMenu!: ${contextMenu}`);
  }, [contextMenu]);
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

  useEffect(() => {
    socket.on("update-messages", async () => {
      console.log("update-messages event!");
      const { data } = await $api(`/messages?chatId=${to}`);
      setMessages(() => data);
      localStorage.setItem(to, JSON.stringify(data));
    });

    () => {
      socket.off("update-messages");
    };
  }, [to]);

  useEffect(() => {
    async function fetchMessages() {
      const { data } = await $api(`/messages?chatId=${to}`);
      setMessages(data);
      localStorage.setItem(to, JSON.stringify(messages));
    }
    fetchMessages();
  }, [to]);

  return (
    <>
      <ForwardMessage />
      {type === "contact" ? (
        <div
          className="chat_page_messages"
          ref={container}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="chat_page_messages_content">
            {groupedMessages.map((msgsArr) => {
              return (
                <div
                  className="group_messages"
                  key={new Date(msgsArr[0]?.createdAt).toLocaleString()}
                >
                  <div
                    data-date={new Date(msgsArr[0]?.createdAt).toLocaleString()}
                    className={msgsArr[0]?.createdAt ? "message_date" : ""}
                  >
                    {msgsArr[0]?.createdAt &&
                      formatTimeDate(msgsArr[0]?.createdAt)}
                  </div>
                  {msgsArr.map((e) => {
                    return (
                      <ChatPageMessage
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
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="chat_page_messages"></div>
      )}
    </>
  );
});

export default ChatPageMessages;
