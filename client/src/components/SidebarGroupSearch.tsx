import { useContext, useEffect, useState, useCallback } from "react";
import { sidebarContext } from "./SidebarMain";
import $api from "../api";
import { GroupChat, groupChatPredicate } from "../types";
import _ from "lodash";
import Loader from "./Loader";
import EmptyMessage from "./AppEmptyMessage";
import ChatItem from "./ChatItem";
import { useNavigate } from "react-router-dom";

function SidebarGroupSearch() {
  const [groups, setGroups] = useState<GroupChat[]>([]);
  const { searchQuery } = useContext(sidebarContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function fetchChats() {
    try {
      setLoading(true);
      const { data: groups } = await $api.get<GroupChat[]>(
        `/find-groups?query=${searchQuery}`
      );
      console.log(groups);
      if (groups.every(groupChatPredicate)) {
        setGroups(groups);
      }
    } catch (e) {
      console.log("An error occured");
    } finally {
      setLoading(false);
    }
  }

  const delayedQuery = useCallback(_.debounce(fetchChats, 500), [searchQuery]);
  useEffect(() => {
    if (searchQuery) {
      delayedQuery();

      return delayedQuery.cancel;
    }
  }, [searchQuery, delayedQuery]);
  return (
    <div className="sidebar_chat_search_container">
      {loading && <Loader />}
      {!loading && !groups.length && searchQuery.length !== 0 && (
        <EmptyMessage>We didn't found any chats</EmptyMessage>
      )}
      {groups.map((e) => (
        <ChatItem
          key={e.id}
          onClick={() => {
            navigate(`/a/${e.chatId}?type=group`);
          }}
          chat={e}
        />
      ))}
    </div>
  );
}

export default SidebarGroupSearch;
