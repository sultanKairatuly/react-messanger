import { Dispatch, SetStateAction } from "react";
import { v4 as uuidv4 } from "uuid";

type SidebarSearchTabProps = {
  activeComponent: string;
  setActiveComponent: Dispatch<SetStateAction<string>>;
};
function SidebarSearchTab({
  activeComponent,
  setActiveComponent,
}: SidebarSearchTabProps) {
  const tabs = [
    {
      id: uuidv4(),
      title: "Chats",
      component: "SidebarChatSearch",
    },
    {
      id: uuidv4(),
      title: "Groups",
      component: "SidebarGroupSearch",
    },
  ];
  return (
    <div className="sidebar_search_tabs">
      {tabs.map((e) => (
        <div
          className={
            (activeComponent === e.component
              ? "sidebar_search_tab_active"
              : "") + " sidebar_search_tab"
          }
          onClick={() => setActiveComponent(e.component)}
          key={e.id}
        >
          <h2 className={"sidebar_search_tab_title"}>{e.title}</h2>
        </div>
      ))}
    </div>
  );
}

export default SidebarSearchTab;
