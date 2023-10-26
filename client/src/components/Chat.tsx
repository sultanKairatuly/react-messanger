import { Chat as ChatType, GroupChat, User } from "../types";
import "../styles/Chat.css";
import { observer } from "mobx-react";

type ChatProps = {
  chat: ChatType;
  onClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
};
const Chat = observer(function Chat({ chat, onClick }: ChatProps) {
  function renderGroup(group: GroupChat) {
    return (
      <div className="chat_container" onClick={onClick}>
        <div className="chat_image-wrapper">
          <img className="chat_image" src={group.avatar} alt="groupAvatar" />
        </div>
        <div className="chat_info">
          <h2 className="chat_title">{group.name}</h2>
          <p className="last_message">
            <span className="last_message-author">
              {group.messages.at(-1)?.author.name}:
            </span>
            <span className="last_message-text">
              {group.messages.at(-1)?.text}
            </span>
          </p>
        </div>
      </div>
    );
  }

  function renderContact(contact: User) {
    //! The last message's text of the current authorized user's conversation with contact !!
    return (
      <div className="chat_container" onClick={onClick}>
        <div className="chat_image-wrapper">
          <img className="chat_image" src={contact.avatar} alt="" />
        </div>
        <div className="chat_info">
          <h2 className="chat_title">{contact.name}</h2>
          <p className="last_message">
            <span className="last_message-author"></span>
            <span className="last_message-text"></span>
          </p>
        </div>
      </div>
    );
  }

  return chat.type === "group" ? renderGroup(chat) : renderContact(chat);
});

export default Chat;
