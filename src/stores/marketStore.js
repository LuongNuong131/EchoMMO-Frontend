import { defineStore } from "pinia";
import axiosClient from "../api/axiosClient";
import { useInventoryStore } from "./inventoryStore";
import { useAuthStore } from "./authStore";

export const useMarketStore = defineStore("market", {
  state: () => ({
    shopItems: [],
    playerListings: [],
    myListings: [],
    isLoading: false,
  }),
  actions: {
    async fetchShopItems() {
      const res = await axiosClient.get("/market/shop-items");
      this.shopItems = res.data;
    },
    async fetchPlayerListings() {
      const res = await axiosClient.get("/market/listings");
      this.playerListings = res.data;
    },
    async fetchMyListings() {
      const res = await axiosClient.get("/market/my-listings");
      this.myListings = res.data;
    },

    // [FIX] Mua từ Shop hệ thống (NPC)
    // Endpoint Backend: POST /api/market/buy-shop
    // Body: { itemId: ..., quantity: ... }
    async buyItem(id, qty) {
      try {
        await axiosClient.post("/market/buy-shop", {
          itemId: id,      // [SỬA] Đổi tên field cho khớp Backend (nếu Backend dùng map.get("itemId"))
          quantity: qty 
        });
        alert("Mua xong!");
        this.refresh();
      } catch (e) {
        // [FIX] Hiển thị lỗi rõ ràng hơn
        alert(e.response?.data?.message || e.response?.data || "Lỗi mua hàng!");
      }
    },

    // Bán cho NPC
    async sellItem(id, qty) {
      try {
        await axiosClient.post("/market/sell", { // [SỬA] Gọi đúng endpoint /sell (không có ID trên URL theo controller cũ)
            userItemId: id, 
            quantity: qty 
        });
        alert("Bán xong!");
        this.refresh();
      } catch (e) {
        alert(e.response?.data?.message || e.response?.data || "Lỗi bán hàng!");
      }
    },

    async createListing(id, price, qty) {
      try {
        await axiosClient.post("/market/create", { // [Check lại controller xem là /create hay /create-listing] -> Controller là /create
          userItemId: id,
          price,
          quantity: qty,
        });
        alert("Đăng bán xong!");
        this.refresh();
      } catch (e) {
        alert(e.response?.data?.message || e.response?.data || "Lỗi đăng bán!");
      }
    },

    async cancelListing(id) {
      try {
        await axiosClient.post(`/market/cancel/${id}`); // [Check lại controller: /cancel/{id}]
        alert("Đã hủy!");
        this.refresh();
      } catch (e) {
        alert(e.response?.data?.message || e.response?.data || "Lỗi hủy!");
      }
    },

    // Mua từ người chơi (P2P)
    async buyPlayerListing(id, qty) {
      try {
        // Endpoint Backend đã fix hỗ trợ: /api/market/buy/{id}
        await axiosClient.post(`/market/buy/${id}`, { quantity: qty });
        alert("Mua xong!");
        this.refresh();
      } catch (e) {
        alert(e.response?.data?.message || e.response?.data || "Lỗi mua hàng chợ!");
      }
    },

    async refresh() {
      this.fetchShopItems();
      this.fetchPlayerListings();
      this.fetchMyListings();
      useInventoryStore().fetchInventory();
      useAuthStore().fetchProfile();
    },
  },
});