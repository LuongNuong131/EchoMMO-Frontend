// src/utils/assetHelper.js

// --- IMPORT ẢNH NHÂN VẬT (YASUO) ---
import yasuoIdle from '@/assets/char/idle_yasou.png';
import yasuoAtk from '@/assets/char/atk_yasou.png';
import yasuoRun from '@/assets/char/run_yasou.png';

// --- IMPORT ẢNH QUÁI VẬT ---
import goblinIdle from '@/assets/enemy/idle_goblin.png';
import skeletonIdle from '@/assets/enemy/idle_skeleton.png';
import mushroomIdle from '@/assets/enemy/idle_mushroom.png';
import goblinAtk from '@/assets/enemy/atk_goblin.png';
import skeletonAtk from '@/assets/enemy/atk_skeleton.png';
import mushroomAtk from '@/assets/enemy/atk_mushroom.png';

// --- IMPORT ITEM ---
import goldCoin from '@/assets/resources/r_gold_coin.png';
import woodLog from '@/assets/resources/r_go.png';
import stoneItem from '@/assets/resources/stone_1.png';
import copperBar from '@/assets/resources/r_copper_bar.png';

// ============================================================
// 1. HỆ THỐNG SKINS (NHÂN VẬT)
// ============================================================
export const CHARACTER_SKINS = {
    "skin_yasou": {
        id: "skin_yasou",
        name: "Lãng Khách",
        description: "Kẻ lang thang với thanh kiếm gió.",
        sprites: {
            idle: yasuoIdle,
            run: yasuoRun,
            attack: yasuoAtk
        }
    }
    // Bạn có thể thêm skin khác vào đây (ví dụ Ninja...)
};

// [HÀM QUAN TRỌNG] Lấy Skin hiện tại
export const getCurrentSkin = (avatarUrl) => {
    // Nếu avatarUrl có trong danh sách skin thì trả về skin đó
    if (avatarUrl && CHARACTER_SKINS[avatarUrl]) {
        return CHARACTER_SKINS[avatarUrl];
    }
    // Fallback mặc định là Yasuo (nếu user chưa chọn hoặc lỗi)
    return CHARACTER_SKINS["skin_yasou"];
};

// ============================================================
// 2. HỆ THỐNG QUÁI VẬT & ITEM
// ============================================================
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