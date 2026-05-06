const DEPLOYED_API_BASE_URL = "https://harmonistay-2.onrender.com";
const LOCAL_API_BASE_URL = "http://localhost:8888";

const isLocalBrowser =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (isLocalBrowser ? LOCAL_API_BASE_URL : DEPLOYED_API_BASE_URL);

export const API_URL = `${API_BASE_URL}/api`;
