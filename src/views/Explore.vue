<template>
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
</style>
