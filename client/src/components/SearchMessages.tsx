import "../styles/searchMessages.css";
import { Chat, Message } from "../types";
import ChatItem from "./ChatItem";
import SearchMessagesHeader from "./SearchMessagesHeader";
import { useState, useMemo } from "react";
import { getTimeFormatted } from "../utils";
import store from "../store/store";
import { observer } from "mobx-react";

type SearchMessagesProps = {
  messages: Message[];
  chat: Chat;
  style?: Record<string, unknown>;
};

const renderHintedMessage = (messageText: string, query: string) =>
  messageText
    .split("")
    .map((str) =>
      query.includes(str) ? <span className="highjlited">{str}</span> : str
    );

const SearchMessages = observer(function SearchMessages({
  messages,
  chat,
  style,
}: SearchMessagesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const filteredMessages = useMemo(
    () =>
      !searchQuery ? [] : messages.filter((m) => m.text.includes(searchQuery)),
    [messages, searchQuery]
  );

  return (
    <div className="search_messages" style={style}>
      <SearchMessagesHeader
        value={searchQuery}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSearchQuery(e.target.value)
        }
      />
      <div className="search_found_messages">
        {searchQuery &&
          filteredMessages &&
          filteredMessages.map((message) => (
            <ChatItem
              topRightText={getTimeFormatted(
                message.createdAt,
                store.timeFormat
              )}
              chat={chat}
              key={message.id}
              onClick={() => {
                const messageElement = document.querySelector(
                  `[data-id="${message.id}"]`
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
            >
              <div>{renderHintedMessage(message.text, searchQuery)}</div>
            </ChatItem>
          ))}
        {!searchQuery && (
          <div className="search_messages_text">Search for messages</div>
        )}
        {searchQuery && !filteredMessages.length && (
          <div className="search_messages_text">Couldn't find any messages</div>
        )}
      </div>
    </div>
  );
});

export default SearchMessages;
