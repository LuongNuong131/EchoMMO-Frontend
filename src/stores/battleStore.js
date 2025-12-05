import { defineStore } from "pinia";
import axiosClient from "../api/axiosClient";
import { useCharacterStore } from "./characterStore";
import { useAuthStore } from "./authStore";

export const useBattleStore = defineStore("battle", {
  state: () => ({
    enemy: null,
    enemyHp: 0,
    enemyMaxHp: 0,
    playerHp: 0,
    playerMaxHp: 0,
    combatLogs: [],
    status: "IDLE", // IDLE, ONGOING, VICTORY, DEFEAT
    isLoading: false,
    skills: [], // Danh sách kỹ năng
  }),

  actions: {
    // Bắt đầu trận đấu (Tìm quái)
    async startBattle() {
      this.isLoading = true;
      this.combatLogs = [];
      try {
        // Gọi song song: Tạo trận + Lấy skill
        const [resBattle, resSkills] = await Promise.all([
          axiosClient.post("/battle/start"),
          axiosClient.get("/battle/skills"),
        ]);

        this.handleResult(resBattle.data);
        this.skills = resSkills.data;

        // Refresh nhân vật để cập nhật Energy (nếu server có trừ/hồi)
        const charStore = useCharacterStore();
        charStore.fetchCharacter();
      } catch (e) {
        alert(e.response?.data || "Không thể tìm thấy đối thủ!");
      } finally {
        this.isLoading = false;
      }
    },

    // Tấn công (Logic mới: Đỡ đòn & Đánh mạnh)
    // attackType: 'normal' | 'strong'
    // isParried: true | false (Từ QTE Frontend)
    async attack(attackType = "normal", isParried = false) {
      if (this.status !== "ONGOING") return;
      this.isLoading = true;

      try {
        const res = await axiosClient.post("/battle/attack", {
          enemyId: this.enemy.enemyId,
          enemyHp: this.enemyHp,
          attackType: attackType,
          isParried: isParried,
        });

        this.handleResult(res.data);
      } catch (e) {
        alert(e.response?.data || "Lỗi tấn công");
      } finally {
        this.isLoading = false;
      }
    },

    // Dùng Skill
    async useSkill(skillId) {
      if (this.status !== "ONGOING") return;
      this.isLoading = true;
      try {
        const res = await axiosClient.post("/battle/skill", {
          enemyId: this.enemy.enemyId,
          enemyHp: this.enemyHp,
          skillId: skillId,
        });
        this.handleResult(res.data);
      } catch (e) {
        alert("⚠️ " + (e.response?.data || "Không thể dùng kỹ năng"));
      } finally {
        this.isLoading = false;
      }
    },

    // Xử lý kết quả trả về từ Backend
    handleResult(data) {
      this.enemy = data.enemy;
      this.enemyHp = data.enemyHp;
      this.enemyMaxHp = data.enemyMaxHp;
      this.playerHp = data.playerHp;
      this.playerMaxHp = data.playerMaxHp;
      this.status = data.status;

      // Thêm log mới vào danh sách
      if (data.combatLog && data.combatLog.length > 0) {
        this.combatLogs.push(...data.combatLog);
      }

      // Cập nhật HP/Energy hiển thị trên Header
      const charStore = useCharacterStore();
      if (charStore.character) {
        charStore.character.hp = data.playerHp;
        // Nếu data backend trả về energy thì update luôn (cần backend hỗ trợ thêm, tạm thời fetch lại)
        if (this.status !== "ONGOING") {
          charStore.fetchCharacter();
        }
      }

      // Nếu thắng -> Cập nhật tiền
      if (this.status === "VICTORY") {
        const authStore = useAuthStore();
        authStore.fetchProfile();
      }

      // Tự động cuộn xuống log cuối cùng
      setTimeout(() => {
        const logDiv = document.querySelector(".combat-log-container");
        if (logDiv) logDiv.scrollTop = logDiv.scrollHeight;
      }, 50);
    },

    resetBattle() {
      this.enemy = null;
      this.status = "IDLE";
      this.combatLogs = [];
    },
  },
});
