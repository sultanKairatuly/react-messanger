import "../styles/searchMessagesHeader.css";
import { useState, useContext } from "react";
import { ChatPageContext } from "./ChatPage";
import { DatePicker } from "react-date-picker";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";

type SearchMessagesHeaderProps = {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

function SearchMessagesHeader({ value, onChange }: SearchMessagesHeaderProps) {
  const [isFocused, setIsFocused] = useState(false);
  const context = useContext(ChatPageContext);
  const [dateValue, setDateValue] = useState(new Date(Date.now()));

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
      <DatePicker
        closeCalendar={false}
        onChange={(value) => {
          if (value instanceof Date) {
            const messageElement = document.querySelector(
              `[data-date="${value.toLocaleDateString()}"]`
            );
            if (messageElement) {
              messageElement.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
              messageElement.classList.add("contexed_message");
              setTimeout(() => {
                messageElement.classList.remove("contexed_message");
              }, 1000);
            }
            setDateValue(value as Date);
          }
        }}
        value={dateValue}
      />
    </div>
  );
}

export default SearchMessagesHeader;
