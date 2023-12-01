import { Message } from "../types";
import { useContext, useMemo, useState, useEffect } from "react";
import { ChatPageContext } from "./ChatPage";
import { useTranslation } from "react-i18next";

type ChatPageFooterSearchProps = {
  messages: Message[];
};
function ChatPageFooterSearch({ messages }: ChatPageFooterSearchProps) {
  const context = useContext(ChatPageContext);
  const {
    i18n: { language },
  } = useTranslation();
  const filteredMessages = useMemo(
    () =>
      messages.filter((m) =>
        m.text.toLowerCase().includes(context.searchingPattern.toLowerCase())
      ),
    [messages, context.searchingPattern]
  );
  const [index, setIndex] = useState(0);
  function scrollToMessage(messageId: string) {
    const messageElement = document.querySelector(`[data-id="${messageId}"]`);
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
  }
  useEffect(() => {
    setIndex(0);
    if (filteredMessages.length > 0 && context.searchingPattern.length > 0) {
      scrollToMessage(filteredMessages[index].id);
    }
  }, [context.searchingPattern]);
  function handleNavigation(dir: "up" | "down") {
    if (dir === "up") {
      if (index < filteredMessages.length - 1) {
        scrollToMessage(filteredMessages[index + 1].id);
        setIndex(index + 1);
      } else {
        setIndex(() => 0);
        scrollToMessage(filteredMessages[0].id);
      }
    } else {
      if (index > 0) {
        scrollToMessage(filteredMessages[index - 1].id);
        setIndex(index - 1);
      } else {
        setIndex(() => filteredMessages.length - 1);
        scrollToMessage(filteredMessages[filteredMessages.length - 1].id);
      }
    }
  }
  return (
    <div className="chat_page_footer_search_content">
      {
        <h2
          className="chat_page_footer_search_counts"
          style={{
            visibility:
              context.searchingPattern.length > 0 ? "visible" : "hidden",
            opacity: context.searchingPattern.length > 0 ? 1 : 0,
          }}
        >
          {index + 1} {language === "en" ? "of" : "из"}{" "}
          {filteredMessages.length}
        </h2>
      }
      <div className="chat_page_footer_search_navigation">
        <i
          className="fa-solid fa-arrow-up footer_arrow_icon"
          style={{
            opacity: context.searchingPattern.length > 0 ? 1 : 0.7,
          }}
          onClick={() =>
            context.searchingPattern.length > 0 && handleNavigation("up")
          }
        ></i>
        <i
          className="fa-solid fa-arrow-down footer_arrow_icon"
          style={{
            opacity: context.searchingPattern.length > 0 ? 1 : 0.7,
          }}
          onClick={() =>
            context.searchingPattern.length > 0 && handleNavigation("down")
          }
        ></i>
      </div>
    </div>
  );
}

export default ChatPageFooterSearch;
