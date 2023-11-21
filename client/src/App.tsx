import "./App.css";
import MainLayout from "./layouts/mainLayout";
import { observer } from "mobx-react";
import { useEffect } from "react";
import { socket } from "./socket";

const App = observer(function App() {
  useEffect(() => {
    socket.connect();
  }, []);

  return (
    <>
      <MainLayout />
    </>
  );
});

export default App;
