import axios from "axios";
import { API_BASE_URL } from "./api";

const LOCAL_BACKEND_ORIGIN = "http://localhost:8888";

const rewriteBackendUrl = (url) => {
  if (typeof url !== "string" || API_BASE_URL === LOCAL_BACKEND_ORIGIN) {
    return url;
  }
  return url.startsWith(LOCAL_BACKEND_ORIGIN)
    ? url.replace(LOCAL_BACKEND_ORIGIN, API_BASE_URL)
    : url;
};

axios.interceptors.request.use((config) => {
  if (config?.url) {
    config.url = rewriteBackendUrl(config.url);
  }
  return config;
});

if (typeof window !== "undefined" && window.fetch) {
  const originalFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    if (typeof input === "string") {
      return originalFetch(rewriteBackendUrl(input), init);
    }

    if (input instanceof Request) {
      const rewrittenUrl = rewriteBackendUrl(input.url);
      if (rewrittenUrl !== input.url) {
        return originalFetch(new Request(rewrittenUrl, input), init);
      }
    }

    return originalFetch(input, init);
  };
}
