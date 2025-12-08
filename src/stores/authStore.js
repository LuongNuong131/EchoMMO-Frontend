import { defineStore } from "pinia";
import axiosClient from "../api/axiosClient";
import router from "../router";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: null,
    wallet: null,
    isLoading: false,
    error: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    // Khởi tạo state từ localStorage (gọi trong App.vue hoặc main.js)
    initialize() {
      try {
        const t = localStorage.getItem("token");
        const u = localStorage.getItem("user");
        if (t && t !== "null") this.token = t;
        if (u && u !== "null") this.user = JSON.parse(u);
      } catch (e) {
        console.warn("Storage blocked");
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

        // Lưu an toàn
        try {
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(this.user));
        } catch (e) {
          console.warn("Không thể lưu session vào localStorage");
        }

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
        if (error.response?.status === 401) this.logout();
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
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } catch(e) {}
      router.push("/login");
    },
  },
});