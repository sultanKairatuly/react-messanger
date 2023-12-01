import React, { useState, Dispatch, SetStateAction } from "react";
import "../styles/Signup.css";
import PrimaryButton from "./AppButton";
import { NavLink, useNavigate } from "react-router-dom";
import $api from "../api";
import { useTranslation } from "react-i18next";

function Signup() {
  const [login, setLogin] = useState("");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [repeatedPassword, setRepeatedPassword] = useState("");
  const [isPwt, setIsPwt] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState("");
  const [idErrorMessage, setIdErrorMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();

  function handleLoginChange(e: React.ChangeEvent<HTMLInputElement>) {
    setLogin(e.target.value);
  }

  function handleIdChange(e: React.ChangeEvent<HTMLInputElement>) {
    setId(e.target.value);
  }

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value);
  }

  function handleRepeatedPasswordChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    setRepeatedPassword(e.target.value);
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
    const candidate = await $api.get(
      `/check-candidate?email=${login}&userId=${id}`
    );
    console.log(candidate);
    if (login.length === 0) {
      showErrorMessage(t("fieldError"), setLoginErrorMessage);
    } else if (id.length <= 4) {
      showErrorMessage(t("idLengthError"), setIdErrorMessage);
    } else if (id.match(/а-яё/gi)) {
      showErrorMessage(t("idLatingError"), setIdErrorMessage);
    } else if (password.length < 5) {
      showErrorMessage(t("pswLengthError"), setPasswordErrorMessage);
    } else if (!login.match(/.+@(gmail.com)|(mail.ru)/gm)) {
      showErrorMessage(t("emailValidError"), setLoginErrorMessage);
    } else if (repeatedPassword !== password) {
      showErrorMessage(t("pswMatchError"), setPasswordErrorMessage);
    } else if (candidate.data) {
      showErrorMessage(t("emailInuseError"), setLoginErrorMessage);
    } else {
      localStorage.setItem("password", password);
      localStorage.setItem("email", login);
      localStorage.setItem("id", id);
      navigate("/signup-customization");
    }
  }

  return (
    <div className="signup_container">
      <div className="signup_form">
        <h1 className="auth_title">{t("registration")}</h1>
        <label htmlFor="login" className="signup_label form_label">
          <h2 className="signup_label_title from_label_title">
            {t("Your email")}:{" "}
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
        <label htmlFor="id" className="signup_label form_label">
          <h2 className="signup_label_title from_label_title">
            {t("userId")}:{" "}
          </h2>
          <div className="auth_from_input-wrapper">
            <input
              className="auth_form_input"
              value={id}
              onChange={handleIdChange}
              placeholder={t("userId")}
              type="text"
            />
          </div>
          <div
            className={
              (idErrorMessage.length
                ? "auth_input_error_message-active"
                : "auth_input_error_message-inactive") +
              " auth_input_error_message"
            }
          >
            {idErrorMessage}
          </div>
        </label>
        <label htmlFor="password" className="signup_label form_label">
          <h2 className="signup_label_title from_label_title">
            {t("createPsw")}
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
        <label htmlFor="repeated password" className="signup_label form_label">
          <h2 className="signup_label_title from_label_title">
            {t("repeatPsw")}
          </h2>
          <div className="auth_form_input-wrapper">
            <input
              className="auth_form_input"
              value={repeatedPassword}
              onChange={handleRepeatedPasswordChange}
              placeholder={t("repeatPsw")}
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
        </label>
        <div className="signin_link">
          {t("alreadyHave")}{" "}
          <NavLink className="signin_link_span" to="/signin">
            {t("signin")}
          </NavLink>
        </div>
        <PrimaryButton onClick={handleSignUpClick}>{t("next")}</PrimaryButton>
      </div>
    </div>
  );
}

export default Signup;
