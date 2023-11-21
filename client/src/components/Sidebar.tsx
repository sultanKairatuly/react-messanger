import "../styles/sidebar.css";
import store from "../store/store";
import Settings from "./Settings";
import SidebarMain from "./SidebarMain";
import { observer } from "mobx-react";
import NewGroup from "./NewGroup";
import Notifications from "./Notifications";
import Faq from "./Faq";
import PrivacyAndSecurity from "./PrivacyAndSecurity";

const Sidebar = observer(function Sidebar() {
  const allFalsy =
    !store.settings && !store.newGroup && !store.notification && !store.faq && !store.privacyAndSecurity;
  return (
    <div className="sidebar">
      {store.settings && <Settings />}
      {store.newGroup && <NewGroup />}
      {store.savedMessages && <h1>savedMessages</h1>}
      {allFalsy && <SidebarMain />}
      {store.notification && <Notifications />}
      {store.faq && <Faq />}
      {store.privacyAndSecurity && <PrivacyAndSecurity />}
    </div>
  );
});

export default Sidebar;
