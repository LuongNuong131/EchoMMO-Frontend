// import axios from "axios";

// const axiosClient = axios.create({
//   // baseURL: "http://localhost:8080/api",

//   // chung wifi
//   // baseURL: "192.168.19.20:8080/api",

//   // radmin
//   baseURL: 'http://26.48.225.101:8080/api',

//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Interceptor: Tự động gắn Token vào header nếu đã đăng nhập
// axiosClient.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token"); // Lấy Token
//   if (token) {
//    config.headers.Authorization = `Bearer ${token}`; // Gắn Header đúng định dạng
//   }
//   return config;
// });
// export default axiosClient;

// import axios from "axios";
// // [FIX] Import store để lấy token từ bộ nhớ tạm
// import { useAuthStore } from "../stores/authStore";

// const axiosClient = axios.create({
//   // Chọn IP phù hợp (dùng Radmin nếu bạn đang test qua mạng LAN ảo)
//   baseURL: 'http://26.48.225.101:8080/api',
//   // baseURL: "http://localhost:8080/api",

//   headers: {
//     "Content-Type": "application/json",
//   },
//   timeout: 10000,
// });

// // Interceptor: Gắn Token vào header
// axiosClient.interceptors.request.use(
//   (config) => {
//     // [FIX QUAN TRỌNG] Lấy token từ Pinia Store trước (ưu tiên RAM), nếu không có mới tìm trong localStorage
//     try {
//       const authStore = useAuthStore();
//       const token = authStore.token || localStorage.getItem("token");

//       if (token && token !== "null" && token !== "undefined") {
//         config.headers['Authorization'] = `Bearer ${token}`;
//       }
//     } catch (e) {
//       console.warn("Lỗi truy cập Token:", e);
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Interceptor: Xử lý lỗi trả về
// axiosClient.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     if (error.response && (error.response.status === 401 || error.response.status === 403)) {
//       console.error("Token hết hạn hoặc bị từ chối.");
//       // Không tự động logout ngay để tránh loop nếu browser chặn storage
//     }
//     return Promise.reject(error);
//   }
// );

// export default axiosClient;

// 5:14
import axios from "axios";
// Import store để xử lý logout
import { useAuthStore } from "../stores/authStore";

const axiosClient = axios.create({
  // [CẤU HÌNH] Đổi thành IP Radmin nếu test LAN, hoặc localhost nếu chạy cùng máy
  baseURL: "http://localhost:8080/api",
  // baseURL: 'http://26.48.225.101:8080/api',

  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// --- REQUEST INTERCEPTOR: Gắn Token vào mọi request ---
axiosClient.interceptors.request.use(
  (config) => {
    // Lấy token từ Pinia (RAM) hoặc localStorage
    try {
      const authStore = useAuthStore();
      const token = authStore.token || localStorage.getItem("token");

      if (token && token !== "null" && token !== "undefined") {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    } catch (e) {
      // Bỏ qua lỗi nếu chưa khởi tạo store
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- RESPONSE INTERCEPTOR: Xử lý lỗi trả về (FIX 403) ---
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const originalRequest = error.config;

    // Nếu lỗi là 401 (Unauthorized) hoặc 403 (Forbidden)
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      console.error("[AXIOS] Token hết hạn hoặc không hợp lệ. Đang đăng xuất...");

      // [FIX QUAN TRỌNG] Gọi hàm logout từ store để xóa token và chuyển hướng
      const authStore = useAuthStore();
      if (authStore) {
        authStore.logout(); // Hàm này sẽ xóa localStorage và đẩy về /login
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient;