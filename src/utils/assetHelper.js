// src/utils/assetHelper.js

// --- 1. NHÂN VẬT ---
import yasuoIdle from '@/assets/char/idle_yasou.png';
import yasuoAtk from '@/assets/char/atk_yasou.png';

// --- 2. QUÁI VẬT (Thống nhất 1 nguồn) ---
import goblinIdle from '@/assets/enemy/idle_goblin.png';
import goblinAtk from '@/assets/enemy/atk_goblin.png';

import skeletonIdle from '@/assets/enemy/idle_skeleton.png';
import skeletonAtk from '@/assets/enemy/atk_skeleton.png';

import mushroomIdle from '@/assets/enemy/idle_mushroom.png';
import mushroomAtk from '@/assets/enemy/atk_mushroom.png';

// --- 3. TÀI NGUYÊN & ITEM ---
import goldCoin from '@/assets/resources/r_gold_coin.png';
import woodLog from '@/assets/resources/r_go.png';       // Kiểm tra lại tên file thực tế trong máy bạn
import stoneItem from '@/assets/resources/stone_1.png';  // Kiểm tra lại tên file thực tế
import copperBar from '@/assets/resources/r_copper_bar.png';

// --- MAP DỮ LIỆU ---
// Key ở đây phải khớp với tên quái vật trả về từ Backend hoặc Random list
const enemyMap = {
    "Yêu Tinh": { idle: goblinIdle, atk: goblinAtk },
    "Bộ Xương": { idle: skeletonIdle, atk: skeletonAtk },
    "Nấm Độc": { idle: mushroomIdle, atk: mushroomAtk },
    // Fallback nếu không tìm thấy tên
    "default": { idle: goblinIdle, atk: goblinAtk }
};

// --- HÀM TRÍCH XUẤT (Export) ---

export const getEnemyImage = (name, state = 'idle') => {
    // Tìm trong map, nếu không có thì dùng default
    // Dùng .find để hỗ trợ tìm gần đúng (ví dụ "Yêu Tinh Rừng" vẫn ra "Yêu Tinh")
    const key = Object.keys(enemyMap).find(k => name && name.includes(k)) || "default";
    const target = enemyMap[key];
    return state === 'attack' ? target.atk : target.idle;
};

export const getCharImage = (state = 'idle') => {
    return state === 'attack' ? yasuoAtk : yasuoIdle;
};

export const getItemImage = (type) => {
    switch (type) {
        case 'GOLD': return goldCoin;
        case 'WOOD': return woodLog;
        case 'STONE': return stoneItem;
        default: return copperBar;
    }
};