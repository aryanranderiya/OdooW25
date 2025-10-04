import axios from "axios";
import { ROUTES } from "./constants";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (
        typeof window !== "undefined" &&
        window.location.pathname !== ROUTES.LOGIN &&
        window.location.pathname !== ROUTES.SIGNUP &&
        window.location.pathname !== ROUTES.VERIFY_EMAIL &&
        window.location.pathname !== ROUTES.FORGOT_PASSWORD &&
        window.location.pathname !== ROUTES.RESET_PASSWORD
      ) {
        window.location.href = ROUTES.LOGIN;
      }
    }
    return Promise.reject(error);
  }
);
