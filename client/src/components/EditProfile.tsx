import "../styles/editProfile.css";
import PageHeader from "./PageHeader";
import store from "../store/store";
import AppInput from "./AppInput";
import {  useState } from "react";
import AppButton from "./AppButton";
import { Dispatch, SetStateAction } from "react";
import $api from "../api";
import { userPredicate } from "../types";
import Loader from "./Loader";
import UserAvatar from "./UserAvatar";
import { useTranslation } from "react-i18next";

function EditProfile() {
  const [userName, setUserName] = useState(store.user?.name || "");
  const [bio, setBio] = useState(store.user?.bio || "");
  const [userId, setUserId] = useState(store.user?.userId || "");
  const [userAvatar, setUserAvatar] = useState(store.user?.avatar || "");
  const [changed, setChanged] = useState(false);
  const [loader, setLoader] = useState(false);
  const { t } = useTranslation();

  function handleBackClick() {
    store.edit = false;
  }

  async function handleSaveClick() {
    try {
      setLoader(true);
      const updatedUser = await $api.post("/update-user-profile", {
        user: store.user,
        bio,
        userId,
        userName,
        userAvatar,
      });
      if (userPredicate(updatedUser.data)) {
        store.setUser(updatedUser.data);
      }
    } catch (e) {
      console.log("An error occured: ", e);
    } finally {
      setLoader(false);
    }
  }

  type handeUserChangeProps =
    | {
        type: "change";
        e: React.ChangeEvent<HTMLInputElement>;
        fn: Dispatch<SetStateAction<string>>;
      }
    | {
        type: "click";
        fn: () => void;
      };
  function handleUserChange(props: handeUserChangeProps) {
    setChanged(true);
    if (props.type === "click") {
      props.fn();
    } else {
      props.fn(props.e.target.value);
    }
  }

  function handleAvatarClick() {
    const inputFile = document.createElement("input");
    inputFile.setAttribute("type", "file");
    inputFile.setAttribute("accept", "image/png, image/gif, image/jpeg");
    inputFile.addEventListener("change", () => {
      setChanged(true);
      if (inputFile.files) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setUserAvatar(e.target?.result?.toString() || "");
        };
        reader.readAsDataURL(inputFile.files[0]);
      }
    });
    inputFile.click();
  }

  return (
    <div className="edit_profile">
      <PageHeader title={t("Edit Profile")} handleBackClick={handleBackClick} />
      {loader && <Loader />}
      <div className=" edit_profile_container">
        <div className="first_section">
          <div
            className="edit_profile_avatar_wrapper"
            onClick={handleAvatarClick}
          >
            {userAvatar ? (
              <img className="user_avatar" src={userAvatar} alt="user_avatar" />
            ) : (
              <UserAvatar />
            )}
          </div>

          <div className="edit_profile_input_wrapper">
            <AppInput
              value={userName}
              changeHandler={(e) =>
                handleUserChange({ e, fn: setUserName, type: "change" })
              }
              labelTitle={t("name")}
              labelFor="name"
            />
          </div>
          <div className="edit_profile_input_wrapper">
            <AppInput
              value={bio}
              changeHandler={(e) =>
                handleUserChange({ e, fn: setBio, type: "change" })
              }
              labelTitle={t("bio")}
              labelFor="bio"
            />
          </div>

          <p className="edit_profile_paragraph">
            {t("bioDescription1")}
            <br />
            {t("bioDescription2")}
          </p>
        </div>
        <div className="second_section">
          <div className="edit_profile_input_wrapper">
            <AppInput
              value={userId}
              changeHandler={(e) =>
                handleUserChange({ e, fn: setUserId, type: "change" })
              }
              labelTitle={t("userId")}
              labelFor="user id"
            />
          </div>
          <p className="edit_profile_paragraph">
            {t("UserIDDescription1")}
            <b className="edit_profile_bold"> {t("UserIDDescription2")}</b>{" "}
            {t("UserIDDescription3")}
            <br />
            <br />
            {t("UserIDDescription4")} <b className="edit_profile_bold">a-z</b>,
            <b className="edit_profile_bold">0-9</b> {t("UserIDDescription5")}{" "}
            <b className="edit_profile_bold">5</b>, {t("UserIDDescription6")}
            <br />
            {`http://localhost:5000/${store.user?.userId}`}
          </p>
          <div
            className={
              (changed
                ? "edit_profile_button_active"
                : "edit_profile_button_inactive") +
              " edit_profile_button_wrapper"
            }
          >
            <AppButton styles={{ marginTop: "20px" }} onClick={handleSaveClick}>
              {t("save")}
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;
