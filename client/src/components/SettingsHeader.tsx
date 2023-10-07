import PageHeader from "./PageHeader";
import store from "../store/store";

function SettingsHeader() {
  function handleBack() {
    store.settings = false;
  }

  function handleEdit() {

  }

  function handleEllipsis() {
    
  }
  return (
    <PageHeader
      title="Settings"
      handleBackClick={handleBack}
      handleEditClick={handleEdit}
      handleEllipsisClick={handleEllipsis}
    />
  );
}

export default SettingsHeader;
