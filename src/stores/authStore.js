import { defineStore } from "pinia";
import axiosClient from "../api/axiosClient";
import router from "../router";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    // Cố gắng lấy từ localStorage ngay khi khởi tạo
    user: JSON.parse(localStorage.getItem("user")) || null,
    token: localStorage.getItem("token") || null,
    wallet: null,
    isLoading: false,
    error: null,
  }),

  getters: {
    // Chỉ coi là đã đăng nhập nếu có token hợp lệ
    isAuthenticated: (state) =>
      !!state.token && state.token !== "null" && state.token !== "undefined",
  },

  actions: {
    // [FIX] Hàm này giúp đồng bộ lại State khi reload trang
    initialize() {
      try {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");

        if (token && token !== "null" && token !== "undefined") {
          this.token = token;
          // Set header mặc định cho mọi request sau này
          axiosClient.defaults.headers.common["Authorization"] =
            `Bearer ${token}`;
        } else {
          this.token = null;
        }

        if (user && user !== "null" && user !== "undefined") {
          this.user = JSON.parse(user);
        }
      } catch (e) {
        console.error("Lỗi khôi phục session:", e);
        this.logout();
      }
    },

    async login(credentials) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axiosClient.post("/auth/login", credentials);
        const { token, username, role } = response.data;

        this.token = token;
        this.user = { username, role };

        // Lưu vào localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(this.user));

        // Cập nhật header axios ngay lập tức
        axiosClient.defaults.headers.common["Authorization"] =
          `Bearer ${token}`;

        await this.fetchProfile();
        router.push("/");
      } catch (err) {
        console.error(err);
        this.error = err.response?.data?.message || "Đăng nhập thất bại!";
      } finally {
        this.isLoading = false;
      }
    },

    async fetchProfile() {
      if (!this.token) return;
      try {
        const res = await axiosClient.get("/user/me");
        this.user = { ...this.user, ...res.data };
        this.wallet = res.data.wallet;
      } catch (error) {
        console.error("Lỗi tải profile:", error);
        // Chỉ logout nếu lỗi 401 (Unauthorized)
        if (error.response && error.response.status === 401) {
          this.logout();
        }
      }
    },

    async register(registerData) {
      this.isLoading = true;
      this.error = null;
      try {
        await axiosClient.post("/auth/register", registerData);
        alert("Đăng ký thành công! Hãy đăng nhập.");
        router.push("/login");
      } catch (err) {
        this.error = err.response?.data || "Đăng ký thất bại!";
      } finally {
        this.isLoading = false;
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      this.wallet = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Xóa header
      delete axiosClient.defaults.headers.common["Authorization"];
      router.push("/login");
    },
  },
});
