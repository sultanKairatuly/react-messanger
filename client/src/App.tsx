import "./App.css";
import MainLayout from "./layouts/mainLayout";
import { observer } from "mobx-react";

const App = observer(function App() {
  return (
    <>
      <MainLayout />
    </>
  );
});

export default App;
