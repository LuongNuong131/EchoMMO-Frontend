<template>
  <div class="dashboard-container">
    
    <div class="command-header">
      <div class="header-left">
        <div class="sys-badge">
          <span class="status-dot online">●</span> MÁY CHỦ: ỔN ĐỊNH
        </div>
        <h1 class="welcome-text">
          CHÀO MỪNG, 
          <span class="user-rank">{{ authStore.user?.username || "ĐẠI HIỆP" }}</span>
        </h1>
        <div class="player-stats">
          <span class="stat-pill"> <i class="fas fa-signal"></i> 12ms </span>
          <span class="stat-pill"> <i class="fas fa-server"></i> S1 - HẮC LONG </span>
          <span class="stat-pill gold-pill"> <i class="fas fa-coins"></i> VIP 0 </span>
        </div>
      </div>
      
      <div class="header-right">
        <div class="weather-widget">
          <div class="weather-icon"><i class="fas fa-cloud-moon"></i></div>
          <div class="weather-info">
            <span class="location">LẠC DƯƠNG THÀNH</span>
            <span class="temp">Giờ Hợi - Trăng Khuyết</span>
          </div>
        </div>
      </div>
    </div>

    <div class="command-grid">
      
      <router-link to="/game" class="cmd-card play-card">
        <div class="card-bg-ink"></div>
        <div class="card-content">
          <div class="play-content-left">
            <div class="icon-wrapper">
              <i class="fas fa-dragon"></i>
            </div>
            <div class="text-group">
              <h2>NHẬP THẾ</h2>
              <p>BƯỚC VÀO GIANG HỒ</p>
            </div>
          </div>
          <div class="play-arrow">
            <i class="fas fa-chevron-right"></i>
          </div>
        </div>
        <div class="card-shine"></div>
      </router-link>

      <router-link to="/inventory" class="cmd-card wood-card">
        <div class="card-content vertical">
          <div class="icon-circle"><i class="fas fa-box-open"></i></div>
          <h3>HÀNH TRANG</h3>
          <p>Vật Phẩm & Bảo Bối</p>
        </div>
      </router-link>

      <router-link to="/market" class="cmd-card wood-card">
        <div class="card-content vertical">
          <div class="icon-circle"><i class="fas fa-store-alt"></i></div>
          <h3>THƯƠNG HỘI</h3>
          <p>Giao Thương Tự Do</p>
        </div>
      </router-link>

      <router-link to="/leaderboard" class="cmd-card wood-card">
        <div class="card-content vertical">
          <div class="icon-circle"><i class="fas fa-trophy"></i></div>
          <h3>BẢNG VÀNG</h3>
          <p>Danh Chấn Thiên Hạ</p>
        </div>
      </router-link>

      <router-link
        v-if="authStore.user?.role === 'ADMIN'"
        to="/admin"
        class="cmd-card admin-card"
      >
        <div class="card-content vertical">
          <div class="icon-circle"><i class="fas fa-gavel"></i></div>
          <h3>QUAN PHỦ</h3>
          <p>Điều Hành Hệ Thống</p>
        </div>
      </router-link>

       <div v-else class="cmd-card locked-card">
        <div class="card-content vertical">
          <div class="icon-circle"><i class="fas fa-lock"></i></div>
          <h3>SẮP RA MẮT</h3>
          <p>Tính năng đang phát triển</p>
        </div>
       </div>

    </div>

    <div class="news-ticker-box">
      <div class="ticker-label"><i class="fas fa-scroll"></i> CÁO THỊ</div>
      <div class="ticker-track">
        <div class="ticker-content">
          <span class="ticker-item highlight">💎 SỰ KIỆN: Nhân đôi kinh nghiệm toàn server</span>
          <span class="ticker-separator">❖</span>
          <span class="ticker-item">⚠️ BẢO TRÌ: Giờ Tý canh ba để nâng cấp hệ thống</span>
          <span class="ticker-separator">❖</span>
          <span class="ticker-item highlight-red">⚔️ BOSS: Hắc Long đã xuất hiện tại Bắc Sơn!</span>
          <span class="ticker-separator">❖</span>
          <span class="ticker-item">🎉 CHÚC MỪNG: Đại hiệp [Mèo Mập] vừa đập đồ lên +15</span>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useAuthStore } from "../stores/authStore";

const authStore = useAuthStore();

onMounted(() => {
  if (authStore.token) authStore.fetchProfile();
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Noto+Serif+TC:wght@500;700;900&display=swap");

/* --- VARIABLES --- */
:root {
  --paper-bg: #e3d5b8;
  --wood-dark: #3e2723;
  --wood-light: #5d4037;
  --red-seal: #b71c1c;
  --gold: #ffecb3;
  --text-light: #fff8e1;
}

.dashboard-container {
  /* Không set height 100vh ở đây để tránh scroll lồng nhau với Layout */
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding-top: 10px;
}

/* --- HEADER --- */
.command-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding-bottom: 20px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  background: radial-gradient(ellipse at bottom, rgba(255,255,255,0.05) 0%, transparent 70%);
}

.sys-badge {
  font-family: "Noto Serif TC", serif;
  font-size: 0.9rem;
  font-weight: bold;
  color: var(--gold);
  margin-bottom: 5px;
  display: flex; align-items: center; gap: 8px;
  text-shadow: 1px 1px 2px #000;
}
.status-dot { color: #4caf50; font-size: 1.2em; text-shadow: 0 0 5px #4caf50; animation: pulse-dot 2s infinite; }
@keyframes pulse-dot { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }

.welcome-text {
  font-size: 2.2rem; font-weight: 900; margin: 0; line-height: 1.1; color: #ffffff;
  text-shadow: 0 4px 4px rgba(0, 0, 0, 0.8);
  font-family: "Noto Serif TC";
}
.user-rank { color: var(--gold); text-shadow: 0 0 10px rgba(255, 215, 0, 0.6); }

.player-stats { display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap; }
.stat-pill {
  font-size: 0.8rem; color: #fff; background: rgba(0, 0, 0, 0.6);
  padding: 4px 12px; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex; align-items: center; gap: 6px; font-weight: bold;
}
.gold-pill { border-color: var(--gold); color: var(--gold); }

.weather-widget {
  background: rgba(0, 0, 0, 0.6); padding: 10px 20px; border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1); display: flex; align-items: center; gap: 15px;
  backdrop-filter: blur(5px);
}
.weather-icon i { font-size: 1.8rem; color: var(--gold); }
.weather-info { display: flex; flex-direction: column; text-align: right; font-family: "Noto Serif TC"; }
.location { font-size: 0.8rem; color: var(--gold); font-weight: bold; letter-spacing: 1px; }
.temp { font-size: 0.95rem; color: #fff; font-weight: bold; }

/* --- GRID SYSTEM --- */
.command-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3 Cột */
  grid-auto-rows: 180px; /* Chiều cao cố định mỗi hàng */
  gap: 20px;
}

/* Card Styles */
.cmd-card {
  position: relative; text-decoration: none;
  background: var(--paper-bg);
  border: 4px solid var(--wood-light); border-radius: 6px;
  overflow: hidden; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex; flex-direction: column;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  background-image: url("https://www.transparenttextures.com/patterns/aged-paper.png");
}

.cmd-card:hover { transform: translateY(-5px); border-color: var(--gold); box-shadow: 0 15px 30px rgba(0, 0, 0, 0.5); }

.card-content { position: relative; z-index: 2; padding: 20px; height: 100%; width: 100%; box-sizing: border-box; }
.card-content.vertical { display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }

.icon-circle {
  width: 50px; height: 50px; border-radius: 50%; background: var(--wood-dark);
  display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: var(--paper-bg);
  margin-bottom: 10px; border: 2px solid var(--gold); transition: all 0.3s ease;
}
.cmd-card:hover .icon-circle { background: var(--red-seal); color: #fff; transform: scale(1.1) rotate(10deg); }

h3 { margin: 0; font-family: "Noto Serif TC"; font-size: 1.2rem; color: #212121; font-weight: 900; }
p { margin: 5px 0 0; color: #4e342e; font-size: 0.9rem; font-weight: 600; }

/* --- PLAY CARD (SPECIAL) --- */
.play-card {
  grid-column: span 2; grid-row: span 2; /* Chiếm 2x2 ô */
  background: #1a0f0a; border-color: var(--gold);
}
.play-card h2 { font-family: "Noto Serif TC"; font-size: 3.5rem; margin: 0; color: #fff; text-shadow: 0 0 20px rgba(0, 0, 0, 0.8); line-height: 1; }
.play-card p { color: var(--gold); font-size: 1.1rem; letter-spacing: 4px; border-top: 2px solid var(--red-seal); padding-top: 10px; display: inline-block; }
.card-bg-ink { position: absolute; inset: 0; background: radial-gradient(circle at center, rgba(78, 52, 46, 0.8) 0%, #000000 100%); z-index: 1; }

.play-card .card-content { display: flex; justify-content: space-between; align-items: center; padding: 40px; }
.play-content-left { display: flex; flex-direction: column; gap: 20px; }
.play-card .icon-wrapper i { font-size: 4rem; color: var(--gold); filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.3)); margin-bottom: 10px; }

.play-arrow {
  width: 70px; height: 70px; border-radius: 50%; border: 3px solid #fff;
  display: flex; align-items: center; justify-content: center; font-size: 1.8rem; color: #fff;
  background: var(--red-seal); transition: all 0.3s ease;
  box-shadow: 0 0 20px rgba(183, 28, 28, 0.6);
}
.play-card:hover .play-arrow { background: #fff; color: var(--red-seal); transform: scale(1.1); box-shadow: 0 0 30px #fff; }

/* Hiệu ứng bóng láng (Shine) */
.card-shine {
  position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
  background: linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent);
  transform: skewX(-25deg); transition: 0.5s; pointer-events: none; z-index: 5;
}
.cmd-card:hover .card-shine { left: 150%; transition: 0.5s; }

/* --- LOCKED & ADMIN --- */
.locked-card { background: #cfd8dc; filter: grayscale(100%); opacity: 0.7; cursor: not-allowed; border-color: #90a4ae; }
.admin-card { background: #263238; border-color: #455a64; }
.admin-card h3 { color: #fff; }
.admin-card p { color: #b0bec5; }

/* --- NEWS TICKER --- */
.news-ticker-box {
  background: var(--wood-dark); border: 2px solid var(--gold); border-radius: 4px;
  height: 40px; display: flex; overflow: hidden; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  margin-top: auto; /* Đẩy xuống dưới cùng nếu grid ngắn */
}
.ticker-label {
  background: var(--gold); color: #3e2723; padding: 0 15px; display: flex; align-items: center;
  font-weight: 900; font-family: "Noto Serif TC"; font-size: 0.9rem; gap: 8px; z-index: 5;
  white-space: nowrap;
}
.ticker-track { flex: 1; display: flex; align-items: center; overflow: hidden; background: rgba(0,0,0,0.3); }
.ticker-content { display: flex; white-space: nowrap; animation: ticker 40s linear infinite; padding-left: 100%; }
.ticker-item { color: #e0e0e0; font-family: "Noto Serif TC"; font-size: 0.95rem; display: flex; align-items: center; }
.ticker-item.highlight { color: var(--gold); font-weight: bold; }
.ticker-item.highlight-red { color: #ff5252; font-weight: bold; text-shadow: 0 0 5px rgba(255, 82, 82, 0.5); }
.ticker-separator { margin: 0 30px; color: #5d4037; font-size: 0.7em; }

@keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }

/* --- RESPONSIVE --- */
@media (max-width: 900px) {
  .command-grid { grid-template-columns: 1fr 1fr; } /* Tablet: 2 cột */
  /* Play card vẫn to, chiếm full width tablet nếu muốn, hoặc thu nhỏ lại */
}

@media (max-width: 600px) {
  .command-header { flex-direction: column; align-items: flex-start; gap: 15px; }
  .header-right { width: 100%; }
  .weather-widget { width: 100%; justify-content: space-between; }
  
  .command-grid { grid-template-columns: 1fr; } /* Mobile: 1 cột */
  .play-card { grid-column: span 1; grid-row: span 1; height: 250px; } /* Play card về bình thường */
  .play-card h2 { font-size: 2.5rem; }
  .play-card .card-content { padding: 20px; }
  .play-card .icon-wrapper i { font-size: 3rem; }
}
</style>