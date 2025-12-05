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
  <div class="page-container battle-page">
    <div class="battle-container" v-if="battleStore.enemy">

      <transition name="bounce">
        <div v-if="battleStore.status === 'VICTORY' && battleStore.expEarned > 0" class="levelup-popup">
          🎉 CHIẾN THẮNG! +{{ battleStore.expEarned }} EXP
        </div>
      </transition>

      <div class="combat-log-text"
        :class="{ 'text-red': battleStore.status === 'DEFEAT', 'text-green': battleStore.status === 'VICTORY' }">
        {{ lastLog }}
      </div>

      <div v-if="showParryBtn" class="parry-overlay">
        <button class="btn-parry" @click="doParry">🛡️ ĐỠ ĐÒN!</button>
        <div class="parry-bar"></div>
      </div>

      <div class="battlefield">
        <div class="fighter enemy" :class="{ 'hit': isEnemyHit }">
          <div class="avatar-box">
            <img :src="battleStore.enemy.imageUrl || '/src/assets/enemy/idle_goblin.png'" class="fighter-img" />
          </div>
          <div class="name">{{ battleStore.enemy.name }} (Lv.{{ battleStore.enemy.level }})</div>
          <div class="hp-bar-frame">
            <div class="hp-bar red" :style="{ width: enemyHpPercent + '%' }"></div>
          </div>
          <div class="hp-text">{{ battleStore.enemyHp }} / {{ battleStore.enemyMaxHp }}</div>
        </div>

        <div class="vs">VS</div>

        <div class="fighter player" :class="{ 'hit': isPlayerHit }">
          <div class="avatar-box">
            <img :src="authStore.user?.avatarUrl || 'https://cdn-icons-png.flaticon.com/512/9408/9408175.png'"
              class="fighter-img" />
          </div>
          <div class="name">{{ authStore.user?.username }}</div>
          <div class="hp-bar-frame">
            <div class="hp-bar green" :style="{ width: playerHpPercent + '%' }"></div>
          </div>
          <div class="hp-text">{{ battleStore.playerHp }} / {{ battleStore.playerMaxHp }}</div>
          <div class="energy text-yellow">⚡ {{ charStore.character?.energy }}</div>
        </div>
      </div>

      <div class="controls">
        <div v-if="battleStore.status === 'ONGOING'">
          <button class="btn-action atk" @click="playerAttack('normal')" :disabled="isBusy">⚔️ TẤN CÔNG</button>
          <button class="btn-action skill" @click="playerAttack('strong')"
            :disabled="isBusy || charStore.character?.energy < 5">💥 MẠNH (5⚡)</button>
        </div>
        <div v-else class="result-actions">
          <button class="btn-back" @click="$router.push('/explore')">🌲 Quay lại rừng</button>
          <button class="btn-back" @click="$router.push('/village')">🏘️ Về làng</button>
        </div>
      </div>
    </div>
    <div v-else class="loading">Đang tìm đối thủ...</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useBattleStore } from '@/stores/battleStore';
import { useCharacterStore } from '@/stores/characterStore';
import { useAuthStore } from '@/stores/authStore';

const battleStore = useBattleStore();
const charStore = useCharacterStore();
const authStore = useAuthStore();

const isBusy = ref(false);
const isPlayerHit = ref(false);
const isEnemyHit = ref(false);
const showParryBtn = ref(false);
let parrySuccess = ref(false);

const enemyHpPercent = computed(() => (battleStore.enemyHp / battleStore.enemyMaxHp) * 100);
const playerHpPercent = computed(() => (battleStore.playerHp / battleStore.playerMaxHp) * 100);
const lastLog = computed(() => battleStore.combatLogs.length ? battleStore.combatLogs[battleStore.combatLogs.length - 1] : '...');
const delay = (ms) => new Promise(r => setTimeout(r, ms));

const playerAttack = async (type) => {
  if (isBusy.value) return;
  isBusy.value = true;
  isEnemyHit.value = true;
  setTimeout(() => isEnemyHit.value = false, 300);

  await battleStore.attack(type, parrySuccess.value);
  parrySuccess.value = false;

  if (battleStore.status === 'ONGOING') {
    await delay(500);
    isPlayerHit.value = true;
    setTimeout(() => isPlayerHit.value = false, 300);
    if (Math.random() < 0.3) triggerParry();
  }
  isBusy.value = false;
};

const triggerParry = () => {
  showParryBtn.value = true;
  setTimeout(() => showParryBtn.value = false, 800);
};

const doParry = () => {
  parrySuccess.value = true;
  showParryBtn.value = false;
};

onMounted(async () => {
  await charStore.fetchCharacter();
  await battleStore.startBattle();
});
</script>

<style scoped>
.battle-page {
  background: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.combat-container {
  background: #261815;
  border: 4px solid #5d4037;
  padding: 20px;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  position: relative;
  color: #eee;
  font-family: "Noto Serif TC";
}

.combat-log-text {
  text-align: center;
  font-weight: bold;
  margin-bottom: 20px;
  min-height: 24px;
  color: #fbc02d;
}

.text-red {
  color: #ef5350;
}

.text-green {
  color: #66bb6a;
}

.battlefield {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.fighter {
  width: 40%;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: 0.2s;
}

.fighter.hit {
  animation: shake 0.3s;
  filter: brightness(2) sepia(1) hue-rotate(-50deg);
}

.avatar-box {
  width: 100px;
  height: 100px;
  border: 3px solid #8d6e63;
  border-radius: 50%;
  overflow: hidden;
  background: #000;
  margin-bottom: 10px;
}

.fighter-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.hp-bar-frame {
  width: 100%;
  height: 10px;
  background: #4e342e;
  border-radius: 5px;
  overflow: hidden;
  margin-top: 5px;
  border: 1px solid #333;
}

.hp-bar {
  height: 100%;
  transition: width 0.3s;
}

.red {
  background: #e53935;
}

.green {
  background: #43a047;
}

.vs {
  font-size: 2em;
  font-weight: 900;
  color: #8d6e63;
  font-family: "Cinzel";
}

.controls {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-action {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  font-family: "Noto Serif TC";
  color: #fff;
  transition: 0.2s;
}

.atk {
  background: #c62828;
  border-bottom: 4px solid #8e0000;
}

.skill {
  background: #fbc02d;
  color: #000;
  border-bottom: 4px solid #c49000;
}

.btn-action:disabled {
  background: #555;
  border-bottom-color: #333;
  cursor: not-allowed;
  color: #aaa;
}

.result-actions {
  display: flex;
  gap: 10px;
}

.btn-back {
  background: #5d4037;
  color: #fff;
  padding: 10px 20px;
  border: 2px solid #3e2723;
  cursor: pointer;
  font-weight: bold;
}

.parry-overlay {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 50;
}

.btn-parry {
  background: #ffd700;
  color: #000;
  font-size: 1.5em;
  font-weight: 900;
  padding: 15px 30px;
  border: 4px solid #fff;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 0 20px #ffd700;
  animation: popIn 0.1s;
}

.parry-bar {
  width: 100%;
  height: 6px;
  background: red;
  margin-top: 5px;
  animation: shrink 0.8s linear forwards;
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

  100% {
    transform: translateX(0);
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

@keyframes popIn {
  from {
    transform: scale(0);
  }

  to {
    transform: scale(1);
  }
}

.levelup-popup {
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(45deg, #ffd700, #ff6f00);
  color: #fff;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: bold;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
  animation: floatUp 2s forwards;
  z-index: 100;
}

@keyframes floatUp {
  0% {
    opacity: 0;
    transform: translate(-50%, 20px);
  }

  20% {
    opacity: 1;
    transform: translate(-50%, 0);
  }

  80% {
    opacity: 1;
    transform: translate(-50%, -10px);
  }

  100% {
    opacity: 0;
    transform: translate(-50%, -30px);
  }
}
</style>