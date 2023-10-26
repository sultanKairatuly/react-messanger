import { Chat } from "../types";
import "../styles/chatItem.css";

type ChatItemProps = {
  chat: Chat;
  topRightText: React.ReactNode | string;
  children?: React.ReactNode;
  onClick?: () => void;
  icon?: string;
};
function ChatItem({
  chat,
  topRightText,
  onClick,
  children,
  icon,
}: ChatItemProps) {
  return (
    <div className="chat_item_container" onClick={onClick}>
      <div className="chat_item_avatar_wrapper">
        <img
          src={chat.avatar}
          alt="chat picture"
          className="chat_item_avatar"
        />
      </div>
      <div className="chat_item_text">
        <div className="chat_item_title">
          <h2 className="chat_item_title_text">{chat.name}</h2>
          <div className="chat_item_icon_wrapper">
            <i className={icon + " chat_item_icon"}></i>
          </div>
        </div>

        <h4 className="chat_item_subtitle">{children}</h4>
      </div>

      <div className="chat_item_subtitle">{topRightText}</div>
    </div>
  );
}

export default ChatItem;
