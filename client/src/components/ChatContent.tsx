import "../styles/ChatContent.css";
import { observer } from "mobx-react";
import store from "../store/store";

const ChatContent = observer(function () {
  return (
    <div className={" chat_content"}>
      <div
        className={(store.blured ? "chat_content-blurred" : "") + " chat_content_background"}
        style={{ backgroundImage: `url(${store.user?.activeChatWallpaper})` }}
      ></div>
    </div>
  );
});

export default ChatContent;
