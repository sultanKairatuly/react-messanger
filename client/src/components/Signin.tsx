import { useState, Dispatch, SetStateAction } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/Signup.css";
import $api from "../api";
import store from "../store/store";
import { User, userPredicate } from "../types";
import { useTranslation } from "react-i18next";

function Signin() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [isPwt, setIsPwt] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const { t } = useTranslation();

  const navigate = useNavigate();
  function handleLoginChange(e: React.ChangeEvent<HTMLInputElement>) {
    setLogin(e.target.value);
  }

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value);
  }

  function handlePasswordVisible() {
    setIsPwt(!isPwt);
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
    if (login.length === 0) {
      showErrorMessage(t("fieldError"), setLoginErrorMessage);
    } else if (password.length < 5) {
      showErrorMessage(t("pswLengthError"), setPasswordErrorMessage);
    } else if (!login.match(/.+@(gmail.com)|(mail.ru)/gm)) {
      showErrorMessage(t("emailValidError"), setLoginErrorMessage);
    } else {
      const { data } = await $api.post<
        User | { type: "error"; message: string }
      >("/login", {
        user: {
          email: login,
          password,
        },
      });
      if (userPredicate(data)) {
        store.setUser(data);
        navigate("/");
      } else {
        const { message } = data;
        switch (message) {
          case "Not authorized":
            showErrorMessage("Email is not authorized", setLoginErrorMessage);
            break;
          case "Credential mismatch":
            showErrorMessage("Credentials mismatch", setLoginErrorMessage);
            break;
          default:
            showErrorMessage("Unexpected error", setLoginErrorMessage);
        }
      }
    }
  }

  return (
    <div className="signup_container">
      <div className="signup_form">
        <h1 className="auth_title">{t("login")}</h1>
        <label htmlFor="login" className="signup_label form_label">
          <h2 className="signup_label_title from_label_title">
            {t("Your email")}
          </h2>
          <div className="auth_from_input-wrapper">
            <input
              className="auth_form_input"
              value={login}
              onChange={handleLoginChange}
              placeholder={t("Your email")}
              type="text"
            />
          </div>
          <div
            className={
              (loginErrorMessage.length
                ? "auth_input_error_message-active"
                : "auth_input_error_message-inactive") +
              " auth_input_error_message"
            }
          >
            {loginErrorMessage}
          </div>
        </label>
        <label htmlFor="password" className="signup_label form_label">
          <h2 className="signup_label_title from_label_title">
            {t("yourPassword")}
          </h2>
          <div className="auth_form_input-wrapper">
            <input
              className="auth_form_input"
              value={password}
              onChange={handlePasswordChange}
              placeholder={t("yourPassword")}
              type={isPwt ? "text" : "password"}
            />
            <i
              className={
                (isPwt ? "fa-eye-slash" : "fa-eye") +
                " fa-solid auth_form_input-eye"
              }
              onClick={handlePasswordVisible}
            ></i>
          </div>
          <div
            className={
              (passwordErrorMessage.length
                ? "auth_input_error_message-active"
                : "auth_input_error_message-inactive") +
              " auth_input_error_message"
            }
          >
            {passwordErrorMessage}
          </div>
        </label>
        <div className="signin_link">
          {t("dontHave")}{" "}
          <NavLink className="signin_link_span" to="/signup">
            {t("signup")}
          </NavLink>
        </div>
        <button className="singup_button" onClick={handleSignUpClick}>
          {t("signin")}
        </button>
      </div>
    </div>
  );
}

export default Signin;
