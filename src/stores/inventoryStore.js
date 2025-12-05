import { defineStore } from "pinia";
import axiosClient from "../api/axiosClient";
import { useCharacterStore } from "./characterStore";

export const useInventoryStore = defineStore("inventory", {
  state: () => ({ items: [], isLoading: false }),
  getters: {
    equippedItems: (state) => {
      const slots = {
        WEAPON: null,
        ARMOR: null,
        HELMET: null,
        BOOTS: null,
        RING: null,
        NECKLACE: null,
      };
      state.items.forEach((item) => {
        if (item.isEquipped && slots[item.item.type])
          slots[item.item.type] = item;
      });
      return slots;
    },
  },
  actions: {
    async fetchInventory() {
      this.isLoading = true;
      try {
        const res = await axiosClient.get("/inventory/me");
        this.items = res.data;
      } catch (error) {
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
    async useItem(id) {
      try {
        const res = await axiosClient.post(`/inventory/use/${id}`);
        alert(res.data);
        await this.fetchInventory();
        const charStore = useCharacterStore();
        await charStore.fetchCharacter();
      } catch (e) {
        alert(e.response?.data || "Lỗi");
      }
    },
    async equipItem(id) {
      try {
        await axiosClient.post(`/inventory/equip/${id}`);
        await this.fetchInventory();
        const charStore = useCharacterStore();
        await charStore.fetchCharacter();
      } catch (e) {
        alert(e.response?.data);
      }
    },
    async unequipItem(id) {
      try {
        await axiosClient.post(`/inventory/unequip/${id}`);
        await this.fetchInventory();
        const charStore = useCharacterStore();
        await charStore.fetchCharacter();
      } catch (e) {
        alert(e.response?.data);
      }
    },
    async enhanceItem(id) {
      if (!confirm("Cường hóa tốn phí. Tiếp tục?")) return;
      try {
        const res = await axiosClient.post(`/inventory/enhance/${id}`);
        alert(res.data);
        await this.fetchInventory();
        const charStore = useCharacterStore();
        await charStore.fetchCharacter();
      } catch (e) {
        alert(e.response?.data);
      }
    },
  },
});
