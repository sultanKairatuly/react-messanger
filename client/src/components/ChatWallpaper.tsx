import { observer } from "mobx-react";
import PageHeader from "./PageHeader";
import "../styles/chatWallpaper.css";
import store from "../store/store";
import SettingsOptionsList from "./SettingsOptionsList";
import { SettingsOptionType } from "../types";
import AppRadio from "./AppRadio";

const backgrounds = [
  "chat_bg1.jpeg",
  "chat_bg2.jpeg",
  "chat_bg3.jpeg",
  "chat_bg4.jpeg",
  "chat_bg5.jpeg",
  "chat_bg6.jpeg",
  "chat_bg7.jpeg",
  "chat_bg8.jpeg",
  "chat_bg9.jpeg",
  "chat_bg10.jpeg",
  "chat_bg11.jpeg",
  "chat_bg12.jpeg",
];
const ChatWallpaper = observer(() => {
  const options: SettingsOptionType[] = [
    {
      title: "Upload image",
      icon: "fa-solid fa-camera",
      action() {},
    },
    {
      title: "Set a color",
      icon: "fa-solid fa-pen-nib",
      action() {},
    },
    {
      title: "Reset to default",
      icon: "fa-solid fa-star",
      action() {
        store.blured = true;
        store.chatWallpaperImage = "chat_bg0.jpeg";
        localStorage.setItem("chwp", store.chatWallpaperImage);
      },
    },
  ];

  function handleBackClick() {
    store.chatWallpaper = false;
  }

  function handleBluredClick() {
    store.blured = !store.blured;
  }

  function handleChatWallpaperClick(imageUrl: string) {
    store.chatWallpaperImage = imageUrl;
    localStorage.setItem("chwp", imageUrl);
  }

  return (
    <div className="chat_wallpaper_container">
      <PageHeader handleBackClick={handleBackClick} title="Chat Wallpaper" />
      <div className="chat_wallpaper_controls">
        <SettingsOptionsList options={options} />
        <AppRadio
          title="Blurred"
          clickHandler={handleBluredClick}
          checked={store.blured}
          classNameRoot="chat_wallpaper_radio"
        />
      </div>
      <div className="chat_wallpaper_backgrounds">
        {backgrounds.map((bg) => (
          <div
            key={bg}
            className={
              (bg === store?.user?.activeChatWallpaper
                ? "chat_wallpaper_background_wrapper_active"
                : "") + " chat_wallpaper_background_wrapper"
            }
            onClick={() => handleChatWallpaperClick(bg)}
          ></div>
        ))}
      </div>
    </div>
  );
});

export default ChatWallpaper;
