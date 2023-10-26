import Sidebar from "../components/Sidebar";
import "../styles/MainLayout.css";
import { observer } from "mobx-react";
import ProtectedRoute from "../components/ProtectedRoute";
import AppNotification from "../components/AppNotification";
import { Outlet } from "react-router-dom";
import store from "../store/store";
import { socket } from "../socket";
import { createContext, useEffect } from "react";
import { userPredicate } from "../types";

export const AppContext = createContext({});
const MainLayout = observer(function MainLayout() {
  socket.on("update-user", (data) => {
    if (userPredicate(data)) {
      console.log("data: ", data);
      store.setUser(data);
    }
  });
  useEffect(() => {
    if (store.user) {
      socket.connect();
      socket.emit("connectToUserId", store.user.userId);
    }

    return () => {
      socket.disconnect();
      socket.off("update-user");
    };
  }, []);

  return (
    <ProtectedRoute>
      <AppNotification />
      <div className="main_layout">
        <Sidebar />
        <Outlet></Outlet>
      </div>
    </ProtectedRoute>
  );
});

export default MainLayout;
