import "../styles/sidebar.css";
import store from "../store/store";
import Settings from "./Settings";
import SidebarMain from "./SidebarMain";
import { observer } from "mobx-react";

const Sidebar = observer(function Sidebar() {
  const allFalsy = !store.settings;
  return (
    <div className="sidebar">
      {store.settings && <Settings />}
      {store.savedMessages && <h1>savedMessages</h1>}
      {allFalsy && <SidebarMain />}
    </div>
  );
});

export default Sidebar;
