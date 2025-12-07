<template>
  <div class="page-container gathering-page">
    <div class="bg-layer"></div>

    <div class="nav-header">
      <button class="btn-back" @click="$router.push('/explore')">
        <i class="fas fa-arrow-left"></i> Rời khỏi
      </button>
    </div>

    <div class="gathering-card" v-if="currentEvent">

      <div class="event-header">
        <div class="node-icon-frame" :class="{ 'shake-anim': isGathering }">
          <img :src="currentEvent.image" class="node-img" />
        </div>
        <h2 class="node-name" :class="currentEvent.rarityClass">{{ currentEvent.name }}</h2>
        <div class="rarity-badge" :class="currentEvent.rarityClass">{{ currentEvent.rarityText }}</div>
        <div class="requirement-text">
          <i class="fas fa-exclamation-circle"></i> Yêu cầu: {{ currentEvent.reqTool }} (Cấp {{ currentEvent.reqLevel
          }})
        </div>
      </div>

      <div class="status-section">
        <div class="status-row" :class="{ 'error-text': playerLevel < currentEvent.reqLevel }">
          <div class="icon-box"><i class="fas fa-star"></i></div>
          <div class="status-content">
            <span class="label">Kỹ năng:</span>
            <span class="value">Lv.{{ playerLevel }} / {{ currentEvent.reqLevel }}</span>
          </div>
        </div>

        <div class="status-row" :class="{ 'warning-text': !hasTool }">
          <div class="icon-box"><i class="fas fa-tools"></i></div>
          <div class="status-content">
            <span class="label">Công cụ:</span>
            <span class="value">{{ hasTool ? currentEvent.reqTool : 'Chưa trang bị' }}</span>
          </div>
        </div>

        <div class="status-row">
          <div class="icon-box"><i class="fas fa-cubes"></i></div>
          <div class="status-content">
            <span class="label">Trữ lượng:</span>
            <span class="value highlight">{{ remainingNode }} / {{ maxNode }}</span>
          </div>
        </div>
      </div>

      <div class="progress-section">
        <div class="progress-info">
          <span>Tiến độ khai thác</span>
          <span>{{ Math.round((1 - remainingNode / maxNode) * 100) }}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-bar" :style="{ width: ((1 - remainingNode / maxNode) * 100) + '%' }"></div>
        </div>
      </div>

      <div class="action-section">
        <div class="energy-display">
          Năng lượng: <span class="energy-val">{{ charStore.character?.energy || 0 }} ⚡</span>
        </div>

        <div class="buttons-grid">
          <button class="btn-gather primary" @click="handleGather(1)"
            :disabled="isGathering || remainingNode <= 0 || (charStore.character?.energy || 0) < 1">
            <div class="btn-content">
              <span class="btn-title">KHAI THÁC</span>
              <span class="btn-sub">Tiêu hao 1 ⚡</span>
            </div>
          </button>

          <button class="btn-gather secondary" @click="handleGatherAll"
            :disabled="isGathering || remainingNode <= 0 || (charStore.character?.energy || 0) < 1">
            <div class="btn-content">
              <span class="btn-title">AUTO (MAX 10)</span>
              <span class="btn-sub">Gom nhanh</span>
            </div>
          </button>
        </div>

        <div class="feedback-msg" v-if="feedbackMsg">
          {{ feedbackMsg }}
        </div>
      </div>
    </div>

    <div class="floating-container">
      <transition-group name="float-up">
        <div v-for="loot in floatingLoots" :key="loot.id" class="float-item">
          +{{ loot.amount }} {{ loot.name }}
        </div>
      </transition-group>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useCharacterStore } from '@/stores/characterStore';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';

import copperNodeImg from '@/assets/resources/r_copper_node.png';
import woodNodeImg from '@/assets/resources/r_go.png';
import stoneNodeImg from '@/assets/resources/stone_1.png';
import mysteryNodeImg from '@/assets/resources/r_gohoathach.png';

const charStore = useCharacterStore();
const authStore = useAuthStore();
const router = useRouter();

const currentEvent = ref(null);
const remainingNode = ref(0);
const maxNode = ref(0);
const isGathering = ref(false);
const feedbackMsg = ref("");
const floatingLoots = ref([]);

const playerLevel = computed(() => charStore.character?.lv || 1);
const hasTool = ref(true);

// [CẬP NHẬT] Tăng trữ lượng lên 10 - 25 để phù hợp cày cuốc
const EVENT_TYPES = [
  {
    id: 'mining', name: 'Mỏ Đồng Lộ Thiên', image: copperNodeImg,
    rarityClass: 'common', rarityText: 'Phổ Thông',
    reqLevel: 1, reqTool: 'Cuốc Chim',
    minYield: 10, maxYield: 20, lootName: 'Quặng Đồng'
  },
  {
    id: 'wood', name: 'Cây Sồi Cổ Thụ', image: woodNodeImg,
    rarityClass: 'common', rarityText: 'Phổ Thông',
    reqLevel: 1, reqTool: 'Rìu Sắt',
    minYield: 15, maxYield: 25, lootName: 'Gỗ Sồi'
  },
  {
    id: 'stone', name: 'Tảng Đá Khổng Lồ', image: stoneNodeImg,
    rarityClass: 'common', rarityText: 'Phổ Thông',
    reqLevel: 1, reqTool: 'Búa Tạ',
    minYield: 10, maxYield: 20, lootName: 'Đá Tảng'
  },
  {
    id: 'special', name: 'Gỗ Hóa Thạch', image: mysteryNodeImg,
    rarityClass: 'epic', rarityText: 'Cực Phẩm',
    reqLevel: 5, reqTool: 'Găng Tay',
    minYield: 3, maxYield: 8, lootName: 'Mảnh Hóa Thạch' // Hiếm thì ít hơn chút
  }
];

const initEvent = () => {
  const rnd = Math.floor(Math.random() * EVENT_TYPES.length);
  const evt = EVENT_TYPES[rnd];
  currentEvent.value = evt;

  // Random số lượng tài nguyên
  const amount = Math.floor(Math.random() * (evt.maxYield - evt.minYield + 1)) + evt.minYield;
  maxNode.value = amount;
  remainingNode.value = amount;
  feedbackMsg.value = "Bạn phát hiện một nguồn tài nguyên dồi dào!";
};

const handleGather = async (times) => {
  if (isGathering.value) return;

  const cost = times;
  if ((charStore.character?.energy || 0) < cost) {
    feedbackMsg.value = "⚠️ Không đủ năng lượng!";
    return;
  }

  isGathering.value = true;
  feedbackMsg.value = times > 1 ? "Đang khai thác liên tục..." : "Đang khai thác...";

  // Thời gian khai thác: Nhiều thì lâu hơn chút
  const delay = times > 1 ? 800 : 500;

  setTimeout(() => {
    // Đảm bảo không lấy quá số còn lại
    const actualGathered = Math.min(times, remainingNode.value);

    remainingNode.value -= actualGathered;

    if (charStore.character) charStore.character.energy -= actualGathered;

    if (actualGathered > 0) {
      showFloatingText(`+${actualGathered} ${currentEvent.value.lootName}`);
      feedbackMsg.value = `Thu hoạch thành công: ${actualGathered} ${currentEvent.value.lootName}`;
    }

    if (remainingNode.value <= 0) {
      feedbackMsg.value = "Tài nguyên đã cạn kiệt!";
      setTimeout(() => {
        router.push('/explore');
      }, 1500);
    }

    isGathering.value = false;
  }, delay);
};

// [UPDATE] Auto Gather: Lấy tối đa 10 cái hoặc hết số còn lại
const handleGatherAll = () => {
  const currentEnergy = charStore.character?.energy || 0;
  // Lấy max 10, hoặc số còn lại, hoặc số energy đang có
  const times = Math.min(10, remainingNode.value, currentEnergy);

  if (times > 0) {
    handleGather(times);
  } else {
    feedbackMsg.value = "⚠️ Năng lượng không đủ!";
  }
};

const showFloatingText = (text) => {
  const id = Date.now();
  floatingLoots.value.push({ id, amount: text.split(' ')[0], name: text.substring(text.indexOf(' ')) });
  setTimeout(() => {
    floatingLoots.value = floatingLoots.value.filter(i => i.id !== id);
  }, 1500);
};

onMounted(() => {
  charStore.fetchCharacter();
  initEvent();
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Cinzel:wght@700&display=swap");

.page-container {
  min-height: 100vh;
  position: relative;
  font-family: 'Inter', sans-serif;
  color: #e0e0e0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.bg-layer {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, #2c2c2c 0%, #121212 90%);
  z-index: -1;
}

.nav-header {
  width: 100%;
  max-width: 500px;
  margin-bottom: 20px;
}

.btn-back {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid #444;
  color: #ccc;
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.gathering-card {
  width: 100%;
  max-width: 500px;
  background: rgba(30, 30, 30, 0.95);
  border: 1px solid #444;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.event-header {
  text-align: center;
}

.node-icon-frame {
  width: 96px;
  height: 96px;
  margin: 0 auto 15px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.node-img {
  width: 80%;
  height: 80%;
  object-fit: contain;
  image-rendering: pixelated;
}

.shake-anim {
  animation: shake 0.5s infinite;
}

.node-name {
  font-family: 'Cinzel', serif;
  font-size: 1.5em;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.node-name.common {
  color: #bdbdbd;
}

.node-name.rare {
  color: #42a5f5;
}

.node-name.epic {
  color: #ab47bc;
  text-shadow: 0 0 10px rgba(171, 71, 188, 0.5);
}

.rarity-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75em;
  font-weight: bold;
  margin-top: 5px;
  border: 1px solid currentColor;
}

.rarity-badge.common {
  color: #bdbdbd;
}

.rarity-badge.rare {
  color: #42a5f5;
}

.rarity-badge.epic {
  color: #ab47bc;
}

.requirement-text {
  margin-top: 8px;
  font-size: 0.85em;
  color: #757575;
  font-style: italic;
}

.status-section {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 10px;
  border: 1px solid #333;
}

.status-row {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px dashed #444;
}

.status-row:last-child {
  border-bottom: none;
}

.icon-box {
  width: 30px;
  text-align: center;
  color: #8d6e63;
}

.status-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  font-size: 0.9em;
}

.label {
  color: #aaa;
}

.value {
  font-weight: bold;
}

.value.highlight {
  color: #ffca28;
}

.error-text .value {
  color: #ef5350;
}

.progress-section {
  margin-top: 5px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.8em;
  margin-bottom: 5px;
  color: #ccc;
}

.progress-track {
  height: 10px;
  background: #222;
  border-radius: 5px;
  overflow: hidden;
  border: 1px solid #444;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(to right, #66bb6a, #43a047);
  transition: width 0.3s ease;
}

.action-section {
  margin-top: 10px;
  text-align: center;
}

.energy-display {
  margin-bottom: 15px;
  font-size: 0.9em;
  color: #42a5f5;
  font-weight: bold;
}

.buttons-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.btn-gather {
  border: none;
  border-radius: 8px;
  cursor: pointer;
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
  position: relative;
  overflow: hidden;
}

.btn-gather:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-gather:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(1);
}

.primary {
  background: linear-gradient(to bottom, #2e7d32, #1b5e20);
  color: white;
  border: 1px solid #43a047;
  box-shadow: 0 4px 0 #1b5e20;
}

.secondary {
  background: #37474f;
  color: #cfd8dc;
  border: 1px solid #546e7a;
  box-shadow: 0 4px 0 #263238;
}

.btn-content {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.btn-title {
  font-weight: bold;
  font-size: 1em;
}

.btn-sub {
  font-size: 0.75em;
  opacity: 0.8;
}

.feedback-msg {
  margin-top: 15px;
  min-height: 20px;
  font-size: 0.9em;
  color: #81c784;
  font-weight: bold;
  animation: fadeIn 0.3s;
}

.floating-container {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
  width: 100%;
  text-align: center;
  z-index: 100;
}

.float-item {
  font-size: 1.5em;
  font-weight: bold;
  color: #ffeb3b;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
  margin-bottom: 5px;
}

@keyframes shake {
  0% {
    transform: rotate(0deg);
  }

  25% {
    transform: rotate(-5deg);
  }

  75% {
    transform: rotate(5deg);
  }

  100% {
    transform: rotate(0deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.float-up-enter-active {
  animation: floatUp 1s ease-out forwards;
}

@keyframes floatUp {
  0% {
    opacity: 1;
    transform: translateY(0);
  }

  100% {
    opacity: 0;
    transform: translateY(-50px);
  }
}

@media (max-width: 480px) {
  .gathering-card {
    padding: 15px;
  }

  .buttons-grid {
    grid-template-columns: 1fr;
  }
}
</style>