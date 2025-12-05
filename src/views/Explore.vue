<template>
  <div class="page-container wuxia-explore">
    <div class="landscape-viewport">
      <div
        class="ink-scroll-bg"
        :style="{ backgroundPosition: bgPos + 'px 0' }"
      ></div>

      <div
        class="cloud-overlay"
        :style="{ backgroundPosition: bgPos * 0.5 + 'px 0' }"
      ></div>

      <div class="paper-texture-overlay"></div>

      <div class="hud-top-left">
        <div class="hud-text">
          <span class="seal-icon">地</span> Vị trí: Hắc Phong Sơn
        </div>
        <div class="hud-text sub">Độ cao: {{ altitude }} trượng</div>
      </div>

      <div class="hud-top-right">
        <div class="hud-text">
          Thể Lực
          <span class="energy-val">{{ energyPercent.toFixed(0) }}%</span>
        </div>
        <div class="energy-brush-bar">
          <div class="ink-fill" :style="{ width: energyPercent + '%' }"></div>
        </div>
      </div>

      <div class="center-focus" :class="{ spinning: isMoving }">
        <div class="bagua-ring"></div>
        <div class="bagua-dot"></div>
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
                v-else-if="eventData.type === 'BATTLE'"
                class="fas fa-swords text-red"
              ></i>
              <i v-else class="fas fa-box-open text-blue"></i>
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
              >[{{ new Date().toLocaleTimeString() }}]</span
            >
            {{ log.message }}
          </div>
          <div v-if="recentLogs.length === 0" class="slat-placeholder">
            ...Chưa có tin tức...
          </div>
        </div>
      </div>

      <div class="desk-actions">
        <button
          class="btn-jade-seal"
          @mousedown="startScouting"
          @mouseup="stopScouting"
          @touchstart="startScouting"
          @touchend="stopScouting"
          :class="{ active: isMoving }"
          :disabled="charStore.character?.energy <= 0 || isBusy"
        >
          <div class="jade-inner">
            <span class="kanji-scan" v-if="!isMoving">THÁM</span>
            <span class="kanji-scan" v-else>DÒ...</span>
          </div>
          <div class="tassel"></div>
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
import { useAuthStore } from "../stores/authStore";
import CaptchaModal from "../components/CaptchaModal.vue";

const charStore = useCharacterStore();
const authStore = useAuthStore();
const captchaModal = ref(null);

const bgPos = ref(0);
const isMoving = ref(false);
const isBusy = ref(false);
const eventData = ref(null);
const altitude = ref(150);
let moveInterval = null;

const energyPercent = computed(() =>
  charStore.character
    ? (charStore.character.energy / charStore.character.maxEnergy) * 100
    : 0
);

const recentLogs = computed(() => charStore.logs.slice(0, 5));

const startScouting = () => {
  if (isBusy.value || charStore.character.energy <= 0) return;
  isMoving.value = true;
  eventData.value = null;

  moveInterval = setInterval(() => {
    bgPos.value -= 5;
    altitude.value = 150 + Math.floor(Math.random() * 6 - 3);
  }, 30);

  setTimeout(triggerEvent, 1500);
};

const stopScouting = () => {
  isMoving.value = false;
  if (moveInterval) clearInterval(moveInterval);
};

const triggerEvent = async () => {
  stopScouting();
  isBusy.value = true;

  try {
    const oldLogLen = charStore.logs.length;
    await charStore.explore();

    if (charStore.logs.length > oldLogLen) {
      eventData.value = charStore.logs[0];
      setTimeout(() => {
        eventData.value = null;
      }, 3000);
    }
  } catch (e) {
    if (e.message === "CAPTCHA") captchaModal.value.open();
  } finally {
    setTimeout(() => (isBusy.value = false), 500);
  }
};

onMounted(() => {
  charStore.fetchCharacter();
});
onUnmounted(() => stopScouting());
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Noto+Serif+TC:wght@700&display=swap");

/* --- COLORS & VARS --- */
:root {
  --paper: #e3d5b8;
  --wood: #4e342e;
  --ink: #212121;
  --jade: #43a047;
  --red: #b71c1c;
  --gold: #d4a017;
}

.wuxia-explore {
  background: #1a1a1a;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: "Playfair Display", serif;
  color: var(--wood);
}

/* --- VIEWPORT (TRANH THỦY MẶC) --- */
.landscape-viewport {
  flex: 1;
  position: relative;
  overflow: hidden;
  /* MÀU DỰ PHÒNG NẾU ẢNH LỖI (Màu giấy cũ) */
  background-color: #d7ccc8;
  border-bottom: 4px double var(--wood);
}

.ink-scroll-bg {
  position: absolute;
  inset: 0;
  /* Link ảnh Unsplash ổn định (Núi non thủy mặc) */
  background-image: url("https://images.unsplash.com/photo-1518182170546-0766ce6fec56?q=80&w=2000&auto=format&fit=crop");
  background-size: cover;
  background-position: center;
  filter: sepia(40%) grayscale(20%) contrast(0.9);
  /* Fallback gradient nếu ảnh vẫn lỗi */
  background-color: #d7ccc8;
}

/* Lớp mây mờ */
.cloud-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.6) 0%,
    transparent 60%
  );
  pointer-events: none;
  z-index: 2;
}

/* Lớp vân giấy */
.paper-texture-overlay {
  position: absolute;
  inset: 0;
  opacity: 0.3;
  pointer-events: none;
  z-index: 3;
  /* Tạo vân giấy bằng CSS không cần ảnh */
  background-image: repeating-linear-gradient(
      45deg,
      #000 0,
      #000 1px,
      transparent 0,
      transparent 50%
    ),
    radial-gradient(#000 1%, transparent 1%);
  background-size: 10px 10px, 3px 3px;
}

/* HUD INFO */
.hud-top-left,
.hud-top-right {
  position: absolute;
  top: 20px;
  z-index: 10;
  padding: 10px 15px;
  background: rgba(227, 213, 184, 0.9);
  border: 2px solid var(--wood);
  border-radius: 4px;
  color: var(--wood);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.hud-top-left {
  left: 20px;
}
.hud-top-right {
  right: 20px;
  text-align: right;
}

.hud-text {
  font-weight: bold;
  font-size: 1em;
  display: flex;
  align-items: center;
  gap: 5px;
}
.hud-text.sub {
  font-size: 0.8em;
  color: #5d4037;
  margin-top: 2px;
  font-style: italic;
}
.seal-icon {
  background: var(--red);
  color: #fff;
  padding: 2px 4px;
  font-size: 0.7em;
  border-radius: 2px;
}
.energy-val {
  color: var(--red);
  font-weight: bold;
  margin-left: 5px;
}

.energy-brush-bar {
  width: 120px;
  height: 8px;
  background: #ccc;
  margin-top: 5px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid var(--wood);
}
.ink-fill {
  height: 100%;
  background: var(--wood);
  transition: width 0.3s;
}

/* CENTER FOCUS (BÁT QUÁI) */
.center-focus {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 150px;
  height: 150px;
  pointer-events: none;
  opacity: 0.6;
  z-index: 5;
  transition: opacity 0.3s;
}
.bagua-ring {
  position: absolute;
  inset: 0;
  border: 4px dashed var(--wood);
  border-radius: 50%;
}
.bagua-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 6px;
  height: 6px;
  background: var(--red);
  transform: translate(-50%, -50%);
  border-radius: 50%;
}
.spinning .bagua-ring {
  animation: spin 3s linear infinite;
  border-color: var(--red);
  opacity: 0.8;
}

/* EVENT SCROLL (CUỘN GIẤY) */
.event-scroll {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff8e1;
  padding: 20px 40px;
  border-left: 1px solid #ccc;
  border-right: 1px solid #ccc;
  min-width: 240px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  z-index: 50;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.scroll-rods {
  position: absolute;
  left: 0;
  right: 0;
  height: 12px;
  background: var(--wood);
  border-radius: 6px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
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
  color: var(--gold);
}
.text-red {
  color: var(--red);
}
.text-blue {
  color: #1e88e5;
}
.event-msg {
  font-weight: bold;
  font-family: "Playfair Display";
  color: var(--wood);
  font-size: 1.2em;
}

/* --- CONTROL DESK --- */
.control-desk {
  height: 240px;
  background: var(--wood);
  border-top: 4px solid #3e2723;
  display: flex;
  padding: 20px;
  gap: 20px;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5);
  /* Vân gỗ (CSS Only) */
  background-image: repeating-linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.03) 0,
    rgba(255, 255, 255, 0.03) 2px,
    transparent 2px,
    transparent 8px
  );
}

/* BAMBOO LOGS */
.bamboo-log-area {
  flex: 1;
  background: #6d4c41;
  border: 4px inset #3e2723;
  padding: 5px;
  overflow-y: auto;
}
.bamboo-slats {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.slat-entry {
  background: #d7ccc8;
  padding: 6px 10px;
  font-size: 0.9em;
  border-radius: 2px;
  color: #3e2723;
  font-weight: bold;
  border-bottom: 1px solid #a1887f;
}
.time-stamp {
  color: var(--red);
  margin-right: 5px;
  font-size: 0.8em;
}
.slat-placeholder {
  text-align: center;
  color: #a1887f;
  margin-top: 20px;
  font-style: italic;
}

/* DESK ACTIONS */
.desk-actions {
  flex: 0 0 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

/* JADE SEAL BUTTON */
.btn-jade-seal {
  width: 100px;
  height: 100px;
  border: none;
  background: transparent;
  cursor: pointer;
  position: relative;
  transition: transform 0.2s;
  z-index: 10;
}
.jade-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  /* Giả lập ngọc bích */
  background: radial-gradient(circle at 30% 30%, #81c784, #388e3c);
  border: 4px solid #c8e6c9;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
}
.kanji-scan {
  font-family: "Noto Serif TC", serif;
  font-size: 2em;
  color: #e8f5e9;
  text-shadow: 0 2px 2px rgba(0, 0, 0, 0.3);
}
.tassel {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 40px;
  background: var(--red);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  z-index: -1;
}

.btn-jade-seal:active,
.btn-jade-seal.active {
  transform: scale(0.95);
}
.btn-jade-seal.active .jade-inner {
  background: radial-gradient(circle, #ef5350, #b71c1c); /* Đỏ khi ấn */
  border-color: #ffcdd2;
}

.side-buttons {
  display: flex;
  gap: 10px;
  width: 100%;
}
.btn-wood {
  flex: 1;
  background: #5d4037;
  color: #d7ccc8;
  border: 1px solid #8d6e63;
  padding: 5px;
  font-family: "Playfair Display", serif;
  cursor: pointer;
  box-shadow: 0 2px 0 #3e2723;
}
.btn-wood:active {
  transform: translateY(2px);
  box-shadow: none;
}

/* ANIMATIONS */
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
    transform: translate(-50%, -50%) scaleY(0);
  }
  to {
    height: auto;
    opacity: 1;
    transform: translate(-50%, -50%) scaleY(1);
  }
}

/* SCROLLBAR */
.custom-scroll::-webkit-scrollbar {
  width: 5px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #5d4037;
  border-radius: 2px;
}
</style>
