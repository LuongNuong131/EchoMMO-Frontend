import { defineStore } from "pinia";
import axiosClient from "../api/axiosClient";
import router from "../router";

export const useCharacterStore = defineStore("character", {
  state: () => ({
    character: null,
    isLoading: false,
    logs: [], // Nhật ký hoạt động (Explore/System)
  }),

  getters: {
    // Tính % thanh kinh nghiệm
    xpPercent: (state) => {
      if (!state.character) return 0;
      const needed = state.character.level * 100;
      return Math.min((state.character.currentExp / needed) * 100, 100);
    },
    // Tính % thanh máu
    hpPercent: (state) => {
      if (!state.character) return 0;
      return Math.min((state.character.hp / state.character.maxHp) * 100, 100);
    },
    // Tính % thanh năng lượng
    energyPercent: (state) => {
      if (!state.character) return 0;
      return Math.min(
        (state.character.energy / state.character.maxEnergy) * 100,
        100
      );
    },
  },

  actions: {
    async fetchCharacter() {
      this.isLoading = true;
      try {
        const res = await axiosClient.get("/character/me");
        this.character = res.data || null;
      } catch (error) {
        console.error("Lỗi tải nhân vật:", error);
        // Nếu lỗi 403/401 thì đá về login
        if (error.response && [401, 403].includes(error.response.status)) {
          router.push("/login");
        }
      } finally {
        this.isLoading = false;
      }
    },

    async createCharacter(name) {
      try {
        const res = await axiosClient.post("/character/create", { name });
        this.character = res.data;
        return true;
      } catch (error) {
        alert(error.response?.data || "Tạo thất bại");
        return false;
      }
    },

    // Đi thám hiểm (Logic mới từ Backend GameFi)
    async explore() {
      if (!this.character) return;
      if (this.character.energy < 1) {
        alert("Hết năng lượng! Hãy về làng nghỉ ngơi.");
        return;
      }

      try {
        const res = await axiosClient.post("/exploration/explore");
        const data = res.data;

        // Cập nhật lại UI dựa trên phản hồi server
        this.character.energy = data.currentEnergy;

        // Nếu lên cấp -> load lại toàn bộ để cập nhật maxHp, stats mới
        if (data.newLevel) {
          await this.fetchCharacter();
          this.addLog(`🌟 <b>LÊN CẤP ĐỘ ${data.newLevel}!</b>`, "LEVEL_UP");
        } else {
          // Cộng EXP client-side cho mượt
          this.character.currentExp += data.expGained || 0;
        }

        // Ghi log
        this.addLog(data.message, data.rewardType);
      } catch (error) {
        const msg =
          error.response?.data?.message ||
          error.response?.data ||
          "Lỗi kết nối";
        if (msg === "CAPTCHA_REQUIRED") {
          throw new Error("CAPTCHA"); // Ném lỗi để View hiện Modal Captcha
        }
        this.addLog("❌ " + msg, "ERROR");
      }
    },

    // Hàm phụ thêm log vào nhật ký
    addLog(message, type = "INFO") {
      this.logs.unshift({
        id: Date.now(),
        message,
        type,
      });
      if (this.logs.length > 50) this.logs.pop();
    },
  },
});
