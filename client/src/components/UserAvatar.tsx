import { memo } from "react";
import "../styles/userAvatar.css";
import store from "../store/store";

const UserAvatar = memo(function ({
  url,
  color,
  name,
  fontSize = "18px",
}: {
  url?: string;
  color?: string;
  name?: string;
  fontSize?: string;
}) {
  return (
    <>
      {(url || store.user?.avatar) === "default" ? (
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
        <img className="user_avatar" src={url || store.user?.avatar} alt="" />
      )}
    </>
  );
});

export default UserAvatar;
