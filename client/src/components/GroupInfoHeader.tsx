import { observer } from "mobx-react";
import "../styles/userInfoHeader.css";
import { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";

type UserInfoHeaderProps = {
  setIsUserInfo: Dispatch<SetStateAction<boolean>>;
};
const UserInfoHeader = observer(function ({
  setIsUserInfo,
}: UserInfoHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="user_info_header">
      <button
        className="user_info_header_close"
        onClick={() => setIsUserInfo(false)}
      >
        <i className="fa-solid fa-xmark"></i>
      </button>
      <h2 className="user_info_header_text">{t("Group Info")}</h2>
    </div>
  );
});

export default UserInfoHeader;
