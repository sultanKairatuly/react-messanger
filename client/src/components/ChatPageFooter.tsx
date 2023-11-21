import { Dispatch, SetStateAction, useContext, useState, useMemo } from "react";
import store from "../store/store";
import { observer } from "mobx-react";
import {
  GrayMenuItemType,
  Message,
  MessageQuery,
  ReplyMessage as ReplyMessageType,
  SystemMessage,
  userPredicate,
} from "../types";

import { v4 as uuidv4 } from "uuid";
import { ChatPageContext } from "./ChatPage";
import $api from "../api";
import GrayMenu from "./GrayMenu";
import AppModal from "./AppModal";
import AppButton from "./AppButton";
import ReplyMessage from "./ReplyMessage";

type ChatPageFooterProps = {
  value: string;
  onMessageSend: (message: MessageQuery) => void;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  setFocused: Dispatch<SetStateAction<boolean>>;
  textAreaHeight: number;
  selectedMessages: Exclude<Message, SystemMessage>[];
  isSelectedMessages: boolean;
  replyMessage: ReplyMessageType["replyMessage"] | null;
  setSelectedMessages: Dispatch<
    SetStateAction<Exclude<Message, SystemMessage>[]>
  >;
  setReplyMessage: Dispatch<
    SetStateAction<ReplyMessageType["replyMessage"] | null>
  >;
};

const ChatPageFooter = observer(function ChatPageFooter({
  value,
  onChange,
  onMessageSend,
  setFocused,
  setSelectedMessages,
  textAreaHeight,
  selectedMessages,
  replyMessage,
  isSelectedMessages,
  setReplyMessage,
}: ChatPageFooterProps) {
  const context = useContext(ChatPageContext);
  const [isMediaMenu, setMediaMenu] = useState(false);
  const [messageImage, setMessageImage] = useState("");
  const [isPhotoModal, setPhotoModal] = useState(false);
  const [imageText, setImageText] = useState("");

  const tailOptions: (Omit<GrayMenuItemType, "action"> & {
    action: (ev: unknown) => void;
  })[] = [
    {
      title: "Forward",
      icon: "fa-solid fa-share",
      id: uuidv4(),
      action() {
        context.setIsForwardMessage(true);
        context.setActiveMessages(selectedMessages);
        setSelectedMessages([]);
      },
    },
    {
      title: "Copy Text",
      icon: "fa-solid fa-clone",
      id: uuidv4(),
      async action() {
        let promises = "";
        for (const message of selectedMessages) {
          promises += `>${message.author.name}: ${message?.text}` || "";
        }
        await navigator.clipboard.writeText(promises);
        store.setNotificationMessage("Text is copied!");
        setSelectedMessages([]);
      },
    },
    {
      title: "Delete",
      icon: "fa-solid fa-trash",
      id: uuidv4(),
      async action() {
        const messagesId = selectedMessages.map((i) => i.id);
        store.setNotificationMessage("Message was deleted!");
        await $api.post(
          `/delete-message?to=${context.to}&messageId=_&user1=${store.user?.userId}&user2=${context.chatId}&type=array`,
          {
            messages: messagesId,
          }
        );
        setSelectedMessages([]);
      },
    },
  ];

  const mediaMenuItems = useMemo<GrayMenuItemType[]>(() => {
    return [
      {
        title: "Photo or video",
        icon: "fa-regular fa-image",
        id: uuidv4(),
        action: () => {
          const inputFile = document.createElement("input");
          inputFile.setAttribute("type", "file");
          inputFile.setAttribute(
            "accept",
            "image/png, image/gif, image/jpeg, video/mp4, video/x-m4v, video/*"
          );
          inputFile.addEventListener("change", () => {
            if (inputFile.files) {
              const reader = new FileReader();
              reader.onload = (e) => {
                const src = e.target?.result;
                if (src) setMessageImage(src.toString());
                setPhotoModal(true);
              };
              reader.readAsDataURL(inputFile.files[0]);
            }
          });
          inputFile.click();
        },
      },
      {
        title: "File",
        icon: "fa-solid fa-file",
        id: uuidv4(),
        action: () => {
          const inputFile = document.createElement("input");
          inputFile.setAttribute("type", "file");
          inputFile.setAttribute(
            "accept",
            "image/png, image/gif, image/jpeg, video/mp4, video/x-m4v, video/*"
          );
          inputFile.addEventListener("change", () => {
            if (inputFile.files) {
              const reader = new FileReader();
              reader.onload = (e) => {
                const src = e.target?.result;
                if (src) setMessageImage(src.toString());
              };
              reader.readAsDataURL(inputFile.files[0]);
            }
          });
          inputFile.click();
        },
      },
    ];
  }, []);

  const isBlocked =
    (store.user && store.user?.blockedContacts.includes(context.chatId)) ||
    (userPredicate(context.chat) &&
      store.user &&
      context.chat.blockedContacts.includes(store.user.userId));
  return (
    <>
      <AppModal setModal={setPhotoModal} isModal={isPhotoModal}>
        <div className="photo_modal">
          <h1 className="photo_modal_title">Send a Photo</h1>
          <div className="photo_modal_image_wrapper">
            {messageImage.includes("image") ? (
              <img
                src={messageImage}
                className="photo_modal_image"
                alt="photo"
              />
            ) : (
              <video src={messageImage} autoPlay></video>
            )}
          </div>
          <div className="photo_modal_footer">
            <input
              type="text"
              placeholder="Add a caption..."
              className="photo_modal_footer_input"
              value={imageText}
              onChange={(e) => setImageText(e.target.value)}
            />
            <AppButton
              onClick={() => {
                if (replyMessage) {
                  console.log(
                    "Reply Message from Footer Modal: ",
                    replyMessage
                  );
                  onMessageSend({
                    type: "reply",
                    replyingMessage: replyMessage,
                    dataType: "image",
                    imageUrl: messageImage,
                    text: imageText,
                  });
                } else {
                  onMessageSend({
                    type: "image",
                    imageUrl: messageImage,
                    text: imageText,
                  });
                }

                setPhotoModal(false);
                setImageText("");
                setMessageImage("");
              }}
            >
              Send
            </AppButton>
          </div>
        </div>
      </AppModal>
      {isBlocked && (
        <div className="chat_page_footer">
          <h1 className="blocked_message">
            {store.user && store.user.blockedContacts.includes(context.chatId)
              ? "Вы заблокировали этого пользователя"
              : "Этот пользователь вас заблокировал"}
          </h1>
        </div>
      )}
      {!isSelectedMessages && !isBlocked && (
        <div className="chat_page_footer">
          <div
            className={
              (replyMessage != null ? "unbordered_radius" : "") +
              " chat_page_footer_input_wrapper"
            }
            style={{
              height: `${textAreaHeight}px`,
            }}
          >
            <textarea
              className="chat_page_footer_input"
              style={{
                fontSize: `${store.messageSize}px`,
              }}
              value={value}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onChange={onChange}
            />
            <button
              className="chat_page_button"
              onClick={() => setMediaMenu(!isMediaMenu)}
            >
              <i className="fa-solid fa-paperclip chat_page_button_icon"></i>
            </button>
            <div
              className={
                (replyMessage
                  ? "reply_message_active"
                  : "reply_message_inactive") + " reply_message"
              }
            >
              {replyMessage ? (
                <ReplyMessage
                  replyMessage={replyMessage}
                  setReplyMessage={setReplyMessage}
                />
              ) : null}
            </div>
          </div>
          <button
            className="chat_page_button"
            onClick={() => {
              if (replyMessage) {
                onMessageSend({
                  type: "reply",
                  replyingMessage: replyMessage,
                  dataType: "text",
                });
              } else {
                onMessageSend({ type: "text" });
              }
            }}
          >
            <i className="fa-solid fa-paper-plane chat_page_button_icon"></i>
          </button>
          <div className="menu">
            <GrayMenu
              position={{ y: -100, x: 80 }}
              isMenu={isMediaMenu}
              items={mediaMenuItems}
              animationFrom="bottom right"
            />
          </div>
        </div>
      )}
      {isSelectedMessages && (
        <div className="chat_page_footer">
          <div className="footer_selected_wrapper">
            <div className="footer_selected_wrapper_head">
              <button
                className="footer_selected_button"
                onClick={() => {
                  onMessageSend({ type: "text" });
                }}
              >
                <i className="fa-solid fa-xmark chat_page_button_icon"></i>
              </button>
              <div className="footer_specified_text">
                {selectedMessages.length} messages selected
              </div>
            </div>

            <div className="footer_selected_wrapper_tail">
              {tailOptions.map((option) => {
                if (
                  option.icon.includes("fa-trash") &&
                  selectedMessages.every(
                    (m) => m.author.userId === store.user?.userId
                  )
                ) {
                  return (
                    <button
                      key={option.id}
                      className="footer_selected_button"
                      onClick={option.action}
                    >
                      <i
                        className={
                          option.icon + " chat_page_button_icon  red-icon"
                        }
                      ></i>
                    </button>
                  );
                } else if (
                  option.icon.includes("fa-trash") &&
                  !selectedMessages.every(
                    (m) => m.author.userId === store.user?.userId
                  )
                ) {
                  return null;
                } else {
                  return (
                    <button
                      key={option.id}
                      className="footer_selected_button"
                      onClick={option.action}
                    >
                      <i className={option.icon + " chat_page_button_icon"}></i>
                    </button>
                  );
                }
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default ChatPageFooter;
