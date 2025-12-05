// import { defineStore } from "pinia";
// import axiosClient from "../api/axiosClient";
// import { useCharacterStore } from "./characterStore";

// export const useBattleStore = defineStore("battle", {
//   state: () => ({
//     enemy: null,
//     enemyHp: 0,
//     enemyMaxHp: 0,
//     playerHp: 0,
//     playerMaxHp: 0,
//     combatLogs: [],
//     status: "IDLE",
//     isLoading: false,
//     skills: [],
//     goldEarned: 0,
//     expEarned: 0,
//   }),

//   actions: {
//     async startBattle() {
//       this.isLoading = true;
//       this.combatLogs = [];
//       try {
//         // Gọi API Start Battle
//         const res = await axiosClient.post("/battle/start");
//         this.handleResult(res.data);

//         // Lấy Skill
//         const resSkill = await axiosClient.get("/battle/skills");
//         this.skills = resSkill.data;
//       } catch (e) {
//         this.combatLogs.push("Lỗi: " + e.message);
//       } finally {
//         this.isLoading = false;
//       }
//     },

//     async attack(attackType = "normal", isParried = false) {
//       const charStore = useCharacterStore();
//       this.isLoading = true;
//       try {
//         const res = await axiosClient.post("/battle/attack", {
//           enemyId: this.enemy.enemyId,
//           enemyHp: this.enemyHp,
//           isParried,
//           attackType,
//         });
//         this.handleResult(res.data);

//         // Sync HP/Energy
//         if (res.data.playerHp) charStore.character.hp = res.data.playerHp;
//         if (res.data.playerEnergy)
//           charStore.character.energy = res.data.playerEnergy;
//       } catch (e) {
//         console.error(e);
//       } finally {
//         this.isLoading = false;
//       }
//     },

//     async useSkill(skillId) {
//       const charStore = useCharacterStore();
//       try {
//         const res = await axiosClient.post("/battle/skill", {
//           enemyId: this.enemy.enemyId,
//           enemyHp: this.enemyHp,
//           skillId,
//         });
//         this.handleResult(res.data);
//         if (res.data.playerHp) charStore.character.hp = res.data.playerHp;
//       } catch (e) {
//         console.error(e);
//       }
//     },

//     handleResult(data) {
//       this.enemy = data.enemy;
//       this.enemyHp = data.enemyHp;
//       this.enemyMaxHp = data.enemyMaxHp;
//       this.playerHp = data.playerHp;
//       this.playerMaxHp = data.playerMaxHp;
//       this.status = data.status;

//       // Append logs
//       if (data.combatLog) this.combatLogs.push(...data.combatLog);

//       if (data.status === "VICTORY") {
//         this.goldEarned = data.goldEarned;
//         this.expEarned = data.expEarned;
//       }
//     },

//     resetBattle() {
//       this.status = "IDLE";
//       this.enemy = null;
//       this.combatLogs = [];
//     },
//   },
// });

// =========================================================

//code test
import { defineStore } from "pinia";
import axiosClient from "../api/axiosClient";
import { useCharacterStore } from "./characterStore";

export const useBattleStore = defineStore("battle", {
  state: () => ({
    enemy: null,
    enemyHp: 0,
    enemyMaxHp: 0,
    playerHp: 0,
    playerMaxHp: 0,
    combatLogs: [],
    status: "IDLE",
    goldEarned: 0,
    expEarned: 0,
    skills: []
  }),

  actions: {
    async startBattle() {
      this.status = "ONGOING";
      this.combatLogs = [];
      try {
        const res = await axiosClient.post("/battle/start");
        this.handleResult(res.data);
        
        // Lấy skills nếu cần
        try {
            const skillRes = await axiosClient.get("/battle/skills");
            this.skills = skillRes.data;
        } catch(err) { /* Bỏ qua nếu chưa có API skill */ }
        
      } catch (e) {
        this.combatLogs.push("Lỗi: " + (e.response?.data || e.message));
      }
    },

    async attack(attackType, isParried) {
      try {
        const res = await axiosClient.post("/battle/attack", {
          enemyId: this.enemy.enemyId,
          enemyHp: this.enemyHp,
          isParried: isParried,
          attackType: attackType,
        });
        this.handleResult(res.data);
      } catch (e) {
        console.error(e);
      }
    },

    async useSkill(skillId) {
       // Logic gọi API skill (nếu backend đã có)
    },

    handleResult(data) {
      this.enemy = data.enemy;
      this.enemyHp = data.enemyHp;
      this.enemyMaxHp = data.enemyMaxHp;
      this.playerHp = data.playerHp;
      this.playerMaxHp = data.playerMaxHp;
      this.status = data.status;

      if (data.combatLog) {
          this.combatLogs.push(...data.combatLog);
      }

      if (data.status === "VICTORY") {
        this.goldEarned = data.goldEarned;
        this.expEarned = data.expEarned;
      }

      // Cập nhật HP cho nhân vật ở store chính để thanh máu bên ngoài đồng bộ
      const charStore = useCharacterStore();
      if(charStore.character) {
        charStore.character.hp = data.playerHp;
        // Nếu backend trả về energy mới thì cập nhật luôn
        // charStore.character.energy = data.playerEnergy; 
      }
    },

    resetBattle() {
      this.status = "IDLE";
      this.enemy = null;
      this.combatLogs = [];
    },
  },
});