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
import { useAuthStore } from "../stores/authStore";

// --- CẤU HÌNH BASE URL ---
// 1. Dùng Localhost (Mặc định khi code trên 1 máy)
const BASE_URL = "http://localhost:8080/api";

// 2. Dùng Radmin VPN (Bỏ comment dòng dưới nếu test qua mạng LAN ảo)
// const BASE_URL = 'http://26.48.225.101:8080/api';

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// --- REQUEST INTERCEPTOR ---
axiosClient.interceptors.request.use(
  (config) => {
    try {
      const authStore = useAuthStore();
      // Ưu tiên lấy từ Store (RAM), nếu không có mới lấy LocalStorage
      const token = authStore.token || localStorage.getItem("token");

      if (token && token !== "null" && token !== "undefined") {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn("Chưa khởi tạo được AuthStore:", e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- RESPONSE INTERCEPTOR ---
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      
      // Xử lý lỗi Token hết hạn hoặc không có quyền (401/403)
      if (status === 401 || status === 403) {
        console.error("[AXIOS] Lỗi xác thực. Đang đăng xuất...");
        
        const authStore = useAuthStore();
        if (authStore) {
          authStore.logout(); // Hàm này cần có trong store để clear token và chuyển trang login
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;