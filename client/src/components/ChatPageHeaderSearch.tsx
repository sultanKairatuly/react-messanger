import { useEffect, useRef, useContext, useState } from "react";
import { ChatPageContext } from "./ChatPage";
import { useTranslation } from "react-i18next";

function ChatPageHeaderSearch() {
  const inputRef = useRef<null | HTMLInputElement>(null);
  const context = useContext(ChatPageContext);
  const [focused, setFocused] = useState(false);
  const { t } = useTranslation()

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  });

  return (
    <div className="chat_page_header_searches">
      <div
        className="chat_page_header_searches_back_btn"
        onClick={() => {
          context.setIsSearchMessages(false);
        }}
      >
        <i className="fa-solid fa-arrow-left chat_page_header_searches_back_icon"></i>
      </div>
      <div
        className={
          (focused
            ? "chat_page_header_searches_input_wrapper_active"
            : "chat_page_header_searches_input_wrapper_inactive") +
          " chat_page_header_searches_input_wrapper"
        }
      >
        <div className="chat_page_header_searches_back_btn">
          <i className="fa-solid fa-magnifying-glass chat_page_header_searches_search_icon"></i>
        </div>
        <input
          value={context.searchingPattern}
          onChange={(e) => context.setSearchingPattern(e.target.value)}
          ref={inputRef}
          type="text"
          placeholder={t("Search")}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="chat_page_header_searches_input"
        />
      </div>
    </div>
  );
}

export default ChatPageHeaderSearch;
