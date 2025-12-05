<template>
  <div class="page-container ancient-hub">
    <div class="world-layer" :class="{ moving: isMoving }">
      <div class="game-view-wrapper">
        <ExploreView />
      </div>

      <div class="parallax-bg bg-far"></div>
      <div class="parallax-bg bg-near"></div>

      <transition name="fade-up">
        <div v-if="currentEvent" class="event-notification">
          <div class="event-seal">
            <i
              v-if="currentEvent.type === 'enemy'"
              class="fas fa-dragon text-danger"
            ></i>
            <i
              v-if="currentEvent.type === 'loot'"
              class="fas fa-gem text-gold"
            ></i>
          </div>
          <span class="event-msg">{{ currentEvent.message }}</span>
        </div>
      </transition>
    </div>

    <div class="ui-overlay">
      <div class="wood-panel left-panel" :class="{ minimized: isLeftMin }">
        <div class="scroll-rod top"></div>

        <div class="panel-header" @click="isLeftMin = !isLeftMin">
          <div class="header-title">
            <span class="ornament">❖</span> THIÊN THƯ
          </div>
          <button class="btn-toggle">
            <i
              :class="isLeftMin ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"
            ></i>
          </button>
        </div>

        <div class="panel-content-wrap">
          <div class="ancient-tabs">
            <button
              :class="{ active: activeTab === 'log' }"
              @click="activeTab = 'log'"
            >
              <i class="fas fa-scroll"></i> NHẬT KÝ
            </button>
            <button
              :class="{ active: activeTab === 'chat' }"
              @click="activeTab = 'chat'"
            >
              <i class="fas fa-comments"></i> TRUYỀN ÂM
            </button>
            <button
              :class="{ active: activeTab === 'stats' }"
              @click="activeTab = 'stats'"
            >
              <i class="fas fa-yin-yang"></i> BẢN THÂN
            </button>
          </div>

          <div class="ancient-body paper-texture">
            <transition name="fade">
              <div
                v-show="activeTab === 'log'"
                class="log-scroll custom-scroll"
              >
                <div
                  v-for="log in charStore.logs"
                  :key="log.id"
                  class="ink-line"
                  :class="log.type"
                >
                  <span class="ink-time"
                    >[{{
                      new Date(log.id).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    }}]</span
                  >
                  <span class="ink-msg" v-html="log.message"></span>
                </div>
                <div
                  v-for="(travelLog, idx) in adventureLogs"
                  :key="'adv' + idx"
                  class="ink-line adventure"
                >
                  <span class="ink-time">[Hành Tẩu]</span> {{ travelLog }}
                </div>
                <div
                  v-if="
                    charStore.logs.length === 0 && adventureLogs.length === 0
                  "
                  class="empty-ink"
                >
                  _Chưa có ghi chép_
                </div>
              </div>
            </transition>

            <transition name="fade">
              <div v-show="activeTab === 'chat'" class="inner-module">
                <ChatPanel />
              </div>
            </transition>

            <transition name="fade">
              <div v-show="activeTab === 'stats'" class="stats-module">
                <div class="talisman-grid">
                  <div class="talisman red">
                    <div class="symbol">CÔNG</div>
                    <div class="val">{{ charStore.character?.atk }}</div>
                  </div>
                  <div class="talisman blue">
                    <div class="symbol">THỦ</div>
                    <div class="val">{{ charStore.character?.def }}</div>
                  </div>
                  <div class="talisman green">
                    <div class="symbol">TỐC</div>
                    <div class="val">{{ charStore.character?.speed }}</div>
                  </div>
                  <div class="talisman purple">
                    <div class="symbol">BẠO</div>
                    <div class="val">{{ charStore.character?.critRate }}%</div>
                  </div>
                </div>

                <div class="action-dock">
                  <router-link to="/battle" class="btn-wood">
                    <i class="fas fa-swords"></i> CHIẾN ĐẤU
                  </router-link>
                  <router-link to="/market" class="btn-wood">
                    <i class="fas fa-store"></i> THƯƠNG HỘI
                  </router-link>
                </div>
              </div>
            </transition>
          </div>
        </div>

        <div class="scroll-rod bot"></div>
      </div>

      <div class="wood-panel right-panel" :class="{ minimized: isRightMin }">
        <div class="scroll-rod top"></div>

        <div class="panel-header" @click="isRightMin = !isRightMin">
          <div class="header-left">
            <i class="fas fa-scroll"></i> BẢNG CÁO THỊ
          </div>
          <button class="btn-toggle">
            <i
              :class="isRightMin ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"
            ></i>
          </button>
        </div>

        <div class="panel-content-wrap">
          <div class="quest-paper custom-scroll">
            <QuestPanel />
          </div>
        </div>

        <div class="scroll-rod bot"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useCharacterStore } from "../stores/characterStore";
import ExploreView from "./Explore.vue";
import ChatPanel from "../components/ChatPanel.vue";
import QuestPanel from "../components/QuestPanel.vue";

const charStore = useCharacterStore();
const activeTab = ref("log");
const isLeftMin = ref(false);
const isRightMin = ref(false);

// --- Logic Hành Tẩu ---
// Note: Hiện tại nút bấm đã xóa, bạn có thể gọi hàm này bằng cách khác (VD: sự kiện phím Space)
const isMoving = ref(false);
const currentEvent = ref(null);
const adventureLogs = ref([]);

const handleMoveForward = () => {
  if (isMoving.value) return;

  isMoving.value = true;
  currentEvent.value = null;

  // Giả lập thời gian đi 2 giây
  setTimeout(() => {
    triggerRandomEvent();
    isMoving.value = false;
  }, 2000);
};

const triggerRandomEvent = () => {
  const roll = Math.random();
  if (roll > 0.7) {
    currentEvent.value = { type: "enemy", message: "SÁT THỦ XUẤT HIỆN!" };
    adventureLogs.value.unshift(
      "Ngươi cảm thấy sát khí, một tên thích khách lao ra!"
    );
  } else if (roll > 0.4) {
    currentEvent.value = { type: "loot", message: "NHẶT ĐƯỢC BÍ KÍP" };
    adventureLogs.value.unshift("Ngươi tìm thấy một cuốn bí kíp thất truyền.");
  } else {
    adventureLogs.value.unshift("Đường đi yên bình, gió thổi vi vu.");
  }
};

onMounted(() => {
  charStore.fetchCharacter();
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Cinzel:wght@400;700&display=swap");

/* --- CẤU TRÚC CHUNG --- */
.ancient-hub {
  height: 100vh;
  position: relative;
  background: #1a1510;
  overflow: hidden;
  font-family: "Playfair Display", serif;
  color: #3e2723;
}

/* --- LỚP THẾ GIỚI (WORLD LAYER) --- */
.world-layer {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: #e0f7fa;
  overflow: hidden;
}

.game-view-wrapper {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* Hiệu ứng Parallax */
.parallax-bg {
  position: absolute;
  width: 200%;
  height: 100%;
  background-repeat: repeat-x;
  background-position: bottom left;
  pointer-events: none;
  z-index: 2;
  opacity: 0.6;
}

.bg-far {
  bottom: 100px;
  background-image: url("https://www.transparenttextures.com/patterns/black-scales.png");
  filter: invert(1) opacity(0.3);
}

.moving .bg-far {
  animation: slideBg 60s linear infinite;
}
.moving .bg-near {
  animation: slideBg 10s linear infinite;
}

@keyframes slideBg {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

/* Notification Sự kiện */
.event-notification {
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  text-align: center;
  background: rgba(255, 250, 240, 0.95);
  padding: 20px 40px;
  border: 2px solid #8a1c1c;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}
.event-seal {
  font-size: 3em;
  margin-bottom: 10px;
}
.event-msg {
  font-family: "Cinzel", serif;
  font-size: 1.5em;
  font-weight: bold;
  color: #8a1c1c;
}
.text-danger {
  color: #b71c1c;
}
.text-gold {
  color: #f9a825;
}

/* --- UI OVERLAY --- */
.ui-overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  pointer-events: none;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

/* --- WOOD PANEL STYLE --- */
.wood-panel {
  pointer-events: auto;
  width: 380px;
  height: 450px;
  background: #fdf5e6;
  border-left: 5px solid #5d4037;
  border-right: 5px solid #5d4037;
  position: relative;
  display: flex;
  flex-direction: column;
  transition: all 0.4s ease;
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.5);
  background-image: url("https://www.transparenttextures.com/patterns/aged-paper.png");
}

.scroll-rod {
  height: 15px;
  background: #3e2723;
  border-radius: 10px;
  position: absolute;
  left: -10px;
  right: -10px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.5);
  z-index: 2;
}
.scroll-rod.top {
  top: -8px;
}
.scroll-rod.bot {
  bottom: -8px;
}

/* Header Gỗ */
.panel-header {
  height: 45px;
  background: #5d4037;
  color: #fbc02d;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 15px;
  font-family: "Cinzel", serif;
  border-bottom: 2px solid #3e2723;
  cursor: pointer;
}
.ornament {
  margin-right: 5px;
  font-size: 1.2em;
}
.btn-toggle {
  background: none;
  border: none;
  color: #fbc02d;
  cursor: pointer;
}

/* Content Wrap */
.panel-content-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  opacity: 1;
  transition: 0.3s;
}

/* Minimize State */
.minimized {
  height: 45px !important;
  border: none;
  background: transparent;
}
.minimized .scroll-rod,
.minimized .panel-content-wrap {
  opacity: 0;
  pointer-events: none;
}
.minimized .panel-header {
  border: 2px solid #fbc02d;
  border-radius: 4px;
  width: 200px;
  margin: 0 auto;
}

/* --- TABS CỔ TRANG --- */
.ancient-tabs {
  display: flex;
  background: #4e342e;
}
.ancient-tabs button {
  flex: 1;
  background: transparent;
  border: none;
  color: #bcaaa4;
  padding: 10px;
  font-family: "Cinzel", serif;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
  border-bottom: 3px solid transparent;
}
.ancient-tabs button.active {
  color: #fff;
  background: #5d4037;
  border-bottom: 3px solid #fbc02d;
}

.ancient-body {
  flex: 1;
  padding: 10px;
  overflow: hidden;
  position: relative;
}

/* LOG STYLE */
.log-scroll {
  height: 100%;
  overflow-y: auto;
  padding-right: 5px;
}
.ink-line {
  margin-bottom: 8px;
  border-bottom: 1px dashed rgba(62, 39, 35, 0.2);
  padding-bottom: 4px;
  font-size: 0.95em;
}
.ink-time {
  font-weight: bold;
  color: #8a1c1c;
  margin-right: 5px;
}
.ink-msg {
  color: #3e2723;
}
.ink-line.adventure {
  background: rgba(255, 215, 0, 0.1);
  padding: 5px;
  font-style: italic;
}

/* STATS */
.stats-module {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.talisman-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 15px;
}
.talisman {
  border: 1px solid #8d6e63;
  padding: 10px;
  text-align: center;
  background: rgba(255, 255, 255, 0.5);
  position: relative;
}
.talisman::before {
  content: "";
  position: absolute;
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 10px;
  height: 10px;
  background: #b71c1c;
  border-radius: 50%;
}
.talisman .symbol {
  font-family: "Cinzel";
  font-size: 0.8em;
  color: #5d4037;
  margin-bottom: 5px;
}
.talisman .val {
  font-size: 1.4em;
  font-weight: bold;
  color: #1a1a1a;
}

.action-dock {
  margin-top: auto;
  display: flex;
  gap: 10px;
}
.btn-wood {
  flex: 1;
  text-align: center;
  padding: 10px;
  background: #3e2723;
  color: #fbc02d;
  text-decoration: none;
  font-family: "Cinzel";
  border: 1px solid #fbc02d;
  transition: 0.2s;
}
.btn-wood:hover {
  background: #5d4037;
  transform: translateY(-2px);
}

/* --- ĐÃ XÓA CENTER BUTTON STYLES --- */

/* --- RIGHT PANEL --- */
.right-panel {
  width: 300px;
  align-self: flex-start;
  margin-top: 10px;
  height: auto;
  max-height: 60vh;
}

.quest-paper {
  padding: 5px;
}

/* Scrollbar Custom */
.custom-scroll::-webkit-scrollbar {
  width: 6px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #8d6e63;
  border-radius: 3px;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-up-enter-active {
  transition: all 0.5s ease-out;
}
.fade-up-enter-from {
  opacity: 0;
  transform: translate(-50%, 20px);
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .ui-overlay {
    flex-direction: column;
    align-items: center;
  }
  .left-panel {
    width: 100%;
    height: 350px;
    order: 2;
    margin-bottom: 10px;
  }
  .right-panel {
    width: 100%;
    order: 1;
    margin-bottom: 10px;
  }
  /* Xóa các style responsive của nút cũ */
}
</style>
