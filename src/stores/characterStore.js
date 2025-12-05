import { defineStore } from "pinia";
import axiosClient from "../api/axiosClient";
import router from "../router";

export const useCharacterStore = defineStore("character", {
  state: () => ({ character: null, isLoading: false, logs: [] }),
  getters: {
    xpPercent: (s) => s.character ? Math.min((s.character.currentExp / (s.character.level * 100)) * 100, 100) : 0,
    hpPercent: (s) => s.character ? Math.min((s.character.hp / s.character.maxHp) * 100, 100) : 0,
    energyPercent: (s) => s.character ? Math.min((s.character.energy / s.character.maxEnergy) * 100, 100) : 0,
  },
  actions: {
    async fetchCharacter() {
      try {
        const res = await axiosClient.get("/character/me");
        this.character = res.data;
      } catch (e) { if (e.response?.status === 401) router.push("/login"); }
    },
    async explore() {
      if (!this.character) return { type: 'ERROR', message: 'Lỗi data' };
      if (this.character.energy < 1) return { type: 'ERROR', message: 'Hết năng lượng!' };

      try {
        const res = await axiosClient.post("/exploration/explore");
        const data = res.data;
        // Update state local
        this.character.energy = data.currentEnergy;
        if(data.newLevel) await this.fetchCharacter(); 
        else if(data.expGained) this.character.currentExp += data.expGained;

        this.addLog(data.message, data.type);
        return data; // Trả về data để View vẽ hình
      } catch (e) {
        const msg = e.response?.data?.message || "Lỗi mạng";
        if (msg === "CAPTCHA_REQUIRED") throw new Error("CAPTCHA");
        return { type: 'ERROR', message: msg };
      }
    },
    addLog(message, type = "INFO") {
      this.logs.unshift({ id: Date.now(), message, type });
      if (this.logs.length > 50) this.logs.pop();
    },
  },
});