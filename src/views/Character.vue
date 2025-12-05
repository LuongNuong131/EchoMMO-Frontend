<template>
    <div class="page-container character-page">
        <div class="char-grid">
            <div class="panel stats">
                <h3>CHỈ SỐ</h3>
                <div class="stat-row"><span>Cấp Độ</span> <span class="hl">Lv.{{ charStore.character?.lv }}</span></div>
                <div class="stat-row"><span>Công Lực</span> <span class="val">{{ charStore.character?.baseAtk }}</span>
                </div>
                <div class="stat-row"><span>Thủ Bị</span> <span class="val">{{ charStore.character?.baseDef }}</span>
                </div>
                <div class="stat-row"><span>Tốc Độ</span> <span>{{ charStore.character?.baseSpeed }}</span></div>
                <div class="stat-row"><span>Bạo Kích</span> <span>{{ charStore.character?.baseCritRate }}%</span></div>
            </div>

            <div class="panel equip-center">
                <div class="char-model">
                    <div class="model-placeholder">🧘</div>
                </div>
                <div class="slot head" @click="unequip('HELMET')" title="Mũ">
                    <img v-if="equipment.HELMET" :src="equipment.HELMET.item.imageUrl" />
                    <span v-else>⛑️</span>
                </div>
                <div class="slot weapon" @click="unequip('WEAPON')" title="Vũ Khí">
                    <img v-if="equipment.WEAPON" :src="equipment.WEAPON.item.imageUrl" />
                    <span v-else>⚔️</span>
                </div>
                <div class="slot body" @click="unequip('ARMOR')" title="Áo">
                    <img v-if="equipment.ARMOR" :src="equipment.ARMOR.item.imageUrl" />
                    <span v-else>👕</span>
                </div>
                <div class="slot boots" @click="unequip('BOOTS')" title="Giày">
                    <img v-if="equipment.BOOTS" :src="equipment.BOOTS.item.imageUrl" />
                    <span v-else>👢</span>
                </div>
            </div>

            <div class="panel bag">
                <div class="panel-head">🎒 TÚI ĐỒ</div>
                <div class="bag-grid custom-scroll">
                    <div v-for="item in inventoryStore.items" :key="item.userItemId" class="bag-slot"
                        :class="{ 'equipped': item.isEquipped }" @click="equip(item)" :title="item.item.name">
                        <img :src="item.item.imageUrl || '/src/assets/item/ring_wood.png'" />
                        <span class="qty" v-if="item.quantity > 1">{{ item.quantity }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useCharacterStore } from '@/stores/characterStore';
import { useInventoryStore } from '@/stores/inventoryStore';

const charStore = useCharacterStore();
const inventoryStore = useInventoryStore();
const equipment = computed(() => inventoryStore.equippedItems);

const unequip = async (slotType) => {
    if (equipment.value[slotType]) {
        if (confirm("Tháo trang bị này?")) {
            await inventoryStore.unequipItem(equipment.value[slotType].userItemId);
        }
    }
};

const equip = async (item) => {
    if (!item.isEquipped) await inventoryStore.equipItem(item.userItemId);
};

onMounted(() => { charStore.fetchCharacter(); inventoryStore.fetchInventory(); });
</script>

<style scoped>
.character-page {
    padding: 20px;
    background: #1a1a1a;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #d7ccc8;
    font-family: "Noto Serif TC";
}

.char-grid {
    display: grid;
    grid-template-columns: 250px 300px 250px;
    gap: 20px;
    width: 100%;
    max-width: 900px;
}

.panel {
    background: #261815;
    border: 2px solid #5d4037;
    border-radius: 8px;
    padding: 15px;
    display: flex;
    flex-direction: column;
}

.panel-head {
    text-align: center;
    font-weight: bold;
    color: #fbc02d;
    border-bottom: 1px solid #5d4037;
    padding-bottom: 10px;
    margin-bottom: 15px;
}

.stat-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 0.9em;
}

.hl {
    color: #fbc02d;
    font-weight: bold;
}

.val {
    font-weight: bold;
    color: #fff;
}

.equip-center {
    position: relative;
    align-items: center;
    justify-content: center;
    background-image: radial-gradient(circle, #3e2723 0%, #1a1a1a 70%);
}

.model-placeholder {
    font-size: 5em;
    opacity: 0.2;
    filter: grayscale(1);
}

.slot {
    position: absolute;
    width: 50px;
    height: 50px;
    background: rgba(0, 0, 0, 0.5);
    border: 2px solid #8d6e63;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: 0.2s;
}

.slot:hover {
    border-color: #fbc02d;
    box-shadow: 0 0 10px #fbc02d;
}

.slot img {
    width: 90%;
    height: 90%;
    object-fit: contain;
}

.head {
    top: 20px;
}

.weapon {
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
}

.armor {
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
}

.boots {
    bottom: 20px;
}

.bag-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 5px;
    overflow-y: auto;
    max-height: 300px;
}

.bag-slot {
    width: 50px;
    height: 50px;
    background: #3e2723;
    border: 1px solid #5d4037;
    position: relative;
    cursor: pointer;
}

.bag-slot:hover {
    border-color: #fff;
}

.bag-slot img {
    width: 100%;
    height: 100%;
    padding: 2px;
    object-fit: contain;
}

.equipped {
    border-color: #2e7d32;
    opacity: 0.5;
}

.qty {
    position: absolute;
    bottom: 0;
    right: 0;
    background: #000;
    color: #fff;
    font-size: 0.7em;
    padding: 0 3px;
}
</style>