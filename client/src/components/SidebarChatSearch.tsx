import { useContext, useEffect, useState, useCallback } from "react";
import { sidebarContext } from "./SidebarMain";
import $api from "../api";
import { User, userPredicate } from "../types";
import _ from "lodash";
import Loader from "./Loader";
import EmptyMessage from "./AppEmptyMessage";
import ChatSearchItem from "./ChatSearchItem";
import { useNavigate } from "react-router-dom";
import store from "../store/store";
function SidebarChatSearch() {
  const [users, setUsers] = useState<User[]>([]);
  const { searchQuery } = useContext(sidebarContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function fetchChats() {
    try {
      setLoading(true);
      let { data: users } = await $api.get<User[]>(
        `/find-chats?query=${searchQuery}`
      );
      users = users.filter(u => u.userId !== store.user?.userId)
      if (users.every(userPredicate)) {
        setUsers(users);
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
      {!loading && !users.length && searchQuery.length !== 0 && (
        <EmptyMessage>We didn't found any chats</EmptyMessage>
      )}
      {users.map((e) => (
        <ChatSearchItem
          key={e.id}
          onClick={() => {
            navigate(`/a/${e.userId}?type=contact`);
          }}
          chat={e}
        />
      ))}
    </div>
  );
}

export default SidebarChatSearch;
