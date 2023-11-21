import { observer } from "mobx-react";
import AppRadio from "./AppRadio";
import { useMemo, useEffect } from "react";
import store from "../store/store";
import PageHeader from "./PageHeader";
import "../styles/notifications.css";

const Notifications = observer(function Notifications() {
  const checked = useMemo(
    () => (store.webNotifications ? true : false),
    []
  );
  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker
        .register("../../service-worker.ts")
        .catch((error) => {
          console.error(
            "An error occurred while registering the service worker."
          );
          console.error(error);
        });
    } else {
      console.error(
        "Browser does not support service workers or push messages."
      );
    }
  }, []);

  async function changeHandler() {
    store.webNotifications = !store.webNotifications;
    localStorage.setItem("webNotifications", store.webNotifications.toString());
  }

  return (
    <div className="notifications">
      <PageHeader
        title="Notifications"
        handleBackClick={() => (store.notification = false)}
      />
      <div className="notification_content">
        <AppRadio
          changeHandler={changeHandler}
          title="Web notifications"
          checked={checked}
        />
      </div>
    </div>
  );
});

export default Notifications;
