import PageHeader from "./PageHeader";
import store from "../store/store";
import type { SettingsOptionType } from "../types";
import { useNavigate } from "react-router-dom";

function SettingsHeader() {
  const navigate = useNavigate();

  const dropdownItems: SettingsOptionType[] = [
    {
      title: "Log out",
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
      title="Settings"
      handleBackClick={handleBack}
      handleEditClick={handleEdit}
      dropdownItems={dropdownItems}
    />
  );
}

export default SettingsHeader;
