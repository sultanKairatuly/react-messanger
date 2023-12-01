import "../styles/emptyChatPage.css";
import store from "../store/store";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

const EmptyChatPage = observer(function EmptyChatPage() {
  const { t, i18n } = useTranslation();
  return (
    <div
      className="empty_chat_page_container"
      style={{
        backgroundImage: `url(${store.user?.activeChatWallpaper})`,
      }}
    >
      <h1
        className="empty_chat_page_title"
        onClick={() =>
          i18n.changeLanguage(i18n.language === "ru" ? "en" : "ru")
        }
      >
        {t("emptyPageMessage")}
      </h1>
    </div>
  );
});

export default EmptyChatPage;
