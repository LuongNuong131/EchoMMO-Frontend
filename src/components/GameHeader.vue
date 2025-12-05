<template>
  <header class="game-header">
    <div class="header-texture"></div>
    <div class="header-border-bot"></div>

    <div class="spacer"></div>

    <div class="hud-container" v-if="authStore.token">
      
      <div class="resource-bank">
        <div class="res-module gold" title="Ngân Lượng">
          <div class="res-icon"><i class="fas fa-coins"></i></div>
          <div class="res-val">
            {{ formatNumber(authStore.wallet?.gold || 0) }}
          </div>
        </div>

        <div class="res-module jade mobile-hide" title="Linh Thạch">
          <div class="res-icon"><i class="fas fa-gem"></i></div>
          <div class="res-val">
            {{ formatNumber(authStore.wallet?.diamonds || 0) }}
          </div>
        </div>

        <div class="res-module energy" title="Chân Khí">
          <div class="res-icon"><i class="fas fa-bolt"></i></div>
          <div class="energy-track">
            <div
              class="energy-bar"
              :style="{ width: energyPercent + '%' }"
            ></div>
          </div>
          <div class="res-val small">
            {{ charStore.character?.energy || 0 }}
          </div>
        </div>
      </div>

      <router-link
        to="/notifications"
        class="noti-node"
        :class="{ 'has-signal': notiStore.unreadCount > 0 }"
      >
        <div class="noti-icon">
          <i class="fas fa-bell"></i>
        </div>
        <div class="noti-badge" v-if="notiStore.unreadCount > 0">
          {{ notiStore.unreadCount }}
        </div>
      </router-link>

      <router-link
        to="/profile"
        class="profile-link"
        v-if="charStore.character"
      >
        <div class="profile-info mobile-hide">
          <div class="char-name">{{ charStore.character.name }}</div>
          <div class="xp-track">
            <div class="xp-fill" :style="{ width: xpPercent + '%' }"></div>
          </div>
        </div>

        <div class="avatar-frame">
          <div class="frame-content">
            <img
              v-if="authStore.user?.avatarUrl"
              :src="authStore.user.avatarUrl"
              @error="$event.target.style.display = 'none'"
            />
            <div v-else class="fallback-avatar">
              {{ charStore.character.name.charAt(0) }}
            </div>
          </div>
          <div class="level-badge">{{ charStore.character.level }}</div>
        </div>
      </router-link>
    </div>
  </header>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useAuthStore } from "../stores/authStore";
import { useCharacterStore } from "../stores/characterStore";
import { useNotificationStore } from "../stores/notificationStore";

const authStore = useAuthStore();
const charStore = useCharacterStore();
const notiStore = useNotificationStore();

const xpPercent = computed(() => {
  if (!charStore.character) return 0;
  // Giả sử max exp là level * 100
  const needed = charStore.character.level * 100;
  return Math.min((charStore.character.currentExp / needed) * 100, 100);
});

const energyPercent = computed(() => {
  if (!charStore.character) return 0;
  return Math.min(
    (charStore.character.energy / charStore.character.maxEnergy) * 100,
    100
  );
});

const formatNumber = (n) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n;
};

onMounted(() => {
  if (authStore.token) {
    authStore.fetchProfile();
    charStore.fetchCharacter();
    notiStore.fetchUnreadCount();
  }
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Cinzel:wght@400;700&display=swap");

/* --- VARIABLES --- */
:root {
  --wood-dark: #3e2723;
  --wood-light: #5d4037;
  --gold-accent: #fbc02d;
  --red-seal: #b71c1c;
  --text-light: #fdf5e6;
}

/* --- MAIN HEADER --- */
.game-header {
  position: sticky;
  top: 0;
  z-index: 900;
  width: 100%;
  height: 60px; /* Gọn hơn chút so với bản cũ */
  background: #3e2723; /* Màu gỗ tối */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  font-family: "Cinzel", serif;
  box-shadow: 0 4px 10px rgba(0,0,0,0.5);
  border-bottom: 2px solid #5d4037;
}

/* Viền vàng dưới cùng tạo cảm giác sang trọng */
.header-border-bot {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--gold-accent), transparent);
}

.spacer { flex: 1; }

.hud-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

/* --- RESOURCES --- */
.resource-bank {
  display: flex;
  gap: 8px;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #5d4037;
}

.res-module {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 2px 6px;
}

.res-icon {
  font-size: 0.9em;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));
}

.res-val {
  font-weight: bold;
  font-size: 0.9em;
  color: #fdf5e6;
  font-family: "Cinzel", serif;
}

.res-val.small {
  font-size: 0.8em;
  color: #d7ccc8;
  min-width: 25px;
  text-align: right;
}

/* Colors */
.gold .res-icon { color: #ffd700; }
.gold .res-val { color: #ffd700; }

.jade .res-icon { color: #00e676; } /* Ngọc màu xanh */
.jade .res-val { color: #b9f6ca; }

.energy .res-icon { color: #29b6f6; } /* Khí màu xanh dương hoặc vàng */

/* Energy Bar (Thanh Khí) */
.energy-track {
  width: 50px;
  height: 6px;
  background: #261815;
  border: 1px solid #5d4037;
  border-radius: 2px;
  overflow: hidden;
}
.energy-bar {
  height: 100%;
  background: #29b6f6;
  transition: width 0.3s ease;
}

/* --- NOTIFICATIONS --- */
.noti-node {
  position: relative;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d7ccc8;
  transition: 0.3s;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 50%;
}

.noti-node:hover {
  color: #fbc02d;
  background: rgba(255,255,255,0.05);
  border-color: rgba(251, 192, 45, 0.3);
}

.noti-node.has-signal .noti-icon {
  animation: shake 2s infinite;
}

@keyframes shake {
  0%, 100% { transform: rotate(0); }
  10%, 30%, 50%, 70%, 90% { transform: rotate(-10deg); }
  20%, 40%, 60%, 80% { transform: rotate(10deg); }
}

.noti-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: #b71c1c; /* Đỏ chu sa */
  color: #fff;
  font-size: 0.65em;
  font-weight: bold;
  padding: 1px 4px;
  border-radius: 4px;
  border: 1px solid #3e2723;
  box-shadow: 1px 1px 3px rgba(0,0,0,0.5);
}

/* --- PROFILE LINK --- */
.profile-link {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  padding-left: 10px;
  border-left: 1px solid #5d4037;
  transition: 0.3s;
}
.profile-link:hover .char-name {
  color: #fbc02d;
}

.profile-info { text-align: right; }
.char-name {
  font-weight: bold;
  font-size: 0.95em;
  color: #fdf5e6;
  font-family: "Playfair Display", serif;
}

.xp-track {
  width: 70px;
  height: 3px;
  background: #261815;
  margin-top: 3px;
  margin-left: auto;
  border-radius: 1px;
}
.xp-fill {
  height: 100%;
  background: #fbc02d; /* Exp màu vàng kim */
  transition: width 0.5s;
}

/* Avatar Frame (Tròn) */
.avatar-frame {
  width: 40px;
  height: 40px;
  position: relative;
  border-radius: 50%;
  border: 2px solid #fbc02d; /* Viền vàng */
  box-shadow: 0 0 5px rgba(0,0,0,0.5);
  background: #1a1510;
}

.frame-content {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.frame-content img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fallback-avatar {
  font-weight: bold;
  font-size: 1.2em;
  color: #fbc02d;
  font-family: "Cinzel", serif;
}

.level-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: #b71c1c; /* Con dấu cấp độ màu đỏ */
  color: #fff;
  font-size: 0.7em;
  font-weight: bold;
  width: 18px;
  height: 18px;
  line-height: 18px;
  text-align: center;
  border-radius: 50%;
  border: 1px solid #fbc02d;
  font-family: "Cinzel", serif;
  box-shadow: 1px 1px 3px rgba(0,0,0,0.5);
}

/* Responsive */
@media (max-width: 600px) {
  .mobile-hide { display: none; }
  .resource-bank { gap: 5px; padding: 4px; }
  .energy-track { width: 30px; }
  .game-header { padding: 0 10px; }
}
</style>