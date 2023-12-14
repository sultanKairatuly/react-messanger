import "../styles/chatPage.css";
import $api from "../api";
import useQuery from "../hooks/useQuery";
import store from "../store/store";
import {
  useEffect,
  useState,
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useParams } from "react-router-dom";
import {
  Message,
  chatPredicate,
  Chat,
  SystemMessage,
  groupChatPredicate,
  ImageMessage,
  TextMessage,
  ReplyMessage,
  MessageQuery,
  User,
  userPredicate,
} from "../types";

import { v4 as uuidv4 } from "uuid";
import { observer } from "mobx-react";
import { EmittingData } from "../types";
import { socket } from "../socket";
import _ from "lodash";
import UserInfo from "./UserInfo";
import GroupInfo from "./GroupInfo";
import ChatPageHeader from "./ChatPageHeader";
import ChatPageMessages from "./ChatPageMessages";
import ChatPageFooter from "./ChatPageFooter";
import HiddenLoader from "./HiddenLoader";

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
  searchingPattern: string;
  setSearchingPattern: Dispatch<SetStateAction<string>>;
  setIsUserInfo: Dispatch<SetStateAction<boolean>>;
  setIsGroupInfo: Dispatch<SetStateAction<boolean>>;
  setActiveUserInfo: Dispatch<SetStateAction<User | null>>;
};
export const ChatPageContext = createContext({} as ChatPageContextType);
const ChatPage = observer(function ChatPage() {
  const { chatId } = useParams();
  const query = useQuery();
  const [chat, setChat] = useState<Chat | null>(null);
  const [messageText, setMessageText] = useState("");
  const [textAreaHeight, setTextAreaHeight] = useState(MIN_TEXTAREA_HEIGHT);
  const [loader, setLoader] = useState(false);
  const [ctrl, setCtrl] = useState(false);
  const [shift, setShift] = useState(false);
  const [focused, setFocused] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<
    Exclude<Message, SystemMessage>[]
  >([]);
  const isSelectedMessages = selectedMessages.length > 0;
  const [isForwardMessage, setIsForwardMessage] = useState(false);
  const [activeMessages, setActiveMessages] = useState<Message[]>([]);
  const [isSearchMessages, setIsSearchMessages] = useState(false);
  const [searchingPattern, setSearchingPattern] = useState("");
  const [replyMessage, setReplyMessage] = useState<
    ReplyMessage["replyMessage"] | null
  >(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const container = useRef<null | HTMLDivElement>(null);
  const timeId = useRef(Infinity);
  const footerSearchContainer = useRef<null | HTMLDivElement>(null);
  const to = useMemo(() => {
    if (chat) {
      return (
        (chat.type === "group"
          ? chatId
          : ((store.user?.userId || "") + chatId).split("").sort().join("")) ||
        ""
      );
    } else {
      return "";
    }
  }, [chatId, chat]);
  const [isUserInfo, setIsUserInfo] = useState(false);
  const [isGroupInfo, setIsGroupInfo] = useState(false);
  const [activeUserInfo, setActiveUserInfo] = useState<User | null>(null);
  const onMessageSend = useCallback(
    async (messageDetails: MessageQuery) => {
      const notEmptyWhileTextReply =
        messageDetails.type === "reply" &&
        messageDetails.dataType === "text" &&
        messageText.length > 0;
      const emptyWhileImageReply =
        messageDetails.type === "reply" && messageDetails.dataType === "image";
      if (
        store.user &&
        chatId &&
        chat &&
        ((messageDetails.type === "text" &&
          messageText.split("").filter((e) => e !== "" && e !== "\n").length) ||
          messageDetails.type === "image" ||
          notEmptyWhileTextReply ||
          emptyWhileImageReply)
      ) {
        let message = {} as Message;
        if (messageDetails.type === "text") {
          message = {
            author: store.user,
            text: messageText,
            type: "text",
            createdAt: Date.now(),
            id: uuidv4(),
            status: "pending",
          } satisfies TextMessage;
        } else if (messageDetails.type === "image") {
          message = {
            author: store.user,
            type: "image",
            createdAt: Date.now(),
            id: uuidv4(),
            text: messageDetails.text,
            imageUrl: messageDetails.imageUrl,
            status: "pending",
          } satisfies ImageMessage;
        }
        let rm: ReplyMessage | null = null;
        if (messageDetails.type === "reply" && messageDetails.replyingMessage) {
          if (messageDetails.dataType === "text") {
            rm = {
              author: store.user,
              text: messageText,
              type: "reply",
              createdAt: Date.now(),
              id: uuidv4(),
              status: "pending",
              replyMessage: messageDetails.replyingMessage,
            };
          } else if (messageDetails.dataType === "image") {
            rm = {
              author: store.user,
              text: messageDetails.text,
              imageUrl: messageDetails.imageUrl,
              type: "reply",
              createdAt: Date.now(),
              id: uuidv4(),
              status: "pending",
              replyMessage: messageDetails.replyingMessage,
            };
          }
        }

        const emittingData: EmittingData = {
          to:
            (chat?.type === "contact"
              ? (store.user.userId + chat.userId).split("").sort().join("")
              : chat?.chatId) || "",
          user1: store.user.userId,
          user2: chatId,
          message: rm ? rm : message,
          type: chat?.type,
          socketId: socket.id,
        };
        setMessageText("");
        setTextAreaHeight(MIN_TEXTAREA_HEIGHT);
        $api.post(
          `/stopped-typing?chatId=${chatId}&userId=${store.user?.userId}&socket=${socket.id}`
        );
        setReplyMessage(null);
        await $api.post("/send-message", emittingData);
      }
    },
    [chatId, messageText, chat]
  );
  useEffect(() => {
    socket.on("update-chat", (chat: unknown) => {
      if (chatPredicate(chat)) {
        setChat(chat);
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

    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
      socket.off("update-chat");
    };
  }, []);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (store.user) {
        const message = {
          author: store.user,
          text: messageText,
          type: "text",
          createdAt: Date.now(),
          id: uuidv4(),
          status: "pending",
        } as const;
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
              onMessageSend(message);
            }
          } else {
            if (e.code === "Enter" && ctrl) {
              onMessageSend(message);
            } else if (e.code === "Enter") {
              if (textAreaHeight > MIN_TEXTAREA_HEIGHT) {
                setTextAreaHeight((t) => t + 20);
              }
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
  const delayedQuery = useCallback(
    _.debounce((value: string) => {
      if (value.split("").filter((val) => val !== "\n").length !== 0) {
        $api.post(`/typing?chatId=${chatId}&userId=${store.user?.userId}`);
      } else {
        $api.post(
          `/stopped-typing?chatId=${chatId}&userId=${store.user?.userId}`
        );
      }
    }, 500),
    [chatId]
  );

  return (
    <>
      {chat ? (
        <ChatPageContext.Provider
          value={{
            setIsForwardMessage,
            setIsGroupInfo,
            isForwardMessage,
            setActiveMessages,
            activeMessages,
            to,
            chatId: chatId || "",
            setIsSearchMessages,
            isSearchMessages,
            chat,
            searchingPattern,
            setSearchingPattern,
            setIsUserInfo,
            setActiveUserInfo,
          }}
        >
          <div
            className="chat_page_container2"
            ref={container}
            style={{
              width:
                windowWidth <= 900 && windowWidth > 500
                  ? store.isSidebar
                    ? "200%"
                    : "100%"
                  : "100%",
            }}
          >
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
              <ChatPageHeader
                chat={chat}
                setIsUserInfo={setIsUserInfo}
                setSearchingPattern={setSearchingPattern}
              />
              <div className="chat_page_content">
                <ChatPageMessages
                  type={chat.type}
                  setReplyMessage={setReplyMessage}
                  to={to}
                  footerSearchContainer={footerSearchContainer.current}
                  isSearchMessages={isSearchMessages}
                  messageText={messageText}
                  isSelectedMessages={isSelectedMessages}
                  setSelectedMessages={setSelectedMessages}
                  selectedMessages={selectedMessages}
                  chat={chat}
                  containerRef={container.current}
                />
                {groupChatPredicate(chat) &&
                  !chat.members.find(
                    (member) => member.userId === store.user?.userId
                  ) && (
                    <button
                      className="join_button"
                      onClick={() => {
                        socket.emit("joinGroup", {
                          chat: {
                            chatId,
                            members: chat.members.map((m) => m.userId),
                          },
                          joiner: store.user,
                          role: "member",
                        });
                        chatId &&
                          !store.user?.chats.includes(chatId) &&
                          store.user?.chats.push(chatId);
                        localStorage.setItem(
                          "user",
                          JSON.stringify(store.user)
                        );
                      }}
                    >
                      JOIN
                    </button>
                  )}
                {
                  <div
                    ref={footerSearchContainer}
                    className="chat_page_footer_search_container"
                    style={{
                      visibility:
                        !isSearchMessages || windowWidth > 500
                          ? "hidden"
                          : "visible",
                      opacity: !isSearchMessages || windowWidth > 500 ? 0 : 1,
                      display:
                        !isSearchMessages || windowWidth > 500
                          ? "none"
                          : "block",
                    }}
                  ></div>
                }
                {!isSearchMessages ? (
                  groupChatPredicate(chat) ? (
                    chat.members.find(
                      (member) => member.userId === store.user?.userId
                    ) && (
                      <ChatPageFooter
                        setReplyMessage={setReplyMessage}
                        setSelectedMessages={setSelectedMessages}
                        isSelectedMessages={isSelectedMessages}
                        selectedMessages={selectedMessages}
                        textAreaHeight={textAreaHeight}
                        setFocused={setFocused}
                        value={messageText}
                        onMessageSend={onMessageSend}
                        replyMessage={replyMessage}
                        onChange={(e) => {
                          delayedQuery(e.target.value);
                          clearTimeout(timeId.current);
                          setMessageText(e.target.value);
                        }}
                      />
                    )
                  ) : (
                    <ChatPageFooter
                      setReplyMessage={setReplyMessage}
                      setSelectedMessages={setSelectedMessages}
                      isSelectedMessages={isSelectedMessages}
                      selectedMessages={selectedMessages}
                      textAreaHeight={textAreaHeight}
                      setFocused={setFocused}
                      value={messageText}
                      replyMessage={replyMessage}
                      onMessageSend={onMessageSend}
                      onChange={(e) => {
                        delayedQuery(e.target.value);
                        clearTimeout(timeId.current);
                        setMessageText(e.target.value);
                      }}
                    />
                  )
                ) : null}
              </div>
            </div>
            <UserInfo
              style={{
                width: isUserInfo && !isSearchMessages ? "100%" : "0%",
              }}
              setIsUserInfo={setIsUserInfo}
              chat={
                activeUserInfo
                  ? activeUserInfo
                  : userPredicate(chat)
                  ? chat
                  : null
              }
            />
            <GroupInfo
              style={{
                width: isGroupInfo && !isSearchMessages ? "100%" : "0%",
              }}
              setIsGroupInfo={setIsGroupInfo}
            />
          </div>
        </ChatPageContext.Provider>
      ) : (
        <div className="chat_page_container">
          <HiddenLoader />
        </div>
      )}
    </>
  );
});

export default ChatPage;
