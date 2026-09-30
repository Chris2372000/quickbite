import axios from "axios";

// Backend URL - during local dev this is your Express server (Docker or not)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const client = axios.create({ baseURL: `${API_URL}/api` });

// Attach the saved JWT (if any) to every outgoing request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("quickbite_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
export { API_URL };
