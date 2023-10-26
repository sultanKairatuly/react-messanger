import { useState, Dispatch, SetStateAction } from "react";
import "../styles/Signup.css";
import "../styles/signupCustomization.css";
import { NavLink, useNavigate } from "react-router-dom";
import PrimaryButton from "./AppButton";
import { User, userPredicate } from "../types";
import { v4 as uuidv4 } from "uuid";
import $api from "../api";
import store from "../store/store";

function SignupCustomization() {
  const [username, setName] = useState("");
  const [avatar, setAvatar] = useState("/default_avatar.jpg");
  const [nameErrorMessage, setNameErrorMessage] = useState("");
  const [generalErrorMessage, setGeneralErrorMessage] = useState("");
  const navigator = useNavigate();
  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setName(e.target.value);
  }

  function showErrorMessage(
    message: string,
    setter: Dispatch<SetStateAction<string>>
  ) {
    setter(message);
    setTimeout(() => {
      setter("");
    }, 2000);
  }

  async function handleSignUpClick() {
    if (username.length < 5) {
      showErrorMessage(
        "Name must have more than 4 symbols!",
        setNameErrorMessage
      );
    } else if (username.match(/[а-яё]/gi)) {
      showErrorMessage("Name must have only latin!", setNameErrorMessage);
    } else {
      const password = localStorage.getItem("password");
      const email = localStorage.getItem("email");
      const id = localStorage.getItem("id");
      if (email && password && id) {
        const newUser: User & { password: string } = {
          password,
          email,
          name: username,
          type: "contact",
          avatar,
          id: uuidv4(),
          chats: [],
          userId: id,
          blockedContacts: [],
          messages: {},
          bio: "",
          chatWallpaper: [
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
          ],
          mutedContacts: [],
          lastSeen: 0,
          activeChatWallpaper: "chat_bg0.jpeg",
        };
        try {
          const response = await $api.post<string>("/registration", {
            user: newUser,
          });
          const parsedUser = JSON.parse(response.data);
          if (userPredicate(parsedUser)) {
            store.setUser(parsedUser);
            if (response.status === 200 && response.statusText === "OK") {
              navigator("/");
              localStorage.removeItem("email");
              localStorage.removeItem("password");
            }
          }
        } catch (e) {
          showErrorMessage("Something went wrong", setGeneralErrorMessage);
        }
      }
    }
  }

  function requestImageFile() {
    const inputFile = document.createElement("input");
    inputFile.setAttribute("type", "file");
    inputFile.setAttribute("accept", "image/png, image/gif, image/jpeg");
    inputFile.addEventListener("change", () => {
      if (inputFile.files) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAvatar(e.target?.result?.toString() || "");
        };
        reader.readAsDataURL(inputFile.files[0]);
      }
    });
    inputFile.click();
  }

  return (
    <div className="signup_container">
      <div className="signup_form">
        <h1 className="auth_title">Configure profile</h1>
        <label htmlFor="login" className="signup_label form_label">
          <div className="signup_label_avatar-wrapper">
            <img
              src={avatar}
              className="signup_label_avatar"
              alt="avatar of your profile"
            />
          </div>
          <PrimaryButton
            styles={{ margin: "10px auto" }}
            className="change_avatar"
            onClick={requestImageFile}
          >
            Change
          </PrimaryButton>
        </label>
        <label htmlFor="login" className="signup_label form_label">
          <h2 className="signup_label_title from_label_title">Your Name: </h2>
          <div className="auth_from_input-wrapper">
            <input
              className="auth_form_input"
              value={username}
              onChange={handleNameChange}
              placeholder="Your name"
              type="text"
            />
          </div>
          <div
            className={
              (nameErrorMessage.length
                ? "auth_input_error_message-active"
                : "auth_input_error_message-inactive") +
              " auth_input_error_message"
            }
          >
            {nameErrorMessage}
          </div>
        </label>

        <div className="signin_link">
          <NavLink className="signin_link_span" to="/signup">
            Back.
          </NavLink>
        </div>
        <PrimaryButton onClick={handleSignUpClick}>Finish</PrimaryButton>
        <div
          className={
            (generalErrorMessage.length
              ? "auth_input_error_message-active"
              : "auth_input_error_message-inactive") +
            " auth_input_error_message"
          }
        >
          {generalErrorMessage}
        </div>
      </div>
    </div>
  );
}

export default SignupCustomization;
