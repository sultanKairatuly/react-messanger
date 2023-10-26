import "../styles/chatPage.css";
import {
  useEffect,
  useState,
  createContext,
  Dispatch,
  SetStateAction,
} from "react";
import { useParams } from "react-router-dom";
import $api from "../api";
import { Message, chatPredicate, Chat } from "../types";
import useQuery from "../hooks/useQuery";
import store from "../store/store";
import { v4 as uuidv4 } from "uuid";
import { observer } from "mobx-react";
import HiddenLoader from "./HiddenLoader";
import { EmittingData } from "../types";
import ChatPageHeader from "./ChatPageHeader";
import ChatPageMessages from "./ChatPageMessages";
import ChatPageFooter from "./ChatPageFooter";
import SearchMessages from "./SearchMessages";
import { socket } from "../socket";

const MAX_TEXTAREA_HEIGHT = 250;
const MIN_TEXTAREA_HEIGHT = 40;

type ChatPageContextType = {
  setIsForwardMessage: Dispatch<SetStateAction<boolean>>;
  isForwardMessage: boolean;
  setActiveMessages: Dispatch<SetStateAction<Message[]>>;
  activeMessages: Message[];
  to: string;
  chatId: string;
  setIsSearchMessages: Dispatch<SetStateAction<boolean>>;
  isSearchMessages: boolean;
  chat: Chat;
};
export const ChatPageContext = createContext({} as ChatPageContextType);
const ChatPage = observer(function ChatPage() {
  const { chatId } = useParams();
  const to = ((store.user?.userId || "") + chatId).split("").sort().join("");
  const query = useQuery();
  const [chat, setChat] = useState<Chat | null>(null);
  const [messageText, setMessageText] = useState("");
  const [textAreaHeight, setTextAreaHeight] = useState(MIN_TEXTAREA_HEIGHT);
  const [messages, setMessages] = useState<Message[]>(
    JSON.parse(localStorage.getItem(to) as string) || []
  );
  const [loader, setLoader] = useState(false);
  const [ctrl, setCtrl] = useState(false);
  const [shift, setShift] = useState(false);
  const [focused, setFocused] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<Message[]>([]);
  const isSelectedMessages = selectedMessages.length > 0;
  const [isForwardMessage, setIsForwardMessage] = useState(false);
  const [activeMessages, setActiveMessages] = useState<Message[]>([]);
  const [isSearchMessages, setIsSearchMessages] = useState(false);

  async function onMessageSend() {
    if (
      store.user &&
      chatId &&
      messageText.length > 0 &&
      messageText.split("").filter((e) => e !== "" && e !== "\n").length
    ) {
      const emittingData: EmittingData = {
        to:
          (chat?.type === "contact"
            ? (store.user.userId + chat.userId).split("").sort().join("")
            : chat?.chatId) || "",
        user1: store.user.userId,
        user2: chatId,
        message: {
          author: store.user,
          text: messageText,
          createdAt: Date.now(),
          images: [],
          id: uuidv4(),
          status: "pending",
        },
      };
      setMessageText("");
      setTextAreaHeight(MIN_TEXTAREA_HEIGHT);
      await $api.post("/send-message", emittingData);
    }
  }
  useEffect(() => {
    socket.on("update-chat", (chat: unknown) => {
      console.log("chat: ", chat);
      if (chatPredicate(chat)) {
        setChat(chat);
      }
    });

    return () => {
      socket.off("update-chat");
    };
  }, []);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (focused) {
        if (e.code === "ControlLeft") {
          setCtrl(true);
        }
        if (e.code === "ShiftLeft") {
          setShift(true);
        }
        if (
          !messageText.split("").filter((e) => e === "\n").length &&
          e.code === "Backspace"
        ) {
          if (textAreaHeight > MIN_TEXTAREA_HEIGHT) {
            setTextAreaHeight((t) => t - 20);
          }
        }
        if (store.sendMode === "enter") {
          if (shift && e.code === "Enter") {
            if (textAreaHeight < MAX_TEXTAREA_HEIGHT) {
              setTextAreaHeight((t) =>
                t === MAX_TEXTAREA_HEIGHT ? t : 20 + t
              );
            }
          } else if (e.code === "Enter") {
            onMessageSend();
          }
        } else {
          if (e.code === "Enter" && ctrl) {
            onMessageSend();
          } else if (e.code === "Enter") {
            if (textAreaHeight > MIN_TEXTAREA_HEIGHT) {
              setTextAreaHeight((t) => t + 20);
            }
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (focused) {
        if (e.code === "ControlLeft") {
          setCtrl(false);
        }

        if (e.code === "ShiftLeft") {
          setShift(false);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [focused, ctrl, shift, messageText]);
  useEffect(() => {
    async function fetchChat() {
      try {
        setLoader(true);
        const { data } = await $api.get(`/chat?chatId=${chatId}`);
        if (chatPredicate(data)) {
          setChat(data);
          await $api.post(
            `/create-messages?user1=${store.user?.userId}&user2=${chatId}&type=${data?.type}`
          );
        }
      } catch (e) {
        console.log(e);
      } finally {
        setLoader(false);
      }
    }
    fetchChat();
  }, [chatId, query]);

  return (
    <>
      {chat && (
        <ChatPageContext.Provider
          value={{
            setIsForwardMessage,
            isForwardMessage,
            setActiveMessages,
            activeMessages,
            to,
            chatId: chatId || "",
            setIsSearchMessages,
            isSearchMessages,
            chat,
          }}
        >
          <div className="chat_page_container2">
            <div className="chat_page_container">
              {loader && <HiddenLoader />}
              <div
                className={
                  (store.blured ? "chat_page_blurred" : "") + " chat_background"
                }
                style={{
                  backgroundImage: `url(/${store.user?.activeChatWallpaper})`,
                }}
              ></div>
              <ChatPageHeader chat={chat} />
              <div className="chat_page_content">
                <ChatPageMessages
                  type="contact"
                  to={to}
                  messages={messages}
                  setMessages={setMessages}
                  messageText={messageText}
                  isSelectedMessages={isSelectedMessages}
                  setSelectedMessages={setSelectedMessages}
                  selectedMessages={selectedMessages}
                />
                <ChatPageFooter
                  setSelectedMessages={setSelectedMessages}
                  isSelectedMessages={isSelectedMessages}
                  selectedMessages={selectedMessages}
                  textAreaHeight={textAreaHeight}
                  setFocused={setFocused}
                  value={messageText}
                  onMessageSend={onMessageSend}
                  onChange={(e) => setMessageText(e.target.value)}
                />
              </div>
            </div>
            <SearchMessages
              messages={messages}
              chat={chat}
              style={{
                width: isSearchMessages ? "70%" : "0%",
              }}
            />
          </div>
        </ChatPageContext.Provider>
      )}
    </>
  );
});

export default ChatPage;
