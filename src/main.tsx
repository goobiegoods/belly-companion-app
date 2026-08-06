import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { initViewportTracking } from "./lib/viewport";
import { initAnalytics } from "./lib/analytics";
import "./index.css";

initViewportTracking();
initAnalytics();

createRoot(document.getElementById("root")!).render(<App />);
