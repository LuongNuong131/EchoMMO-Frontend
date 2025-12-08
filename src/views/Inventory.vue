<template>
  <div class="page-container wuxia-inventory dark-theme">
    <div class="ink-bg-layer">
      <div class="mountain-bg"></div>
      <div class="fog-anim"></div>
    </div>

    <div class="inventory-overlay">
      <div class="inventory-header">
        <div class="header-decor left"></div>
        <h2 class="inventory-title">HÀNH TRANG</h2>
        <div class="header-decor right"></div>
      </div>

      <div class="inventory-grid custom-scroll">
        <div v-if="inventoryStore.items.length === 0" class="empty-state">
          <i class="fas fa-box-open"></i>
          <p>Túi đồ trống rỗng...</p>
        </div>

        <div
          v-for="item in inventoryStore.items"
          :key="item.userItemId"
          class="inventory-slot"
          :class="{ equipped: item.isEquipped }"
        >
          <div class="slot-inner">
            <div class="img-wrapper" :class="'border-' + item.item.rarity">
              <img :src="resolveItemImage(item.item.imageUrl)" />
              <span class="qty-badge" v-if="item.quantity > 1">{{
                item.quantity
              }}</span>
              <span class="enhance-badge" v-if="item.enhanceLevel > 0"
                >+{{ item.enhanceLevel }}</span
              >
            </div>

            <div class="item-info">
              <div class="item-name" :class="'text-' + item.item.rarity">
                {{ item.item.name }}
              </div>
              <div class="item-stats">
                <span v-if="item.item.atkBonus > 0"
                  >ATK: {{ item.item.atkBonus }}</span
                >
                <span v-if="item.item.defBonus > 0"
                  >DEF: {{ item.item.defBonus }}</span
                >
                <span v-if="item.item.hpBonus > 0"
                  >HP: {{ item.item.hpBonus }}</span
                >
              </div>
            </div>

            <div class="slot-actions">
              <button
                v-if="!item.isEquipped && item.item.type !== 'MATERIAL'"
                @click="inventoryStore.equipItem(item.userItemId)"
                class="btn-action btn-equip"
              >
                TRANG BỊ
              </button>
              <button
                v-if="item.isEquipped"
                @click="inventoryStore.unequipItem(item.userItemId)"
                class="btn-action btn-unequip"
              >
                THÁO
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useInventoryStore } from "../stores/inventoryStore";
import { resolveItemImage } from "../utils/assetHelper"; // [QUAN TRỌNG]

const inventoryStore = useInventoryStore();

onMounted(() => {
  inventoryStore.fetchInventory();
});
</script>

<style scoped>
/* (Giữ nguyên CSS cũ của Inventory hoặc copy từ các file trước nếu chưa có) */
@import url("https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;700;900&display=swap");
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css");

:root {
  --wood-dark: #3e2723;
  --wood-light: #5d4037;
  --gold: #ffecb3;
  --text-light: #f3f4f6;
}
.dark-theme {
  background-color: #212121;
  min-height: 100vh;
  font-family: "Noto Serif TC", serif;
  color: var(--text-light);
  position: relative;
  overflow: hidden;
}
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
.inventory-overlay {
  position: relative;
  z-index: 10;
  max-width: 1000px;
  margin: 0 auto;
  padding: 30px 20px;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.inventory-header {
  text-align: center;
  margin-bottom: 20px;
  background: rgba(30, 20, 15, 0.95);
  padding: 15px;
  border: 2px solid var(--wood-light);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  position: relative;
}
.inventory-title {
  font-size: 2rem;
  color: var(--gold);
  margin: 0;
  letter-spacing: 3px;
  font-weight: 900;
}
.header-decor {
  width: 40px;
  height: 2px;
  background: var(--gold);
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}
.left {
  left: 20px;
}
.right {
  right: 20px;
}
.inventory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 15px;
  overflow-y: auto;
  padding: 10px;
}
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  color: #757575;
  font-size: 1.2rem;
  margin-top: 50px;
}
.inventory-slot {
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid #444;
  padding: 10px;
  border-radius: 4px;
  transition: 0.2s;
  position: relative;
}
.inventory-slot:hover {
  border-color: var(--gold);
  background: rgba(255, 236, 179, 0.05);
}
.inventory-slot.equipped {
  border-color: #4caf50;
  background: rgba(76, 175, 80, 0.1);
}
.slot-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.img-wrapper {
  width: 64px;
  height: 64px;
  background: #222;
  border: 2px solid #555;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.img-wrapper img {
  max-width: 90%;
  max-height: 90%;
}
.qty-badge {
  position: absolute;
  bottom: 2px;
  right: 2px;
  font-size: 0.7rem;
  background: rgba(0, 0, 0, 0.8);
  padding: 1px 4px;
  border-radius: 2px;
}
.enhance-badge {
  position: absolute;
  top: 2px;
  left: 2px;
  font-size: 0.7rem;
  color: #ffd700;
  text-shadow: 0 0 2px #000;
  font-weight: bold;
}
.border-C {
  border-color: #bdbdbd;
}
.border-A {
  border-color: #ab47bc;
}
.border-S {
  border-color: var(--gold);
  box-shadow: 0 0 5px var(--gold);
}
.item-info {
  text-align: center;
}
.item-name {
  font-size: 0.9rem;
  font-weight: bold;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}
.text-C {
  color: #bdbdbd;
}
.text-A {
  color: #ab47bc;
}
.text-S {
  color: var(--gold);
}
.item-stats {
  font-size: 0.75rem;
  color: #aaa;
}
.slot-actions {
  width: 100%;
  display: flex;
  gap: 5px;
}
.btn-action {
  flex: 1;
  border: none;
  padding: 5px;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.8rem;
  border-radius: 2px;
}
.btn-equip {
  background: #2e7d32;
  color: #fff;
}
.btn-unequip {
  background: #c62828;
  color: #fff;
}
.custom-scroll::-webkit-scrollbar {
  width: 5px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #5d4037;
}
</style>
