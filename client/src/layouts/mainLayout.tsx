import Sidebar from "../components/Sidebar";
import "../styles/mainLayout.css";
import { observer } from "mobx-react";
import ProtectedRoute from "../components/ProtectedRoute";
import AppNotification from "../components/AppNotification";
import { Outlet } from "react-router-dom";
import store from "../store/store";
import { socket } from "../socket";
import { createContext, useEffect, useState, useRef } from "react";
import { userPredicate } from "../types";

export const AppContext = createContext({});
const MainLayout = observer(function MainLayout() {
  const [resizing, setResizing] = useState(false);
  const [sidebarContainerWidth, setSidebarContainerWidth] = useState(1000);
  const container = useRef<HTMLDivElement | null>(null);
  socket.on("update-user", (data) => {
    if (userPredicate(data)) {
      store.setUser(data);
    }
  });

  useEffect(() => {
    if (store.user) {
      socket.emit("connectToUserId", store.user.userId);
      socket.emit("connectToGroups", store.user.chats);
    }
    console.log("rendered");
    return () => {
      socket.disconnect();
      socket.off("update-user");
    };
  }, []);

  useEffect(() => {
    console.log("resizing: ", resizing);
    function handleResizeMouseMove(
      e: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) {
      if (resizing && container.current != null) {
        requestAnimationFrame(() => {
          setSidebarContainerWidth(e.clientX);
        });
        // setSidebarContainerWidth(e.clientX);
        console.log(e.clientX);
      }
    }

    function handleMouseUp() {
      setResizing(() => false);
    }

    window.addEventListener("mousemove", handleResizeMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleResizeMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizing, sidebarContainerWidth, container]);
  return (
    <ProtectedRoute>
      <AppNotification />
      <div
        className="main_layout"
        style={{
          userSelect: resizing ? "none" : "auto",
        }}
      >
        <div
          className="sidebar_container"
          onMouseUp={() => {
            setResizing(() => false);
          }}
          style={{
            width: `${sidebarContainerWidth}px`,
          }}
          ref={container}
        >
          <Sidebar />
          <div
            className="resize_col"
            onMouseDown={() => setResizing(() => true)}
          ></div>
        </div>
        <div className="outlet_container">
          <Outlet></Outlet>
        </div>
      </div>
    </ProtectedRoute>
  );
});

export default MainLayout;
