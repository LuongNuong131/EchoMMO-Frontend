// src/utils/assetHelper.js

import { reactive } from 'vue';

// ============================================================
// 1. IMPORT NHÂN VẬT & QUÁI (GIỮ NGUYÊN CŨ)
// ============================================================
import yasuoIdle from '@/assets/char/idle_yasou.png';
import yasuoAtk from '@/assets/char/atk_yasou.png';
import yasuoRun from '@/assets/char/run_yasou.png';
import demonIdle from '@/assets/char/idle_demon1.png';
import demonAtk from '@/assets/char/atk_demon1.png';
import demonRun from '@/assets/char/run_demon1.png';
import langkhachIdle from '@/assets/char/idle_langkhach1.png';
import langkhachAtk from '@/assets/char/atk_langkhach1.png';
import langkhachRun from '@/assets/char/run_langkhach1.png';

import goblinIdle from '@/assets/enemy/idle_goblin.png';
import skeletonIdle from '@/assets/enemy/idle_skeleton.png';
import mushroomIdle from '@/assets/enemy/idle_mushroom.png';
import goblinAtk from '@/assets/enemy/atk_goblin.png';
import skeletonAtk from '@/assets/enemy/atk_skeleton.png';
import mushroomAtk from '@/assets/enemy/atk_mushroom.png';

import goldCoin from '@/assets/resources/r_gold_coin.png';
import woodLog from '@/assets/resources/r_go.png';
import stoneItem from '@/assets/resources/stone_1.png';
import copperBar from '@/assets/resources/r_copper_bar.png';

// ============================================================
// 2. IMPORT TRANG BỊ MỚI (NEW ASSETS)
// ============================================================
// Sword
import sword0 from '@/assets/equipment/sword/s_sword_0.png';
import sword1 from '@/assets/equipment/sword/s_sword_1.png';
import sword2 from '@/assets/equipment/sword/s_sword_2.png';
import sword3 from '@/assets/equipment/sword/s_sword_3.png';
import sword4 from '@/assets/equipment/sword/s_sword_4.png';

// Armor
import armor0 from '@/assets/equipment/armor/a_armor_0.png';
import armor1 from '@/assets/equipment/armor/a_armor_1.png';
import armor2 from '@/assets/equipment/armor/a_armor_2.png';
import armor3 from '@/assets/equipment/armor/a_armor_3.png';
import armor4 from '@/assets/equipment/armor/a_armor_4.png';

// Helmet
import helmet0 from '@/assets/equipment/helmet/h_helmet_0.png';
import helmet1 from '@/assets/equipment/helmet/h_helmet_1.png';
import helmet2 from '@/assets/equipment/helmet/h_helmet_2.png';
import helmet3 from '@/assets/equipment/helmet/h_helmet_3.png';
import helmet4 from '@/assets/equipment/helmet/h_helmet_4.png';

// Boots
import boot0 from '@/assets/equipment/boots/b_boot_0.png';
import boot1 from '@/assets/equipment/boots/b_boot_1.png';
import boot2 from '@/assets/equipment/boots/b_boot_2.png';
import boot3 from '@/assets/equipment/boots/b_boot_3.png';
import boot4 from '@/assets/equipment/boots/b_boot_4.png';

// Ring
import ring0 from '@/assets/equipment/ring/ri_ring_0.png';
import ring1 from '@/assets/equipment/ring/ri_ring_1.png';
import ring2 from '@/assets/equipment/ring/ri_ring_2.png';
import ring3 from '@/assets/equipment/ring/ri_ring_3.png';
import ring4 from '@/assets/equipment/ring/ri_ring_4.png';

// Necklace
import neck0 from '@/assets/equipment/necklace/n_necklace_0.png';
import neck1 from '@/assets/equipment/necklace/n_necklace_1.png';
import neck2 from '@/assets/equipment/necklace/n_necklace_2.png';
import neck3 from '@/assets/equipment/necklace/n_necklace_3.png';
import neck4 from '@/assets/equipment/necklace/n_necklace_4.png';

// ============================================================
// 3. HÀM MAPPING ITEM IMAGE
// ============================================================
const itemMap = {
    // Mapping dựa trên tên file hoặc mã code từ backend
    's_sword_0': sword0, 's_sword_1': sword1, 's_sword_2': sword2, 's_sword_3': sword3, 's_sword_4': sword4,
    'a_armor_0': armor0, 'a_armor_1': armor1, 'a_armor_2': armor2, 'a_armor_3': armor3, 'a_armor_4': armor4,
    'h_helmet_0': helmet0, 'h_helmet_1': helmet1, 'h_helmet_2': helmet2, 'h_helmet_3': helmet3, 'h_helmet_4': helmet4,
    'b_boot_0': boot0, 'b_boot_1': boot1, 'b_boot_2': boot2, 'b_boot_3': boot3, 'b_boot_4': boot4,
    'ri_ring_0': ring0, 'ri_ring_1': ring1, 'ri_ring_2': ring2, 'ri_ring_3': ring3, 'ri_ring_4': ring4,
    'n_neck_0': neck0, 'n_neck_1': neck1, 'n_neck_2': neck2, 'n_neck_3': neck3, 'n_neck_4': neck4,

    // Resource
    'gold': goldCoin, 'wood': woodLog, 'stone': stoneItem, 'copper': copperBar
};

export const resolveItemImage = (imgCode) => {
    if (!imgCode) return copperBar; // Fallback
    // Nếu imgCode là URL đầy đủ (http...) thì trả về luôn
    if (imgCode.startsWith('http')) return imgCode;
    // Nếu là mã (ví dụ: 's_sword_1') thì lấy từ map
    return itemMap[imgCode] || copperBar;
};

// ============================================================
// 4. CẤU HÌNH SKINS (GIỮ NGUYÊN)
// ============================================================
export const CHARACTER_SKINS = reactive({
    "skin_yasou": { id: "skin_yasou", name: "Yasuo", description: "Kẻ bất dung thứ.", sprites: { idle: yasuoIdle, run: yasuoRun, attack: yasuoAtk } },
    "skin_demon": { id: "skin_demon", name: "Huyết Quỷ", description: "Sức mạnh từ bóng tối.", sprites: { idle: demonIdle, run: demonRun, attack: demonAtk } },
    "skin_langkhach": { id: "skin_langkhach", name: "Lãng Khách", description: "Kiếm khách vô danh.", sprites: { idle: langkhachIdle, run: langkhachRun, attack: langkhachAtk } }
});

export const getCurrentSkin = (avatarUrl) => {
    if (avatarUrl && CHARACTER_SKINS[avatarUrl]) return CHARACTER_SKINS[avatarUrl];
    return CHARACTER_SKINS["skin_yasou"];
};

// Helpers cũ giữ nguyên
const enemyMap = {
    "Yêu Tinh": { idle: goblinIdle, atk: goblinAtk },
    "Bộ Xương": { idle: skeletonIdle, atk: skeletonAtk },
    "Nấm Độc": { idle: mushroomIdle, atk: mushroomAtk },
    "default": { idle: goblinIdle, atk: goblinAtk }
};

export const getEnemyImage = (name, state = 'idle') => {
    const key = Object.keys(enemyMap).find(k => name && name.includes(k)) || "default";
    const target = enemyMap[key];
    return state === 'attack' ? target.atk : target.idle;
};

export const getItemImage = (type) => {
    switch (type) {
        case 'GOLD': return goldCoin;
        case 'WOOD': return woodLog;
        case 'STONE': return stoneItem;
        default: return copperBar;
    }
};

export const getRandomEnemyData = () => {
    const keys = Object.keys(enemyMap).filter(k => k !== 'default');
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return { name: randomKey, img: enemyMap[randomKey].idle };
};