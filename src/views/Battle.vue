<!-- <template>
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
</style> -->

<!-- ========================================================= -->

<!-- code test -->
<template>
  <div class="combat-page">
    <div class="combat-container">
      <transition name="bounce">
        <div v-if="showLevelUp" class="levelup-overlay">
          <h2>🌟 LEVEL UP! {{ playerStore.stats.lv }} 🌟</h2>
          <p>Full HP/Energy - Tăng sức mạnh!</p>
        </div>
      </transition>

      <h2 class="combat-title" :class="{ 'text-red': isGameOver, 'text-green': isVictory }">
        {{ combatLog }}
      </h2>

      <div v-if="showParryBtn" class="parry-overlay">
        <button class="btn-parry" @click="handleParry">🛡️ ĐỠ NGAY!</button>
        <div class="parry-timer-bar"></div>
      </div>

      <div class="battlefield">
        <div class="fighter enemy" :class="{ 'attack-anim': enemyAttacking, 'hit-anim': enemyHit }">
          <div class="avatar-box">
            <img :src="currentEnemyImage" class="fighter-img enemy-img" alt="Enemy" />
          </div>
          <div class="name">{{ battleStore.enemy ? battleStore.enemy.name : 'Đang tải...' }}</div>
          <div class="hp-bar-container">
            <div class="hp-bar" :style="{ width: visualEnemyHp + '%' }"></div>
          </div>
        </div>

        <div class="vs-text">VS</div>

        <div class="fighter player" :class="{ 'attack-anim': playerAttacking, 'hit-anim': playerHit }">
          <div class="avatar-box">
            <img :src="authStore.user?.avatarUrl || 'https://cdn-icons-png.flaticon.com/512/9408/9408175.png'"
              class="fighter-img player-img" />
          </div>
          <div class="name">
            {{ playerStore.stats.name }} <span class="badge-lv">Lv.{{ playerStore.stats.lv }}</span>
          </div>
          <div class="hp-bar-container">
            <div class="hp-bar player-bar" :style="{ width: playerHpPercent + '%' }"></div>
          </div>
          <div class="hp-text">{{ playerStore.stats.hp }} / {{ playerStore.stats.maxHp }}</div>
        </div>
      </div>
      <div class="controls">
        <div v-if="!isGameOver && !isVictory">
          <button v-if="isAutoBattling" class="btn btn-disabled" disabled>🤖 Đang tự động đánh...</button>
          <template v-else>
            <button class="btn btn-attack" @click="playerTurn('normal')" :disabled="isBusy">⚔️ ĐÁNH THƯỜNG</button>
            <button class="btn btn-strong" @click="playerTurn('strong')"
              :disabled="isBusy || playerStore.stats.energy < 5">💥 ĐÁNH MẠNH (5⚡)</button>
            <button class="btn btn-auto" @click="startAutoBattle" :disabled="isBusy">🤖 AUTO</button>
          </template>
        </div>
        <div v-else class="end-actions">
          <button class="btn btn-back" @click="$router.push('/explore')">Quay lại Rừng</button>
          <button class="btn btn-village" @click="$router.push('/village')">Về Làng</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { usePlayerStore } from '@/stores/player';
import { useBattleStore } from '@/stores/battleStore'; // Import BattleStore
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';
import { getEnemyImage } from '@/utils/assetHelper'; // Import Helper

const playerStore = usePlayerStore();
const battleStore = useBattleStore();
const authStore = useAuthStore();
const router = useRouter();

// --- STATE ---
const combatLog = ref('Sẵn sàng chiến đấu!');
const isAutoBattling = ref(false);
const isGameOver = ref(false);
const isVictory = ref(false);
const isBusy = ref(false);
const showLevelUp = ref(false);

const playerAttacking = ref(false);
const enemyAttacking = ref(false);
const playerHit = ref(false);
const enemyHit = ref(false);
const visualEnemyHp = ref(100); // % hiển thị

const showParryBtn = ref(false);
let parrySuccess = false;
let autoBattleTimer = null;

// --- COMPUTED: Lấy ảnh quái từ Helper dựa trên tên quái trả về từ API ---
const currentEnemyImage = computed(() => {
  if (!battleStore.enemy) return '';
  return getEnemyImage(battleStore.enemy.name, enemyAttacking.value ? 'attack' : 'idle');
});

const playerHpPercent = computed(() => {
  if (playerStore.stats.maxHp === 0) return 0;
  return (playerStore.stats.hp / playerStore.stats.maxHp) * 100;
});

const delay = (ms) => new Promise(r => setTimeout(r, ms));

// --- PLAYER ACTION ---
const playerTurn = async (attackType = 'normal') => {
  if (isBusy.value) return;
  isBusy.value = true;

  playerAttacking.value = true;
  await delay(300);
  playerAttacking.value = false;

  combatLog.value = attackType === 'strong' ? "Tung đòn sấm sét!" : "Tấn công!";

  // Gọi API từ Store
  await battleStore.attack(attackType, parrySuccess);
  parrySuccess = false; // Reset parry sau khi đánh

  // Logic hiển thị sau khi có kết quả
  if (battleStore.status !== 'ONGOING') {
    visualEnemyHp.value = 0;
    if (battleStore.status === 'VICTORY') {
      isVictory.value = true;
      combatLog.value = "🎉 Chiến thắng!";
    } else {
      isGameOver.value = true;
      combatLog.value = "💀 Bạn đã thất bại...";
    }
  } else {
    // Tính % máu quái để hiển thị thanh máu (giả lập visual vì backend trả về số thực)
    visualEnemyHp.value = (battleStore.enemyHp / battleStore.enemyMaxHp) * 100;
    enemyHit.value = true;
    await delay(200);
    enemyHit.value = false;

    // Enemy đánh lại (Animation)
    await enemyTurnAnimation();
  }

  isBusy.value = false;
};

const enemyTurnAnimation = async () => {
  await delay(500);
  enemyAttacking.value = true;
  await delay(300);
  enemyAttacking.value = false;

  playerHit.value = true;
  await delay(300);
  playerHit.value = false;
}

const startAutoBattle = () => {
  // Logic auto battle giữ nguyên như cũ
};

// ... (Giữ nguyên các phần parry logic nếu muốn)

onMounted(async () => {
  // Khởi tạo battle khi vào trang
  if (battleStore.status === 'IDLE') {
    await battleStore.startBattle();
  }
  visualEnemyHp.value = 100;
});
</script>

<style scoped>
/* Giữ nguyên style cũ */
.combat-page {
  width: 100%;
  color: white;
  text-align: center;
  padding: 20px;
  position: relative;
}

.combat-container {
  background: #222;
  padding: 20px;
  border-radius: 12px;
  border: 2px solid #444;
  max-width: 600px;
  margin: 0 auto;
  position: relative;
}

.combat-title {
  color: #ffd166;
  min-height: 30px;
  margin-bottom: 20px;
  font-size: 1.2rem;
}

.parry-overlay {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
}

.btn-parry {
  background: #ffd700;
  color: #000;
  font-size: 24px;
  font-weight: 900;
  padding: 15px 40px;
  border: 4px solid #fff;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 0 20px #ffd700;
  animation: popIn 0.1s;
}

.parry-timer-bar {
  width: 100%;
  height: 5px;
  background: red;
  margin-top: 5px;
  animation: shrink 0.73s linear forwards;
}

@keyframes popIn {
  from {
    transform: scale(0);
  }

  to {
    transform: scale(1);
  }
}

@keyframes shrink {
  from {
    width: 100%;
  }

  to {
    width: 0%;
  }
}

.battlefield {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 0 10px;
}

.fighter {
  width: 40%;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.2s;
}

.avatar-box {
  width: 120px;
  height: 120px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fighter-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 5px 5px rgba(0, 0, 0, 0.5));
}

.hp-bar-container {
  width: 100%;
  height: 8px;
  background: #444;
  border-radius: 5px;
  margin-top: 5px;
  overflow: hidden;
}

.hp-bar {
  height: 100%;
  background: #ef476f;
  transition: width 0.3s ease;
}

.player-bar {
  background: #06d6a0;
}

.vs-text {
  font-size: 24px;
  font-weight: 900;
  color: #555;
  font-style: italic;
}

.controls button {
  padding: 10px 15px;
  margin: 5px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-attack {
  background: #ef476f;
  color: white;
}

.btn-strong {
  background: #9d4edd;
  color: white;
  box-shadow: 0 0 10px #9d4edd;
}

.btn-auto {
  background: #118ab2;
  color: white;
}

.btn-disabled {
  background: #555;
  color: #aaa;
  cursor: not-allowed;
}

.btn-back {
  background: #555;
  color: white;
}

.btn-village {
  background: #118ab2;
  color: white;
}

.attack-anim {
  transform: scale(1.2) translateY(-20px);
}

.hit-anim {
  filter: brightness(0) sepia(1) hue-rotate(-50deg) saturate(5);
  animation: shake 0.3s;
}

@keyframes shake {

  0%,
  100% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-5px);
  }

  75% {
    transform: translateX(5px);
  }
}

.exp-bar-container {
  width: 100%;
  height: 4px;
  background: #333;
  margin-top: 5px;
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.exp-bar {
  background: #3b82f6;
  height: 100%;
  transition: width 0.5s ease-out;
}

.exp-text {
  font-size: 0.7rem;
  color: #aaa;
  margin-top: 2px;
}

.badge-lv {
  background: #ffd700;
  color: black;
  padding: 1px 4px;
  border-radius: 4px;
  font-size: 0.8em;
  margin-left: 5px;
}

.levelup-overlay {
  position: absolute;
  top: 15%;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(45deg, #ffd700, #ff8c00);
  color: #fff;
  text-shadow: 0 2px 0 #000;
  padding: 15px 30px;
  border-radius: 12px;
  border: 2px solid #fff;
  z-index: 999;
  text-align: center;
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
}

.levelup-overlay h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 900;
}

.levelup-overlay p {
  margin: 5px 0 0;
  font-size: 0.9rem;
}

.bounce-enter-active {
  animation: bounce-in .5s;
}

.bounce-leave-active {
  animation: bounce-in .5s reverse;
}

@keyframes bounce-in {
  0% {
    transform: translateX(-50%) scale(0);
  }

  50% {
    transform: translateX(-50%) scale(1.2);
  }

  100% {
    transform: translateX(-50%) scale(1);
  }
}
</style>