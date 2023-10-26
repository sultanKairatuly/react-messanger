import "../styles/searchMessagesHeader.css";
import { useState, useContext } from "react";
import { ChatPageContext } from "./ChatPage";

type SearchMessagesHeaderProps = {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

function SearchMessagesHeader({ value, onChange }: SearchMessagesHeaderProps) {
  const [isFocused, setIsFocused] = useState(false);
  const context = useContext(ChatPageContext);

  return (
    <div className="search_messages_header">
      <button
        className="search_messages_header_close"
        onClick={() => context.setIsSearchMessages(false)}
      >
        <i className="fa-solid fa-xmark"></i>
      </button>
      <div className="search_messages_header_search_wrapper">
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder="Search"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={
            (isFocused ? "search_messages_header_search_input-active" : "") +
            " search_messages_header_search_input"
          }
        />
      </div>
      <button className="search_messages_header_date">
        <i className="fa-regular fa-calendar "></i>
      </button>
    </div>
  );
}

export default SearchMessagesHeader;
