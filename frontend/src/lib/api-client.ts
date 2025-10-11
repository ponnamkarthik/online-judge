import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "./constants";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Separate client for refresh to avoid being intercepted by our own interceptor
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
type Queued = {
  config: InternalAxiosRequestConfig & { _retry?: boolean };
  resolve: (v: unknown) => void;
  reject: (e: unknown) => void;
};
let pendingQueue: Queued[] = [];

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const status = error.response?.status;
    const url = original?.url || "";
    const isRefresh = url.includes("/api/auth/refresh");

    if (status === 401 && original && !original._retry && !isRefresh) {
      original._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          await refreshClient.post("/api/auth/refresh");
          // Replay queued requests with their own configs
          const queue = [...pendingQueue];
          pendingQueue = [];
          queue.forEach(({ config, resolve, reject }) => {
            api(config).then(resolve).catch(reject);
          });
        } catch (refreshErr) {
          // reject all queued
          pendingQueue.forEach(({ reject }) => reject(refreshErr));
          pendingQueue = [];
          isRefreshing = false;
          return Promise.reject(error);
        }
        isRefreshing = false;
      }

      return new Promise((resolve, reject) => {
        pendingQueue.push({ config: original, resolve, reject });
      });
    }
    return Promise.reject(error);
  }
);
