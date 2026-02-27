import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const recoverPwaCacheIfRequested = async () => {
  if (!("serviceWorker" in navigator) || !navigator.onLine) return;

  const shouldRecover =
    window.location.pathname === "/offline.html" ||
    new URLSearchParams(window.location.search).get("recoverPwa") === "1";

  if (!shouldRecover) return;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));

    if ("caches" in window) {
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map((key) => caches.delete(key)));
    }

    if (window.location.pathname !== "/") {
      window.location.replace("/");
      return;
    }
  } catch (error) {
    console.error("PWA recovery failed:", error);
  }
};

void recoverPwaCacheIfRequested();

createRoot(document.getElementById("root")!).render(<App />);
