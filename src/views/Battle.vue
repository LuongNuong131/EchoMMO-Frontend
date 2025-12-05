<template>
  <div class="page-container battle-ancient">
    <div class="battle-wrapper">
      <div
        v-if="battleStore.status === 'IDLE'"
        class="loading-scroll paper-texture"
      >
        <h2><i class="fas fa-yin-yang fa-spin"></i> ĐANG TÌM ĐỐI THỦ...</h2>
      </div>

      <div v-else class="arena-layout">
        <div class="fighter-card enemy" :class="{ shake: isEnemyHit }">
          <div class="card-top">
            <span class="name">{{ battleStore.enemy?.name }}</span>
            <span class="level">Cấp {{ battleStore.enemy?.level }}</span>
          </div>
          <div class="avatar-frame red-border">
            <div class="avatar-img">👿</div>
            <div class="dmg-float" v-if="isEnemyHit">-{{ lastDmg }}</div>
          </div>
          <div class="hp-track">
            <div
              class="hp-fill red"
              :style="{ width: enemyHpPercent + '%' }"
            ></div>
          </div>
          <div class="hp-num">
            {{ battleStore.enemyHp }} / {{ battleStore.enemyMaxHp }}
          </div>
        </div>

        <div class="vs-seal">VS</div>

        <div class="fighter-card player" :class="{ shake: isPlayerHit }">
          <div class="card-top">
            <span class="name">BẢN THÂN</span>
            <span class="level">Cấp {{ charStore.character?.level }}</span>
          </div>
          <div class="avatar-frame blue-border">
            <div class="avatar-img">🦸‍♂️</div>
          </div>
          <div class="hp-track">
            <div
              class="hp-fill blue"
              :style="{ width: playerHpPercent + '%' }"
            ></div>
          </div>
          <div class="hp-num">
            {{ battleStore.playerHp }} / {{ battleStore.playerMaxHp }}
          </div>
          <div class="energy-display">
            ⚡ Chân Khí: {{ charStore.character?.energy }}
          </div>
        </div>

        <div class="battle-log paper-texture custom-scroll" ref="logRef">
          <div
            v-for="(log, i) in battleStore.combatLogs"
            :key="i"
            class="log-entry"
          >
            {{ log }}
          </div>
        </div>

        <div class="action-dock" v-if="battleStore.status === 'ONGOING'">
          <button class="btn-move atk" @click="attack('normal')">
            <div class="kanji">攻</div>
            TẤN CÔNG
          </button>
          <button class="btn-move skill" @click="attack('strong')">
            <div class="kanji">力</div>
            MẠNH MẼ (5⚡)
          </button>
          <button
            v-for="s in battleStore.skills"
            :key="s.skillId"
            class="btn-move magic"
            @click="useSkill(s.skillId)"
          >
            <div class="kanji">技</div>
            {{ s.name }}
          </button>
        </div>

        <div v-else class="result-panel paper-texture">
          <h2 :class="battleStore.status">
            {{
              battleStore.status === "VICTORY" ? "ĐẠI THẮNG!" : "THẤT BẠI..."
            }}
          </h2>
          <div v-if="battleStore.status === 'VICTORY'" class="rewards">
            <p>Chiến lợi phẩm:</p>
            <span>💰 {{ battleStore.goldEarned }} Vàng</span>
            <span>✨ {{ battleStore.expEarned }} Kinh Nghiệm</span>
          </div>
          <button class="btn-wood" @click="goBack">QUAY VỀ RỪNG</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { useBattleStore } from "../stores/battleStore";
import { useCharacterStore } from "../stores/characterStore";
import { useRouter } from "vue-router";

const battleStore = useBattleStore();
const charStore = useCharacterStore();
const router = useRouter();
const isEnemyHit = ref(false);
const isPlayerHit = ref(false);
const lastDmg = ref(0);
const logRef = ref(null);

const enemyHpPercent = computed(
  () => (battleStore.enemyHp / battleStore.enemyMaxHp) * 100
);
const playerHpPercent = computed(
  () => (battleStore.playerHp / battleStore.playerMaxHp) * 100
);

const attack = async (type) => {
  isEnemyHit.value = true;
  await battleStore.attack(type);
  setTimeout(() => (isEnemyHit.value = false), 300);
  scrollToBottom();
};

const useSkill = async (id) => {
  isEnemyHit.value = true;
  await battleStore.useSkill(id);
  setTimeout(() => (isEnemyHit.value = false), 300);
  scrollToBottom();
};

const goBack = () => {
  battleStore.resetBattle();
  router.push("/explore");
};

const scrollToBottom = () =>
  nextTick(() => {
    if (logRef.value) logRef.value.scrollTop = logRef.value.scrollHeight;
  });

onMounted(() => {
  if (battleStore.status === "IDLE") battleStore.startBattle();
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Noto+Serif+TC:wght@700&display=swap");

.battle-ancient {
  background: #1a1a1a;
  min-height: 100vh;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #4e342e;
  font-family: "Playfair Display";
}
.battle-wrapper {
  width: 100%;
  max-width: 600px;
}

.paper-texture {
  background: #fdf5e6;
  background-image: url("https://www.transparenttextures.com/patterns/aged-paper.png");
  border: 4px solid #5d4037;
  padding: 20px;
  border-radius: 4px;
  text-align: center;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
}

.arena-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.fighter-card {
  background: #efebe9;
  border: 2px solid #8d6e63;
  padding: 15px;
  border-radius: 6px;
  position: relative;
}
.fighter-card.enemy {
  border-color: #c62828;
}
.fighter-card.player {
  border-color: #1565c0;
}

.card-top {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  font-family: "Noto Serif TC";
  margin-bottom: 10px;
}
.avatar-frame {
  width: 80px;
  height: 80px;
  background: #3e2723;
  margin: 0 auto 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3em;
  border-radius: 50%;
  border: 3px solid;
}
.red-border {
  border-color: #c62828;
}
.blue-border {
  border-color: #1565c0;
}

.hp-track {
  height: 10px;
  background: #d7ccc8;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 5px;
}
.hp-fill {
  height: 100%;
  transition: width 0.3s;
}
.red {
  background: #c62828;
}
.blue {
  background: #1565c0;
}
.hp-num {
  text-align: center;
  font-size: 0.8em;
  font-weight: bold;
}

.vs-seal {
  text-align: center;
  font-size: 2em;
  font-family: "Cinzel";
  font-weight: 900;
  color: #fbc02d;
  text-shadow: 2px 2px 0 #3e2723;
  margin: -10px 0;
  z-index: 2;
}

.battle-log {
  height: 150px;
  overflow-y: auto;
  text-align: left;
  font-size: 0.9em;
  border: 2px dashed #8d6e63;
}
.log-entry {
  margin-bottom: 5px;
  border-bottom: 1px solid #d7ccc8;
}

.action-dock {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}
.btn-move {
  padding: 10px 15px;
  border: 2px solid #5d4037;
  background: #fdf5e6;
  cursor: pointer;
  font-family: "Noto Serif TC";
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: transform 0.1s;
}
.btn-move:hover {
  background: #5d4037;
  color: #fdf5e6;
}
.kanji {
  font-size: 1.2em;
  color: #b71c1c;
}

.result-panel h2 {
  font-size: 2em;
  margin: 0 0 10px;
}
.VICTORY {
  color: #2e7d32;
}
.DEFEAT {
  color: #c62828;
}
.btn-wood {
  background: #5d4037;
  color: #fdf5e6;
  border: none;
  padding: 10px 20px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 15px;
}

.shake {
  animation: shake 0.3s;
}
@keyframes shake {
  0% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}
</style>
