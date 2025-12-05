<!-- <template>
  <div class="page-container wuxia-explore">
    <div class="landscape-viewport">
      <div
        class="ink-scroll-bg"
        :style="{ backgroundPosition: bgPos + 'px 0' }"
      ></div>

      <div class="paper-texture-overlay"></div>

      <div class="hud-top-left">
        <div class="hud-text">
          <span class="seal-icon">地</span> Vị trí: Hắc Phong Sơn
        </div>
      </div>

      <div class="hud-top-right">
        <div class="hud-text">
          Thân Thể:
          <span class="energy-val"
            >{{ charStore.character?.hp }}/{{
              charStore.character?.maxHp
            }}</span
          >
        </div>
        <div class="hud-text">
          Thể Lực:
          <span class="energy-val">{{ charStore.character?.energy }}</span>
        </div>
      </div>

      <div class="center-focus" :class="{ spinning: isMoving }">
        <div class="bagua-ring"></div>
      </div>

      <transition name="scroll-unroll">
        <div v-if="eventData" class="event-scroll" :class="eventData.type">
          <div class="scroll-rods top"></div>
          <div class="scroll-content">
            <div class="event-icon">
              <i
                v-if="eventData.type === 'GOLD'"
                class="fas fa-coins text-gold"
              ></i>
              <i
                v-else-if="eventData.type === 'ENEMY'"
                class="fas fa-skull text-red"
              ></i>
              <i v-else class="fas fa-wind"></i>
            </div>
            <div class="event-msg">{{ eventData.message }}</div>
          </div>
          <div class="scroll-rods bot"></div>
        </div>
      </transition>
    </div>

    <div class="control-desk">
      <div class="bamboo-log-area custom-scroll">
        <div class="bamboo-slats">
          <div v-for="(log, i) in recentLogs" :key="i" class="slat-entry">
            <span class="time-stamp"
              >[{{ new Date(log.id).toLocaleTimeString() }}]</span
            >
            <span :class="log.type">{{ log.message }}</span>
          </div>
        </div>
      </div>

      <div class="desk-actions">
        <button
          class="btn-jade-seal"
          @click="handleExplore"
          :class="{ active: isMoving }"
          :disabled="charStore.character?.energy <= 0 || isBusy"
        >
          <div class="jade-inner">
            <span class="kanji-scan" v-if="!isMoving">THÁM</span>
            <span class="kanji-scan" v-else>ĐANG ĐI</span>
          </div>
        </button>

        <div class="side-buttons">
          <button class="btn-wood" @click="$router.push('/village')">
            TRẠI
          </button>
          <button class="btn-wood" @click="$router.push('/inventory')">
            TÚI
          </button>
        </div>
      </div>
    </div>

    <CaptchaModal ref="captchaModal" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useCharacterStore } from "../stores/characterStore";
import { useRouter } from "vue-router";
import CaptchaModal from "../components/CaptchaModal.vue";

const charStore = useCharacterStore();
const router = useRouter();
const captchaModal = ref(null);

const bgPos = ref(0);
const isMoving = ref(false);
const isBusy = ref(false);
const eventData = ref(null);
let moveInterval = null;

const recentLogs = computed(() => charStore.logs.slice(0, 10));

const handleExplore = async () => {
  if (isBusy.value) return;
  isBusy.value = true;
  isMoving.value = true;
  eventData.value = null;

  // Hiệu ứng chạy nền
  moveInterval = setInterval(() => {
    bgPos.value -= 5;
  }, 30);

  try {
    const oldLogLen = charStore.logs.length;
    await charStore.explore();

    // Dừng chạy sau 1.5s
    setTimeout(() => {
      clearInterval(moveInterval);
      isMoving.value = false;

      if (charStore.logs.length > oldLogLen) {
        const latest = charStore.logs[0];
        eventData.value = latest;

        // Nếu gặp quái -> Chuyển cảnh Battle
        if (latest.type === "ENEMY") {
          setTimeout(() => router.push("/battle"), 1500);
        }
      }
      isBusy.value = false;
    }, 1500);
  } catch (e) {
    clearInterval(moveInterval);
    isMoving.value = false;
    isBusy.value = false;
    if (e.message === "CAPTCHA") captchaModal.value.open();
  }
};

onMounted(() => charStore.fetchCharacter());
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Noto+Serif+TC:wght@700&display=swap");

.wuxia-explore {
  background: #1a1a1a;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: "Playfair Display", serif;
  color: #4e342e;
}

.landscape-viewport {
  flex: 1;
  position: relative;
  overflow: hidden;
  background-color: #d7ccc8;
  border-bottom: 4px double #4e342e;
  /* Hình nền thủy mặc */
  background-image: url("https://images.unsplash.com/photo-1518182170546-0766ce6fec56?q=80&w=2000&auto=format&fit=crop");
  background-size: cover;
  background-position: center;
}

.ink-scroll-bg {
  position: absolute;
  inset: 0;
  background: inherit;
  filter: sepia(0.5) grayscale(0.5);
}
.paper-texture-overlay {
  position: absolute;
  inset: 0;
  background-image: url("https://www.transparenttextures.com/patterns/aged-paper.png");
  opacity: 0.4;
  pointer-events: none;
}

/* HUD */
.hud-top-left,
.hud-top-right {
  position: absolute;
  top: 20px;
  padding: 10px 15px;
  background: rgba(253, 245, 230, 0.9);
  border: 2px solid #4e342e;
  border-radius: 4px;
  font-weight: bold;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}
.hud-top-left {
  left: 20px;
}
.hud-top-right {
  right: 20px;
  text-align: right;
}
.seal-icon {
  background: #b71c1c;
  color: white;
  padding: 2px 5px;
  border-radius: 2px;
  margin-right: 5px;
}
.energy-val {
  color: #b71c1c;
  font-weight: 900;
}

/* Center Ring */
.center-focus {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.6;
}
.bagua-ring {
  width: 120px;
  height: 120px;
  border: 4px dashed #4e342e;
  border-radius: 50%;
}
.spinning .bagua-ring {
  animation: spin 3s linear infinite;
  border-color: #b71c1c;
  opacity: 0.9;
}

/* Event Scroll */
.event-scroll {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff8e1;
  padding: 20px 40px;
  border-left: 2px solid #8d6e63;
  border-right: 2px solid #8d6e63;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  z-index: 50;
}
.scroll-rods {
  position: absolute;
  left: -5px;
  right: -5px;
  height: 12px;
  background: #4e342e;
  border-radius: 6px;
}
.scroll-rods.top {
  top: -6px;
}
.scroll-rods.bot {
  bottom: -6px;
}
.event-icon {
  font-size: 2.5em;
  margin-bottom: 10px;
}
.text-gold {
  color: #f9a825;
}
.text-red {
  color: #b71c1c;
}

/* Control Desk */
.control-desk {
  height: 260px;
  background: #4e342e;
  border-top: 4px solid #3e2723;
  display: flex;
  padding: 20px;
  gap: 20px;
  box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.7);
  background-image: url("https://www.transparenttextures.com/patterns/wood-pattern.png");
}
.bamboo-log-area {
  flex: 1;
  background: #3e2723;
  border: 4px inset #271c19;
  padding: 5px;
  overflow-y: auto;
}
.slat-entry {
  background: #d7ccc8;
  padding: 8px;
  font-size: 0.95em;
  margin-bottom: 2px;
  border-bottom: 1px solid #a1887f;
  font-weight: bold;
}
.ENEMY {
  color: #c62828;
}
.GOLD {
  color: #f9a825;
}
.LEVEL_UP {
  color: #2e7d32;
}

.desk-actions {
  width: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}
.btn-jade-seal {
  width: 100px;
  height: 100px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: transform 0.2s;
}
.jade-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #66bb6a, #2e7d32);
  border: 4px solid #a5d6a7;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
}
.kanji-scan {
  font-family: "Noto Serif TC";
  font-size: 1.8em;
  color: #e8f5e9;
  text-shadow: 0 2px 2px rgba(0, 0, 0, 0.5);
  font-weight: 900;
}
.btn-jade-seal:active {
  transform: scale(0.95);
}

.side-buttons {
  display: flex;
  gap: 10px;
  width: 100%;
}
.btn-wood {
  flex: 1;
  background: #6d4c41;
  color: #efebe9;
  border: 2px solid #8d6e63;
  padding: 5px;
  font-family: "Playfair Display";
  font-weight: bold;
  cursor: pointer;
}
.btn-wood:hover {
  background: #8d6e63;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}
.scroll-unroll-enter-active {
  animation: unroll 0.5s ease-out;
}
@keyframes unroll {
  from {
    height: 0;
    opacity: 0;
  }
  to {
    height: auto;
    opacity: 1;
  }
}
</style> -->

<!-- ========================================================= -->

<!-- code test -->
<template>
  <div class="page-container explore-page">
    <div class="status-bar-container">
      <div class="status-bar">
        <div class="level-badge">Lv.{{ charStore.character?.lv }}</div>
        <div class="stat-item">❤️ {{ charStore.character?.hp }}/{{ charStore.character?.maxHp }}</div>
        <div class="stat-item">⚡ {{ charStore.character?.energy }}/{{ charStore.character?.maxEnergy }}</div>
      </div>
      <div class="exp-bar-wrapper">
        <div class="exp-bar" :style="{ width: charStore.xpPercent + '%' }"></div>
      </div>
    </div>

    <div class="game-layout">
      <div class="stage-area">
        <div class="stage-background">
          <div class="actor player"
            :style="{ left: charStore.explorationState.playerPos + '%', transform: `scaleX(${charStore.explorationState.moveDir})` }">
            <div class="avatar-circle" :class="{ 'bounce': isMoving }">
              <img :src="authStore.user?.avatarUrl || 'https://cdn-icons-png.flaticon.com/512/9408/9408175.png'"
                class="avatar-img" />
            </div>
            <div class="label">Bạn</div>
          </div>

          <div class="actor target" v-if="showTarget"
            :style="{ left: (charStore.explorationState.playerPos + (10 * charStore.explorationState.moveDir)) + '%' }">
            <div class="avatar-target">
              <img v-if="targetImage" :src="targetImage" class="avatar-img" />
              <div v-else class="text-3xl">🎁</div>
            </div>
            <div class="label">{{ targetName }}</div>
          </div>
        </div>

        <div class="controls">
          <template v-if="!isEncounter">
            <button class="btn-explore" @click="startExploration"
              :disabled="isMoving || charStore.character?.energy < 2">
              <span v-if="!isMoving">👣 ĐI TIẾP (-2⚡)</span>
              <span v-else>🔍 Đang tìm... ({{ countdown }}s)</span>
            </button>
            <button class="btn-back" @click="$router.push('/village')" :disabled="isMoving">
              🏘️ Về Làng
            </button>
          </template>
          <template v-else>
            <button class="btn-fight" @click="$router.push('/battle')">⚔️ CHIẾN ĐẤU</button>
          </template>
        </div>
      </div>

      <div class="log-area custom-scroll">
        <div v-for="(log, i) in logs" :key="i" class="log-item">
          <span class="time">[{{ log.time }}]</span> <span v-html="log.msg"></span>
        </div>
      </div>
    </div>
    <CaptchaModal ref="captchaModal" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useCharacterStore } from '@/stores/characterStore';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';
import CaptchaModal from "@/components/CaptchaModal.vue";

const charStore = useCharacterStore();
const authStore = useAuthStore();
const router = useRouter();
const captchaModal = ref(null);

const isMoving = ref(false);
const isEncounter = ref(false);
const showTarget = ref(false);
const countdown = ref(0);
const logs = ref([]);
const targetImage = ref('');
const targetName = ref('');
let moveInterval = null;

const enemyPool = [
  { name: "Yêu Tinh", img: "/src/assets/enemy/idle_goblin.png" },
  { name: "Bộ Xương", img: "/src/assets/enemy/idle_skeleton.png" },
  { name: "Nấm Độc", img: "/src/assets/enemy/idle_mushroom.png" }
];

const addLog = (msg) => logs.value.unshift({ time: new Date().toLocaleTimeString(), msg });

const startMoving = () => {
  if (moveInterval) clearInterval(moveInterval);
  moveInterval = setInterval(() => {
    charStore.explorationState.playerPos += 0.5 * charStore.explorationState.moveDir;
    if (charStore.explorationState.playerPos >= 85) charStore.explorationState.moveDir = -1;
    else if (charStore.explorationState.playerPos <= 5) charStore.explorationState.moveDir = 1;
  }, 16);
};

const startExploration = () => {
  if (isMoving.value) return;
  isMoving.value = true;
  showTarget.value = false;
  isEncounter.value = false;
  countdown.value = 2;
  startMoving();
  addLog("Đang thám thính...");

  const timer = setInterval(async () => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
      await handleResult();
    }
  }, 1000);
};

const handleResult = async () => {
  clearInterval(moveInterval);
  isMoving.value = false;
  try {
    const res = await charStore.explore();
    if (res.type === 'GOLD') {
      showTarget.value = true;
      targetName.value = "Vàng";
      targetImage.value = "https://cdn-icons-png.flaticon.com/512/2535/2535079.png";
      addLog(`<span style="color:gold">${res.message}</span>`);
    } else if (res.type === 'ENEMY') {
      isEncounter.value = true;
      showTarget.value = true;
      const rnd = enemyPool[Math.floor(Math.random() * enemyPool.length)];
      targetName.value = rnd.name;
      targetImage.value = rnd.img;
      addLog(`<span style="color:red">${res.message}</span>`);
    } else {
      addLog(res.message);
    }
  } catch (e) {
    const msg = typeof e === 'string' ? e : (e.message || "Lỗi không xác định");
    if (msg === "CAPTCHA" || msg === "CAPTCHA_REQUIRED") captchaModal.value.open();
    else addLog("Lỗi: " + msg);
  }
};

onMounted(() => { charStore.fetchCharacter(); authStore.fetchProfile(); });
onUnmounted(() => clearInterval(moveInterval));
</script>

<style scoped>
/* CSS GIỮ NGUYÊN */
.explore-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  color: #eee;
  font-family: "Noto Serif TC";
}

.status-bar-container {
  background: #3e2723;
  padding: 10px;
  border-radius: 8px;
  border: 2px solid #5d4037;
  margin-bottom: 20px;
}

.status-bar {
  display: flex;
  gap: 15px;
  justify-content: center;
  font-weight: bold;
}

.level-badge {
  background: #fbc02d;
  color: #000;
  padding: 2px 8px;
  border-radius: 4px;
}

.exp-bar-wrapper {
  height: 5px;
  background: #000;
  margin-top: 8px;
  border-radius: 2px;
  overflow: hidden;
}

.exp-bar {
  height: 100%;
  background: #fbc02d;
  transition: width 0.3s;
}

.game-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 15px;
  height: 400px;
}

.stage-background {
  background: #261815;
  border: 2px solid #5d4037;
  flex: 1;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background-image: url("https://images.unsplash.com/photo-1518182170546-0766ce6fec56?q=80&w=2000");
  background-size: cover;
}

.stage-area {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
}

.actor {
  position: absolute;
  bottom: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80px;
  transition: 0.1s;
}

.avatar-circle,
.avatar-target {
  width: 60px;
  height: 60px;
  background: #000;
  border: 2px solid #fbc02d;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-target {
  border-radius: 10px;
  border-color: #b71c1c;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bounce {
  animation: bounce 0.4s infinite alternate;
}

@keyframes bounce {
  from {
    transform: translateY(0);
  }

  to {
    transform: translateY(-5px);
  }
}

.controls {
  display: flex;
  gap: 10px;
  height: 50px;
}

.btn-explore {
  flex: 2;
  background: #2e7d32;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

.btn-explore:disabled {
  background: #555;
  cursor: not-allowed;
}

.btn-back {
  flex: 1;
  background: #4e342e;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.btn-fight {
  width: 100%;
  background: #c62828;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1.2em;
  cursor: pointer;
  animation: pulse 1s infinite;
}

.btn-ignore {
  flex: 1;
  background: #f9a825;
  color: #000;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

.log-area {
  background: #261815;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #5d4037;
  overflow-y: auto;
}

.log-item {
  border-bottom: 1px dashed #5d4037;
  padding: 4px 0;
  font-size: 0.9em;
}

.time {
  color: #a1887f;
  margin-right: 5px;
  font-size: 0.8em;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }

  100% {
    transform: scale(1);
  }
}
</style>