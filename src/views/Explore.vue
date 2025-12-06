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
<!-- <template>
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
              <img src="@/assets/char/idle_yasou.png" class="avatar-img" />
            </div>
            <div class="label">Bạn</div>
          </div>

          <div class="actor target" v-if="showTarget"
            :style="{ left: (charStore.explorationState.playerPos + (12 * charStore.explorationState.moveDir)) + '%' }">
            <div class="avatar-target" :class="{ 'is-enemy': isEncounter }">
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
              <span v-if="!isMoving">👣 HÀNH TẨU (-2⚡)</span>
              <span v-else>🔍 Đang tìm... ({{ countdown }}s)</span>
            </button>
            <button class="btn-back" @click="$router.push('/village')" :disabled="isMoving">
              🏘️ Về Doanh Trại
            </button>
          </template>
          <div v-else class="encounter-placeholder">Đang tương tác...</div>
        </div>
      </div>

      <div class="log-area custom-scroll">
        <div v-for="(log, i) in logs" :key="i" class="log-item">
          <span class="time">[{{ log.time }}]</span> <span v-html="log.msg"></span>
        </div>
      </div>
    </div>

    <div v-if="isEncounter" class="encounter-modal">
      <div class="modal-content">
        <h3>⚠️ CẢNH BÁO</h3>
        <div class="enemy-preview">
          <img :src="targetImage" class="enemy-img-large" />
          <p>Bạn gặp <strong>{{ targetName }}</strong>!</p>
        </div>
        <div class="actions">
          <button class="btn-flee" @click="flee">🏃 Bỏ Chạy</button>
          <button class="btn-fight" @click="goToBattle">⚔️ CHIẾN ĐẤU</button>
        </div>
      </div>
    </div>

    <CaptchaModal ref="captchaModal" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useCharacterStore } from '@/stores/characterStore';
import { useRouter } from 'vue-router';
import CaptchaModal from "@/components/CaptchaModal.vue";

const charStore = useCharacterStore();
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

// Lấy đúng đường dẫn ảnh quái vật
const enemyPool = [
  { name: "Yêu Tinh", img: new URL('@/assets/enemy/idle_goblin.png', import.meta.url).href },
  { name: "Bộ Xương", img: new URL('@/assets/enemy/idle_skeleton.png', import.meta.url).href },
  { name: "Nấm Độc", img: new URL('@/assets/enemy/idle_mushroom.png', import.meta.url).href }
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
  countdown.value = 2; // Giả lập tìm kiếm 2s
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
      addLog(`<span style="color:#ffd700">${res.message}</span>`);
    } else if (res.type === 'ENEMY') {
      // Kích hoạt Modal gặp quái
      isEncounter.value = true;
      showTarget.value = true;
      const rnd = enemyPool[Math.floor(Math.random() * enemyPool.length)];
      targetName.value = rnd.name;
      targetImage.value = rnd.img;
      addLog(`<span style="color:#ef5350">⚠️ ${res.message}</span>`);
    } else {
      addLog(res.message);
    }
  } catch (e) {
    if (e.message === "CAPTCHA") captchaModal.value.open();
    else addLog("Lỗi: " + e.message);
  }
};

const goToBattle = () => {
  router.push('/battle');
};

const flee = () => {
  isEncounter.value = false;
  showTarget.value = false;
  addLog("Bạn đã bỏ chạy thành công.");
};

onMounted(() => { charStore.fetchCharacter(); });
onUnmounted(() => clearInterval(moveInterval));
</script>

<style scoped>
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
  background-image: url("@/assets/img/forest.png");
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
  width: 64px;
  height: 64px;
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid #fbc02d;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-target {
  border-radius: 12px;
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

/* MODAL STYLES */
.encounter-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: #261815;
  border: 2px solid #b71c1c;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  width: 300px;
  box-shadow: 0 0 20px #b71c1c;
  animation: popIn 0.3s;
}

.enemy-img-large {
  width: 100px;
  height: 100px;
  object-fit: contain;
  margin: 10px auto;
  filter: drop-shadow(0 0 5px red);
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-fight {
  flex: 1;
  background: #c62828;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}

.btn-flee {
  flex: 1;
  background: #5d4037;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

@keyframes popIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style> -->

<!-- new code -->
<template>
  <div class="page-container explore-page">

    <div class="explore-layout">

      <div class="center-zone">

        <div class="game-board">

          <div class="status-header">
            <div class="level-badge">
              <span>Lv.{{ charStore.character?.lv }}</span>
            </div>

            <div class="bars-container">
              <div class="stat-group">
                <div class="stat-row">
                  <span class="stat-icon">❤️</span>
                  <div class="progress-bg">
                    <div class="progress-fill hp" :style="{ width: charStore.hpPercent + '%' }"></div>
                    <span class="stat-text">{{ charStore.character?.hp }}/{{ charStore.character?.maxHp }}</span>
                  </div>
                </div>
                <div class="stat-row">
                  <span class="stat-icon">⚡</span>
                  <div class="progress-bg">
                    <div class="progress-fill energy" :style="{ width: charStore.energyPercent + '%' }"></div>
                    <span class="stat-text">{{ charStore.character?.energy }}/{{ charStore.character?.maxEnergy
                      }}</span>
                  </div>
                </div>
              </div>

              <div class="exp-row">
                <div class="exp-bg">
                  <div class="exp-fill" :style="{ width: charStore.xpPercent + '%' }"></div>
                </div>
                <span class="exp-text">{{ charStore.xpPercent.toFixed(1) }}%</span>
              </div>
            </div>
          </div>

          <div class="stage-viewport">
            <div class="stage-background">

              <div class="actor player"
                :style="{ left: charStore.explorationState.playerPos + '%', transform: `scaleX(${charStore.explorationState.moveDir})` }">
                <div class="avatar-circle" :class="{ 'moving': isMoving }">
                  <img :src="imgPlayer" class="avatar-img" />
                </div>
                <div class="actor-label">Bạn</div>
              </div>

              <div class="actor target" v-if="showTarget"
                :style="{ left: (charStore.explorationState.playerPos + (15 * charStore.explorationState.moveDir)) + '%' }">
                <div class="avatar-target" :class="{ 'is-enemy': isEncounter }">
                  <img v-if="targetImage" :src="targetImage" class="avatar-img" />
                  <div v-else class="text-3xl">🎁</div>
                </div>
                <div class="actor-label target-name">{{ targetName }}</div>
              </div>
            </div>
          </div>

          <div class="action-panel">
            <template v-if="!isEncounter">
              <button class="btn-action main-btn" @click="startExploration"
                :disabled="isMoving || charStore.character?.energy < 2">
                <div class="btn-content">
                  <i class="fas fa-walking"></i>
                  <span v-if="!isMoving">HÀNH TẨU (-2⚡)</span>
                  <span v-else>ĐANG TÌM... ({{ countdown }}s)</span>
                </div>
              </button>

              <button class="btn-action sub-btn" @click="$router.push('/village')" :disabled="isMoving">
                <div class="btn-content">
                  <i class="fas fa-home"></i>
                  <span>VỀ TRẠI</span>
                </div>
              </button>
            </template>

            <div v-else class="encounter-msg">
              ⚠️ Đang tương tác...
            </div>
          </div>
        </div>

        <div class="chat-board">
          <ChatPanel />
        </div>

      </div>

      <div class="right-zone">
        <div class="log-panel">
          <div class="log-header">
            <i class="fas fa-scroll"></i> NHẬT KÝ
          </div>
          <div class="log-content custom-scroll">
            <div v-if="logs.length === 0" class="empty-log">Chưa có sự kiện...</div>
            <div v-for="(log, index) in logs" :key="index" class="log-line">
              <span class="log-time">[{{ log.time }}]</span>
              <span class="log-msg" v-html="log.msg"></span>
            </div>
          </div>
        </div>
      </div>

    </div>

    <div v-if="isEncounter" class="encounter-modal">
      <div class="modal-card">
        <div class="modal-header">⚠️ CẢNH BÁO</div>
        <div class="modal-body">
          <div class="preview-box">
            <img :src="targetImage" class="enemy-preview-img" />
          </div>
          <p>Gặp <strong>{{ targetName }}</strong>!</p>
        </div>
        <div class="modal-footer">
          <button class="modal-btn flee" @click="flee">🏃 Bỏ Chạy</button>
          <button class="modal-btn fight" @click="goToBattle">⚔️ CHIẾN ĐẤU</button>
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
import ChatPanel from "@/components/ChatPanel.vue";

// === IMPORT HÌNH ẢNH TRỰC TIẾP ===
import imgGoblin from '@/assets/enemy/idle_goblin.png';
import imgSkeleton from '@/assets/enemy/idle_skeleton.png';
import imgMushroom from '@/assets/enemy/idle_mushroom.png';
import imgGold from '@/assets/resources/r_gold_coin.png';
import imgYasuo from '@/assets/char/idle_yasou.png';

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
// Dùng ảnh từ authStore hoặc ảnh mặc định import ở trên
const imgPlayer = authStore.user?.avatarUrl || imgYasuo;

let moveInterval = null;

const enemyPool = [
  { name: "Yêu Tinh", img: imgGoblin },
  { name: "Bộ Xương", img: imgSkeleton },
  { name: "Nấm Độc", img: imgMushroom }
];

const getTime = () => new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

const addLog = (msg) => {
  logs.value.unshift({ time: getTime(), msg });
  if (logs.value.length > 50) logs.value.pop();
};

const startMovingJS = () => {
  if (moveInterval) clearInterval(moveInterval);
  moveInterval = setInterval(() => {
    charStore.explorationState.playerPos += 0.5 * charStore.explorationState.moveDir;
    if (charStore.explorationState.playerPos >= 80) charStore.explorationState.moveDir = -1;
    else if (charStore.explorationState.playerPos <= 10) charStore.explorationState.moveDir = 1;
  }, 16);
};

const startExploration = () => {
  if (isMoving.value) return;
  isMoving.value = true;
  showTarget.value = false;
  isEncounter.value = false;
  countdown.value = 2;

  startMovingJS();
  addLog("Bắt đầu hành tẩu...");

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
      targetName.value = "Túi Vàng";
      targetImage.value = imgGold;
      addLog(`<span style="color:#ffd700; font-weight:bold;">${res.message}</span>`);
    } else if (res.type === 'ENEMY') {
      isEncounter.value = true;
      showTarget.value = true;
      const rnd = enemyPool[Math.floor(Math.random() * enemyPool.length)];
      targetName.value = rnd.name;
      targetImage.value = rnd.img;
      addLog(`<span style="color:#ef5350; font-weight:bold;">⚠️ ${res.message}</span>`);
    } else {
      addLog(`<span style="color:#aaa;">${res.message}</span>`);
    }
  } catch (e) {
    const msg = e.message || e;
    if (msg === "CAPTCHA" || msg === "CAPTCHA_REQUIRED") captchaModal.value.open();
    else addLog(`<span style="color:red">Lỗi: ${msg}</span>`);
  }
};

const goToBattle = () => router.push('/battle');
const flee = () => {
  isEncounter.value = false;
  showTarget.value = false;
  addLog("<span style='color:#a5d6a7'>Đã chạy thoát.</span>");
};

onMounted(() => { charStore.fetchCharacter(); });
onUnmounted(() => { clearInterval(moveInterval); });
</script>

<style scoped>
.explore-page {
  padding: 10px;
  height: 100vh;
  box-sizing: border-box;
  overflow: hidden;
  color: #eee;
  font-family: "Noto Serif TC", serif;
}

.explore-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 15px;
  height: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

/* --- CỘT TRÁI --- */
.center-zone {
  display: flex;
  flex-direction: column;
  gap: 15px;
  height: 100%;
  overflow: hidden;
}

/* 1. KHUNG GAME */
.game-board {
  flex: 1;
  min-height: 300px;
  background: #261815;
  border: 2px solid #5d4037;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  position: relative;
}

.status-header {
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.4);
  border-bottom: 1px solid #5d4037;
  display: flex;
  align-items: center;
  gap: 12px;
}

.level-badge {
  background: linear-gradient(135deg, #ffd700, #f57f17);
  color: #000;
  font-weight: 900;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85em;
  white-space: nowrap;
}

.bars-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-group {
  display: flex;
  gap: 10px;
}

.stat-row {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 5px;
}

.stat-icon {
  font-size: 1em;
}

.progress-bg {
  flex: 1;
  height: 14px;
  background: #000;
  border: 1px solid #444;
  border-radius: 2px;
  position: relative;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.progress-fill.hp {
  background: linear-gradient(to right, #c62828, #e53935);
}

.progress-fill.energy {
  background: linear-gradient(to right, #1565c0, #42a5f5);
}

.stat-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.65em;
  font-weight: bold;
  text-shadow: 1px 1px 0 #000;
}

.exp-row {
  position: relative;
  width: 100%;
  margin-top: 2px;
}

.exp-bg {
  height: 3px;
  background: #333;
}

.exp-fill {
  height: 100%;
  background: #00e676;
}

.exp-text {
  position: absolute;
  right: 0;
  top: -12px;
  font-size: 0.6em;
  color: #00e676;
}

/* STAGE - MÀN HÌNH CHÍNH */
.stage-viewport {
  flex: 1;
  min-height: 0;
  margin: 5px;
  border: 2px solid #3e2723;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}

.stage-background {
  width: 100%;
  height: 100%;
  background-image: url("@/assets/img/forest.png");
  background-size: cover;
  background-position: center bottom;
  position: relative;
}

/* --- CHỈNH SỬA KÍCH THƯỚC VÀ VIỀN --- */
.actor {
  position: absolute;
  bottom: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 140px;
  /* Tăng chiều rộng container */
  transition: left 0.1s linear;
  z-index: 10;
}

.avatar-circle,
.avatar-target {
  width: 96px;
  /* Tăng kích thước cực đại */
  height: 96px;
  /* Tăng kích thước cực đại */
  /* XÓA BỎ VIỀN VÀNG */
  border: none;
  background: transparent;
  /* Xóa nền tối luôn nếu muốn trong suốt */

  /* Giữ bo tròn hoặc bỏ tùy bạn, ở đây giữ bo tròn để ảnh không bị vuông vức quá */
  /* border-radius: 50%; */

  display: flex;
  justify-content: center;
  align-items: center;

  /* Hiệu ứng bóng đổ nhẹ để tách biệt khỏi nền (tùy chọn) */
  filter: drop-shadow(0 5px 5px rgba(0, 0, 0, 0.5));
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  /* Đảm bảo ảnh không bị cắt */
  transform: scale(1.2);
  /* Phóng to ảnh bên trong lên thêm chút nữa */
}

.actor-label {
  margin-top: 0px;
  /* Kéo tên sát lên */
  background: rgba(0, 0, 0, 0.6);
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.9em;
  color: #fff;
  border: none;
  white-space: nowrap;
  font-weight: bold;
  z-index: 12;
}

.target-name {
  color: #ffeb3b;
}

.moving {
  animation: bounce 0.4s infinite alternate;
}

@keyframes bounce {
  from {
    transform: translateY(0);
  }

  to {
    transform: translateY(-8px);
  }
}

/* BUTTONS */
.action-panel {
  height: 60px;
  background: #1a100e;
  border-top: 2px solid #5d4037;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  padding: 0 15px;
}

.btn-action {
  border: none;
  border-radius: 6px;
  cursor: pointer;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Noto Serif TC";
  font-weight: bold;
  font-size: 0.9em;
  transition: 0.2s;
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.5);
}

.btn-action:active {
  transform: translateY(2px);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.5);
}

.btn-action:disabled {
  background: #444;
  border: 1px solid #333;
  color: #888;
  cursor: not-allowed;
}

.main-btn {
  flex: 2;
  background: linear-gradient(to bottom, #2e7d32, #1b5e20);
  border: 1px solid #43a047;
  color: #fff;
}

.sub-btn {
  flex: 1;
  background: #3e2723;
  border: 1px solid #5d4037;
  color: #d7ccc8;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 2. KHUNG CHAT */
.chat-board {
  height: 350px;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid #5d4037;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

/* --- CỘT PHẢI: LOG --- */
.right-zone {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

.log-panel {
  flex: 1;
  background: #1e1e1e;
  border: 2px solid #5d4037;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.log-header {
  height: 36px;
  background: #3e2723;
  border-bottom: 1px solid #5d4037;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #ffd700;
  gap: 6px;
  font-size: 0.9em;
}

.log-content {
  flex: 1;
  padding: 8px;
  overflow-y: auto;
  font-size: 0.85em;
  line-height: 1.4;
  background: #111;
}

.log-line {
  margin-bottom: 5px;
  padding-bottom: 3px;
  border-bottom: 1px dashed #333;
}

.log-time {
  color: #757575;
  font-size: 0.85em;
  margin-right: 4px;
}

.empty-log {
  text-align: center;
  color: #666;
  font-style: italic;
  margin-top: 20px;
  font-size: 0.85em;
}

/* MODAL */
.encounter-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-card {
  width: 350px;
  background: #261815;
  border: 2px solid #b71c1c;
  border-radius: 12px;
  box-shadow: 0 0 30px rgba(183, 28, 28, 0.5);
  overflow: hidden;
  animation: zoomIn 0.2s;
}

.modal-header {
  background: #b71c1c;
  color: #fff;
  padding: 10px;
  text-align: center;
  font-weight: bold;
  font-size: 1.1em;
}

.modal-body {
  padding: 20px 15px;
  text-align: center;
  color: #eee;
}

/* PREVIEW BOX TRONG MODAL */
.preview-box {
  width: 160px;
  height: 160px;
  margin: 0 auto 15px;
  /* Xóa viền nếu muốn sạch sẽ */
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}

.enemy-preview-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 0 10px rgba(255, 0, 0, 0.5));
}

.modal-footer {
  padding: 15px;
  background: #1a100e;
  display: flex;
  gap: 15px;
}

.modal-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  font-size: 1em;
}

.modal-btn.flee {
  background: #555;
  color: #ccc;
}

.modal-btn.fight {
  background: #d32f2f;
  color: #fff;
  animation: pulse 1.5s infinite;
}

@keyframes zoomIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.02);
  }

  100% {
    transform: scale(1);
  }
}

@media (max-width: 900px) {
  .explore-page {
    padding: 5px;
    height: auto;
    min-height: 100vh;
    overflow-y: auto;
  }

  .explore-layout {
    grid-template-columns: 1fr;
    gap: 10px;
    height: auto;
  }

  .center-zone {
    height: auto;
  }

  .game-board {
    height: 350px;
  }

  .chat-board {
    height: 300px;
  }

  .right-zone {
    height: 200px;
  }
}
</style>