import SidebarSearchTab from "./SidebarSearchTab";
import { useState } from "react";
import SidebarChatSearch from "./SidebarChatSearch";
import SidebarGroupSearch from "./SidebarGroupSearch";
import "../styles/sidebarSearch.css";

function SidebarSearch() {
  const [activeComponent, setActiveComponent] = useState("SidebarChatSearch");
  return (
    <div className="sidebar_search_container">
      <SidebarSearchTab
        activeComponent={activeComponent}
        setActiveComponent={setActiveComponent}
      />
      <div className="sidebar_search">
        {activeComponent === "SidebarChatSearch" ? (
          <SidebarChatSearch />
        ) : activeComponent === "SidebarGroupSearch" ? (
          <SidebarGroupSearch />
        ) : (
          ""
        )}
      </div>
    </div>
  );
}

export default SidebarSearch;
