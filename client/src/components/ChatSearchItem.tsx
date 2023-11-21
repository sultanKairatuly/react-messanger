import type { Chat } from "../types";

type ChatSearchItemProps = {
  chat: Chat;
  onClick?: () => void;
};
function ChatSearchItem({ chat, onClick }: ChatSearchItemProps) {
  return (
    <div className="chat_search_item" onClick={onClick}>
      <div className="chat_search_avatar_wrapper">
        <img
          src={chat.avatar}
          className="chat_search_avatar"
          alt="chat avatar"
        />
      </div>
      <h1 className="chat_search_title">{chat.name}</h1>
    </div>
  );
}

export default ChatSearchItem;
