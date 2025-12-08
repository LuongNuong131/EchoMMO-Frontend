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
// [FIX] Import store để lấy token từ bộ nhớ tạm (như bài trước đã hướng dẫn)
import { useAuthStore } from "../stores/authStore";

const axiosClient = axios.create({
  // [SỬA LẠI] Dùng localhost cho ổn định nếu chạy cùng máy
  baseURL: "http://localhost:8080/api",

  // Chỉ dùng dòng dưới nếu bạn test qua mạng LAN/Radmin với máy KHÁC
  // baseURL: 'http://26.48.225.101:8080/api',

  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Interceptor: Gắn Token vào header
axiosClient.interceptors.request.use(
  (config) => {
    // Ưu tiên lấy token từ Pinia Store (RAM), dự phòng localStorage
    try {
      const authStore = useAuthStore();
      const token = authStore.token || localStorage.getItem("token");

      if (token && token !== "null" && token !== "undefined") {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn("Lỗi truy cập Token:", e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor: Xử lý lỗi trả về
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      console.error("Token hết hạn hoặc bị từ chối.");
      // Có thể logout tại đây nếu cần
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
