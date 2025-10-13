import ReactDOM from "react-dom/client";
import App from "./App";
import { HashRouter } from "react-router-dom"; // <-- changed
import "./index.css"; 

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <HashRouter>
    <App />
  </HashRouter>
);
