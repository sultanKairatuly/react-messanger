import store from "../store/store";
import "../styles/ui.css";
import { observer } from "mobx-react";

const AppNotification = observer(function () {
  return (
    <div
      className={
        (store.notificationMessage.length
          ? "app_notification_active"
          : "app_notification_inactive") + " app_notification_container"
      }
    >
      <div className="app_notification_icon">i</div>
      <div className="app_notification_message">
        {store.notificationMessage}
      </div>
    </div>
  );
});

export default AppNotification;
