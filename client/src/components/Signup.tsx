import React, { useState, Dispatch, SetStateAction } from "react";
import "../styles/Signup.css";
import PrimaryButton from "./AppButton";
import { NavLink, useNavigate } from "react-router-dom";
import $api from "../api";

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
      showErrorMessage("Field must be filled!", setLoginErrorMessage);
    } else if (id.length <= 4) {
      showErrorMessage("Id must have more than 4 symbols!", setIdErrorMessage);
    } else if (id.match(/а-яё/gi)) {
      showErrorMessage("Id must contain only latin!", setIdErrorMessage);
    } else if (password.length < 5) {
      showErrorMessage(
        "Password must have more than 4 symbols!",
        setPasswordErrorMessage
      );
    } else if (!login.match(/.+@(gmail.com)|(mail.ru)/gm)) {
      showErrorMessage("Email must be valid!", setLoginErrorMessage);
    } else if (repeatedPassword !== password) {
      showErrorMessage("Passwords doesn't match!", setPasswordErrorMessage);
    } else if (candidate.data) {
      showErrorMessage("Email already in use!", setLoginErrorMessage);
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
        <h1 className="auth_title">Registration</h1>
        <label htmlFor="login" className="signup_label form_label">
          <h2 className="signup_label_title from_label_title">Your Email: </h2>
          <div className="auth_from_input-wrapper">
            <input
              className="auth_form_input"
              value={login}
              onChange={handleLoginChange}
              placeholder="Your email"
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
          <h2 className="signup_label_title from_label_title">Your ID: </h2>
          <div className="auth_from_input-wrapper">
            <input
              className="auth_form_input"
              value={id}
              onChange={handleIdChange}
              placeholder="Your id"
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
            Create password
          </h2>
          <div className="auth_form_input-wrapper">
            <input
              className="auth_form_input"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Your new password"
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
            Repeat password
          </h2>
          <div className="auth_form_input-wrapper">
            <input
              className="auth_form_input"
              value={repeatedPassword}
              onChange={handleRepeatedPasswordChange}
              placeholder="Repeat password"
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
          Already have an account?{" "}
          <NavLink className="signin_link_span" to="/signin">
            Sign in then.
          </NavLink>
        </div>
        <PrimaryButton onClick={handleSignUpClick}>Next</PrimaryButton>
      </div>
    </div>
  );
}

export default Signup;
