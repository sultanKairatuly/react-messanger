import { useState } from "react";
import { observer } from "mobx-react";
import PageHeader from "./PageHeader";
import "../styles/chatWallpaper.css";
import store from "../store/store";
import SettingsOptionsList from "./SettingsOptionsList";
import { SettingsOptionType, userPredicate, User } from "../types";
import AppRadio from "./AppRadio";
import $api from "../api";
import Loader from "./Loader";

const ChatWallpaper = observer(() => {
  const [loader, setLoader] = useState(false);
  const [loadingWallpaper, setLoadingWallpaper] = useState("");
  const options: SettingsOptionType[] = [
    {
      title: "Upload image",
      icon: "fa-solid fa-camera",
      async action() {
        try {
          if (userPredicate(store.user)) {
            const user = store.user;
            const inputFile = document.createElement("input");
            inputFile.setAttribute("type", "file");
            inputFile.setAttribute(
              "accept",
              "image/png, image/gif, image/jpeg"
            );
            inputFile.addEventListener("change", () => {
              if (inputFile.files) {
                setLoader(true);
                const reader = new FileReader();
                reader.onload = async (e) => {
                  const updatedUser = await $api.post(
                    `/update-user-wallpapers`,
                    {
                      wallpaper: e.target?.result || "",
                      prevUser: user,
                    }
                  );
                  if (userPredicate(updatedUser.data)) {
                    store.setUser(updatedUser.data);
                  }
                  setLoader(false);
                };
                reader.readAsDataURL(inputFile.files[0]);
              }
            });
            inputFile.click();
          }
        } catch (e) {
          console.log("An error occured: ", e);
        } finally {
          setLoader(false);
        }
      },
    },
    {
      title: "Set a color",
      icon: "fa-solid fa-pen-nib",
      action() {},
    },
    {
      title: "Reset to default",
      icon: "fa-solid fa-star",
      async action() {
        try {
          setLoader(true);
          if (userPredicate(store.user)) {
            const updatedUser = await $api.post<User>(`/update-user`, {
              field: "activeChatWallpaper",
              val: "chat_bg0.jpeg",
              prevUser: store.user || {},
            });
            store.blured = true;
            store.user = updatedUser.data;
            localStorage.setItem("user", JSON.stringify(store.user));
          }
        } catch (e) {
          console.log("Error occured: ", e);
        } finally {
          setLoader(false);
        }
      },
    },
  ];

  function handleBackClick() {
    store.chatWallpaper = false;
  }

  function handleBluredChange() {
    store.blured = !store.blured;
  }
  async function handleChatWallpaperClick(imageUrl: string) {
    try {
      setLoadingWallpaper(imageUrl);
      if (store.user && "activeChatWallpaper" in store.user) {
        const updatedUser = await $api.post<User>(`/update-user`, {
          field: "activeChatWallpaper",
          val: imageUrl,
          prevUser: store.user || {},
        });
        console.log(updatedUser);
        store.setUser(updatedUser.data);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoadingWallpaper("");
    }
  }
  return (
    <div className="chat_wallpaper_container">
      <PageHeader handleBackClick={handleBackClick} title="Chat Wallpaper" />
      <div className="chat_wallpaper_controls">
        <SettingsOptionsList options={options} />
        <AppRadio
          title="Blurred"
          changeHandler={handleBluredChange}
          checked={store.blured}
          classNameRoot="chat_wallpaper_radio"
        />
      </div>
      <div className="chat_wallpaper_backgrounds">
        {loader && <Loader />}
        {store.user?.chatWallpaper.map((bg) => (
          <div
            key={bg}
            className={
              (bg === store?.user?.activeChatWallpaper
                ? "chat_wallpaper_background_wrapper_active"
                : "") + " chat_wallpaper_background_wrapper"
            }
            onClick={() => handleChatWallpaperClick(bg)}
          >
            {loadingWallpaper === bg}
            {loadingWallpaper === bg && <Loader />}
            <img className="chat_wallpaper_background_image" src={`/${bg}`} />
          </div>
        ))}
      </div>
    </div>
  );
});

export default ChatWallpaper;
