import { defineStore } from "pinia";
import axiosClient from "../api/axiosClient";
import { useCharacterStore } from "./characterStore";
import { useAuthStore } from "./authStore";

export const useBattleStore = defineStore("battle", {
  state: () => ({
    enemy: null, enemyHp: 0, enemyMaxHp: 0,
    playerHp: 0, playerMaxHp: 0, playerEnergy: 0, playerMaxEnergy: 0,
    combatLogs: [], status: "IDLE", isLoading: false, skills: [],
    levelUp: false, goldEarned: 0, expEarned: 0
  }),
  actions: {
    async startBattle() {
      this.isLoading = true; this.combatLogs = []; this.levelUp = false;
      try {
        const [resBattle, resSkills] = await Promise.all([
          axiosClient.post("/battle/start"), axiosClient.get("/battle/skills")
        ]);
        this.handleResult(resBattle.data);
        this.skills = resSkills.data;
        useCharacterStore().fetchCharacter();
      } catch (e) { alert(e.response?.data || "Lỗi tìm trận"); }
      finally { this.isLoading = false; }
    },
    async attack(attackType = "normal", isParried = false) {
      if (this.status !== "ONGOING") return;
      this.isLoading = true;
      try {
        const res = await axiosClient.post("/battle/attack", {
          enemyId: this.enemy.enemyId, enemyHp: this.enemyHp,
          attackType, isParried
        });
        this.handleResult(res.data);
      } catch (e) { alert(e.response?.data); }
      finally { this.isLoading = false; }
    },
    async useSkill(skillId) {
      if (this.status !== "ONGOING") return;
      this.isLoading = true;
      try {
        const res = await axiosClient.post("/battle/skill", {
          enemyId: this.enemy.enemyId, enemyHp: this.enemyHp, skillId
        });
        this.handleResult(res.data);
      } catch (e) { alert(e.response?.data); }
      finally { this.isLoading = false; }
    },
    handleResult(data) {
      Object.assign(this, {
        enemy: data.enemy, enemyHp: data.enemyHp, enemyMaxHp: data.enemyMaxHp,
        playerHp: data.playerHp, playerMaxHp: data.playerMaxHp,
        playerEnergy: data.playerEnergy, playerMaxEnergy: data.playerMaxEnergy,
        status: data.status, levelUp: data.levelUp || false,
        goldEarned: data.goldEarned, expEarned: data.expEarned
      });
      if (data.combatLog) this.combatLogs.push(...data.combatLog);

      const charStore = useCharacterStore();
      if (charStore.character) {
        charStore.character.hp = data.playerHp;
        if(data.playerEnergy !== undefined) charStore.character.energy = data.playerEnergy;
        if (this.levelUp) charStore.fetchCharacter();
      }
      if (this.status === "VICTORY") useAuthStore().fetchProfile();

      setTimeout(() => {
        const logDiv = document.querySelector(".combat-log");
        if (logDiv) logDiv.scrollTop = logDiv.scrollHeight;
      }, 50);
    },
    resetBattle() { this.enemy = null; this.status = "IDLE"; this.combatLogs = []; }
  }
});