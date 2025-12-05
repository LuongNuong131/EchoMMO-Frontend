<template>
  <div class="page-container village-page ancient-wood-theme">
    <div class="bg-layer"></div>
    <div class="paper-texture"></div>
    <div class="screen-border"></div>

    <div class="village-wrapper">
      <div class="hub-header">
        <div class="header-scroll-decor">
          <span class="decor-line"></span>
          <div class="main-title-box">
            <h1 class="hub-title">LẠC DƯƠNG</h1>
            <div class="seal-mark">thành</div>
          </div>
          <span class="decor-line"></span>
        </div>
        <p class="hub-subtitle">-- Thiên Hạ Thái Bình --</p>
      </div>

      <div class="hub-grid">
        <div class="wood-card inn-card">
          <div class="card-inner">
            <div class="card-icon-frame">
              <i class="fas fa-bed"></i>
            </div>
            <h3 class="card-name">KHÁCH ĐIẾM</h3>
            <p class="card-desc">Hồi phục sinh lực</p>

            <div class="status-scroll">
              <div class="stat-row">
                <span class="stat-label">Sinh</span>
                <div class="stat-bar-frame">
                  <div class="stat-fill red" :style="{ width: hpPercent + '%' }"></div>
                </div>
              </div>
              <div class="stat-row">
                <span class="stat-label">Nội</span>
                <div class="stat-bar-frame">
                  <div class="stat-fill blue" :style="{ width: energyPercent + '%' }"></div>
                </div>
              </div>
            </div>

            <button class="btn-plaque" @click="restAtInn" :disabled="isResting">
              <span v-if="!isResting">UỐNG TRÀ</span>
              <span v-else>ĐANG NGHỈ...</span>
            </button>
          </div>
          <div class="nail n-tl"></div><div class="nail n-tr"></div>
          <div class="nail n-bl"></div><div class="nail n-br"></div>
        </div>

        <router-link to="/market" class="wood-card market-card">
          <div class="card-inner">
            <div class="card-icon-frame gold-border">
              <i class="fas fa-coins"></i>
            </div>
            <h3 class="card-name">THƯƠNG HỘI</h3>
            <p class="card-desc">Giao thương buôn bán</p>
            <div class="btn-plaque action">VÀO CHỢ</div>
          </div>
          <div class="nail n-tl"></div><div class="nail n-tr"></div>
          <div class="nail n-bl"></div><div class="nail n-br"></div>
        </router-link>

        <router-link to="/inventory" class="wood-card bag-card">
          <div class="card-inner">
            <div class="card-icon-frame wood-border">
              <i class="fas fa-box"></i>
            </div>
            <h3 class="card-name">HÀNH TRANG</h3>
            <p class="card-desc">Hành lý mang theo</p>
            <div class="btn-plaque action">MỞ TÚI</div>
          </div>
          <div class="nail n-tl"></div><div class="nail n-tr"></div>
          <div class="nail n-bl"></div><div class="nail n-br"></div>
        </router-link>

        <router-link to="/leaderboard" class="wood-card board-card">
          <div class="card-inner">
            <div class="card-icon-frame jade-border">
              <i class="fas fa-scroll"></i>
            </div>
            <h3 class="card-name">BẢNG VÀNG</h3>
            <p class="card-desc">Danh chấn giang hồ</p>
            <div class="btn-plaque action">XEM BẢNG</div>
          </div>
          <div class="nail n-tl"></div><div class="nail n-tr"></div>
          <div class="nail n-bl"></div><div class="nail n-br"></div>
        </router-link>
      </div>

      <div class="deploy-section">
        <button @click="$router.push('/explore')" class="btn-imperial-seal">
          <div class="seal-content">
            <span class="seal-main-text">XUẤT THÀNH</span>
            <span class="seal-sub-text">Hành Hiệp Trượng Nghĩa</span>
          </div>
          <div class="seal-stamp">
            <i class="fas fa-torii-gate"></i>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useCharacterStore } from "../stores/characterStore";

const charStore = useCharacterStore();
const isResting = ref(false);

const hpPercent = computed(() => {
  if (!charStore.character) return 0;
  return (charStore.character.hp / charStore.character.maxHp) * 100;
});

const energyPercent = computed(() => {
  if (!charStore.character) return 0;
  return (charStore.character.energy / charStore.character.maxEnergy) * 100;
});

const restAtInn = async () => {
  if (isResting.value) return;
  isResting.value = true;
  try {
    await new Promise((r) => setTimeout(r, 2000));
    await charStore.fetchCharacter();
  } catch (e) {
    console.error(e);
  } finally {
    isResting.value = false;
  }
};

onMounted(() => {
  charStore.fetchCharacter();
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Noto+Serif+TC:wght@500;700;900&display=swap");

/* --- CORE PALETTE (Màu Cổ) --- */
:root {
  --paper-bg: #eaddcf;      /* Giấy cũ */
  --wood-dark: #3e2723;     /* Gỗ đen */
  --wood-mid: #5d4037;      /* Gỗ nâu */
  --wood-light: #8d6e63;    /* Gỗ sáng */
  --ink: #1a1a1a;           /* Mực tàu */
  --red-seal: #8a1c1c;      /* Đỏ son trầm */
  --gold-antique: #c5a059;  /* Vàng đồng cổ */
  --jade: #388e3c;          /* Ngọc bích */
}

/* --- LAYOUT --- */
.village-page.ancient-wood-theme {
  background-color: var(--paper-bg);
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  font-family: "Noto Serif TC", serif;
  color: var(--wood-dark);
}

/* --- SỬA LẠI PHẦN NỀN --- */
.bg-layer {
  position: absolute; inset: 0;
  /* Khôi phục ảnh nền gốc của bạn */
  background-image: url("../assets/Background/b_doanhtrai.png");
  background-size: cover; background-position: center;
  /* Điều chỉnh độ mờ và màu sắc để hợp với theme gỗ tối */
  opacity: 0.25; 
  filter: sepia(0.4) contrast(1.1) brightness(0.9);
  z-index: 0;
}

.paper-texture {
  position: absolute; inset: 0;
  background-image: url("https://www.transparenttextures.com/patterns/aged-paper.png");
  opacity: 0.5; z-index: 1; pointer-events: none;
}

.screen-border {
  position: fixed; inset: 0;
  border: 8px solid var(--wood-dark);
  pointer-events: none; z-index: 999;
  box-shadow: inset 0 0 50px rgba(0,0,0,0.5);
}

.village-wrapper {
  position: relative; z-index: 10;
  max-width: 1000px; margin: 0 auto;
  padding: 60px 20px 40px;
  display: flex; flex-direction: column;
}

/* --- HEADER (Kiểu hoành phi câu đối) --- */
.hub-header {
  text-align: center; margin-bottom: 50px;
}

.header-scroll-decor {
  display: flex; align-items: center; justify-content: center; gap: 15px;
}

.decor-line {
  height: 2px; width: 60px; background: var(--wood-dark);
  position: relative;
}
.decor-line::after {
  content: "✦"; position: absolute; top: -10px; 
  left: 50%; transform: translateX(-50%); color: var(--wood-dark);
}

.main-title-box {
  border: 4px double var(--wood-dark);
  padding: 10px 30px;
  background: var(--paper-bg);
  position: relative;
  box-shadow: 5px 5px 0 rgba(62,39,35,0.2);
}

.hub-title {
  font-size: 2.8em; margin: 0; font-weight: 900;
  color: var(--ink); letter-spacing: 5px;
  text-transform: uppercase;
}

.seal-mark {
  position: absolute; top: -10px; right: -15px;
  width: 40px; height: 40px; background: var(--red-seal);
  color: #fff; font-size: 0.8em; font-weight: bold;
  display: flex; align-items: center; justify-content: center;
  border-radius: 4px; box-shadow: 2px 2px 2px rgba(0,0,0,0.3);
  transform: rotate(15deg);
  border: 1px solid #ffcdd2;
}

.hub-subtitle {
  margin-top: 15px; font-style: italic; color: var(--wood-mid); font-weight: bold;
}

/* --- GRID (Thẻ bài gỗ) --- */
.hub-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 30px; margin-bottom: 40px;
}

/* THẺ GỖ */
.wood-card {
  position: relative;
  background: #5d4037; /* Màu gỗ nền */
  padding: 6px; /* Viền gỗ ngoài */
  box-shadow: 0 10px 20px rgba(0,0,0,0.4);
  /* Cắt góc (Octagon shape) */
  clip-path: polygon(
    10px 0, calc(100% - 10px) 0, 
    100% 10px, 100% calc(100% - 10px), 
    calc(100% - 10px) 100%, 10px 100%, 
    0 calc(100% - 10px), 0 10px
  );
  transition: transform 0.3s;
  text-decoration: none;
}

.wood-card:hover { transform: translateY(-5px); }

.card-inner {
  background: var(--paper-bg); /* Giấy dán lên gỗ */
  height: 100%;
  padding: 25px 15px;
  display: flex; flex-direction: column; align-items: center;
  text-align: center;
  /* Cắt góc trong */
  clip-path: polygon(
    5px 0, calc(100% - 5px) 0, 
    100% 5px, 100% calc(100% - 5px), 
    calc(100% - 5px) 100%, 5px 100%, 
    0 calc(100% - 5px), 0 5px
  );
  border: 1px solid rgba(0,0,0,0.1);
}

/* ĐINH ỐC TRANG TRÍ */
.nail {
  position: absolute; width: 6px; height: 6px; background: #261815;
  border-radius: 50%; z-index: 5;
  box-shadow: inset 1px 1px 1px rgba(255,255,255,0.2);
}
.n-tl { top: 12px; left: 12px; }
.n-tr { top: 12px; right: 12px; }
.n-bl { bottom: 12px; left: 12px; }
.n-br { bottom: 12px; right: 12px; }

/* ICON */
.card-icon-frame {
  width: 60px; height: 60px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.8em; color: var(--wood-dark);
  border: 2px solid var(--wood-dark);
  transform: rotate(45deg); /* Hình thoi */
  margin-bottom: 20px;
  background: rgba(0,0,0,0.05);
  box-shadow: inset 2px 2px 5px rgba(0,0,0,0.1);
}
.card-icon-frame i { transform: rotate(-45deg); } /* Xoay icon lại */

.gold-border { border-color: var(--gold-antique); color: #8d6e63; }
.wood-border { border-color: var(--wood-mid); color: var(--wood-mid); }
.jade-border { border-color: var(--jade); color: var(--jade); }

.card-name {
  font-size: 1.4em; font-weight: 900; margin: 0 0 5px;
  color: var(--wood-dark); font-family: "Noto Serif TC";
}
.card-desc { font-size: 0.85em; color: var(--wood-light); margin-bottom: 20px; font-style: italic; }

/* STAT BARS */
.status-scroll { width: 100%; margin-bottom: 15px; }
.stat-row { display: flex; align-items: center; gap: 5px; margin-bottom: 5px; }
.stat-label { font-size: 0.75em; font-weight: bold; width: 30px; }
.stat-bar-frame { flex: 1; height: 6px; background: #ccc; border: 1px solid var(--wood-dark); }
.stat-fill { height: 100%; }
.red { background: #b71c1c; }
.blue { background: #1565c0; }

/* NÚT TRONG CARD (BTN PLAQUE) */
.btn-plaque {
  width: 100%; padding: 8px; margin-top: auto;
  background: var(--wood-dark); color: #eaddcf;
  border: 2px solid #5d4037;
  font-family: "Noto Serif TC"; font-weight: bold;
  cursor: pointer; box-shadow: 0 3px 0 #261815;
  transition: 0.2s; position: relative; top: 0;
}
.btn-plaque:hover { background: #4e342e; top: -2px; box-shadow: 0 5px 0 #261815; }
.btn-plaque:active { top: 2px; box-shadow: 0 1px 0 #261815; }
.action { text-align: center; display: block; width: auto; min-width: 100px;}

/* --- NÚT XUẤT THÀNH (IMPERIAL SEAL) --- */
.deploy-section { text-align: center; margin-top: 20px; }

.btn-imperial-seal {
  position: relative; width: 100%; max-width: 400px; margin: 0 auto;
  /* Màu đỏ son như ấn triện */
  background: #8a1c1c;
  color: #fff8e1;
  border: 4px double #d4af37; /* Viền vàng */
  padding: 15px 30px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: space-between;
  transition: 0.3s;
  box-shadow: 0 5px 0 #5c0b0b, 0 15px 20px rgba(0,0,0,0.3);
  /* Vát góc nhẹ */
  clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
}

.btn-imperial-seal:hover { transform: translateY(-2px); background: #9b2020; box-shadow: 0 7px 0 #5c0b0b; }
.btn-imperial-seal:active { transform: translateY(3px); box-shadow: 0 2px 0 #5c0b0b; }

.seal-content { text-align: left; }
.seal-main-text { display: block; font-size: 1.5em; font-weight: 900; letter-spacing: 2px; }
.seal-sub-text { font-size: 0.8em; color: #ffecb3; font-style: italic; }

.seal-stamp {
  width: 50px; height: 50px;
  border: 2px solid #d4af37;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5em; color: #d4af37;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.3);
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .hub-title { font-size: 2em; }
  .hub-grid { grid-template-columns: 1fr; max-width: 320px; margin: 0 auto 30px; }
}
</style>