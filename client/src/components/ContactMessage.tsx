import {
  Message,
  SystemMessage,
  imageMessagePredicate,
  textMessagePredicate,
} from "../types";
import store from "../store/store";
import $api from "../api";
import { observer } from "mobx-react";
import { getTimeFormatted } from "../utils";
import { socket } from "../socket";
import UserAvatar from "./UserAvatar";

type ContactMessageProps = {
  message: Exclude<Message, SystemMessage>;
  onContextMenu: (
    ev: React.MouseEvent<HTMLDivElement, MouseEvent>,
    e: Message
  ) => void;
  isSelectedMessages: boolean;
  handleMessageClick: (e: Message) => void;
  contextMenu: string;
  selectedMessages: Exclude<Message, SystemMessage>[];
  to: string;
  chatId: string;
  observers: { current: IntersectionObserver[] };
  renderMessageContextMenu: (
    e: Exclude<Message, SystemMessage>
  ) => React.ReactNode;
  isName?: boolean;
  isAvatar?: boolean;
  group?: boolean;
};
const ContactMessage = observer(function ContactMessage({
  message: e,
  onContextMenu,
  isSelectedMessages,
  contextMenu,
  handleMessageClick,
  selectedMessages,
  to,
  isName = false,
  isAvatar = false,
  group = false,
  chatId,
  renderMessageContextMenu,
  observers,
}: ContactMessageProps) {
  // function getMediaSizes(src: string) {
  //   console.log("getMediaSizes");
  //   const video = document.createElement("video");
  //   video.src = src;
  //   video.onloadedmetadata = () => {
  //     console.log("width: ", video.videoWidth, "height: ", video.videoHeight);
  //   };
  //   video.load();
  // }
  return (
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
        (e.author?.userId === store.user?.userId
          ? " self_message"
          : " opossite_message") +
        " chat_page_message"
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
          (e.author?.userId === store.user?.userId
            ? "self_message"
            : "opossite_message") + " chat_page_message_content_wrapper"
        }
      >
        {group && !isAvatar && (
          <div className="message_author_avatar_wrapper"></div>
        )}
        {isAvatar && e.author.userId !== store.user?.userId && (
          <div className="message_author_avatar_wrapper">
            <UserAvatar color={e.author.randomColor} name={e.author.name} />
          </div>
        )}
        <div
          className={
            (e.author?.userId === store.user?.userId
              ? ""
              : "chat_page_message_content-opossite") +
            (e.type === "image"
              ? (e.text.length > 0 ? " chat_page_message_content_texed" : "") +
                " chat_page_message_content_image"
              : "") +
            " chat_page_message_content"
          }
        >
          {isName && (
            <div
              className={
                (e.type === "image" ? "chat_page_message_author_image" : "") +
                " chat_page_message_author"
              }
              style={{ color: e.author.randomColor }}
            >
              {e.author.name}
            </div>
          )}
          {e.type === "image" ? (
            <>
              <div
                className="image_message_wrapper"
                style={{
                  height: e.text.length === 0 ? "100%" : "",
                }}
              >
                {e.imageUrl.includes("image") ? (
                  <img src={e.imageUrl} alt="image" className="image_message" />
                ) : (
                  <video src={e.imageUrl} className="image_message">
                    <source src={e.imageUrl} />
                  </video>
                )}
              </div>
            </>
          ) : (
            <div>
              {e.type === "reply" ? (
                <div
                  onClick={() => {
                    const messageElement = document.querySelector(
                      `[data-id="${e.replyMessage.id}"]`
                    );
                    if (messageElement) {
                      messageElement.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                      messageElement.classList.add("contexed_message");
                      setTimeout(() => {
                        messageElement.classList.remove("contexed_message");
                      }, 1000);
                    }
                  }}
                  className="reply_message"
                  style={{
                    backgroundColor: `${e.replyMessage.author.randomColor.replace(
                      ")",
                      ""
                    )}, 0.4)`,
                  }}
                >
                  <h1 className="reply_message_name">
                    {e.replyMessage.author.name}
                  </h1>
                  {imageMessagePredicate(e.replyMessage) ? (
                    "Photo"
                  ) : (
                    <h2 className="reply_message_content">
                      {textMessagePredicate(e.replyMessage)
                        ? e.replyMessage.text
                        : e.text}
                    </h2>
                  )}
                </div>
              ) : null}
              {"imageUrl" in e && (
                <div
                  className="image_message_wrapper"
                  style={{
                    height: e.text.length === 0 ? "100%" : "",
                    marginTop: "10px",
                  }}
                >
                  {e.imageUrl.includes("image") ? (
                    <img
                      src={e.imageUrl}
                      alt="image"
                      className="image_message"
                    />
                  ) : (
                    <video src={e.imageUrl} className="image_message">
                      <source src={e.imageUrl} />
                    </video>
                  )}
                </div>
              )}
            </div>
          )}
          <div className="chat_page_message_text">
            {e.text.length > 0 && (
              <div className="text">
                {e.text.split("\n").map((t, i) => {
                  if (
                    e.status !== "read" &&
                    e.author?.userId !== store.user?.userId
                  ) {
                    const observer = new IntersectionObserver(([entry]) => {
                      if (entry.isIntersecting) {
                        $api.post(
                          `/read-message?to=${to}&messageId=${e.id}&user2=${chatId}&socket=${socket.id}`
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
            )}
            <footer className="chat_page_message_footer">
              {e.author.userId === store.user?.userId &&
                (e.status === "pending" ? (
                  <i className="fa-solid fa-check message_icon"></i>
                ) : e.status === "received" ? (
                  <i className="fa-solid fa-check-double message_icon"></i>
                ) : (
                  <i className="fa-solid fa-check-double message_icon message_icon-read"></i>
                ))}
              <div
                className={
                  ("imageUrl" in e && e.text.length === 0 ? "image_time" : "") +
                  " chat_page_message_time"
                }
              >
                {getTimeFormatted(e.createdAt, store.timeFormat)}
              </div>
            </footer>
          </div>
        </div>
        {group && !isAvatar && (
          <div className="message_author_avatar_wrapper"></div>
        )}
        {isAvatar && e.author.userId === store.user?.userId && (
          <div className="message_author_avatar_wrapper">
            <UserAvatar color={e.author.randomColor} name={e.author.name} />
          </div>
        )}
      </div>
      {renderMessageContextMenu(e)}
    </div>
  );
});

export default ContactMessage;
