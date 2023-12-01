import PageHeader from "./PageHeader";
import store from "../store/store";
import type { SettingsOptionType } from "../types";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function SettingsHeader() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const dropdownItems: SettingsOptionType[] = [
    {
      title: t("logout"),
      icon: "fa-solid fa-arrow-right-from-bracket",
      action() {
        store.user = null;
        localStorage.removeItem("user");
        navigate("/signup");
      },
    },
  ];
  function handleBack() {
    store.settings = false;
  }

  function handleEdit() {
    store.edit = true;
  }

  return (
    <PageHeader
      title={t("Settings")}
      handleBackClick={handleBack}
      handleEditClick={handleEdit}
      dropdownItems={dropdownItems}
    />
  );
}

export default SettingsHeader;
