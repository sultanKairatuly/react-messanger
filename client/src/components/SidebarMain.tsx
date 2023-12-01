import Chats from "./Chats";
import type { Chat } from "../types";
import { observer } from "mobx-react";
import SidebarHeader from "./SidebarHeader";
import SidebarSearch from "./SidebarSearch";
import { createContext, useEffect, useState } from "react";
import store from "../store/store";
import $api from "../api";

type SidebarContext = {
  searchQuery: string;
};
export const sidebarContext = createContext({} as SidebarContext);

const Sidebar = observer(function () {
  const [sidebarSearch, setSidebarSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  useEffect(() => {
    const userChats = async () => {
      const result = [];
      for (const chatName of store.user?.chats || []) {
        const promise = $api<Chat>(`/chat?chatId=${chatName}`);
        result.push(promise);
      }
      const ans = await Promise.all(result);
      setChats(ans.map((e) => e.data));
    };
    userChats();
    console.log("chattimng...");
  }, [store.user?.chats]);

  return (
    <sidebarContext.Provider value={{ searchQuery: searchQuery }}>
      <div className="sidebar_main_container">
        <SidebarHeader
          sidebarSearch={sidebarSearch}
          setSidebarSearch={setSidebarSearch}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        {!sidebarSearch && <Chats chats={chats} />}
        {sidebarSearch && <SidebarSearch />}
      </div>
    </sidebarContext.Provider>
  );
});

export default Sidebar;
