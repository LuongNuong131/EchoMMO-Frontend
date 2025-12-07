<!-- <template>
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
            <div class="seal-mark">THÀNH</div>
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
              <span v-if="!isResting">NGHỈ NGƠI (50💰)</span>
              <span v-else>ĐANG HỒI PHỤC...</span>
            </button>
          </div>
          <div class="nail n-tl"></div>
          <div class="nail n-tr"></div>
          <div class="nail n-bl"></div>
          <div class="nail n-br"></div>
        </div>

        <router-link to="/market" class="wood-card market-card">
          <div class="card-inner">
            <div class="card-icon-frame gold-border"><i class="fas fa-coins"></i></div>
            <h3 class="card-name">THƯƠNG HỘI</h3>
            <p class="card-desc">Giao thương buôn bán</p>
            <div class="btn-plaque action">VÀO CHỢ</div>
          </div>
          <div class="nail n-tl"></div>
          <div class="nail n-tr"></div>
          <div class="nail n-bl"></div>
          <div class="nail n-br"></div>
        </router-link>

        <router-link to="/inventory" class="wood-card bag-card">
          <div class="card-inner">
            <div class="card-icon-frame wood-border"><i class="fas fa-box"></i></div>
            <h3 class="card-name">HÀNH TRANG</h3>
            <p class="card-desc">Hành lý mang theo</p>
            <div class="btn-plaque action">MỞ TÚI</div>
          </div>
          <div class="nail n-tl"></div>
          <div class="nail n-tr"></div>
          <div class="nail n-bl"></div>
          <div class="nail n-br"></div>
        </router-link>

        <router-link to="/leaderboard" class="wood-card board-card">
          <div class="card-inner">
            <div class="card-icon-frame jade-border"><i class="fas fa-scroll"></i></div>
            <h3 class="card-name">BẢNG VÀNG</h3>
            <p class="card-desc">Danh chấn giang hồ</p>
            <div class="btn-plaque action">XEM BẢNG</div>
          </div>
          <div class="nail n-tl"></div>
          <div class="nail n-tr"></div>
          <div class="nail n-bl"></div>
          <div class="nail n-br"></div>
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
import { useAuthStore } from "../stores/authStore"; // Import mới
import axiosClient from "../api/axiosClient";       // Import mới

const charStore = useCharacterStore();
const authStore = useAuthStore(); // Sử dụng AuthStore
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

  // Kiểm tra tiền trước khi gọi API
  if ((authStore.wallet?.gold || 0) < 50) {
    alert("Tiểu nhị: 'Khách quan không đủ ngân lượng (50 Xu)!'");
    return;
  }

  isResting.value = true;
  try {
    await axiosClient.post(`/game/rest?playerId=${authStore.user.userId}`);

    // Giả lập delay
    await new Promise((r) => setTimeout(r, 1500));

    // Refresh data
    await charStore.fetchCharacter();
    await authStore.fetchProfile(); // Để cập nhật số vàng hiển thị

    alert("Tiểu nhị: 'Chúc khách quan thượng lộ bình an!'");
  } catch (e) {
    alert(e.response?.data?.message || "Có lỗi xảy ra khi nghỉ ngơi.");
  } finally {
    isResting.value = false;
  }
};

onMounted(() => {
  charStore.fetchCharacter();
  // Đảm bảo có thông tin ví để check tiền
  if (authStore.token) authStore.fetchProfile();
});
</script>

<style scoped>
/* (Giữ nguyên phần style cũ của bạn) */
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Noto+Serif+TC:wght@500;700;900&display=swap");

:root {
  --paper-bg: #eaddcf;
  --wood-dark: #3e2723;
  --wood-mid: #5d4037;
  --wood-light: #8d6e63;
  --ink: #1a1a1a;
  --red-seal: #8a1c1c;
  --gold-antique: #c5a059;
  --jade: #388e3c;
}

.village-page.ancient-wood-theme {
  background-color: var(--paper-bg);
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  font-family: "Noto Serif TC", serif;
  color: var(--wood-dark);
}

.bg-layer {
  position: absolute;
  inset: 0;
  background-image: url("@/assets/Background/b_doanhtrai.png");
  background-size: cover;
  background-position: center;
  opacity: 0.25;
  filter: sepia(0.4) contrast(1.1) brightness(0.9);
  z-index: 0;
}

.paper-texture {
  position: absolute;
  inset: 0;
  background-image: url("https://www.transparenttextures.com/patterns/aged-paper.png");
  opacity: 0.5;
  z-index: 1;
  pointer-events: none;
}

.screen-border {
  position: fixed;
  inset: 0;
  border: 8px solid var(--wood-dark);
  pointer-events: none;
  z-index: 999;
  box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.5);
}

.village-wrapper {
  position: relative;
  z-index: 10;
  max-width: 1000px;
  margin: 0 auto;
  padding: 60px 20px 40px;
  display: flex;
  flex-direction: column;
}

.hub-header {
  text-align: center;
  margin-bottom: 50px;
}

.header-scroll-decor {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.decor-line {
  height: 2px;
  width: 60px;
  background: var(--wood-dark);
  position: relative;
}

.decor-line::after {
  content: "✦";
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  color: var(--wood-dark);
}

.main-title-box {
  border: 4px double var(--wood-dark);
  padding: 10px 30px;
  background: var(--paper-bg);
  position: relative;
  box-shadow: 5px 5px 0 rgba(62, 39, 35, 0.2);
}

.hub-title {
  font-size: 2.8em;
  margin: 0;
  font-weight: 900;
  color: var(--ink);
  letter-spacing: 5px;
  text-transform: uppercase;
}

.seal-mark {
  position: absolute;
  top: -10px;
  right: -15px;
  width: 40px;
  height: 40px;
  background: var(--red-seal);
  color: #fff;
  font-size: 0.8em;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.3);
  transform: rotate(15deg);
  border: 1px solid #ffcdd2;
}

.hub-subtitle {
  margin-top: 15px;
  font-style: italic;
  color: var(--wood-mid);
  font-weight: bold;
}

.hub-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.wood-card {
  position: relative;
  background: #5d4037;
  padding: 6px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
  clip-path: polygon(10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px), 0 10px);
  transition: transform 0.3s;
  text-decoration: none;
}

.wood-card:hover {
  transform: translateY(-5px);
}

.card-inner {
  background: var(--paper-bg);
  height: 100%;
  padding: 25px 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  clip-path: polygon(5px 0, calc(100% - 5px) 0, 100% 5px, 100% calc(100% - 5px), calc(100% - 5px) 100%, 5px 100%, 0 calc(100% - 5px), 0 5px);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.nail {
  position: absolute;
  width: 6px;
  height: 6px;
  background: #261815;
  border-radius: 50%;
  z-index: 5;
  box-shadow: inset 1px 1px 1px rgba(255, 255, 255, 0.2);
}

.n-tl {
  top: 12px;
  left: 12px;
}

.n-tr {
  top: 12px;
  right: 12px;
}

.n-bl {
  bottom: 12px;
  left: 12px;
}

.n-br {
  bottom: 12px;
  right: 12px;
}

.card-icon-frame {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8em;
  color: var(--wood-dark);
  border: 2px solid var(--wood-dark);
  transform: rotate(45deg);
  margin-bottom: 20px;
  background: rgba(0, 0, 0, 0.05);
  box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.1);
}

.card-icon-frame i {
  transform: rotate(-45deg);
}

.gold-border {
  border-color: var(--gold-antique);
  color: #8d6e63;
}

.wood-border {
  border-color: var(--wood-mid);
  color: var(--wood-mid);
}

.jade-border {
  border-color: var(--jade);
  color: var(--jade);
}

.card-name {
  font-size: 1.4em;
  font-weight: 900;
  margin: 0 0 5px;
  color: var(--wood-dark);
  font-family: "Noto Serif TC";
}

.card-desc {
  font-size: 0.85em;
  color: var(--wood-light);
  margin-bottom: 20px;
  font-style: italic;
}

.status-scroll {
  width: 100%;
  margin-bottom: 15px;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.75em;
  font-weight: bold;
  width: 30px;
}

.stat-bar-frame {
  flex: 1;
  height: 6px;
  background: #ccc;
  border: 1px solid var(--wood-dark);
}

.stat-fill {
  height: 100%;
}

.red {
  background: #b71c1c;
}

.blue {
  background: #1565c0;
}

.btn-plaque {
  width: 100%;
  padding: 8px;
  margin-top: auto;
  background: var(--wood-dark);
  color: #eaddcf;
  border: 2px solid #5d4037;
  font-family: "Noto Serif TC";
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 3px 0 #261815;
  transition: 0.2s;
  position: relative;
  top: 0;
}

.btn-plaque:hover {
  background: #4e342e;
  top: -2px;
  box-shadow: 0 5px 0 #261815;
}

.btn-plaque:active {
  top: 2px;
  box-shadow: 0 1px 0 #261815;
}

.action {
  text-align: center;
  display: block;
  width: auto;
  min-width: 100px;
}

.deploy-section {
  text-align: center;
  margin-top: 20px;
}

.btn-imperial-seal {
  position: relative;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  background: #8a1c1c;
  color: #fff8e1;
  border: 4px double #d4af37;
  padding: 15px 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: 0.3s;
  box-shadow: 0 5px 0 #5c0b0b, 0 15px 20px rgba(0, 0, 0, 0.3);
  clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
}

.btn-imperial-seal:hover {
  transform: translateY(-2px);
  background: #9b2020;
  box-shadow: 0 7px 0 #5c0b0b;
}

.btn-imperial-seal:active {
  transform: translateY(3px);
  box-shadow: 0 2px 0 #5c0b0b;
}

.seal-content {
  text-align: left;
}

.seal-main-text {
  display: block;
  font-size: 1.5em;
  font-weight: 900;
  letter-spacing: 2px;
}

.seal-sub-text {
  font-size: 0.8em;
  color: #ffecb3;
  font-style: italic;
}

.seal-stamp {
  width: 50px;
  height: 50px;
  border: 2px solid #d4af37;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5em;
  color: #d4af37;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
  .hub-title {
    font-size: 2em;
  }

  .hub-grid {
    grid-template-columns: 1fr;
    max-width: 320px;
    margin: 0 auto 30px;
  }
}
</style> -->
<template>
  <div class="page-container village-page wuxia-theme">
    <div class="bg-landscape"></div>
    <div class="vignette-overlay"></div>
    
    <div class="village-wrapper">
      <div class="hub-header">
        <div class="title-plaque">
          <div class="plaque-ornament left"></div>
          <h1 class="hub-title">LẠC DƯƠNG THÀNH</h1>
          <div class="plaque-ornament right"></div>
        </div>
        <p class="hub-subtitle">
          <span class="ink-decor">~</span> Thiên Hạ Thái Bình <span class="ink-decor">~</span>
        </p>
      </div>

      <div class="hub-grid">
        
        <div class="location-card inn-card" :class="{ 'night-mode': isResting }">
          <div class="card-border">
            
            <template v-if="!isResting">
              <div class="card-header">
                <span class="icon-stamp"><i class="fas fa-bed"></i></span>
                <h3 class="card-name">KHÁCH ĐIẾM</h3>
              </div>
              
              <div class="card-body">
                <p class="desc">Hồi phục tinh lực, dưỡng sức đường xa.</p>
                
                <div class="stat-box">
                  <div class="stat-line">
                    <span class="label">Sinh Lực</span>
                    <div class="progress-track">
                      <div class="progress-bar hp-bar" :style="{ width: hpPercent + '%' }"></div>
                    </div>
                  </div>
                  <div class="stat-line">
                    <span class="label">Nội Lực</span>
                    <div class="progress-track">
                      <div class="progress-bar mp-bar" :style="{ width: energyPercent + '%' }"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card-footer">
                <button class="btn-action wuxia-btn" @click="restAtInn" :disabled="isResting">
                  <span class="btn-text">NGHỈ NGƠI (50 <i class="fas fa-coins text-gold"></i>)</span>
                </button>
              </div>
            </template>

            <template v-else>
              <div class="night-scene">
                <div class="moon"></div>
                <div class="stars">
                  <span></span><span></span><span></span>
                </div>
                <div class="sleeping-hero">
                  <i class="fas fa-user-injured"></i> <div class="zzz-container">
                    <span class="z-char">Z</span>
                    <span class="z-char">z</span>
                    <span class="z-char">.</span>
                  </div>
                </div>
                <div class="night-text">Đang hồi phục công lực...</div>
              </div>
            </template>

          </div>
        </div>

        <router-link to="/forge" class="location-card forge-card">
          <div class="card-border">
            <div class="card-header">
              <span class="icon-stamp forge-stamp"><i class="fas fa-hammer"></i></span>
              <h3 class="card-name">THẦN BINH CÁC</h3>
            </div>
            <div class="card-body">
              <p class="desc">Rèn đúc binh khí, cường hóa trang bị.</p>
              <div class="decor-forge-fire">
                <i class="fas fa-fire"></i>
              </div>
            </div>
            <div class="card-footer">
              <div class="btn-action wuxia-btn outline">
                <span class="btn-text">VÀO LÒ RÈN</span>
              </div>
            </div>
          </div>
        </router-link>

      </div>

      <div class="deploy-container">
        <button @click="$router.push('/explore')" class="imperial-seal-btn">
          <div class="seal-inner">
            <div class="seal-icon"><i class="fas fa-torii-gate"></i></div>
            <div class="seal-text">
              <span class="big">XUẤT THÀNH</span>
              <span class="small">Hành Hiệp Trượng Nghĩa</span>
            </div>
          </div>
        </button>
      </div>
    </div>

    <transition name="scroll-open">
      <div v-if="showRestModal" class="wuxia-modal-overlay" @click.self="closeRestModal">
        <div class="scroll-modal">
          <div class="scroll-handle top"></div>
          <div class="scroll-content">
            <div class="modal-stamp"><i class="fas fa-check"></i></div>
            <h3 class="modal-title">HỒI PHỤC HOÀN TẤT</h3>
            <p class="modal-msg">
              Tiểu nhị: <i>"Khách quan thần thái hồng hào, nội công sung mãn. Chúc ngài thượng lộ bình an!"</i>
            </p>
            <div class="modal-stats">
              <span class="stat-tag hp">Sinh Lực Đầy</span>
              <span class="stat-tag mp">Nội Lực Đầy</span>
            </div>
            <button class="btn-confirm" @click="closeRestModal">ĐA TẠ</button>
          </div>
          <div class="scroll-handle bottom"></div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from "vue"; 
import { useCharacterStore } from "../stores/characterStore";
import { useAuthStore } from "../stores/authStore"; 
import axiosClient from "../api/axiosClient"; 

const charStore = useCharacterStore();
const authStore = useAuthStore(); 
const isResting = ref(false);
const showRestModal = ref(false);
let restInterval = null; 

const hpPercent = computed(() => {
    if (!charStore.character || !charStore.character.maxHp) return 0;
    return (charStore.character.hp / charStore.character.maxHp) * 100;
});

const energyPercent = computed(() => {
    if (!charStore.character || !charStore.character.maxEnergy) return 0;
    return (charStore.character.energy / charStore.character.maxEnergy) * 100;
});

const closeRestModal = () => {
    showRestModal.value = false;
};

// Hàm kiểm tra trạng thái và tự động thức dậy
const checkStatusAndWakeUp = () => {
    // Kiểm tra nếu cả hai đã đầy (hoặc gần đầy > 99%)
    if (hpPercent.value >= 99 && energyPercent.value >= 99) {
        if (restInterval) clearInterval(restInterval); 
        restInterval = null;
        
        // Delay nhẹ 500ms để người dùng thấy thanh máu đầy rồi mới hiện thông báo
        setTimeout(() => {
            isResting.value = false; 
            showRestModal.value = true;
        }, 500);
    }
};

const restAtInn = async () => {
    if (isResting.value) return;

    if ((authStore.wallet?.gold || 0) < 50) {
        alert("Tiểu nhị: 'Khách quan không đủ ngân lượng (50 Xu)!'");
        return;
    }

    isResting.value = true;
    try {
        await axiosClient.post(`/game/rest?playerId=${authStore.user.userId}`);
        await authStore.fetchProfile(); 

        if (restInterval) clearInterval(restInterval);
        
        // Gọi API cập nhật mỗi giây
        restInterval = setInterval(async () => {
            await charStore.fetchCharacter(); 
            checkStatusAndWakeUp();
        }, 1000); 

    } catch (e) {
        if (restInterval) clearInterval(restInterval);
        isResting.value = false;
        alert(e.response?.data?.message || "Có lỗi xảy ra khi nghỉ ngơi.");
    }
};

onMounted(() => {
    charStore.fetchCharacter();
    if (authStore.token) authStore.fetchProfile();
});

// Watcher an toàn
watch([hpPercent, energyPercent], () => {
    if (isResting.value && hpPercent.value >= 99 && energyPercent.value >= 99) {
        checkStatusAndWakeUp();
    }
});

onUnmounted(() => {
    if (restInterval) {
        clearInterval(restInterval);
        restInterval = null;
    }
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Noto+Serif+TC:wght@400;700;900&display=swap");
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css");

/* --- BẢNG MÀU GIANG HỒ --- */
:root {
    --bg-dark: #121212;
    --paper-antique: #fdf5e6; /* Giấy cũ sáng */
    --wood-frame: #4e342e;    /* Khung gỗ tối */
    --ink-black: #1a1a1a;     /* Màu chữ */
    --red-lacquer: #b71c1c;   /* Đỏ son mài */
    --gold-leaf: #d4af37;     /* Vàng lá */
    --jade-green: #2e7d32;    /* Ngọc bích */
    --night-blue: #1a237e;    /* Màu đêm */
}

/* --- TỔNG THỂ --- */
.village-page.wuxia-theme {
    background-color: var(--bg-dark);
    min-height: 100vh;
    position: relative;
    overflow-x: hidden;
    font-family: "Noto Serif TC", serif;
    color: var(--ink-black);
}

/* Nền phong cảnh mờ */
.bg-landscape {
    position: absolute;
    inset: 0;
    background-image: url("https://images.unsplash.com/photo-1542640244-7e672d6bd4e8?q=80&w=2000&auto=format&fit=crop"); /* Ảnh núi non Trung Hoa */
    background-size: cover;
    background-position: center;
    opacity: 0.4;
    filter: sepia(30%) grayscale(20%);
    z-index: 0;
}

/* Vignette tối 4 góc */
.vignette-overlay {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle, transparent 40%, #000000 100%);
    z-index: 1;
    pointer-events: none;
}

.village-wrapper {
    position: relative;
    z-index: 10;
    max-width: 900px;
    margin: 0 auto;
    padding: 40px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

/* --- HEADER BIỂN HIỆU --- */
.hub-header {
    margin-bottom: 50px;
    text-align: center;
}

.title-plaque {
    background: var(--red-lacquer);
    padding: 10px 40px;
    border: 4px solid var(--gold-leaf);
    border-radius: 8px;
    box-shadow: 0 10px 20px rgba(0,0,0,0.6);
    display: inline-flex;
    align-items: center;
    position: relative;
}

.hub-title {
    margin: 0;
    font-size: 2.5em;
    color: var(--gold-leaf);
    text-transform: uppercase;
    letter-spacing: 5px;
    text-shadow: 2px 2px 0 #000;
}

.plaque-ornament {
    width: 10px;
    height: 10px;
    background: var(--gold-leaf);
    border-radius: 50%;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    box-shadow: inset 1px 1px 2px rgba(0,0,0,0.5);
}
.plaque-ornament.left { left: 15px; }
.plaque-ornament.right { right: 15px; }

.hub-subtitle {
    margin-top: 15px;
    color: #ccc;
    font-size: 1.1em;
    font-style: italic;
    text-shadow: 1px 1px 2px #000;
}
.ink-decor { font-weight: bold; color: var(--gold-leaf); }

/* --- GRID LAYOUT --- */
.hub-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    width: 100%;
    max-width: 800px;
    margin-bottom: 40px;
}

/* --- LOCATION CARD (CHUNG) --- */
.location-card {
    background: var(--wood-frame);
    padding: 8px; /* Viền gỗ bên ngoài */
    border-radius: 8px;
    box-shadow: 0 15px 30px rgba(0,0,0,0.5);
    transition: transform 0.3s, box-shadow 0.3s;
    text-decoration: none;
    cursor: default;
    position: relative;
    overflow: hidden;
}

.location-card:hover:not(.night-mode) {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.6);
}

.card-border {
    background: var(--paper-antique); /* Nền giấy bên trong */
    height: 100%;
    border: 2px solid #8d6e63;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    position: relative;
    background-image: url("https://www.transparenttextures.com/patterns/aged-paper.png");
}

/* Header của Card */
.card-header {
    margin-bottom: 15px;
    position: relative;
}

.icon-stamp {
    font-size: 2em;
    color: var(--wood-frame);
    border: 3px double var(--wood-frame);
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    margin: 0 auto 10px;
    background: rgba(0,0,0,0.05);
}

.card-name {
    margin: 0;
    font-size: 1.5em;
    font-weight: 900;
    color: var(--red-lacquer);
    border-bottom: 2px solid var(--gold-leaf);
    padding-bottom: 5px;
    display: inline-block;
}

.card-body {
    flex: 1;
    width: 100%;
}

.desc {
    font-size: 0.9em;
    color: #555;
    margin-bottom: 20px;
    font-style: italic;
}

/* THANH CHỈ SỐ */
.stat-box {
    width: 100%;
    background: rgba(0,0,0,0.03);
    padding: 10px;
    border-radius: 4px;
    border: 1px dashed #bbb;
}

.stat-line {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
}
.stat-line:last-child { margin-bottom: 0; }

.label {
    font-size: 0.8em;
    font-weight: bold;
    width: 60px;
    text-align: left;
    color: var(--wood-frame);
}

.progress-track {
    flex: 1;
    height: 8px;
    background: #ddd;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid #aaa;
}

.progress-bar {
    height: 100%;
    transition: width 0.5s ease;
}
.hp-bar { background: linear-gradient(90deg, #e53935, #b71c1c); }
.mp-bar { background: linear-gradient(90deg, #42a5f5, #1565c0); }

/* NÚT BẤM CỔ TRANG */
.wuxia-btn {
    width: 100%;
    padding: 10px;
    border: none;
    background: var(--red-lacquer);
    color: #fff;
    font-family: "Noto Serif TC";
    font-weight: bold;
    font-size: 1em;
    cursor: pointer;
    position: relative;
    clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
    transition: 0.2s;
    margin-top: 15px;
}

.wuxia-btn:hover {
    background: #d32f2f;
    transform: scale(1.02);
}

.wuxia-btn.outline {
    background: transparent;
    border: 2px solid var(--wood-frame);
    color: var(--wood-frame);
    clip-path: none;
    border-radius: 4px;
}
.wuxia-btn.outline:hover {
    background: var(--wood-frame);
    color: #fff;
}

.text-gold { color: var(--gold-leaf); }

/* --- TRẠNG THÁI NGỦ (NIGHT MODE) --- */
.night-mode {
    border-color: #333;
}
.night-mode .card-border {
    background: #0d1b2a; /* Nền xanh đen */
    background-image: none;
    color: #fff;
    border-color: #5c6bc0;
}

.night-scene {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    min-height: 250px;
}

.moon {
    width: 60px;
    height: 60px;
    background: #ffeb3b;
    border-radius: 50%;
    box-shadow: 0 0 20px rgba(255, 235, 59, 0.6);
    margin-bottom: 20px;
}

.sleeping-hero {
    font-size: 4em;
    color: #90caf9;
    position: relative;
}

.zzz-container {
    position: absolute;
    top: -20px;
    right: -20px;
    display: flex;
}

.z-char {
    color: #fff;
    font-weight: bold;
    animation: floatZ 2s infinite ease-in-out;
    opacity: 0;
}
.z-char:nth-child(1) { font-size: 1em; animation-delay: 0s; }
.z-char:nth-child(2) { font-size: 1.5em; animation-delay: 0.5s; }
.z-char:nth-child(3) { font-size: 2em; animation-delay: 1s; }

.night-text {
    margin-top: 20px;
    font-style: italic;
    color: #b39ddb;
}

@keyframes floatZ {
    0% { transform: translateY(0) translateX(0); opacity: 0; }
    50% { opacity: 1; }
    100% { transform: translateY(-20px) translateX(10px); opacity: 0; }
}

/* --- TRANG TRÍ LÒ RÈN --- */
.decor-forge-fire {
    font-size: 3em;
    color: #ff5722;
    margin-top: 10px;
    animation: fireFlicker 0.1s infinite alternate;
    text-align: center;
}
@keyframes fireFlicker {
    from { opacity: 0.8; transform: scale(0.95); text-shadow: 0 0 10px #ff5722; }
    to { opacity: 1; transform: scale(1.05); text-shadow: 0 0 20px #ffab91; }
}

/* --- NÚT LỆNH BÀI (XUẤT THÀNH) --- */
.deploy-container {
    width: 100%;
    max-width: 400px;
    margin-top: 20px;
}

.imperial-seal-btn {
    width: 100%;
    background: var(--red-lacquer);
    border: none;
    padding: 5px; /* Viền ngoài */
    border-radius: 8px;
    cursor: pointer;
    box-shadow: 0 5px 15px rgba(0,0,0,0.5);
    transition: transform 0.2s;
}

.imperial-seal-btn:hover {
    transform: translateY(-3px);
}

.seal-inner {
    border: 2px dashed var(--gold-leaf);
    padding: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
    border-radius: 4px;
}

.seal-icon {
    font-size: 2.5em;
    color: var(--gold-leaf);
}

.seal-text {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    color: var(--gold-leaf);
}

.seal-text .big {
    font-size: 1.8em;
    font-weight: 900;
    letter-spacing: 2px;
}

.seal-text .small {
    font-size: 0.9em;
    font-style: italic;
    color: #ffecb3;
}

/* --- MODAL CÁO THỊ (Scroll Modal) --- */
.wuxia-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
}

.scroll-modal {
    width: 90%;
    max-width: 400px;
    position: relative;
    display: flex;
    flex-direction: column;
    animation: openScroll 0.5s ease-out;
}

.scroll-handle {
    height: 20px;
    background: var(--wood-frame);
    border-radius: 10px;
    position: relative;
    box-shadow: 0 2px 5px rgba(0,0,0,0.5);
    z-index: 2;
}
.scroll-handle::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 10px;
    right: 10px;
    height: 2px;
    background: var(--gold-leaf);
    transform: translateY(-50%);
}

.scroll-content {
    background: var(--paper-antique);
    padding: 30px 20px;
    text-align: center;
    box-shadow: 0 0 20px rgba(0,0,0,0.5);
    border-left: 10px solid #f0e6d2; /* Giả gáy cuộn */
    border-right: 10px solid #f0e6d2;
    position: relative;
}

.modal-stamp {
    font-size: 3em;
    color: var(--jade-green);
    border: 3px solid var(--jade-green);
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 15px;
    transform: rotate(-10deg);
    opacity: 0.8;
}

.modal-title {
    color: var(--red-lacquer);
    font-weight: 900;
    font-size: 1.5em;
    margin-bottom: 15px;
    text-decoration: underline double;
}

.modal-msg {
    font-size: 1.1em;
    color: var(--wood-frame);
    margin-bottom: 20px;
    line-height: 1.5;
}

.modal-stats {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-bottom: 20px;
}

.stat-tag {
    background: var(--jade-green);
    color: #fff;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 0.85em;
    font-weight: bold;
}

.btn-confirm {
    background: var(--wood-frame);
    color: var(--gold-leaf);
    border: 2px solid var(--gold-leaf);
    padding: 10px 30px;
    font-family: "Noto Serif TC";
    font-weight: bold;
    cursor: pointer;
    font-size: 1.1em;
    transition: 0.2s;
}
.btn-confirm:hover {
    background: var(--ink-black);
}

@keyframes openScroll {
    from { transform: scaleY(0); opacity: 0; }
    to { transform: scaleY(1); opacity: 1; }
}

@media (max-width: 600px) {
    .hub-grid { grid-template-columns: 1fr; }
    .hub-title { font-size: 1.8em; }
}
</style>