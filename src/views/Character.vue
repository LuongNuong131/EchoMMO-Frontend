<template>
    <div class="page-container character-page dark-fantasy-theme">
        <div class="char-grid">
            
            <div class="panel stats stat-panel-glow">
                <h3 class="panel-title-glow">❖ CHỈ SỐ ❖</h3>
                <div class="stat-row">
                    <span>Cấp Độ</span> 
                    <span class="hl">Lv.{{ charStore.character?.lv }}</span>
                </div>
                <div class="stat-row">
                    <span>CÔNG LỰC</span> 
                    <span class="val atk-val">{{ charStore.character?.baseAtk }}</span>
                </div>
                <div class="stat-row">
                    <span>PHÒNG THỦ</span> 
                    <span class="val def-val">{{ charStore.character?.baseDef }}</span>
                </div>
                <div class="stat-row">
                    <span>TỐC ĐỘ</span> 
                    <span class="val speed-val">{{ charStore.character?.baseSpeed }}</span>
                </div>
                <div class="stat-row">
                    <span>BẠO KÍCH</span> 
                    <span class="val crit-val">{{ charStore.character?.baseCritRate }}%</span>
                </div>
            </div>

            <div class="panel equip-center">
                <div class="char-model">
                    <div class="model-placeholder">⚔️</div>
                </div>
                
                <div 
                    class="slot head" 
                    @mousedown.left="unequipSlow('HELMET')" 
                    @contextmenu.prevent="unequipFast('HELMET')"
                    title="Mũ (Chuột trái: Hỏi, Chuột phải: Tháo nhanh)" 
                    :class="{ filled: equipment.HELMET }"
                >
                    <img v-if="equipment.HELMET" :src="equipment.HELMET.item.imageUrl" />
                    <i v-else class="fas fa-helmet placeholder-icon"></i>
                    <div class="item-glow" v-if="equipment.HELMET"></div>
                </div>
                <div 
                    class="slot weapon" 
                    @mousedown.left="unequipSlow('WEAPON')" 
                    @contextmenu.prevent="unequipFast('WEAPON')"
                    title="Vũ Khí (Chuột trái: Hỏi, Chuột phải: Tháo nhanh)" 
                    :class="{ filled: equipment.WEAPON }"
                >
                    <img v-if="equipment.WEAPON" :src="equipment.WEAPON.item.imageUrl" />
                    <i v-else class="fas fa-sword placeholder-icon"></i>
                    <div class="item-glow" v-if="equipment.WEAPON"></div>
                </div>
                <div 
                    class="slot body" 
                    @mousedown.left="unequipSlow('ARMOR')" 
                    @contextmenu.prevent="unequipFast('ARMOR')"
                    title="Áo (Chuột trái: Hỏi, Chuột phải: Tháo nhanh)" 
                    :class="{ filled: equipment.ARMOR }"
                >
                    <img v-if="equipment.ARMOR" :src="equipment.ARMOR.item.imageUrl" />
                    <i v-else class="fas fa-shield-alt placeholder-icon"></i>
                    <div class="item-glow" v-if="equipment.ARMOR"></div>
                </div>
                <div 
                    class="slot boots" 
                    @mousedown.left="unequipSlow('BOOTS')" 
                    @contextmenu.prevent="unequipFast('BOOTS')"
                    title="Giày (Chuột trái: Hỏi, Chuột phải: Tháo nhanh)" 
                    :class="{ filled: equipment.BOOTS }"
                >
                    <img v-if="equipment.BOOTS" :src="equipment.BOOTS.item.imageUrl" />
                    <i v-else class="fas fa-boot placeholder-icon"></i>
                    <div class="item-glow" v-if="equipment.BOOTS"></div>
                </div>
            </div>

            <div class="panel bag inventory-panel-glow">
                <div class="panel-head">
                    <i class="fas fa-sack-dollar"></i> TÚI ĐỒ 
                    <small>({{ inventoryStore.items.length }})</small>
                </div>
                <div class="bag-grid custom-scroll">
                    <div 
                        v-for="item in inventoryStore.items" 
                        :key="item.userItemId" 
                        class="bag-slot"
                        :class="{ 'equipped': item.isEquipped }" 
                        @click="equip(item)" 
                        :title="item.item.name"
                    >
                        <img :src="item.item.imageUrl || '/src/assets/item/ring_wood.png'" />
                        <span class="qty" v-if="item.quantity > 1">{{ item.quantity }}</span>
                        <div class="equipped-marker" v-if="item.isEquipped"></div>
                    </div>
                </div>
            </div>
        </div>

        <transition name="fade">
            <div v-if="showUnequipModal" class="custom-modal-overlay" @click.self="closeModal">
                <div class="custom-modal dark-fantasy-modal">
                    <div class="modal-header">
                        <i class="fas fa-exclamation-triangle"></i> XÁC NHẬN THÁO BỎ
                    </div>
                    <div class="modal-body" v-if="itemToUnequip">
                        <p class="modal-text">Bạn chắc chắn muốn **tháo bỏ** trang bị này?</p>
                        <div class="item-preview">
                            <img :src="itemToUnequip.item.imageUrl" :alt="itemToUnequip.item.name" class="item-thumb-modal">
                            <span class="item-name">{{ itemToUnequip.item.name }}</span>
                        </div>
                        <p class="warning-text">Trang bị này sẽ trở lại **Túi đồ** của bạn.</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-cancel" @click="closeModal">HỦY BỎ</button>
                        <button class="btn-confirm-unequip" @click="confirmUnequip">XÁC NHẬN THÁO</button>
                    </div>
                </div>
            </div>
        </transition>
        </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'; 
import { useCharacterStore } from '@/stores/characterStore';
import { useInventoryStore } from '@/stores/inventoryStore';

const charStore = useCharacterStore();
const inventoryStore = useInventoryStore();
const equipment = computed(() => inventoryStore.equippedItems);

// LOGIC MODAL (Dùng cho chuột trái)
const showUnequipModal = ref(false);
const itemToUnequip = ref(null);
const slotToUnequip = ref(null);

// Hàm tháo trang bị chậm (Mở Modal xác nhận) - Dùng cho chuột trái
const unequipSlow = (slotType) => {
    const item = equipment.value[slotType];
    if (item) {
        itemToUnequip.value = item;
        slotToUnequip.value = slotType;
        showUnequipModal.value = true;
    }
};

// Hàm tháo trang bị nhanh (Tháo ngay lập tức) - Dùng cho chuột phải
const unequipFast = async (slotType) => {
    const item = equipment.value[slotType];
    if (item) {
        await inventoryStore.unequipItem(item.userItemId);
    }
};

const confirmUnequip = async () => {
    if (itemToUnequip.value) {
        await inventoryStore.unequipItem(itemToUnequip.value.userItemId);
    }
    closeModal();
};

const closeModal = () => {
    showUnequipModal.value = false;
    itemToUnequip.value = null;
    slotToUnequip.value = null;
};
// KẾT THÚC LOGIC MODAL

const equip = async (item) => {
    // Logic trang bị (thường là chuột trái hoặc click)
    if (item.item.type === 'WEAPON' || item.item.type === 'ARMOR' || item.item.type === 'HELMET' || item.item.type === 'BOOTS') {
        if (!item.isEquipped) await inventoryStore.equipItem(item.userItemId);
    }
};

onMounted(() => { charStore.fetchCharacter(); inventoryStore.fetchInventory(); });
</script>

<style scoped>
/* Nhúng icon font awesome để có icon đẹp hơn */
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css");
@import url("https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;700&display=swap");

/* Biến màu mới */
:root {
    --bg-dark: #0f0f1a;
    --panel-dark: #1c1c2b;
    --highlight-gold: #ffc857;
    --highlight-red: #ff3366;
    --text-light: #f5f5f5;
    --border-dark: #3a3a50;
    --equipped-green: #37d399;
}

.character-page {
    padding: 30px; 
    background: var(--bg-dark);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--text-light);
    font-family: "Noto Serif TC", serif;
}

.char-grid {
    display: grid;
    grid-template-columns: 280px 320px 280px; 
    gap: 30px; 
    width: 100%;
    max-width: 1000px;
}

.panel {
    background: var(--panel-dark);
    border: 1px solid var(--border-dark);
    border-radius: 12px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
}

/* HIỆU ỨNG GLOW CHO PANEL CHỈ SỐ VÀ TÚI ĐỒ */
.stat-panel-glow {
    box-shadow: 0 0 10px rgba(255, 51, 102, 0.3); /* Red glow cho stats */
}
.inventory-panel-glow {
    box-shadow: 0 0 10px rgba(55, 211, 153, 0.3); /* Green glow cho inventory */
}

.panel-title-glow {
    text-align: center;
    font-weight: 700;
    color: var(--highlight-red);
    text-shadow: 0 0 5px var(--highlight-red);
    border-bottom: 2px solid var(--border-dark);
    padding-bottom: 12px;
    margin-bottom: 20px;
    font-size: 1.2em;
}

.panel-head {
    text-align: center;
    font-weight: 700;
    color: var(--highlight-gold);
    text-shadow: 0 0 5px rgba(255, 200, 87, 0.5);
    border-bottom: 2px solid var(--border-dark);
    padding-bottom: 12px;
    margin-bottom: 20px;
    font-size: 1.1em;
}
.panel-head small {
    color: var(--border-dark);
    margin-left: 5px;
    font-weight: 400;
}

/* CHỈ SỐ */
.stat-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    font-size: 1em;
    padding: 5px 0;
    border-bottom: 1px dashed rgba(255, 255, 255, 0.1);
    transition: background 0.3s;
}
.stat-row:hover {
    background: rgba(255, 255, 255, 0.05);
}

.hl {
    color: var(--highlight-gold);
    font-weight: bold;
}
.val {
    font-weight: bold;
    color: var(--text-light);
}

.atk-val { color: var(--highlight-red); }
.def-val { color: #5d8aa8; } 
.speed-val { color: #bdbd00; } 
.crit-val { color: var(--highlight-gold); }

/* TRANG BỊ VÀ NHÂN VẬT */
.equip-center {
    position: relative;
    align-items: center;
    justify-content: center;
    background-image: radial-gradient(circle, #3a3a50 0%, var(--bg-dark) 80%);
    min-height: 450px;
}

.char-model {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.model-placeholder {
    font-size: 8em;
    opacity: 0.15;
    filter: grayscale(1);
}

.slot {
    position: absolute;
    width: 60px; 
    height: 60px;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid var(--border-dark);
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s ease-out;
    overflow: hidden;
}

.slot:hover {
    border-color: var(--highlight-gold);
    box-shadow: 0 0 15px rgba(255, 200, 87, 0.5);
    transform: scale(1.05);
}

.slot img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 4px;
    z-index: 10;
}
.slot.filled {
    border-color: var(--equipped-green);
}

.placeholder-icon {
    font-size: 1.8em;
    color: var(--border-dark);
}

/* Ánh sáng glow cho item khi được trang bị */
.item-glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
    animation: itemPulse 3s infinite;
}
@keyframes itemPulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 0.8; }
}

/* TỌA ĐỘ SLOT */
.head {
    top: 50px;
    left: 50%;
    transform: translateX(-50%);
}
.weapon {
    left: 40px;
    top: 65%;
    transform: translateY(-50%);
}
.body {
    right: 40px;
    top: 65%;
    transform: translateY(-50%);
}
.boots {
    bottom: 50px;
    left: 50%;
    transform: translateX(-50%);
}

/* TÚI ĐỒ */
.bag-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px; 
    overflow-y: auto;
    max-height: 350px; 
    padding-right: 5px;
}

.bag-slot {
    width: 60px;
    height: 60px;
    background: #2a2a3b;
    border: 1px solid var(--border-dark);
    position: relative;
    cursor: pointer;
    transition: 0.2s;
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.6);
}

.bag-slot:hover {
    border-color: var(--highlight-gold);
    transform: translateY(-2px);
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.5);
}

.bag-slot img {
    width: 100%;
    height: 100%;
    padding: 4px;
    object-fit: contain;
}

.equipped {
    border-color: var(--equipped-green);
    opacity: 0.7; 
}

.equipped-marker {
    position: absolute;
    top: 0;
    right: 0;
    width: 8px;
    height: 8px;
    background-color: var(--equipped-green);
    border-radius: 50%;
    box-shadow: 0 0 5px var(--equipped-green);
    z-index: 10;
}

.qty {
    position: absolute;
    bottom: 2px;
    right: 2px;
    background: rgba(0, 0, 0, 0.8);
    color: #fff;
    font-size: 0.7em;
    padding: 0 3px;
    border-radius: 2px;
}

/* CUSTOM SCROLLBAR (cho Túi đồ) */
.custom-scroll::-webkit-scrollbar {
    width: 6px;
}
.custom-scroll::-webkit-scrollbar-thumb {
    background: #8d6e63;
    border-radius: 3px;
}
.custom-scroll::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
}

/* --- CUSTOM MODAL STYLES --- */
.custom-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.custom-modal.dark-fantasy-modal {
    background: var(--panel-dark);
    border: 2px solid var(--highlight-red);
    border-radius: 10px;
    box-shadow: 0 0 25px rgba(255, 51, 102, 0.5);
    width: 350px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    animation: modal-in 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

@keyframes modal-in {
    from {
        opacity: 0;
        transform: scale(0.9);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

.modal-header {
    font-size: 1.3em;
    font-weight: bold;
    color: var(--highlight-red);
    border-bottom: 2px solid var(--border-dark);
    padding-bottom: 10px;
    margin-bottom: 15px;
    text-align: center;
}

.modal-body {
    text-align: center;
    margin-bottom: 20px;
}

.modal-text {
    margin-bottom: 10px;
    color: var(--text-light);
    font-size: 0.95em;
}

.item-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 10px 0;
    padding: 10px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 5px;
}

.item-thumb-modal {
    width: 40px;
    height: 40px;
    border: 1px solid var(--equipped-green);
    border-radius: 3px;
    margin-right: 10px;
    padding: 2px;
}

.item-name {
    font-weight: bold;
    color: var(--highlight-gold);
}

.warning-text {
    font-size: 0.8em;
    color: var(--border-dark);
    margin-top: 10px;
}

.modal-footer {
    display: flex;
    justify-content: space-between;
    gap: 15px;
}

.btn-cancel, .btn-confirm-unequip {
    padding: 10px 15px;
    border: none;
    border-radius: 5px;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
    flex-grow: 1;
}

.btn-cancel {
    background: var(--border-dark);
    color: var(--text-light);
}

.btn-cancel:hover {
    background: #5a5a70;
}

.btn-confirm-unequip {
    background: var(--highlight-red);
    color: white;
    box-shadow: 0 0 10px rgba(255, 51, 102, 0.5);
}

.btn-confirm-unequip:hover {
    background: #e62250;
    transform: translateY(-1px);
}
</style>