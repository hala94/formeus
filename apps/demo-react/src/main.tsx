import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
// include styles from the ui package
import "ui/styles.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
