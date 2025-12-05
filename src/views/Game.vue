<template>
  <div class="page-container ancient-hub" @keydown.space.prevent="startExploration" tabindex="0">
    <div class="world-layer" :class="{ moving: isMoving }">
      
      <div class="status-bar-container">
        <div class="status-bar">
          <div class="level-badge">Lv.{{ charStore.character?.lv || 1 }}</div>

          <div class="stat-item">❤️ {{ charStore.character?.hp || 0 }}/{{ charStore.character?.maxHp || 100 }}</div>
          <div class="stat-item">⚡ {{ charStore.character?.energy || 0 }}/{{ charStore.character?.maxEnergy || 50 }}</div>
          <div class="stat-item">💰 {{ charStore.character?.user?.wallet?.gold || 0 }}</div>
        </div>

        <div class="exp-bar-wrapper">
          <div class="exp-bar" :style="{ width: expPercent + '%' }"></div>
        </div>
      </div>
      
      <div class="game-view-wrapper">
        <div class="stage-area">
          <div class="stage-background">

            <transition name="fade-up">
              <div v-if="showExpPopup" class="exp-popup">+{{ lastExpGain }} EXP</div>
            </transition>

            <div class="actor player"
              :style="{ left: playerStore.explorationState.playerPos + '%', transform: `scaleX(${playerStore.explorationState.moveDir})` }">
              <div class="avatar-circle" :class="{ 'bounce': isMoving }">
                <img src="https://cdn-icons-png.flaticon.com/512/9408/9408175.png" class="avatar-img" />
              </div>
              <div class="label" :style="{ transform: `scaleX(${playerStore.explorationState.moveDir})` }">Bạn</div>
            </div>

            <div class="actor target" v-if="showTarget"
              :style="{ left: (playerStore.explorationState.playerPos + (12 * playerStore.explorationState.moveDir)) + '%' }">
              <div class="avatar-target" :class="{ 'is-enemy': isEncounter }">
                <img v-if="targetImage" :src="targetImage" class="avatar-img" />
                <div v-else class="text-3xl">🎁</div>
              </div>
              <div class="label">{{ targetName }}</div>
            </div>
          </div>

          <div class="controls">
            <template v-if="!isEncounter && !isBattling">
              <button class="btn-explore" @click="startExploration" :disabled="isMoving || charStore.character?.hp <= 0">
                <span v-if="!isMoving">👣 HÀNH TẨU (Space)</span>
                <span v-else>🔍 Đang tìm kiếm... ({{ countdown }}s)</span>
              </button>
              <button class="btn-back" @click="$router.push('/village')" :disabled="isMoving">
                🏘️ Về làng
              </button>
            </template>

            <template v-if="isEncounter && !isBattling">
              <div class="encounter-actions">
                <button class="btn-ignore" @click="ignoreEncounter">🏃 Bỏ qua</button>
                <button class="btn-fight" @click="goToCombat">
                  ⚔️ CHIẾN ĐẤU
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>
      <div class="parallax-bg bg-far"></div>
      <div class="parallax-bg bg-near"></div>

      <transition name="fade-up">
        <div v-if="currentEvent" class="event-notification">
          <div class="event-seal">
            <i v-if="currentEvent.type === 'enemy'" class="fas fa-dragon text-danger"></i>
            <i v-if="currentEvent.type === 'loot'" class="fas fa-gem text-gold"></i>
          </div>
          <span class="event-msg">{{ currentEvent.message }}</span>
        </div>
      </transition>
    </div>

    <div class="ui-overlay">
      <div class="wood-panel left-panel" :class="{ minimized: isLeftMin }">
        <div class="panel-header" @click="isLeftMin = !isLeftMin">
          <div class="header-title">
            <span class="ornament">❖</span> THIÊN THƯ
          </div>
          <button class="btn-toggle">
            <i :class="isLeftMin ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
          </button>
        </div>

        <div class="panel-content-wrap">
          <div class="ancient-tabs">
            <button :class="{ active: activeTab === 'log' }" @click="activeTab = 'log'">
              <i class="fas fa-scroll"></i> <span class="tab-text">NHẬT KÝ</span>
            </button>
            <button :class="{ active: activeTab === 'chat' }" @click="activeTab = 'chat'">
              <i class="fas fa-comments"></i> <span class="tab-text">TRUYỀN ÂM</span>
            </button>
            <button :class="{ active: activeTab === 'stats' }" @click="activeTab = 'stats'">
              <i class="fas fa-yin-yang"></i> <span class="tab-text">BẢN THÂN</span>
            </button>
          </div>

          <div class="ancient-body paper-texture">
            <transition name="fade">
              <div v-show="activeTab === 'log'" class="log-scroll custom-scroll" ref="logContainer">
                <div 
                  v-for="(travelLog, idx) in adventureLogs" 
                  :key="'adv' + idx" 
                  class="ink-line adventure"
                >
                  <span class="ink-time">[Hành Tẩu]</span> {{ travelLog }}
                </div>
                <div 
                  v-for="log in charStore.logs" 
                  :key="log.id" 
                  class="ink-line"
                  :class="log.type"
                >
                  <span class="ink-time">
                    [{{ new Date(log.id).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }}]
                  </span>
                  <span class="ink-msg" v-html="log.message"></span>
                </div>
              </div>
            </transition>
            </div>
        </div>
      </div>
      </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { useCharacterStore } from "../stores/characterStore";
import { usePlayerStore } from '@/stores/player'; // Store mới cho Exploration State
import { useRouter } from 'vue-router';

// Imports Components (Assume they exist)
import ExploreView from "./Explore.vue"; // Dùng để gọi is (nhưng logic bị ẩn)
import ChatPanel from "../components/ChatPanel.vue";
import QuestPanel from "../components/QuestPanel.vue";

const charStore = useCharacterStore();
const playerStore = usePlayerStore();
const router = useRouter();

const activeTab = ref("log");
const isLeftMin = ref(false);
const isRightMin = ref(false);
const logContainer = ref(null);

// --- Logic Game Hub/Exploration ---
const isMoving = ref(false);
const isEncounter = ref(false);
const isBattling = ref(false);
const showTarget = ref(false);
const showExpPopup = ref(false);
const countdown = ref(0);
const lastExpGain = ref(0);
let moveInterval = null;
let countdownTimer = null;

const targetImage = ref('');
const targetName = ref('');
const logs = ref([]); // Logs cũ đã bị xóa. Adventure Logs mới được đẩy vào đây.
const adventureLogs = ref([{ msg: 'Sẵn sàng thám hiểm...', time: 'INIT' }]);

// Computed EXP %
const expPercent = computed(() => {
  const stats = charStore.character;
  if (!stats?.exp || !stats?.nextLevelExp || stats.nextLevelExp === 0) return 0;
  return (stats.exp / stats.nextLevelExp) * 100;
});

// Danh sách quái (Dùng ảnh local IDLE)
const enemyList = [
  { name: "Bộ Xương", img: new URL('@/assets/enemy/idle_skeleton.png', import.meta.url).href },
  { name: "Yêu Tinh", img: new URL('@/assets/enemy/idle_goblin.png', import.meta.url).href },
  { name: "Nấm Độc", img: new URL('@/assets/enemy/idle_mushroom.png', import.meta.url).href }
];

function getCurrentTime() { const now = new Date(); return `${now.getHours()}:${now.getMinutes()}`; }

const addLocalLog = async (msg, type = 'info') => {
  adventureLogs.value.unshift(msg); // Push log mới lên đầu (nhật ký)
  if (adventureLogs.value.length > 50) adventureLogs.value.pop();
  await nextTick();
  // Ensure log tab is active and scroll to bottom
  if (activeTab.value === 'log' && logContainer.value) {
    logContainer.value.scrollTop = logContainer.value.scrollHeight;
  }
};

// --- LOGIC DI CHUYỂN ---
const startMovingJS = () => {
  const speed = 0.15;
  if (moveInterval) clearInterval(moveInterval);
  moveInterval = setInterval(() => {
    // Logic di chuyển qua lại
    if (Math.random() < 0.02) { playerStore.explorationState.moveDir = Math.random() < 0.5 ? 1 : -1; }
    playerStore.explorationState.playerPos += speed * playerStore.explorationState.moveDir;

    if (playerStore.explorationState.playerPos >= 85) playerStore.explorationState.moveDir = -1;
    else if (playerStore.explorationState.playerPos <= 5) playerStore.explorationState.moveDir = 1;
  }, 16);
};

const stopMovingJS = () => { if (moveInterval) { clearInterval(moveInterval); moveInterval = null; } };

// --- HÀM CỐT LÕI: BẮT ĐẦU THÁM HIỂM ---
const startExploration = () => {
  if (isMoving.value || !charStore.character || charStore.character.hp <= 0) return;
  isMoving.value = true;
  showTarget.value = false;
  isEncounter.value = false;
  
  if (charStore.character.energy <= 0) {
      addLocalLog('<span style="color:#ef476f">⚡ Energy đã cạn! Cần nghỉ ngơi.</span>');
      isMoving.value = false;
      return;
  }

  const duration = 3; // Fixed duration for visibility
  countdown.value = duration;
  addLocalLog('🔍 Đang lùng sục khắp nơi...');
  startMovingJS();

  countdownTimer = setInterval(async () => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(countdownTimer);
      await revealEventFromServer();
    }
  }, 1000);
};

// --- XỬ LÝ SỰ KIỆN TỪ SERVER (API Call) ---
const revealEventFromServer = async () => {
  stopMovingJS();
  isMoving.value = false;

  // Gọi API lấy kết quả (Gold, Enemy, Walk, Rest)
  // Logic gọi API Exploration Service (Giả định trả về result)
  const result = await playerStore.explore(); 
  
  // Update HUD
  charStore.character.energy = result.playerEnergy;
  if (result.expGain) { 
      lastExpGain.value = result.expGain;
      showExpPopup.value = true;
      setTimeout(() => showExpPopup.value = false, 800);
  }

  if (result.type === 'ENEMY') {
    showTarget.value = true;
    isEncounter.value = true;

    const randomEnemy = enemyList[Math.floor(Math.random() * enemyList.length)];
    targetImage.value = randomEnemy.img;
    targetName.value = randomEnemy.name;

    addLocalLog(`<span style="color:#ef476f">⚔️ Gặp <b>${randomEnemy.name}</b>! Chuẩn bị chiến đấu!</span>`);

  } else if (result.type === 'GOLD') {
    showTarget.value = true;
    isEncounter.value = false;
    targetImage.value = 'https://cdn-icons-png.flaticon.com/512/2535/2535079.png'; // Túi vàng
    targetName.value = 'Túi Vàng';
    addLocalLog(`<span style="color:#ffd166">💰 ${result.message}</span>`);

  } else {
    showTarget.value = false;
    isEncounter.value = false;
    addLocalLog(`<span style="color:gray">${result.message}</span>`);
  }
};

const ignoreEncounter = () => {
  isEncounter.value = false;
  showTarget.value = false;
  addLocalLog('Bạn đã lờ đi và đi tiếp.');
};

const goToCombat = () => {
  stopMovingJS();
  router.push('/combat'); // Chuyển sang trang chiến đấu
};

onMounted(() => { 
    charStore.fetchCharacter(); 
    window.addEventListener('keyup', (e) => { if (e.code === 'Space') startExploration(); });
});
onUnmounted(() => { 
    stopMovingJS(); 
    if (countdownTimer) clearInterval(countdownTimer);
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Cinzel:wght@400;700&display=swap");

/* --- CẤU TRÚC CHUNG (Hub Layout) --- */
.ancient-hub {
  height: 100vh;
  position: relative;
  background: #1a1510;
  overflow: hidden;
  font-family: "Playfair Display", serif;
  color: #3e2723;
}
.world-layer { position: absolute; inset: 0; z-index: 1; background: #263238; overflow: hidden; }
.game-view-wrapper {
  position: absolute; width: 100%; height: 100%; z-index: 1;
  padding-top: 10px; /* Padding để panel không che */
}
/* Parallax */
.parallax-bg { position: absolute; width: 200%; height: 100%; background-repeat: repeat-x; background-position: bottom left; pointer-events: none; z-index: 2; opacity: 0.6; }
.bg-far { bottom: 100px; background-image: url("https://www.transparenttextures.com/patterns/black-scales.png"); filter: invert(1) opacity(0.3); }
.moving .bg-far { animation: slideBg 60s linear infinite; }
.moving .bg-near { animation: slideBg 10s linear infinite; }
@keyframes slideBg { from { transform: translateX(0); } to { transform: translateX(-50%); } }

/* Notification Sự kiện */
.event-notification {
  position: absolute; top: 15%; left: 50%; transform: translateX(-50%); z-index: 20;
  text-align: center; background: rgba(255, 250, 240, 0.95); padding: 15px 30px;
  border: 2px solid #8a1c1c; border-radius: 8px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}
.event-seal { font-size: 2.5em; margin-bottom: 5px; }

/* --- UI OVERLAY --- */
.ui-overlay {
  position: absolute; inset: 0; z-index: 10; pointer-events: none;
  padding: 10px; display: flex; justify-content: space-between; align-items: flex-end;
}
.wood-panel {
  pointer-events: auto; width: 380px; height: 450px; background: #fdf5e6;
  border-left: 5px solid #5d4037; border-right: 5px solid #5d4037;
  position: relative; display: flex; flex-direction: column; transition: all 0.4s ease;
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.5); background-image: url("https://www.transparenttextures.com/patterns/aged-paper.png");
}

/* Status Bar (NEW) */
.status-bar-container {
  background: rgba(0, 0, 0, 0.5); border-radius: 8px; margin: 20px auto 0;
  overflow: hidden; border: 2px solid #5d4037; width: 90%; max-width: 600px;
  flex-shrink: 0; position: relative; z-index: 5;
}
.status-bar {
  display: flex; justify-content: center; align-items: center; gap: 20px;
  padding: 10px 80px; font-weight: bold; font-size: 1rem; color: #fff;
  position: relative;
}
.level-badge { background: var(--wood-light); color: var(--gold-accent); padding: 2px 8px; border-radius: 4px; font-size: 0.9rem; position: absolute; left: 10px; }
.exp-bar-wrapper { width: 100%; height: 6px; background: #111; }
.exp-bar { height: 100%; background: #06d6a0; transition: width 0.5s ease-out; }

/* Game Stage (Tích hợp từ ExploreView) */
.stage-area { display: flex; flex-direction: column; gap: 15px; height: 100%; padding: 20px; }
.stage-background { flex: 1; background: #2c1810; border: 2px solid #555; border-radius: 12px; position: relative; overflow: hidden; }

/* Actors */
.actor { position: absolute; bottom: 40px; display: flex; flex-direction: column; align-items: center; width: 80px; z-index: 2; transition: left 0.5s ease; }
.avatar-circle { width: 70px; height: 70px; background: #333; border: 3px solid #06d6a0; border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(6, 214, 160, 0.5); }
.avatar-target { width: 70px; height: 70px; background: #333; border: 3px solid #ffd166; border-radius: 12px; overflow: hidden; display: flex; align-items: center; justify-content: center; transition: all 0.3s; }
.avatar-target.is-enemy { border-color: #ef476f; }
.label { font-weight: bold; background: rgba(0, 0, 0, 0.6); padding: 4px 10px; border-radius: 4px; margin-top: 5px; font-size: 0.9rem; transition: transform 0.2s; color: #fff; }

/* Controls (Tích hợp từ ExploreView) */
.controls { display: flex; gap: 10px; height: 60px; }
.btn-explore { flex: 2; background: #d32f2f; color: #fff; border: 2px solid #8a1c1c; font-size: 18px; font-weight: 900; border-radius: 50px; cursor: pointer; transition: 0.2s; }
.btn-explore:hover:not(:disabled) { background: #b71c1c; }
.btn-explore:disabled { background: #555; cursor: not-allowed; }
.btn-back { flex: 1; background: #4e342e; color: var(--gold-accent); border: 1px solid #8d6e63; border-radius: 50px; cursor: pointer; }
.encounter-actions { display: flex; gap: 10px; width: 100%; }
.btn-fight { flex: 2; background: #ef476f; color: white; border: none; border-radius: 50px; cursor: pointer; font-weight: bold; font-size: 18px; }
.btn-ignore { flex: 1; background: #ffd166; color: black; border: none; border-radius: 50px; cursor: pointer; font-weight: bold; }

.exp-popup { position: absolute; top: 30%; left: 50%; transform: translateX(-50%); color: #06d6a0; font-weight: bold; font-size: 1.5rem; text-shadow: 0 0 5px #000; z-index: 10; }
@keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-5px); } }

/* --- TABS & LOGS (Left Panel) --- */
.ancient-body { flex: 1; padding: 10px; overflow: hidden; position: relative; display: flex; flex-direction: column; }
.log-scroll { flex: 1; overflow-y: auto; padding-right: 5px; }
.ink-line.adventure { background: rgba(251, 192, 45, 0.1); padding: 4px 8px; border-radius: 4px; border: none; font-style: italic; }

/* Responsive */
@media (max-width: 768px) {
  .status-bar { gap: 10px; padding: 10px 50px; }
  .level-badge { position: relative; left: auto; }
  .stat-item { font-size: 1rem; }
}
</style>