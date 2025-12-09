<template>
  <div class="page-container forge-page ancient-theme">
    <div class="wood-bg-layer"></div>
    <div class="fire-overlay"></div>
    <div class="forge-wrapper">
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
            <div v-for="item in equipableItems" :key="item.userItemId" class="item-slot" :class="{
              selected: selectedItem?.userItemId === item.userItemId,
              'border-mythic': item.isMythic,
              [getRarityClass(item)]: true
            }" @click="selectItem(item)">
              <div class="slot-img-box">
                <img :src="getIconUrl(item.item.imageUrl)" />

                <div class="equipped-badge" v-if="item.isEquipped">
                  <i class="fas fa-check"></i>
                </div>

                <div class="level-badge" v-if="item.isMythic">
                  M{{ item.mythicLevel }}
                </div>
                <div class="level-badge" v-else-if="item.enhanceLevel > 0">
                  +{{ item.enhanceLevel }}
                </div>
              </div>
            </div>

            <div v-if="equipableItems.length === 0" class="empty-msg">
              Không có trang bị
            </div>
          </div>
        </div>

        <div class="anvil-panel wood-panel">
          <div class="anvil-zone">
            <div class="fire-particles"></div>

            <div class="main-slot-container" :class="{ shaking: isForging, 'mythic-glow': selectedItem?.isMythic }">
              <div class="main-slot" v-if="selectedItem">
                <img :src="getIconUrl(selectedItem.item.imageUrl)" />
                <div class="glow-ring"></div>
              </div>
              <div class="empty-anvil" v-else>
                <i class="fas fa-hammer"></i>
                <p>Chọn trang bị để rèn</p>
              </div>
            </div>

            <transition name="fade">
              <div v-if="selectedItem" class="upgrade-info">

                <h3 class="item-title-large" :class="getRarityTextClass(selectedItem)">
                  {{ selectedItem.item.name }}

                  <template v-if="selectedItem.isMythic">
                    <span class="mythic-tag">[Thần Lv{{ selectedItem.mythicLevel }}]</span>
                    <i class="fas fa-arrow-right arrow"></i>
                    <span class="next-lv mythic-text">Lv{{ selectedItem.mythicLevel + 1 }}</span>
                  </template>
                  <template v-else>
                    <span class="curr-lv">+{{ selectedItem.enhanceLevel }}</span>
                    <i class="fas fa-arrow-right arrow"></i>
                    <span class="next-lv">+{{ selectedItem.enhanceLevel + 1 }}</span>
                  </template>
                </h3>

                <div class="stats-preview custom-scroll">
                  <div class="stat-row main-stat">
                    <span>{{ getStatLabel(selectedItem.mainStatType) }}</span>
                    <span class="val">{{ formatNumber(selectedItem.mainStatValue) }}</span>
                    <span v-if="selectedItem.isMythic" class="orig-val">
                      (Gốc: {{ formatNumber(selectedItem.originalMainStatValue) }})
                    </span>
                    <span v-else class="boost">(+{{ estimatedBoost }})</span>
                  </div>

                  <div v-for="(sub, idx) in parsedSubStats" :key="idx" class="stat-row sub-stat">
                    <span class="sub-dot">•</span>
                    <span>{{ getStatLabel(sub.code) }}:</span>
                    <span class="val">
                      +{{ formatNumber(sub.value) }}{{ sub.isPercent ? '%' : '' }}
                    </span>
                    <span v-if="selectedItem.isMythic" class="orig-val-small">
                      (Base: {{ formatNumber(sub.originalValue) }})
                    </span>
                  </div>

                  <div v-if="!selectedItem.isMythic && parsedSubStats.length < getMaxSlots(selectedItem.rarity)"
                    class="stat-row empty-slot">
                    [???] Dòng thuộc tính ẩn
                  </div>
                </div>

                <div class="info-row">
                  <div class="cost-box">
                    <span>Chi phí:</span>
                    <div class="cost-val">
                      <i class="fas fa-coins text-gold"></i>
                      {{ formatNumber(upgradeCost.gold) }} Vàng + {{ upgradeCost.matQty }} {{ upgradeCost.matName }}
                    </div>
                  </div>

                  <div class="rate-box" v-if="!selectedItem.isMythic">
                    Tỉ lệ: <span :class="getRateColor(successRate)">{{ successRate }}%</span>
                  </div>
                </div>

                <div class="actions-group">
                  <button v-if="!selectedItem.isMythic && selectedItem.enhanceLevel < 30" class="btn-forge"
                    @click="handleUpgrade" :disabled="isForging">
                    <span v-if="!isForging">CƯỜNG HÓA</span>
                    <span v-else>ĐANG RÈN...</span>
                  </button>

                  <button v-if="canEvolve" class="btn-evolve glitch-effect" @click="handleEvolve" :disabled="isForging">
                    ☠️ ĐỘT PHÁ THẦN (5%) ☠️
                  </button>

                  <button v-if="selectedItem.isMythic" class="btn-mythic-upgrade" @click="handleMythicUpgrade"
                    :disabled="isForging || selectedItem.mythicLevel >= 30">
                    <span v-if="!isForging">THĂNG CẤP THẦN</span>
                    <span v-else>ĐANG HẤP THỤ...</span>
                  </button>

                  <button v-if="selectedItem.enhanceLevel >= 30 && !selectedItem.isMythic" class="btn-forge disabled"
                    disabled>
                    Cấp cường hóa MAX
                  </button>
                </div>

                <div v-if="errorMessage" class="error-text">
                  {{ errorMessage }}
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>

    <transition name="pop-up">
      <div v-if="showResult" class="result-overlay" @click="closeResult">
        <div class="result-scroll" :class="resultType">
          <div class="result-icon">
            <i :class="resultIcon"></i>
          </div>
          <h2 class="result-title">{{ resultTitle }}</h2>
          <p class="result-desc">{{ resultMessage }}</p>

          <button class="btn-confirm" @click.stop="closeResult">
            XÁC NHẬN
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from 'axios';
// import { useInventoryStore } from "../stores/inventoryStore"; 
// import { useAuthStore } from "../stores/authStore";

// --- STATE ---
const inventoryItems = ref([]);
const selectedItem = ref(null);
const isForging = ref(false);
const showResult = ref(false);
const resultType = ref('success');
const resultMessage = ref('');
const errorMessage = ref('');
const userId = ref(1); // MOCK USER ID - Cần lấy từ AuthStore thật

// --- COMPUTED LOGIC ---

const equipableItems = computed(() => {
  // [FIXED] Thêm check Array.isArray() để tránh TypeError khi dữ liệu chưa load
  if (!Array.isArray(inventoryItems.value)) {
    return [];
  }

  // FINAL FILTER: Chỉ hiển thị các loại có thể trang bị/cường hóa
  return inventoryItems.value.filter((i) =>
    i.item && ["WEAPON", "ARMOR", "HELMET", "BOOTS", "RING", "NECKLACE"].includes(i.item.type)
  );
});

const parsedSubStats = computed(() => {
  if (!selectedItem.value || !selectedItem.value.subStats) return [];
  try {
    const data = selectedItem.value.subStats;
    // Đảm bảo parsing an toàn
    return typeof data === 'string'
      ? JSON.parse(data)
      : data;
  } catch (e) {
    console.error("Lỗi parse SubStats:", e);
    return [];
  }
});

const getMaxSlots = (rarity) => {
  const map = { COMMON: 1, UNCOMMON: 2, RARE: 3, EPIC: 4, LEGENDARY: 4, MYTHIC: 4 };
  return map[rarity] || 1;
}

const canEvolve = computed(() => {
  if (!selectedItem.value) return false;
  // Điều kiện: LEGENDARY và Enhance Level MAX (>= 30)
  return selectedItem.value.rarity === 'LEGENDARY' && selectedItem.value.enhanceLevel >= 30;
});

const upgradeCost = computed(() => {
  if (!selectedItem.value) return { gold: 0, matQty: 0, matName: '' };

  const level = selectedItem.value.isMythic ? selectedItem.value.mythicLevel : selectedItem.value.enhanceLevel;
  const matName = level < 10 ? 'Gỗ' : (level < 20 ? 'Sắt' : (level < 30 ? 'Bạch Kim' : 'Kim Cương'));

  return {
    gold: selectedItem.value.isMythic ? 5000 * (level + 1) : 100 + level * 50,
    matQty: selectedItem.value.isMythic ? 1 : Math.floor(level / 5) + 1,
    matName: selectedItem.value.isMythic ? 'Kim Cương' : matName
  };
});

const successRate = computed(() => {
  if (!selectedItem.value || selectedItem.value.isMythic) return 100;
  return Math.max(10, 100 - (selectedItem.value.enhanceLevel || 0) * 3);
});

const estimatedBoost = computed(() => 10); // Placeholder

const resultTitle = computed(() => {
  if (resultType.value === 'mythic') return "THẦN KHÍ GIÁNG LÂM!";
  return resultType.value === 'success' ? "THÀNH CÔNG!" : "THẤT BẠI!";
});

const resultIcon = computed(() => {
  if (resultType.value === 'mythic') return "fas fa-dragon";
  return resultType.value === 'success' ? "fas fa-check-circle" : "fas fa-heart-broken";
});

// --- ACTIONS ---

const fetchInventory = async () => {
  try {
    // API để lấy kho đồ và cập nhật Vàng/Nguyên liệu
    const res = await axios.get(`/api/game/inventory/${userId.value}`);
    inventoryItems.value = res.data;

    // Giữ item đã chọn (nếu nó vẫn còn trong kho)
    if (selectedItem.value) {
      selectedItem.value = inventoryItems.value.find(i => i.userItemId === selectedItem.value.userItemId) || null;
    }
  } catch (error) {
    console.error("Lỗi khi tải kho đồ:", error);
    errorMessage.value = "Không thể tải kho đồ. Vui lòng kiểm tra API /api/game/inventory/{userId}";
    inventoryItems.value = [];
  }
};

const updateItemInInventory = (updatedItem) => {
  selectedItem.value = updatedItem;
  const index = inventoryItems.value.findIndex(i => i.userItemId === updatedItem.userItemId);
  if (index !== -1) {
    inventoryItems.value[index] = updatedItem;
  }
};


const selectItem = (item) => {
  if (isForging.value) return;
  selectedItem.value = item;
  errorMessage.value = '';
};

// 1. NÂNG CẤP THƯỜNG (Endpoint: /api/game/item/enhance/{itemId})
const handleUpgrade = async () => {
  if (!selectedItem.value || isForging.value) return;
  isForging.value = true;
  errorMessage.value = '';

  try {
    const url = `/api/game/item/enhance/${selectedItem.value.userItemId}?userId=${userId.value}`;
    const res = await axios.post(url);

    // Backend trả về updated UserItem
    updateItemInInventory(res.data);
    showResultModal('success', `Cường hóa thành công lên +${selectedItem.value.enhanceLevel}!`);

  } catch (err) {
    // Lấy thông báo lỗi từ Backend (ví dụ: "Không đủ Vàng!")
    errorMessage.value = err.response?.data || "Lỗi hệ thống hoặc thiếu nguyên liệu.";
    showResultModal('fail', errorMessage.value);
  } finally {
    isForging.value = false;
    await fetchInventory(); // Cần refresh Inventory để cập nhật Vàng/Nguyên liệu đã trừ
  }
};

// 2. TIẾN HÓA MYTHIC (Endpoint: /api/items/{itemId}/evolve-mythic)
const handleEvolve = async () => {
  if (!selectedItem.value || !confirm("Tỉ lệ 5%. Thất bại sẽ mất nguyên liệu. Chắc chắn?")) return;

  isForging.value = true;
  errorMessage.value = '';

  try {
    const url = `/api/items/${selectedItem.value.userItemId}/evolve-mythic?userId=${userId.value}`;
    const res = await axios.post(url);

    // Backend trả về String message ("THÀNH CÔNG" hoặc "Thất bại...")
    if (res.data.includes("THÀNH CÔNG")) {
      showResultModal('mythic', res.data);
      await fetchInventory(); // Refresh để item chuyển từ Legendary -> Mythic
      // Cập nhật lại selectedItem sau khi fetch
      selectedItem.value = inventoryItems.value.find(i => i.userItemId === selectedItem.value.userItemId);
    } else {
      errorMessage.value = res.data;
      showResultModal('fail', res.data);
    }
  } catch (err) {
    errorMessage.value = err.response?.data || "Lỗi kết nối hoặc không đủ điều kiện.";
    showResultModal('fail', errorMessage.value);
  } finally {
    isForging.value = false;
    await fetchInventory(); // Refresh Vàng/nguyên liệu
  }
};

// 3. NÂNG CẤP MYTHIC (Endpoint: /api/items/{itemId}/upgrade-mythic)
const handleMythicUpgrade = async () => {
  if (!selectedItem.value || isForging.value) return;
  isForging.value = true;
  errorMessage.value = '';

  try {
    const url = `/api/items/${selectedItem.value.userItemId}/upgrade-mythic`;
    const res = await axios.post(url);

    updateItemInInventory(res.data);
    showResultModal('success', `Sức mạnh thần thánh đã tăng lên Lv${selectedItem.value.mythicLevel}!`);
  } catch (err) {
    errorMessage.value = err.response?.data || "Lỗi nâng cấp Mythic.";
    showResultModal('fail', errorMessage.value);
  } finally {
    isForging.value = false;
    await fetchInventory(); // Refresh Vàng/nguyên liệu
  }
}

const showResultModal = (type, msg) => {
  resultType.value = type;
  resultMessage.value = msg;
  showResult.value = true;
};

const closeResult = () => {
  showResult.value = false;
};

// --- UTILS ---
const formatNumber = (n) => {
  if (n === null || isNaN(Number(n))) return '0';
  return Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });
};
const getIconUrl = (name) => `/assets/items/${name}.png`;
const getStatLabel = (code) => {
  const map = { ATK_FLAT: "Tấn Công", ATK_PERCENT: "Tấn Công %", HP_FLAT: "Máu", CRIT_RATE: "Chí Mạng", CRIT_DMG: "Sát thương CM", SPEED: "Tốc Độ", DEF_FLAT: "Thủ", DEF_PERCENT: "Thủ %" };
  return map[code] || code;
};
const getRarityClass = (item) => {
  if (item.isMythic) return 'mythic';
  return item.rarity ? item.rarity.toLowerCase() : 'common';
};
const getRarityTextClass = (item) => {
  if (item.isMythic) return 'text-mythic';
  return item.rarity ? `text-${item.rarity.toLowerCase()}` : 'text-common';
};
const getRateColor = (r) => r >= 80 ? 'high-rate' : (r >= 50 ? 'mid-rate' : 'low-rate');


onMounted(() => {
  fetchInventory();
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Noto+Serif+TC:wght@500;700;900&display=swap");

:root {
  --bg-dark: #121212;
  --wood-dark: #3e2723;
  --wood-light: #8d6e63;
  --gold: #ffc107;
  --mythic-red: #ff1744;
  --mythic-glow: #d50000;
  --text-primary: #eaddcf;
}

/* --- ADDED MYTHIC STYLES --- */
.border-mythic {
  border-color: var(--mythic-red) !important;
  box-shadow: 0 0 10px var(--mythic-glow);
  animation: pulse-red 2s infinite;
}

.mythic-glow {
  border-color: var(--mythic-red) !important;
  box-shadow: 0 0 30px var(--mythic-glow) !important;
}

.text-mythic {
  color: var(--mythic-red) !important;
  text-shadow: 0 0 10px var(--mythic-glow) !important;
}

.mythic-tag {
  color: var(--mythic-red);
  font-size: 0.6em;
  border: 1px solid var(--mythic-red);
  padding: 2px 5px;
  border-radius: 4px;
  margin-left: 10px;
}

.orig-val {
  font-size: 0.7em;
  color: #888;
  margin-left: 5px;
}

.orig-val-small {
  font-size: 0.6em;
  color: #666;
  margin-left: 5px;
  font-style: italic;
}

/* BUTTONS */
.btn-evolve {
  background: #000;
  color: var(--mythic-red);
  border: 2px solid var(--mythic-red);
  padding: 12px 20px;
  font-weight: bold;
  font-family: "Noto Serif TC";
  cursor: pointer;
  box-shadow: 0 0 10px var(--mythic-glow);
  margin-top: 10px;
  width: 100%;
}

.btn-evolve:hover {
  background: var(--mythic-red);
  color: #000;
}

.btn-mythic-upgrade {
  background: linear-gradient(180deg, #b71c1c, #7f0000);
  color: #fff;
  border: 2px solid #ff5252;
  padding: 12px 20px;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  margin-top: 10px;
}

/* Glitch Effect cho nút Evolve */
.glitch-effect {
  animation: glitch-skew 3s infinite linear alternate-reverse;
}

@keyframes glitch-skew {
  0% {
    transform: skew(0deg);
  }

  20% {
    transform: skew(-2deg);
  }

  40% {
    transform: skew(2deg);
  }

  60% {
    transform: skew(0deg);
  }

  100% {
    transform: skew(0deg);
  }
}

@keyframes pulse-red {
  0% {
    box-shadow: 0 0 5px var(--mythic-glow);
  }

  50% {
    box-shadow: 0 0 15px var(--mythic-glow);
  }

  100% {
    box-shadow: 0 0 5px var(--mythic-glow);
  }
}

/* --- EXISTING STYLES (Phần nền & Layout) --- */
.forge-page.ancient-theme {
  background-color: var(--bg-dark);
  height: 100vh;
  position: relative;
  overflow: hidden;
  font-family: "Noto Serif TC", serif;
  color: var(--text-primary);
}

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
  0% {
    opacity: 0.6;
    transform: scale(1);
  }

  100% {
    opacity: 1;
    transform: scale(1.05);
  }
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

.forge-layout {
  display: flex;
  gap: 20px;
  flex: 1;
  min-height: 0;
}

.wood-panel {
  background: rgba(44, 24, 16, 0.85);
  border: 2px solid var(--wood-light);
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

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
  background: rgba(0, 0, 0, 0.3);
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
  background: #b71c1c;
  color: #fff;
  font-size: 0.7em;
  padding: 1px 3px;
  border-radius: 2px;
  font-weight: bold;
}

.empty-msg {
  grid-column: 1/-1;
  text-align: center;
  color: #888;
  font-style: italic;
  margin-top: 20px;
}

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

.empty-anvil i {
  font-size: 2.5em;
  margin-bottom: 5px;
}

.upgrade-info {
  width: 100%;
  background: rgba(0, 0, 0, 0.4);
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

.curr-lv {
  color: #aaa;
}

.next-lv {
  color: #4caf50;
  font-weight: bold;
}

.arrow {
  font-size: 0.8em;
  color: #666;
}

.stats-preview {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.05);
  padding: 15px;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  font-size: 1.1em;
}

.boost {
  color: #4caf50;
}

.high-rate {
  color: #4caf50;
}

.mid-rate {
  color: #ff9800;
}

.low-rate {
  color: #f44336;
}

.cost-box {
  font-size: 1.2em;
  display: flex;
  align-items: center;
  gap: 10px;
}

.text-gold {
  color: var(--gold);
}

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

@keyframes shake-anvil {
  0% {
    transform: translate(1px, 1px) rotate(0deg);
  }

  10% {
    transform: translate(-1px, -2px) rotate(-1deg);
  }

  100% {
    transform: translate(1px, -2px) rotate(-1deg);
  }
}

.result-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.result-scroll {
  width: 350px;
  background: #eaddcf;
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

.success .result-icon {
  color: #2e7d32;
}

.fail .result-icon {
  color: #c62828;
}

.result-title {
  font-size: 1.8em;
  font-weight: 900;
  margin-bottom: 10px;
  font-family: "Playfair Display";
}

.success .result-title {
  color: #2e7d32;
}

.fail .result-title {
  color: #c62828;
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
  from {
    transform: scale(0.8);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

.custom-scroll::-webkit-scrollbar {
  width: 6px;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: var(--wood-light);
  border-radius: 3px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .forge-layout {
    flex-direction: column;
  }

  .inventory-panel {
    max-width: 100%;
    height: 200px;
  }

  .anvil-panel {
    height: auto;
    padding: 20px;
  }
}

.text-common {
  color: #bdbdbd;
}

.text-uncommon {
  color: #66bb6a;
}

.text-rare {
  color: #42a5f5;
}

.text-epic {
  color: #ab47bc;
}

.text-legendary {
  color: #ffca28;
  text-shadow: 0 0 5px #ffca28;
}
</style>