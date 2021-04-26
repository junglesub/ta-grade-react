import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

// Stores Setup
import { UserStateProvider } from "./stores/userStore";
import GetData from "./components/GetData";

ReactDOM.render(
  <React.StrictMode>
    <UserStateProvider>
      <GetData />
      <App />
    </UserStateProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
