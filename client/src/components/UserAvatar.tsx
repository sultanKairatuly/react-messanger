import { memo, useState, useEffect } from "react";
import "../styles/userAvatar.css";
import store from "../store/store";
import $api from "../api";

const UserAvatar = memo(function ({
  url,
  color,
  name,
  userId,
  fontSize = "18px",
}: {
  url?: string;
  color?: string;
  name?: string;
  fontSize?: string;
  userId?: string;
}) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    const getSrc = async () => {

      if ((url ?? store.user?.avatar) !== "default") {
        const response = await $api(
          `/user-avatar?userId=${userId ? userId : store.user?.userId}`
        );

        setSrc(response.data);
      }
    };
    getSrc();
  }, []);
  return (
    <>
      {(url ?? store.user?.avatar) === "default" ? (
        <div
          className="default_avatar"
          style={{
            backgroundColor: color || store.user?.randomColor,
            fontSize,
          }}
        >
          {name === "Saved Messages" ? (
            <i
              className="fa-solid fa-bookmark"
              style={{
                fontSize,
              }}
            ></i>
          ) : (
            (name || store.user?.name)?.[0]
          )}
        </div>
      ) : (
        <img className="user_avatar" src={src} alt="" />
      )}
    </>
  );
});

export default UserAvatar;
