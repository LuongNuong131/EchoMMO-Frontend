<template>
  <div class="page-container inventory-page wuxia-dark-theme">
    <div class="ink-bg-layer">
      <div class="mountain-bg"></div>
      <div class="fog-anim"></div>
    </div>

    <div class="inventory-wrapper">
      <div class="main-chest-frame">
        
        <div class="chest-header">
          <div class="header-decoration left"></div>
          <h2 class="chest-title">HÀNH TRANG</h2>
          <div class="header-decoration right"></div>
        </div>

        <div class="tab-control-bar">
          <button 
            class="tab-btn" 
            :class="{ active: filter === 'ALL' }" 
            @click="filter = 'ALL'"
          >
            TẤT CẢ
          </button>
          <div class="separator">|</div>
          <button 
            class="tab-btn" 
            :class="{ active: filter === 'EQUIP' }" 
            @click="filter = 'EQUIP'"
          >
            TRANG BỊ
          </button>
          <div class="separator">|</div>
          <button 
            class="tab-btn" 
            :class="{ active: filter === 'MAT' }" 
            @click="filter = 'MAT'"
          >
            VẬT PHẨM
          </button>
          
          <div class="capacity-badge">
            <i class="fas fa-weight-hanging"></i> 
            {{ inventoryStore.items.length }} / 50
          </div>
        </div>

        <div class="inventory-grid custom-scroll">
          <div
            v-for="u in filteredItems"
            :key="u.userItemId"
            class="grid-slot"
            :class="[
              'rarity-' + (u.item.rarity || 'C'),
              { 
                selected: selectedItem?.userItemId === u.userItemId,
                equipped: u.isEquipped
              }
            ]"
            @click="selectedItem = u"
          >
            <div class="slot-inner">
              <img :src="u.item.imageUrl" class="item-icon" />
              
              <div class="qty-tag" v-if="u.quantity > 1">{{ u.quantity }}</div>
              
              <div class="equip-tag" v-if="u.isEquipped">
                <i class="fas fa-shield-alt"></i>
              </div>
            </div>
            <div class="selection-glow"></div>
          </div>

          <div v-for="n in (50 - filteredItems.length)" :key="'empty-'+n" class="grid-slot empty"></div>
        </div>

        <transition name="slide-up">
          <div v-if="selectedItem" class="item-detail-panel">
            <div class="detail-content">
              
              <div class="detail-left">
                <div class="item-portrait" :class="'border-' + (selectedItem.item.rarity || 'C')">
                  <img :src="selectedItem.item.imageUrl" />
                </div>
              </div>

              <div class="detail-mid">
                <div class="item-header">
                  <h3 :class="'text-rarity-' + (selectedItem.item.rarity || 'C')">
                    {{ selectedItem.item.name }}
                  </h3>
                  <span class="item-type-badge">{{ translateType(selectedItem.item.type) }}</span>
                </div>
                
                <div class="item-stats-row">
                  <span v-if="selectedItem.item.atkBonus" class="stat atk">+{{ selectedItem.item.atkBonus }} CÔNG</span>
                  <span v-if="selectedItem.item.defBonus" class="stat def">+{{ selectedItem.item.defBonus }} THỦ</span>
                  <span v-if="selectedItem.item.hpBonus" class="stat hp">+{{ selectedItem.item.hpBonus }} SINH LỰC</span>
                </div>

                <p class="item-desc">
                  {{ selectedItem.item.description || "Vật phẩm bí ẩn, chưa rõ công dụng." }}
                </p>
              </div>

              <div class="detail-right actions">
                <button v-if="selectedItem.item.type === 'CONSUMABLE'" 
                  class="action-btn use-btn"
                  @click="inventoryStore.useItem(selectedItem.userItemId)"
                >
                  SỬ DỤNG
                </button>

                <template v-if="canEquip(selectedItem)">
                  <button v-if="!selectedItem.isEquipped" 
                    class="action-btn equip-btn"
                    @click="inventoryStore.equipItem(selectedItem.userItemId)"
                  >
                    TRANG BỊ
                  </button>
                  <button v-else 
                    class="action-btn unequip-btn"
                    @click="inventoryStore.unequipItem(selectedItem.userItemId)"
                  >
                    GỠ BỎ
                  </button>
                </template>

                <button v-if="!selectedItem.isEquipped" 
                  class="action-btn sell-btn"
                  @click="openSellModal(selectedItem)"
                >
                  BÁN
                </button>
              </div>
            </div>
          </div>
        </transition>

      </div>
    </div>

    <div v-if="showSell" class="modal-overlay">
      <div class="dark-modal">
        <div class="modal-header">
          <span class="decor">❖</span> GIAO DỊCH <span class="decor">❖</span>
        </div>
        
        <div class="modal-body">
          <h3 class="trade-item-name">{{ sellItem.item.name }}</h3>
          
          <div class="trade-tabs">
            <div class="trade-tab" :class="{ active: mode === 'NPC' }" @click="mode = 'NPC'">
              TIỆM CẦM ĐỒ (NPC)
            </div>
            <div class="trade-tab" :class="{ active: mode === 'P2P' }" @click="mode = 'P2P'">
              CHỢ TRỜI (P2P)
            </div>
          </div>

          <div class="trade-form">
            <div class="form-group">
              <label>SỐ LƯỢNG</label>
              <input type="number" v-model.number="qty" min="1" :max="sellItem.quantity" class="dark-input" />
            </div>
            
            <div v-if="mode === 'P2P'" class="form-group">
              <label>ĐƠN GIÁ</label>
              <input type="number" v-model.number="price" class="dark-input" />
            </div>

            <div class="trade-summary">
              Tổng thu: 
              <span class="money-highlight">
                {{ mode === "NPC" ? (sellItem.item.basePrice * 0.5 * qty) : (price * qty) }}
                <i class="fas fa-coins"></i>
              </span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="modal-btn cancel" @click="showSell = false">HỦY</button>
          <button class="modal-btn confirm" @click="mode === 'NPC' ? confirmNPC() : confirmP2P()">
            XÁC NHẬN
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
<script setup>
import { ref, computed, onMounted } from "vue";
import { useInventoryStore } from "../stores/inventoryStore";
import { useCharacterStore } from "../stores/characterStore";
import { useAuthStore } from "../stores/authStore";
import { useMarketStore } from "../stores/marketStore";

const inventoryStore = useInventoryStore();
const charStore = useCharacterStore();
const authStore = useAuthStore();
const marketStore = useMarketStore();

const filter = ref("ALL");
const selectedItem = ref(null);
const equipment = computed(() => inventoryStore.equippedItems); 

const EQUIP_TYPES = ["WEAPON", "ARMOR", "HELMET", "BOOTS", "RING", "NECKLACE"];
const MATERIAL_TYPES = ["MATERIAL", "CONSUMABLE"];

const filteredItems = computed(() => {
  let items = inventoryStore.items;
  if (filter.value === "EQUIP") {
    items = items.filter((i) => EQUIP_TYPES.includes(i.item.type));
  }
  if (filter.value === "MAT") {
    items = items.filter((i) => MATERIAL_TYPES.includes(i.item.type));
  }
  return items;
});

const showSell = ref(false);
const sellItem = ref(null);
const mode = ref("NPC");
const qty = ref(1);
const price = ref(0);

const openSellModal = (item) => {
  sellItem.value = item;
  qty.value = 1;
  price.value = item.item.basePrice;
  showSell.value = true;
};
const confirmNPC = async () => {
  await marketStore.sellItem(sellItem.value.userItemId, qty.value);
  showSell.value = false;
  selectedItem.value = null;
};
const confirmP2P = async () => {
  await marketStore.createListing(
    sellItem.value.userItemId,
    price.value,
    qty.value
  );
  showSell.value = false;
  selectedItem.value = null;
};

const canEquip = (u) => EQUIP_TYPES.includes(u.item.type);

const translateType = (type) => {
  const map = {
    WEAPON: "Binh Khí",
    ARMOR: "Y Phục",
    HELMET: "Mũ",
    BOOTS: "Giày",
    RING: "Nhẫn",
    NECKLACE: "Dây Chuyền",
    CONSUMABLE: "Tiêu Hao",
    MATERIAL: "Nguyên Liệu",
  };
  return map[type] || type;
};

onMounted(() => {
  inventoryStore.fetchInventory();
  charStore.fetchCharacter();
});
</script>
<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;700;900&display=swap");
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css");

/* --- PALETTE --- */
:root {
  --wood-dark: #3e2723;
  --wood-light: #5d4037;
  --gold: #ffecb3;
  --gold-dim: #ffe082;
  --text-light: #f3f4f6;
  --text-dim: #bdbdbd;
  --red-seal: #b71c1c;
  --bg-slot: rgba(0,0,0,0.5);
  --border-slot: #4e342e;
}

/* --- BASE --- */
.wuxia-dark-theme {
  background-color: #212121;
  min-height: 100vh;
  font-family: "Noto Serif TC", serif;
  color: var(--text-light);
  position: relative;
  overflow: hidden;
}

/* Background Layers (Copy từ Home) */
.ink-bg-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-color: #3e2723;
}
.mountain-bg {
  position: absolute;
  inset: 0;
  background-image: url("https://images.unsplash.com/photo-1518182170546-0766ce6fec56?q=80&w=2000&auto=format&fit=crop");
  background-size: cover;
  filter: sepia(40%) brightness(0.5) contrast(1.2);
  opacity: 0.6;
}
.fog-anim {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, #261815 10%, transparent 90%);
}

.inventory-wrapper {
  position: relative;
  z-index: 10;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
}

/* --- MAIN CHEST --- */
.main-chest-frame {
  width: 100%;
  max-width: 900px;
  height: 90vh;
  background: rgba(30, 20, 15, 0.95);
  border: 4px solid var(--wood-light);
  box-shadow: 0 0 50px rgba(0,0,0,0.8);
  display: flex;
  flex-direction: column;
  position: relative;
}

/* Header */
.chest-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px;
  border-bottom: 2px solid var(--wood-light);
  background: linear-gradient(to right, rgba(0,0,0,0), rgba(93, 64, 55, 0.5), rgba(0,0,0,0));
}
.chest-title {
  font-size: 1.8rem;
  color: var(--gold);
  margin: 0 20px;
  text-shadow: 0 0 10px rgba(255, 236, 179, 0.3);
  font-weight: 900;
  letter-spacing: 2px;
}
.header-decoration {
  width: 50px;
  height: 2px;
  background: var(--gold);
  position: relative;
}
.header-decoration::after {
  content: "✦";
  position: absolute;
  top: -8px;
  color: var(--gold);
}
.header-decoration.left::after { right: -5px; }
.header-decoration.right::after { left: -5px; }

/* Tabs Control */
.tab-control-bar {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  gap: 15px;
  background: rgba(0,0,0,0.3);
}
.tab-btn {
  background: none;
  border: none;
  color: var(--text-dim);
  font-family: inherit;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: 0.3s;
  padding: 5px 0;
  border-bottom: 2px solid transparent;
}
.tab-btn:hover { color: var(--gold); }
.tab-btn.active {
  color: var(--gold);
  border-bottom-color: var(--gold);
  text-shadow: 0 0 8px rgba(255, 236, 179, 0.4);
}
.separator { color: #555; }
.capacity-badge {
  margin-left: auto;
  font-size: 0.9rem;
  color: #a1887f;
}

/* --- GRID SYSTEM --- */
.inventory-grid {
  flex: 1;
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  grid-auto-rows: 70px;
  gap: 8px;
  overflow-y: auto;
  align-content: start;
}

.grid-slot {
  background: var(--bg-slot);
  border: 1px solid var(--border-slot);
  border-radius: 4px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.8);
}
.grid-slot.empty {
  opacity: 0.3;
  pointer-events: none;
}

.grid-slot:hover {
  border-color: var(--gold-dim);
  background: rgba(255, 255, 255, 0.05);
}

.grid-slot.selected {
  border-color: var(--gold);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3), inset 0 0 15px rgba(255, 215, 0, 0.1);
}
.grid-slot.selected .selection-glow {
  position: absolute;
  inset: 0;
  border: 2px solid var(--gold);
  animation: pulseSlot 1.5s infinite;
}

.slot-inner {
  width: 100%;
  height: 100%;
  padding: 5px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
}
.item-icon {
  max-width: 100%;
  max-height: 100%;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.8));
}

/* Badges */
.qty-tag {
  position: absolute;
  bottom: 2px;
  right: 2px;
  font-size: 0.75rem;
  color: #fff;
  background: rgba(0,0,0,0.8);
  padding: 0 4px;
  border-radius: 2px;
}
.equip-tag {
  position: absolute;
  top: 2px;
  left: 2px;
  color: #4caf50;
  font-size: 0.8rem;
  text-shadow: 0 0 2px #000;
}

/* Rarity Colors (Border Bottom) */
.rarity-C { border-bottom: 2px solid #bdbdbd; }
.rarity-B { border-bottom: 2px solid #42a5f5; }
.rarity-A { border-bottom: 2px solid #ab47bc; }
.rarity-S { border-bottom: 2px solid #ffca28; }

/* --- DETAIL PANEL (SLIDE UP) --- */
.item-detail-panel {
  height: 200px;
  background: #261815;
  border-top: 4px solid var(--wood-light);
  padding: 15px 25px;
  box-shadow: 0 -5px 20px rgba(0,0,0,0.5);
}

.detail-content {
  display: flex;
  gap: 20px;
  height: 100%;
}

.detail-left {
  width: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.item-portrait {
  width: 100px;
  height: 100px;
  background: #1a1a1a;
  border: 2px solid #444;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 0 15px rgba(0,0,0,0.8);
}
.item-portrait img { max-width: 80%; max-height: 80%; }
.item-portrait.border-S { border-color: #ffca28; box-shadow: 0 0 15px rgba(255, 202, 40, 0.3); }

.detail-mid {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.item-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 5px;
}
.text-rarity-S { color: #ffca28; }
.text-rarity-A { color: #ab47bc; }
.text-rarity-B { color: #42a5f5; }
.text-rarity-C { color: #bdbdbd; }

.item-type-badge {
  background: #3e2723;
  color: #a1887f;
  font-size: 0.8rem;
  padding: 2px 8px;
  border: 1px solid #5d4037;
}

.item-stats-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 0.9rem;
  font-weight: bold;
}
.stat.atk { color: #ef5350; }
.stat.def { color: #42a5f5; }
.stat.hp { color: #66bb6a; }

.item-desc {
  font-size: 0.95rem;
  color: #9e9e9e;
  font-style: italic;
  margin: 0;
  line-height: 1.4;
}

.detail-right {
  width: 150px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
}

/* BUTTONS */
.action-btn {
  width: 100%;
  padding: 10px;
  border: none;
  font-family: inherit;
  font-weight: bold;
  cursor: pointer;
  color: #fff;
  transition: 0.2s;
  text-transform: uppercase;
  border: 1px solid rgba(255,255,255,0.1);
}
.action-btn:hover { filter: brightness(1.2); transform: translateY(-2px); }

.use-btn { background: #ff8f00; color: #000; }
.equip-btn { background: #2e7d32; }
.unequip-btn { background: #4e342e; }
.sell-btn { background: #c62828; }

/* --- MODAL (Giao dịch) --- */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  backdrop-filter: blur(5px);
}
.dark-modal {
  width: 400px;
  background: #261815;
  border: 2px solid var(--gold);
  box-shadow: 0 0 30px rgba(0,0,0,0.9);
}
.modal-header {
  background: var(--wood-light);
  color: var(--gold);
  padding: 15px;
  text-align: center;
  font-weight: bold;
  letter-spacing: 2px;
}
.decor { color: var(--red-seal); }

.modal-body {
  padding: 20px;
}
.trade-item-name {
  text-align: center;
  color: var(--text-light);
  margin-bottom: 20px;
  font-size: 1.4rem;
}
.trade-tabs {
  display: flex;
  border: 1px solid #444;
  margin-bottom: 20px;
}
.trade-tab {
  flex: 1;
  text-align: center;
  padding: 10px;
  cursor: pointer;
  color: #757575;
  background: #1a1a1a;
}
.trade-tab.active {
  background: var(--red-seal);
  color: #fff;
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  font-size: 0.8rem;
  color: var(--gold);
  margin-bottom: 5px;
}
.dark-input {
  width: 100%;
  background: #121212;
  border: 1px solid #444;
  color: var(--text-light);
  padding: 8px;
  font-size: 1.1rem;
  box-sizing: border-box;
}
.trade-summary {
  text-align: right;
  margin-top: 15px;
  color: #bdbdbd;
}
.money-highlight { color: var(--gold); font-weight: bold; font-size: 1.2rem; }

.modal-footer {
  display: flex;
  border-top: 1px solid #444;
}
.modal-btn {
  flex: 1;
  padding: 15px;
  border: none;
  font-family: inherit;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
}
.cancel { background: #3e2723; color: #bdbdbd; }
.confirm { background: var(--gold); color: #3e2723; }
.confirm:hover { background: #ffca28; }

/* Scrollbar */
.custom-scroll::-webkit-scrollbar { width: 6px; }
.custom-scroll::-webkit-scrollbar-thumb { background: #5d4037; }
.custom-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }

/* Animation */
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); opacity: 0; }
@keyframes pulseSlot {
  0% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.3); }
  50% { box-shadow: 0 0 15px rgba(255, 215, 0, 0.6); }
  100% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.3); }
}
</style>