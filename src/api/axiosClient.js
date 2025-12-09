import axios from "axios";
import { useAuthStore } from "../stores/authStore";

const axiosClient = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor cho Request: Gắn token vào header
axiosClient.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`;
  }
  return config;
});

// Interceptor cho Response: Xử lý lỗi toàn cục
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const authStore = useAuthStore();

    if (error.response) {
      // [FIX] Chỉ logout khi mã lỗi là 401 (Unauthorized - Hết hạn token)
      if (error.response.status === 401) {
        console.warn(
          "[AXIOS] Phiên đăng nhập hết hạn (401). Đang đăng xuất...",
        );
        authStore.logout();
        window.location.href = "/login";
      }
      // [FIX] 403 (Forbidden) thì chỉ log ra, không logout
      else if (error.response.status === 403) {
        console.error(
          "[AXIOS] Truy cập bị từ chối (403). Bạn không có quyền thực hiện hành động này.",
        );
      }
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
