import "../styles/ChatContent.css";
import { observer } from "mobx-react";
import store from "../store/store";

const ChatContent = observer(function () {
  return (
    <div
      className={(store.blured ? "chat_content-blurred" : "") + " chat_content "}
      style={{ backgroundImage: `url(${store.chatWallpaperImage})` }}
    >
    </div>
  );
});

export default ChatContent;
