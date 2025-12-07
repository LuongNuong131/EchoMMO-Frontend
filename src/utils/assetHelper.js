// src/utils/assetHelper.js

import { reactive } from 'vue';

// ============================================================
// 1. IMPORT ẢNH NHÂN VẬT (ĐÚNG TÊN FILE BẠN VỪA UP)
// ============================================================

// --- 1. YASUO (Mặc định) ---
import yasuoIdle from '@/assets/char/idle_yasou.png';
import yasuoAtk from '@/assets/char/atk_yasou.png';
import yasuoRun from '@/assets/char/run_yasou.png';

// --- 2. DEMON (Ma Tộc) ---
import demonIdle from '@/assets/char/idle_demon1.png';
import demonAtk from '@/assets/char/atk_demon1.png';
import demonRun from '@/assets/char/run_demon1.png';

// --- 3. LÃNG KHÁCH (Kiếm Khách) ---
import langkhachIdle from '@/assets/char/idle_langkhach1.png';
import langkhachAtk from '@/assets/char/atk_langkhach1.png';
import langkhachRun from '@/assets/char/run_langkhach1.png';

// ============================================================
// 2. IMPORT QUÁI VẬT & ITEM
// ============================================================
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
// 3. CẤU HÌNH HỆ THỐNG SKINS
// ============================================================
export const CHARACTER_SKINS = reactive({
    "skin_yasou": {
        id: "skin_yasou",
        name: "Yasuo",
        description: "Kẻ bất dung thứ.",
        sprites: {
            idle: yasuoIdle,
            run: yasuoRun,
            attack: yasuoAtk
        }
    },
    "skin_demon": {
        id: "skin_demon",
        name: "Huyết Quỷ",
        description: "Sức mạnh từ bóng tối.",
        sprites: {
            idle: demonIdle,
            run: demonRun,
            attack: demonAtk
        }
    },
    "skin_langkhach": {
        id: "skin_langkhach",
        name: "Lãng Khách",
        description: "Kiếm khách vô danh.",
        sprites: {
            idle: langkhachIdle,
            run: langkhachRun,
            attack: langkhachAtk
        }
    }
});

// Hàm lấy skin hiện tại
export const getCurrentSkin = (avatarUrl) => {
    // Nếu avatarUrl có trong danh sách skin (ví dụ "skin_demon")
    if (avatarUrl && CHARACTER_SKINS[avatarUrl]) {
        return CHARACTER_SKINS[avatarUrl];
    }
    // Mặc định trả về Yasuo
    return CHARACTER_SKINS["skin_yasou"];
};

// ... Các hàm khác giữ nguyên
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