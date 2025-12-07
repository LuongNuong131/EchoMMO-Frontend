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




import axios from "axios";

const axiosClient = axios.create({
  // baseURL: "http://localhost:8080/api",
  
  // Radmin VPN (Hãy chắc chắn Backend đang chạy và Firewall đã mở)
  baseURL: 'http://26.48.225.101:8080/api',
  
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // [FIX] Thêm timeout 10s để app không bị treo nếu Radmin lag
});

// Interceptor: Tự động gắn Token vào header
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      // [FIX] Dùng ngoặc vuông để an toàn hơn, tránh lỗi gõ sai chính tả
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// [FIX QUAN TRỌNG] Xử lý lỗi Token hết hạn (401/403)
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.error("Token hết hạn hoặc không có quyền truy cập.");
      // Tùy chọn: Xóa token và reload trang để bắt đăng nhập lại
      // localStorage.removeItem("token");
      // localStorage.removeItem("user");
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosClient;