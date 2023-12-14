import { Message, SystemMessage } from "../types";
import store from "../store/store";
import { observer } from "mobx-react";
import { hasDifference } from "../utils";
import ContactMessage from "./ContactMessage";

type GroupMessageProp = {
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
  messages: Exclude<Message, SystemMessage>[];
};

const isAvatar = (
  e: Exclude<Message, SystemMessage>,
  messages: Exclude<Message, SystemMessage>[]
) => {
  const prevMessage =
    messages[messages.findIndex((m) => m.id === e.id) - 1]?.author?.userId ===
    e.author.userId;
  const nextMessage =
    messages[messages.findIndex((m) => m.id === e.id) + 1]?.author?.userId ===
    e.author.userId;

  if (!prevMessage && !nextMessage) return true;
  if (!prevMessage && nextMessage) return true;
  if (prevMessage && nextMessage) return false;
};

const isName = (
  e: Exclude<Message, SystemMessage>,
  messages: Exclude<Message, SystemMessage>[]
) => {
  return (
    ((messages[messages.findIndex((m) => m.id === e.id) - 1]?.author?.userId !==
      e.author.userId ||
      !messages[messages.findIndex((m) => m.id === e.id) - 1]) &&
      messages[messages.findIndex((m) => m.id === e.id) + 1]?.author?.userId ===
        e.author.userId) ||
    hasDifference(
      messages[messages.findIndex((m) => m.id === e.id) - 1],
      messages[messages.findIndex((m) => m.id === e.id)]
    )
  );
};
const GroupMessage = observer(function GroupMessage({
  message: e,
  onContextMenu,
  isSelectedMessages,
  contextMenu,
  handleMessageClick,
  selectedMessages,
  to,
  renderMessageContextMenu,
  observers,
  messages,
}: GroupMessageProp) {
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
        (e.author.userId === store.user?.userId
          ? " self_message"
          : " opossite_message") + " chat_page_message group_message"
      }
    >
      {}
      <div
        className={
          (e.author.userId === store.user?.userId
            ? "self_message"
            : "opossite_message") + " chat_page_message_content_wrapper"
        }
        style={{
          padding: 0,
        }}
      >
        <div className="group_message_wrapper">
          <ContactMessage
            group={true}
            message={e}
            isAvatar={isAvatar(e, messages)}
            isName={isName(e, messages)}
            onContextMenu={onContextMenu}
            isSelectedMessages={isSelectedMessages}
            contextMenu={contextMenu}
            handleMessageClick={handleMessageClick}
            renderMessageContextMenu={renderMessageContextMenu}
            selectedMessages={selectedMessages}
            to={to}
            chatId={to}
            observers={observers}
          />
        </div>
      </div>
    </div>
  );
});

export default GroupMessage;
