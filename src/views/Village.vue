<template>
  <div class="page-container village-page bright-ancient-theme">
    <div class="bg-layer"></div>
    <div class="paper-overlay"></div>

    <div class="village-wrapper">
      <div class="hub-header">
        <div class="header-ornament left"></div>
        <div class="header-content">
          <h1 class="hub-title">
            <span class="ornament">❖</span> LẠC DƯƠNG THÀNH
            <span class="ornament">❖</span>
          </h1>
          <p class="hub-subtitle">Thành Trì Phồn Hoa - Thiên Hạ Thái Bình</p>
        </div>
        <div class="header-ornament right"></div>
      </div>

      <div class="hub-grid">
        <div class="place-card inn-card">
          <div class="card-border-frame"></div>
          <div class="card-content">
            <div class="icon-circle"><i class="fas fa-bed"></i></div>
            <h3>KHÁCH ĐIẾM</h3>
            <p class="card-desc">Nghỉ ngơi hồi phục sinh lực</p>

            <div class="status-monitor">
              <div class="monitor-row">
                <i class="fas fa-heart red-icon"></i>
                <div class="bar-track">
                  <div class="bar-fill red-fill" :style="{
                    width:
                      (charStore.character?.hp / charStore.character?.maxHp) *
                      100 +
                      '%',
                  }"></div>
                </div>
                <span class="status-text">{{ charStore.character?.hp }}/{{
                  charStore.character?.maxHp
                }}</span>
              </div>
              <div class="monitor-row">
                <i class="fas fa-bolt blue-icon"></i>
                <div class="bar-track">
                  <div class="bar-fill blue-fill" :style="{
                    width:
                      (charStore.character?.energy /
                        charStore.character?.maxEnergy) *
                      100 +
                      '%',
                  }"></div>
                </div>
                <span class="status-text">{{ charStore.character?.energy }}/{{
                  charStore.character?.maxEnergy
                }}</span>
              </div>
            </div>

            <button class="btn-wood full-width" @click="restAtInn" :disabled="isResting">
              <span v-if="!isResting"><i class="fas fa-coffee"></i> UỐNG TRÀ HỒI SỨC</span>
              <span v-else>ĐANG NGHỈ NGƠI... <i class="fas fa-spinner fa-spin"></i></span>
            </button>
          </div>
        </div>

        <router-link to="/market" class="place-card market-card">
          <div class="card-border-frame"></div>
          <div class="card-content">
            <div class="icon-circle gold"><i class="fas fa-store"></i></div>
            <h3>THƯƠNG HỘI</h3>
            <p class="card-desc">Giao dịch binh khí & đan dược</p>
            <div class="btn-wood action">VÀO CHỢ</div>
          </div>
        </router-link>

        <router-link to="/inventory" class="place-card bag-card">
          <div class="card-border-frame"></div>
          <div class="card-content">
            <div class="icon-circle brown"><i class="fas fa-box-open"></i></div>
            <h3>HÀNH TRANG</h3>
            <p class="card-desc">Kiểm tra túi đồ & trang bị</p>
            <div class="btn-wood action">XEM TÚI</div>
          </div>
        </router-link>

        <router-link to="/leaderboard" class="place-card board-card">
          <div class="card-border-frame"></div>
          <div class="card-content">
            <div class="icon-circle purple"><i class="fas fa-scroll"></i></div>
            <h3>ANH HÙNG BẢNG</h3>
            <p class="card-desc">Danh sách cao thủ giang hồ</p>
            <div class="btn-wood action">XEM BXH</div>
          </div>
        </router-link>
      </div>

      <div class="deploy-section">
        <button @click="$router.push('/explore')" class="btn-gate-bright">
          <div class="gate-content">
            <span class="big-text">XUẤT THÀNH</span>
            <span class="sub-text">Hành tẩu giang hồ - Trừ gian diệt ác</span>
          </div>
          <div class="gate-icon-wrapper">
            <i class="fas fa-dungeon"></i>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useCharacterStore } from "../stores/characterStore";

// KHÔNG import ảnh ở đây nữa để tránh lỗi đường dẫn
const charStore = useCharacterStore();
const isResting = ref(false);

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
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Cinzel:wght@400;700;900&display=swap");

/* --- PALETTE MÀU SÁNG (BRIGHT THEME) --- */
:root {
  --bg-paper: #fdf5e6;
  --wood-frame: #5d4037;
  --wood-light: #8d6e63;
  --text-ink: #2c1810;
  --gold-accent: #fbc02d;
  --red-accent: #b71c1c;
  --card-bg: #fffaf0;
  --shadow-soft: rgba(93, 64, 55, 0.2);
}

/* --- BASE LAYOUT --- */
.village-page.bright-ancient-theme {
  background-color: var(--bg-paper);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  font-family: "Playfair Display", serif;
  color: var(--text-ink);
}

.bg-layer {
  position: absolute;
  inset: 0;
  /* --- SỬA ĐƯỜNG DẪN Ở ĐÂY --- */
  /* Dùng ../ để lùi ra khỏi thư mục views, sau đó vào assets */
  background-image: url("../assets/Background/b_doanhtrai.png");
  background-size: cover;
  background-position: center;
  z-index: 0;
  opacity: 0.15;
}

.paper-overlay {
  position: absolute;
  inset: 0;
  background-image: url("https://www.transparenttextures.com/patterns/aged-paper.png");
  opacity: 0.5;
  z-index: 1;
  pointer-events: none;
}

.village-wrapper {
  position: relative;
  z-index: 10;
  max-width: 1100px;
  margin: 0 auto;
  padding: 80px 20px 40px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* --- HEADER --- */
.hub-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 40px;
  text-align: center;
}

.header-ornament {
  height: 2px;
  width: 80px;
  background: var(--wood-frame);
  position: relative;
}

.header-ornament::after {
  content: "♦";
  position: absolute;
  top: -10px;
  color: var(--wood-frame);
  font-size: 1.2em;
}

.header-ornament.left::after {
  right: 0;
}

.header-ornament.right::after {
  left: 0;
}

.hub-title {
  font-family: "Cinzel", serif;
  font-size: 2.8em;
  margin: 0;
  font-weight: 900;
  color: var(--text-ink);
  text-shadow: 2px 2px 0px rgba(255, 255, 255, 0.8);
  letter-spacing: 2px;
}

.hub-subtitle {
  color: #5d4037;
  font-style: italic;
  margin-top: 5px;
  font-size: 1.1em;
  font-weight: bold;
}

.ornament {
  color: var(--red-accent);
  font-size: 0.7em;
  vertical-align: middle;
}

/* --- GRID CARDS --- */
.hub-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 25px;
  margin-bottom: auto;
}

.place-card {
  position: relative;
  text-decoration: none;
  color: var(--text-ink);
  background-color: var(--card-bg);
  border: 1px solid #d7ccc8;
  border-radius: 8px;
  box-shadow: 0 5px 15px var(--shadow-soft);
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
  overflow: hidden;
}

.place-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(93, 64, 55, 0.3);
  border-color: var(--wood-light);
}

.card-border-frame {
  position: absolute;
  inset: 5px;
  border: 2px double var(--wood-light);
  border-radius: 6px;
  pointer-events: none;
}

.card-content {
  padding: 30px 20px;
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
}

/* ICON TRÒN SÁNG */
.icon-circle {
  font-size: 2em;
  margin-bottom: 15px;
  color: #fff;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--wood-light);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: 0.3s;
}

.place-card:hover .icon-circle {
  transform: scale(1.1);
}

/* Màu icon riêng từng loại */
.inn-card .icon-circle {
  background: #81c784;
}

.market-card .icon-circle {
  background: #ffb74d;
}

.bag-card .icon-circle {
  background: #a1887f;
}

.board-card .icon-circle {
  background: #9575cd;
}

.place-card h3 {
  font-family: "Cinzel", serif;
  font-size: 1.4em;
  margin: 0 0 8px;
  font-weight: bold;
  color: var(--text-ink);
}

.card-desc {
  font-size: 0.95em;
  color: #6d4c41;
  margin-bottom: 20px;
}

/* --- STATUS BAR (SÁNG) --- */
.status-monitor {
  width: 100%;
  margin-bottom: 20px;
  background: #f5f5f5;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.monitor-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.red-icon {
  color: #e53935;
}

.blue-icon {
  color: #1e88e5;
}

.bar-track {
  flex: 1;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s;
}

.red-fill {
  background: #e53935;
}

.blue-fill {
  background: #1e88e5;
}

.status-text {
  font-size: 0.8em;
  font-weight: bold;
  color: #616161;
  min-width: 60px;
  text-align: right;
}

/* --- BUTTONS (GỖ SÁNG) --- */
.btn-wood {
  width: 100%;
  padding: 10px;
  margin-top: auto;
  background: #fff;
  border: 2px solid var(--wood-light);
  color: var(--wood-frame);
  font-family: "Cinzel";
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-wood:hover:not(:disabled) {
  background: var(--wood-frame);
  color: #fff;
  border-color: var(--wood-frame);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-wood:disabled {
  background: #f5f5f5;
  color: #bdbdbd;
  border-color: #e0e0e0;
  cursor: not-allowed;
}

/* --- DEPLOY BUTTON (CỔNG THÀNH) --- */
.deploy-section {
  margin-top: 40px;
  text-align: center;
}

.btn-gate-bright {
  position: relative;
  width: 100%;
  max-width: 600px;
  background: linear-gradient(135deg, #b71c1c, #880e4f);
  color: #fff;
  border: 4px double #ffecb3;
  padding: 20px 30px;
  border-radius: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: 0.3s;
  box-shadow: 0 5px 15px rgba(183, 28, 28, 0.4);
}

.btn-gate-bright:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 20px rgba(183, 28, 28, 0.6);
}

.gate-content {
  text-align: left;
}

.big-text {
  display: block;
  font-family: "Cinzel", serif;
  font-size: 1.6em;
  font-weight: 900;
  color: #fff;
  letter-spacing: 1px;
}

.sub-text {
  display: block;
  font-size: 0.9em;
  color: #ffcdd2;
  font-weight: 500;
  margin-top: 2px;
}

.gate-icon-wrapper {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8em;
  color: #fff;
}

/* Responsive */
@media (max-width: 768px) {
  .hub-title {
    font-size: 2em;
  }

  .hub-grid {
    grid-template-columns: 1fr;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
  }
}
</style>