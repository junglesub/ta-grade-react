import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

// Stores Setup
import { UserStateProvider } from "./stores/userStore";
import GetData from "./components/GetData";
import {
  ThemeProvider,
  unstable_createMuiStrictModeTheme as createMuiTheme,
} from "@material-ui/core";

const theme = createMuiTheme();

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <UserStateProvider>
        <GetData />
        <App />
      </UserStateProvider>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
