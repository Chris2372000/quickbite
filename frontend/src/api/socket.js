import { io } from "socket.io-client";
import { API_URL } from "./client";

// A single shared socket connection for the whole app
const socket = io(API_URL, { autoConnect: true });

export default socket;
