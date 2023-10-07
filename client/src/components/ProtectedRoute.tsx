import { observer } from "mobx-react";
import { ReactNode } from "react";
import store from "../store/store";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const ProtectedRoute = observer(function ({
  children,
}: {
  children: ReactNode;
}) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("user") || !store.user) {
      navigate("/signup");
    }
  });

  return children;
});

export default ProtectedRoute;
