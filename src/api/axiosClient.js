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
//       // [FIX] 403 (Forbidden) thì chỉ log ra, không logout
//       else if (error.response.status === 403) {
//         console.error(
//           "[AXIOS] Truy cập bị từ chối (403). Bạn không có quyền thực hiện hành động này.",
//         );
//       }
//     }

//     return Promise.reject(error);
//   },
// );

// export default axiosClient;
// [FIX] 403 (Forbidden) thì chỉ log ra, không logout
      else if (error.response.status === 403) {
        console.error("--- LỖI QUYỀN HẠN (403) ---");
        
        // 1. In ra URL bị lỗi để chắc chắn mình gọi đúng API
        console.error("API gọi đến:", error.config.url);
        
        // 2. In ra tin nhắn từ Server (Quan trọng nhất)
        // Server thường trả về lý do: "User ID 10 cannot access Player ID 5"
        console.error("Lý do từ Server:", error.response.data); 
        
        // 3. Kiểm tra xem lúc đó đang dùng Token nào (để debug)
        const authStore = useAuthStore();
        console.log("Token hiện tại:", authStore.token);
      }
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
