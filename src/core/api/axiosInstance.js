import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "https://apirag.nicolaspirello.com";
const API_KEY = import.meta.env.VITE_API_KEY || "s3cret-super-safe"; // ¡no dejar este hardcodeado en producción!

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "X-APP-AUTH": API_KEY,
  },
});

export default axiosInstance;
