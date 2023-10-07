import Sidebar from "../components/Sidebar";
import ChatContent from "../components/ChatContent";
import "../styles/MainLayout.css";
import { observer } from "mobx-react";
import ProtectedRoute from "../components/ProtectedRoute";

const MainLayout = observer(function MainLayout() {
    return (
    <ProtectedRoute>
      <div className="main_layout">
        <Sidebar />
        <ChatContent />
      </div>
    </ProtectedRoute>
  );
});

export default MainLayout;
