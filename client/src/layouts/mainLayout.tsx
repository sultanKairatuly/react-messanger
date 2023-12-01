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
  const [sidebarContainerWidth, setSidebarContainerWidth] = useState(700);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const container = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (store.user) {
      socket.emit("connectToUserId", store.user.userId);
      socket.emit("connectToGroups", store.user.chats);
    }

    socket.on("update-user", (data) => {
      console.log("USER DATA: ", data);
      if (userPredicate(data)) {
        store.setUser(data);
      }
    });
    const handleWindowResize = (e: UIEvent) => {
      if (
        e.target &&
        "innerWidth" in e.target &&
        typeof e.target.innerWidth === "number"
      ) {
        setWindowWidth(e.target.innerWidth);
      }
    };

    window.addEventListener("resize", handleWindowResize);

    return () => {
      socket.disconnect();
      socket.off("update-user");
    };
  }, []);

  useEffect(() => {
    if (windowWidth < 500) {
      setSidebarContainerWidth(100);
      console.log(store.isSidebar);
      console.log("===================");
    }
  }, [windowWidth]);

  useEffect(() => {
    function handleResizeMouseMove(
      e: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) {
      if (resizing && container.current != null) {
        requestAnimationFrame(() => {
          setSidebarContainerWidth(e.clientX);
        });
      }
    }

    function handleMouseUp() {
      setResizing(() => false);
    }

    //! КОСТЫЛЬ !!! ИСПРАВИТЬ КОГДА НЕ БУДЕТ ЛЕНЬ

    window.addEventListener("mousemove", () => handleResizeMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", () => handleResizeMouseMove);
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
            width: store.isSidebar
              ? `${sidebarContainerWidth}${windowWidth < 500 ? "%" : "px"}`
              : "0px",
            minWidth: store.isSidebar ? `250px` : "0px",
            maxWidth: windowWidth < 500 ? "1000px" : "400px",
          }}
          ref={container}
        >
          <Sidebar />
          <div
            className="resize_col"
            onMouseDown={() => setResizing(() => true)}
          ></div>
        </div>
        {windowWidth < 500 ? (
          !store.isSidebar ? (
            <div
              className="outlet_container"
              style={{
                width: windowWidth < 500 ? "0" : "50%",
              }}
            >
              <Outlet></Outlet>
            </div>
          ) : null
        ) : (
          <div
            className="outlet_container"
            style={{
              width: windowWidth < 500 ? "0" : "50%",
            }}
          >
            <Outlet></Outlet>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
});

export default MainLayout;
