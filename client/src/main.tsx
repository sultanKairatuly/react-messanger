
import ReactDOM from "react-dom/client";
import router from "./router/router";
import { RouterProvider } from "react-router-dom";
import "./styles/global.css";
import { configure } from "mobx";

configure({
  enforceActions: "never",
});
ReactDOM.createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
