<template>
  <div class="page-container explore-mmo">
    <div class="stats-bar glass-panel">
      <div class="stat"><i class="fas fa-heart text-red"></i> {{ charStore.character?.hp }}/{{
        charStore.character?.maxHp }}</div>
      <div class="stat"><i class="fas fa-bolt text-yellow"></i> {{ charStore.character?.energy }}/{{
        charStore.character?.maxEnergy }}</div>
      <div class="stat"><i class="fas fa-coins text-gold"></i> {{ authStore.wallet?.gold }}</div>
    </div>

    <div class="main-layout">
      <div class="action-zone">
        <div class="scene-viewer glass-panel">
          <div class="scene-bg" :class="currentBiome"></div>
          <div class="character-sprite">
            <div class="avatar-circle">
              {{ charStore.character?.name.charAt(0).toUpperCase() }}
            </div>
          </div>
          <transition name="pop">
            <div v-if="targetIcon" class="encounter-icon">{{ targetIcon }}</div>
          </transition>
        </div>

        <div class="controls">
          <button class="btn-step" @click="handleStep" :disabled="isBusy || charStore.character?.energy < 1"
            :class="{ 'disabled': charStore.character?.energy < 1 }">
            <div class="btn-content">
              <i class="fas fa-shoe-prints"></i>
              <span>BƯỚC TIẾP</span>
              <small>-1 Năng Lượng</small>
            </div>
          </button>

          <div class="sub-actions">
            <button class="btn-sub" @click="$router.push('/village')">
              <i class="fas fa-home"></i> Về Làng
            </button>
            <button class="btn-sub" @click="$router.push('/inventory')">
              <i class="fas fa-box"></i> Túi Đồ
            </button>
          </div>
        </div>
      </div>

      <div class="log-zone glass-panel custom-scroll">
        <div class="log-header">NHẬT KÝ HÀNH TRÌNH</div>
        <transition-group name="list" tag="div" class="log-list">
          <div v-for="(log, i) in charStore.logs" :key="log.id" class="log-item" :class="log.type">
            <span class="time">[{{ new Date(log.id).toLocaleTimeString([], {
              hour: '2-digit', minute: '2-digit',
              second:'2-digit'}) }}]</span>
            <span class="message" v-html="log.message"></span>
          </div>
        </transition-group>
        <div v-if="charStore.logs.length === 0" class="empty-log">
          Hãy bắt đầu bước đi để khám phá thế giới...
        </div>
      </div>
    </div>

    <CaptchaModal ref="captchaModal" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useCharacterStore } from '../stores/characterStore';
import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'vue-router';
import CaptchaModal from '../components/CaptchaModal.vue';

const charStore = useCharacterStore();
const authStore = useAuthStore();
const router = useRouter();
const captchaModal = ref(null);

const isBusy = ref(false);
const targetIcon = ref(null);
const currentBiome = ref('forest'); // Có thể đổi map sau này

const handleStep = async () => {
  if (isBusy.value) return;
  isBusy.value = true;
  targetIcon.value = null;

  try {
    const data = await charStore.explore();

    // Xử lý kết quả trả về
    if (data.type === 'ENEMY') {
      targetIcon.value = '👿';
      // Delay xíu để người dùng thấy log rồi mới chuyển cảnh
      setTimeout(() => router.push('/battle'), 800);
    } else if (data.type === 'GOLD') {
      targetIcon.value = '💰';
      authStore.fetchProfile(); // Cập nhật tiền
    } else if (data.type === 'MATERIAL') {
      targetIcon.value = '🪵';
      authStore.fetchProfile();
    } else if (data.type === 'EXP' || data.type === 'LEVEL_UP') {
      targetIcon.value = '✨';
    } else {
      targetIcon.value = '🍃';
    }

  } catch (e) {
    if (e.message === 'CAPTCHA') {
      captchaModal.value.open();
    }
  } finally {
    setTimeout(() => { isBusy.value = false; }, 300); // Cooldown nhẹ để tránh spam quá nhanh
  }
};

onMounted(() => {
  charStore.fetchCharacter();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');

.explore-mmo {
  background: #111;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 10px;
  gap: 10px;
  font-family: "Noto Serif TC", serif;
}

/* TOP STATS */
.stats-bar {
  display: flex;
  justify-content: space-around;
  padding: 15px;
  font-size: 1.2rem;
  font-weight: bold;
  color: #fff;
  background: #222;
  border: 1px solid #444;
}

.text-red {
  color: #ff5252;
}

.text-yellow {
  color: #ffd740;
}

.text-gold {
  color: #ffab00;
}

/* MAIN LAYOUT */
.main-layout {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  overflow: hidden;
}

/* ACTION ZONE (LEFT) */
.action-zone {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.scene-viewer {
  flex: 1;
  position: relative;
  background: #000;
  border: 2px solid #555;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scene-bg {
  position: absolute;
  inset: 0;
  background-image: url('https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=1000&auto=format&fit=crop');
  /* Rừng */
  background-size: cover;
  opacity: 0.4;
  transition: 0.5s;
}

.character-sprite {
  z-index: 2;
  position: relative;
  animation: breathe 3s infinite;
}

.avatar-circle {
  width: 80px;
  height: 80px;
  background: #3e2723;
  color: #ffecb3;
  border: 3px solid #ffecb3;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  box-shadow: 0 0 20px rgba(255, 236, 179, 0.4);
}

.encounter-icon {
  position: absolute;
  top: 20%;
  font-size: 4rem;
  z-index: 3;
  animation: floatUp 0.8s ease-out forwards;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn-step {
  padding: 20px;
  background: linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%);
  border: 2px solid #4caf50;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  transition: 0.1s;
  box-shadow: 0 5px 0 #1b5e20;
}

.btn-step:active {
  transform: translateY(5px);
  box-shadow: none;
}

.btn-step:disabled {
  background: #424242;
  border-color: #616161;
  box-shadow: none;
  cursor: not-allowed;
  opacity: 0.7;
}

.btn-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.btn-content span {
  font-size: 1.5rem;
  font-weight: 900;
}

.btn-content small {
  font-size: 0.9rem;
  opacity: 0.8;
}

.sub-actions {
  display: flex;
  gap: 10px;
}

.btn-sub {
  flex: 1;
  padding: 12px;
  background: #37474f;
  color: #eceff1;
  border: 1px solid #546e7a;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}

.btn-sub:hover {
  background: #455a64;
}

/* LOG ZONE (RIGHT) */
.log-zone {
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
  border: 1px solid #333;
  padding: 10px;
}

.log-header {
  text-align: center;
  font-weight: bold;
  color: #888;
  border-bottom: 1px dashed #444;
  padding-bottom: 10px;
  margin-bottom: 10px;
}

.log-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.log-item {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
  padding: 8px;
  border-left: 3px solid #555;
  background: rgba(255, 255, 255, 0.02);
  animation: slideIn 0.3s ease-out;
}

.log-item.GOLD {
  border-color: #ffab00;
  color: #ffecb3;
}

.log-item.EXP {
  border-color: #2979ff;
  color: #bbdefb;
}

.log-item.LEVEL_UP {
  border-color: #d500f9;
  color: #ea80fc;
  font-weight: bold;
  background: rgba(213, 0, 249, 0.1);
}

.log-item.ENEMY {
  border-color: #ff1744;
  color: #ff8a80;
}

.log-item.MATERIAL {
  border-color: #795548;
  color: #d7ccc8;
}

.time {
  color: #666;
  margin-right: 8px;
  font-size: 0.8rem;
}

/* ANIMATIONS */
@keyframes breathe {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }
}

@keyframes floatUp {
  0% {
    transform: translateY(0) scale(0.5);
    opacity: 0;
  }

  50% {
    opacity: 1;
  }

  100% {
    transform: translateY(-50px) scale(1.2);
    opacity: 0;
  }
}

@keyframes slideIn {
  from {
    transform: translateX(-10px);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .main-layout {
    grid-template-columns: 1fr;
  }

  .action-zone {
    height: 400px;
  }

  .log-zone {
    height: 300px;
  }
}
</style>