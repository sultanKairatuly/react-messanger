import { Dispatch, SetStateAction, useContext } from "react";
import store from "../store/store";
import { observer } from "mobx-react";
import { GrayMenuItemType, Message, userPredicate } from "../types";
import { v4 as uuidv4 } from "uuid";
import { ChatPageContext } from "./ChatPage";
import $api from "../api";

type ChatPageFooterProps = {
  value: string;
  onMessageSend: () => void;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  setFocused: Dispatch<SetStateAction<boolean>>;
  textAreaHeight: number;
  selectedMessages: Message[];
  isSelectedMessages: boolean;
  setSelectedMessages: Dispatch<SetStateAction<Message[]>>;
};

const ChatPageFooter = observer(function ChatPageFooter({
  value,
  onChange,
  onMessageSend,
  setFocused,
  setSelectedMessages,
  textAreaHeight,
  selectedMessages,
  isSelectedMessages,
}: ChatPageFooterProps) {
  const context = useContext(ChatPageContext);
  const tailOptions: (Omit<GrayMenuItemType, "action"> & {
    action: (ev: unknown) => void;
  })[] = [
    {
      title: "Forward",
      icon: "fa-solid fa-share",
      id: uuidv4(),
      action() {
        context.setIsForwardMessage(true);
        context.setActiveMessages(selectedMessages);
        setSelectedMessages([]);
      },
    },
    {
      title: "Copy Text",
      icon: "fa-solid fa-clone",
      id: uuidv4(),
      async action() {
        let promises = "";
        for (const message of selectedMessages) {
          promises += `>${message.author.name}: ${message?.text}` || "";
        }
        await navigator.clipboard.writeText(promises);
        store.setNotificationMessage("Text is copied!");
        setSelectedMessages([]);
      },
    },
    {
      title: "Delete",
      icon: "fa-solid fa-trash",
      id: uuidv4(),
      async action() {
        await $api.post(
          `/delete-message?to=${context.to}&messageId=_&user1=${store.user?.userId}&user2=${context.chatId}&type=array`,
          {
            messages: selectedMessages.map((i) => i.id),
          }
        );
        store.setNotificationMessage("Message was deleted!");
        setSelectedMessages([]);
      },
    },
  ];

  const isBlocked =
    (store.user && store.user?.blockedContacts.includes(context.chatId)) ||
    (userPredicate(context.chat) &&
      store.user &&
      context.chat.blockedContacts.includes(store.user.userId));
  return (
    <>
      {isBlocked && (
        <div className="chat_page_footer">
          <h1 className="blocked_message">
            {store.user && store.user.blockedContacts.includes(context.chatId)
              ? "Вы заблокировали этого пользователя"
              : "Этот пользователь вас заблокировал"}
          </h1>
        </div>
      )}
      {!isSelectedMessages && !isBlocked && (
        <div className="chat_page_footer">
          <textarea
            className="chat_page_footer_input"
            style={{
              height: `${textAreaHeight}px`,
              fontSize: `${store.messageSize}px`,
            }}
            value={value}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={onChange}
          />
          <button className="chat_page_button" onClick={onMessageSend}>
            <i className="fa-solid fa-paper-plane chat_page_button_icon"></i>
          </button>
        </div>
      )}
      {isSelectedMessages && (
        <div className="chat_page_footer">
          <div className="footer_selected_wrapper">
            <div className="footer_selected_wrapper_head">
              <button
                className="footer_selected_button"
                onClick={onMessageSend}
              >
                <i className="fa-solid fa-xmark chat_page_button_icon"></i>
              </button>
              <div className="footer_specified_text">
                {selectedMessages.length} messages selected
              </div>
            </div>

            <div className="footer_selected_wrapper_tail">
              {tailOptions.map((option) => {
                if (
                  option.icon.includes("fa-trash") &&
                  selectedMessages.every(
                    (m) => m.author.userId === store.user?.userId
                  )
                ) {
                  return (
                    <button
                      key={option.id}
                      className="footer_selected_button"
                      onClick={option.action}
                    >
                      <i
                        className={
                          option.icon + " chat_page_button_icon  red-icon"
                        }
                      ></i>
                    </button>
                  );
                } else if (
                  option.icon.includes("fa-trash") &&
                  !selectedMessages.every(
                    (m) => m.author.userId === store.user?.userId
                  )
                ) {
                  return null;
                } else {
                  return (
                    <button
                      key={option.id}
                      className="footer_selected_button"
                      onClick={option.action}
                    >
                      <i className={option.icon + " chat_page_button_icon"}></i>
                    </button>
                  );
                }
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default ChatPageFooter;
