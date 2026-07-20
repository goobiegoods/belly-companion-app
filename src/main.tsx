import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { initViewportTracking } from "./lib/viewport";
import "./index.css";

initViewportTracking();

createRoot(document.getElementById("root")!).render(<App />);
