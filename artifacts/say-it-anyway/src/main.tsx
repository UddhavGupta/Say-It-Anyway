import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

// Wire up the API base URL for cross-origin deployment.
// VITE_API_BASE_URL is only needed when the API server lives on a different
// origin from the frontend (e.g. frontend on Cloudflare Pages, API on Railway).
// If the variable is absent, all API calls use relative paths — correct when
// both services are served from the same origin.
setBaseUrl(import.meta.env.VITE_API_BASE_URL ?? null);

createRoot(document.getElementById("root")!).render(<App />);
