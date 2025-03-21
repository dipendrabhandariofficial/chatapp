import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AppContext } from "./context/appContext.jsx";
import AppContextProvider from "./context/appContext.jsx";




createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AppContextProvider> {/* Wrap App inside the provider */}
      <App />
    </AppContextProvider>
  </BrowserRouter>
);
