"use client";

import { useEffect } from "react";

/** Registers the offline service worker in production builds only. */
export default function SwRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => { /* offline support is optional */ });
    }
  }, []);
  return null;
}
