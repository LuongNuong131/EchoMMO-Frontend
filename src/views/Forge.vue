<template>
  <div class="page-container forge-page ancient-theme">
    <div class="wood-bg-layer"></div>
    <div class="fire-overlay"></div> <div class="forge-wrapper">
      <div class="forge-header">
        <div class="header-ornament left"></div>
        <h2 class="title-ancient">THẦN BINH CÁC</h2>
        <div class="header-ornament right"></div>
      </div>

      <div class="forge-layout">
        <div class="inventory-panel wood-panel">
          <div class="panel-title">
            <i class="fas fa-box-open"></i> HÀNH TRANG
          </div>
          <div class="item-grid custom-scroll">
            <div 
              v-for="item in equipableItems" 
              :key="item.userItemId"
              class="item-slot"
              :class="{ selected: selectedItem?.userItemId === item.userItemId }"
              @click="selectItem(item)"
            >
              <div class="slot-img-box">
                <img :src="item.item.imageUrl" />
                <div class="level-badge" v-if="item.level > 0">+{{ item.level }}</div>
              </div>
              <div class="slot-info">
                <div class="name" :class="'rarity-' + item.item.rarity">{{ item.item.name }}</div>
                <div class="type">{{ translateType(item.item.type) }}</div>
              </div>
            </div>
            
            <div v-if="equipableItems.length === 0" class="empty-msg">
              Không có trang bị để rèn
            </div>
          </div>
        </div>

        <div class="anvil-panel wood-panel">
          <div class="anvil-zone">
            <div class="fire-particles"></div>
            
            <div class="main-slot-container" :class="{ 'shaking': isForging }">
              <div class="main-slot" v-if="selectedItem">
                <img :src="selectedItem.item.imageUrl" />
                <div class="glow-ring"></div>
              </div>
              <div class="empty-anvil" v-else>
                <i class="fas fa-hammer"></i>
                <p>Chọn trang bị để rèn</p>
              </div>
            </div>

            <transition name="fade">
              <div v-if="selectedItem" class="upgrade-info">
                <h3 class="item-title-large" :class="'rarity-' + selectedItem.item.rarity">
                  {{ selectedItem.item.name }} 
                  <span class="curr-lv" v-if="selectedItem.level > 0">+{{ selectedItem.level }}</span>
                  <i class="fas fa-arrow-right arrow"></i>
                  <span class="next-lv">+{{ (selectedItem.level || 0) + 1 }}</span>
                </h3>

                <div class="stats-preview">
                  <div class="stat-row">
                    <span>Công Lực:</span>
                    <span class="val">{{ calculateStat(selectedItem.item.atk, selectedItem.level) }}</span>
                    <span class="boost">(+{{ itemStep }})</span>
                  </div>
                  <div class="stat-row">
                    <span>Tỉ lệ thành công:</span>
                    <span class="rate" :class="getRateColor(successRate)">{{ successRate }}%</span>
                  </div>
                </div>

                <div class="cost-box">
                  <span>Chi phí:</span>
                  <div class="cost-val">
                    <i class="fas fa-coins text-gold"></i> {{ formatNumber(upgradeCost) }}
                  </div>
                </div>

                <button 
                  class="btn-forge" 
                  @click="handleForge" 
                  :disabled="isForging || !canAfford"
                  :class="{ disabled: !canAfford }"
                >
                  <span v-if="!isForging">CƯỜNG HÓA</span>
                  <span v-else>ĐANG RÈN...</span>
                </button>
                <div v-if="!canAfford" class="error-text">Không đủ ngân lượng!</div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>

    <transition name="pop-up">
      <div v-if="showResult" class="result-overlay" @click="closeResult">
        <div class="result-scroll" :class="forgeSuccess ? 'success' : 'fail'">
          <div class="result-icon">
            <i :class="forgeSuccess ? 'fas fa-check-circle' : 'fas fa-heart-broken'"></i>
          </div>
          <h2 class="result-title">{{ forgeSuccess ? 'THÀNH CÔNG!' : 'THẤT BẠI!' }}</h2>
          <p class="result-desc">
            {{ forgeSuccess ? 'Trang bị đã được nâng cấp sức mạnh.' : 'Lần rèn này không như ý muốn.' }}
          </p>
          <div class="item-result-display" v-if="forgeSuccess">
             {{ selectedItem?.item.name }} <b>+{{ (selectedItem?.level || 0) }}</b>
          </div>
          <button class="btn-confirm" @click.stop="closeResult">XÁC NHẬN</button>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useInventoryStore } from '../stores/inventoryStore';
import { useAuthStore } from '../stores/authStore';
// import axiosClient from '../api/axiosClient'; // Dùng khi có API thật

const inventoryStore = useInventoryStore();
const authStore = useAuthStore();

const selectedItem = ref(null);
const isForging = ref(false);
const showResult = ref(false);
const forgeSuccess = ref(false);

// Lọc các item có thể trang bị (Weapon, Armor...)
const equipableItems = computed(() => {
  return inventoryStore.items.filter(i => 
    ['WEAPON', 'ARMOR', 'HELMET', 'BOOTS'].includes(i.item.type)
  );
});

// Giả lập tính toán chỉ số
const itemStep = 10; // Mỗi cấp tăng 10 chỉ số
const calculateStat = (base, lv = 0) => base + (lv * itemStep);

// Tính chi phí: Cơ bản 100 + (Level * 50)
const upgradeCost = computed(() => {
  if (!selectedItem.value) return 0;
  return 100 + ((selectedItem.value.level || 0) * 50);
});

// Tính tỉ lệ thành công: Giảm dần theo cấp
const successRate = computed(() => {
  if (!selectedItem.value) return 0;
  const lv = selectedItem.value.level || 0;
  return Math.max(10, 100 - (lv * 10)); // Min 10%, giảm 10% mỗi cấp
});

const canAfford = computed(() => {
  return (authStore.wallet?.gold || 0) >= upgradeCost.value;
});

const getRateColor = (rate) => {
  if (rate >= 80) return 'high-rate';
  if (rate >= 50) return 'mid-rate';
  return 'low-rate';
};

const formatNumber = (n) => n.toLocaleString();

const translateType = (type) => {
  const map = { WEAPON: 'Vũ Khí', ARMOR: 'Y Phục', HELMET: 'Mũ', BOOTS: 'Giày' };
  return map[type] || type;
};

const selectItem = (item) => {
  if (isForging.value) return;
  selectedItem.value = item;
};

const handleForge = async () => {
  if (isForging.value || !selectedItem.value) return;

  // Trừ tiền (Giả lập FE)
  // authStore.wallet.gold -= upgradeCost.value; 
  
  isForging.value = true;

  // Giả lập gọi API delay 2s
  setTimeout(() => {
    const isSuccess = Math.random() * 100 < successRate.value;
    forgeSuccess.value = isSuccess;
    
    if (isSuccess) {
      // Update logic giả lập
      selectedItem.value.level = (selectedItem.value.level || 0) + 1;
    }

    isForging.value = false;
    showResult.value = true;
  }, 2000);
};

const closeResult = () => {
  showResult.value = false;
};

onMounted(() => {
  inventoryStore.fetchInventory();
  if (authStore.token) authStore.fetchProfile();
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Noto+Serif+TC:wght@500;700;900&display=swap");

:root {
  --bg-dark: #121212;
  --wood-dark: #3e2723;
  --wood-light: #8d6e63;
  --gold: #ffc107;
  --red-seal: #b71c1c;
  --text-primary: #eaddcf;
}

.forge-page.ancient-theme {
  background-color: var(--bg-dark);
  height: 100vh;
  position: relative;
  overflow: hidden;
  font-family: "Noto Serif TC", serif;
  color: var(--text-primary);
}

/* Background & Effects */
.wood-bg-layer {
  position: absolute;
  inset: 0;
  background-image: url("https://www.transparenttextures.com/patterns/wood-pattern.png");
  background-color: #1a100c;
  z-index: 0;
}

.fire-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60%;
  background: radial-gradient(circle at bottom, rgba(255, 87, 34, 0.15) 0%, transparent 70%);
  pointer-events: none;
  animation: fire-pulse 4s infinite alternate;
  z-index: 1;
}

@keyframes fire-pulse {
  0% { opacity: 0.6; transform: scale(1); }
  100% { opacity: 1; transform: scale(1.05); }
}

.forge-wrapper {
  position: relative;
  z-index: 10;
  max-width: 1100px;
  margin: 0 auto;
  padding: 80px 20px 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/* Header */
.forge-header {
  text-align: center;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}
.title-ancient {
  font-size: 2.5em;
  color: var(--gold);
  text-shadow: 0 0 10px rgba(255, 193, 7, 0.5), 2px 2px 0 #000;
  margin: 0;
  letter-spacing: 3px;
}
.header-ornament {
  width: 50px;
  height: 2px;
  background: var(--wood-light);
  position: relative;
}
.header-ornament::after {
  content: "♦";
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  color: var(--gold);
}

/* Layout Grid */
.forge-layout {
  display: flex;
  gap: 20px;
  flex: 1;
  min-height: 0;
}

/* Panels Common */
.wood-panel {
  background: rgba(44, 24, 16, 0.85);
  border: 2px solid var(--wood-light);
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* LEFT PANEL: INVENTORY */
.inventory-panel {
  flex: 1;
  max-width: 350px;
}
.panel-title {
  background: var(--wood-dark);
  padding: 10px;
  text-align: center;
  font-weight: bold;
  border-bottom: 2px solid var(--wood-light);
  color: var(--gold);
}
.item-grid {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  gap: 10px;
  align-content: start;
}
.item-slot {
  aspect-ratio: 1;
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--wood-light);
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
}
.item-slot:hover {
  border-color: var(--gold);
  background: rgba(255, 193, 7, 0.1);
}
.item-slot.selected {
  border-color: var(--gold);
  box-shadow: 0 0 10px rgba(255, 193, 7, 0.3);
  background: rgba(255, 193, 7, 0.15);
}
.slot-img-box {
  width: 80%;
  height: 80%;
  position: relative;
}
.slot-img-box img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.level-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  background: var(--red-seal);
  color: #fff;
  font-size: 0.7em;
  padding: 1px 3px;
  border-radius: 2px;
  font-weight: bold;
}
.slot-info {
  display: none; /* Ẩn info chi tiết ở grid nhỏ */
}
.empty-msg {
  grid-column: 1/-1;
  text-align: center;
  color: #888;
  font-style: italic;
  margin-top: 20px;
}

/* RIGHT PANEL: ANVIL */
.anvil-panel {
  flex: 2;
  position: relative;
  background-image: radial-gradient(circle, #3e2723 0%, #1a100c 80%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.anvil-zone {
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

.main-slot-container {
  width: 120px;
  height: 120px;
  background: #1a1a1a;
  border: 4px solid var(--wood-light);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 20px #000;
  position: relative;
  transition: 0.1s;
}

.main-slot-container.shaking {
  animation: shake-anvil 0.1s infinite;
  border-color: #ff5722;
  box-shadow: 0 0 30px #ff5722;
}

.main-slot img {
  width: 90px;
  height: 90px;
  object-fit: contain;
  z-index: 2;
  position: relative;
}

.empty-anvil {
  color: var(--wood-light);
  text-align: center;
  opacity: 0.5;
}
.empty-anvil i { font-size: 2.5em; margin-bottom: 5px; }

/* Upgrade Info Box */
.upgrade-info {
  width: 100%;
  background: rgba(0,0,0,0.4);
  border: 1px solid var(--wood-light);
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.item-title-large {
  font-size: 1.5em;
  margin-bottom: 20px;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.curr-lv { color: #aaa; }
.next-lv { color: #4caf50; font-weight: bold; }
.arrow { font-size: 0.8em; color: #666; }

.stats-preview {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
  background: rgba(255,255,255,0.05);
  padding: 15px;
  border-radius: 4px;
}
.stat-row {
  display: flex;
  justify-content: space-between;
  font-size: 1.1em;
}
.boost { color: #4caf50; }
.high-rate { color: #4caf50; }
.mid-rate { color: #ff9800; }
.low-rate { color: #f44336; }

.cost-box {
  margin-bottom: 20px;
  font-size: 1.2em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.text-gold { color: var(--gold); }

.btn-forge {
  background: linear-gradient(180deg, #d84315, #bf360c);
  color: #fff;
  border: 2px solid #ff5722;
  padding: 12px 40px;
  font-family: "Noto Serif TC";
  font-weight: bold;
  font-size: 1.2em;
  cursor: pointer;
  border-radius: 4px;
  box-shadow: 0 5px 15px rgba(216, 67, 21, 0.4);
  transition: 0.2s;
  width: 100%;
}
.btn-forge:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(255, 87, 34, 0.6);
}
.btn-forge:disabled {
  background: #555;
  border-color: #333;
  cursor: not-allowed;
  opacity: 0.7;
}
.error-text {
  color: #f44336;
  margin-top: 10px;
  font-style: italic;
}

/* Animations */
@keyframes shake-anvil {
  0% { transform: translate(1px, 1px) rotate(0deg); }
  10% { transform: translate(-1px, -2px) rotate(-1deg); }
  20% { transform: translate(-3px, 0px) rotate(1deg); }
  30% { transform: translate(3px, 2px) rotate(0deg); }
  40% { transform: translate(1px, -1px) rotate(1deg); }
  50% { transform: translate(-1px, 2px) rotate(-1deg); }
  60% { transform: translate(-3px, 1px) rotate(0deg); }
  70% { transform: translate(3px, 1px) rotate(-1deg); }
  80% { transform: translate(-1px, -1px) rotate(1deg); }
  90% { transform: translate(1px, 2px) rotate(0deg); }
  100% { transform: translate(1px, -2px) rotate(-1deg); }
}

/* Result Modal */
.result-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.result-scroll {
  width: 350px;
  background: #eaddcf; /* Giấy */
  color: #3e2723;
  text-align: center;
  padding: 30px;
  border: 4px double #3e2723;
  border-radius: 8px;
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.result-icon {
  font-size: 4em;
  margin-bottom: 15px;
}
.success .result-icon { color: #2e7d32; }
.fail .result-icon { color: #c62828; }

.result-title {
  font-size: 1.8em;
  font-weight: 900;
  margin-bottom: 10px;
  font-family: "Playfair Display";
}
.success .result-title { color: #2e7d32; }
.fail .result-title { color: #c62828; }

.item-result-display {
  background: rgba(0,0,0,0.1);
  padding: 10px 20px;
  border-radius: 4px;
  margin: 15px 0;
  font-size: 1.2em;
}

.btn-confirm {
  background: #3e2723;
  color: #eaddcf;
  border: none;
  padding: 10px 30px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 15px;
}

@keyframes pop-in {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* Custom Scroll */
.custom-scroll::-webkit-scrollbar { width: 6px; }
.custom-scroll::-webkit-scrollbar-thumb { background: var(--wood-light); border-radius: 3px; }
.custom-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }

/* Fade Trans */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 768px) {
  .forge-layout { flex-direction: column; }
  .inventory-panel { max-width: 100%; height: 200px; }
  .anvil-panel { height: auto; padding: 20px; }
}
</style>