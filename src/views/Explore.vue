<template>
  <div class="page-container explore-page">
    <div class="status-hud glass-panel">
      <div class="stat-item">❤️ {{ charStore.character?.hp }}/{{ charStore.character?.maxHp }}</div>
      <div class="stat-item">⚡ {{ charStore.character?.energy }}/{{ charStore.character?.maxEnergy }}</div>
      <div class="stat-item gold">💰 {{ authStore.wallet?.gold }}</div>
    </div>

    <div class="game-scene">
      <div class="scene-background" :style="{ backgroundPosition: bgPosition + 'px 0' }"></div>

      <transition name="float-up">
        <div v-if="showExp" class="exp-popup">+{{ lastExp }} EXP</div>
      </transition>

      <div class="actor player" :class="{ walking: isMoving }">
        <div class="avatar-glow">
          <div class="char-emoji">{{ charStore.character?.name.charAt(0) || '🧙' }}</div>
        </div>
      </div>

      <div class="actor target" v-if="targetType" :style="{ left: targetLeft + '%' }">
        <div class="target-icon" :class="targetType">
          <span v-if="targetType === 'ENEMY'">👿</span>
          <span v-if="targetType === 'GOLD'">💰</span>
        </div>
      </div>
    </div>

    <div class="control-deck">
      <div class="log-screen custom-scroll">
        <div v-for="(log, i) in recentLogs" :key="i" class="log-line" :class="log.type">
          <span class="time">[{{ new Date(log.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}]</span>
          <span v-html="log.message"></span>
        </div>
      </div>

      <div class="action-pad">
        <button class="btn-explore" @mousedown="startMoving" @mouseup="stopMoving" @touchstart="startMoving"
          @touchend="stopMoving" :disabled="isBusy || charStore.character?.energy <= 0" :class="{ active: isMoving }">
          <div class="btn-inner">
            <i class="fas fa-shoe-prints"></i>
            <span>{{ isMoving ? 'ĐANG TÌM...' : 'GIỮ ĐỂ ĐI' }}</span>
          </div>
        </button>

        <div class="side-btns">
          <button class="btn-small" @click="$router.push('/village')"><i class="fas fa-home"></i> LÀNG</button>
          <button class="btn-small" @click="$router.push('/inventory')"><i class="fas fa-box"></i> TÚI</button>
        </div>
      </div>
    </div>
    <CaptchaModal ref="captchaModal" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useCharacterStore } from '../stores/characterStore';
import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'vue-router';
import CaptchaModal from '../components/CaptchaModal.vue';

const charStore = useCharacterStore();
const authStore = useAuthStore();
const router = useRouter();
const captchaModal = ref(null);

const bgPosition = ref(0);
const isMoving = ref(false);
const isBusy = ref(false);
const targetType = ref(null);
const targetLeft = ref(120);
const showExp = ref(false);
const lastExp = ref(0);
let moveInterval = null;
let eventTimer = null;

const recentLogs = computed(() => charStore.logs.slice(0, 5));

const startMoving = () => {
  if (isBusy.value || charStore.character?.energy <= 0) return;
  isMoving.value = true;
  targetType.value = null; targetLeft.value = 120;
  moveInterval = setInterval(() => { bgPosition.value -= 15; }, 30);
  eventTimer = setTimeout(triggerEvent, 1200);
};

const stopMoving = () => {
  isMoving.value = false;
  if (moveInterval) clearInterval(moveInterval);
  if (eventTimer) clearTimeout(eventTimer);
};

const triggerEvent = async () => {
  stopMoving();
  isBusy.value = true;
  try {
    const result = await charStore.explore();
    if (result.type === 'ERROR') { /* Handle error */ }
    else {
      if (result.expGained > 0) {
        lastExp.value = result.expGained;
        showExp.value = true; setTimeout(() => showExp.value = false, 1000);
      }
      if (result.type === 'ENEMY') {
        targetType.value = 'ENEMY'; animateTargetEntry();
        setTimeout(() => router.push('/battle'), 1500);
      } else if (result.type === 'GOLD') {
        targetType.value = 'GOLD'; animateTargetEntry();
        authStore.fetchProfile();
        setTimeout(() => isBusy.value = false, 1500);
      } else {
        isBusy.value = false;
      }
    }
  } catch (e) {
    if (e.message === 'CAPTCHA') captchaModal.value.open();
    isBusy.value = false;
  }
};

const animateTargetEntry = () => {
  const anim = setInterval(() => {
    targetLeft.value -= 5;
    if (targetLeft.value <= 60) clearInterval(anim);
  }, 20);
};

onMounted(() => { charStore.fetchCharacter(); authStore.fetchProfile(); });
onUnmounted(() => stopMoving());
</script>

<style scoped>
.explore-page {
  background: #050505;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.status-hud {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 20px;
  padding: 10px 20px;
  z-index: 100;
  font-weight: bold;
  border: 1px solid #333;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 30px;
  color: #fff;
}

.gold {
  color: #ffd700;
}

.game-scene {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #111;
  border-bottom: 2px solid #333;
}

.scene-background {
  position: absolute;
  inset: 0;
  background-image: url('https://raw.githubusercontent.com/htkhang111/fe-game-fi/refs/heads/main/src/assets/img/forest.png');
  background-size: cover;
  background-repeat: repeat-x;
  opacity: 0.8;
}

.actor {
  position: absolute;
  bottom: 20%;
  left: 20%;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.2s;
}

.actor.target {
  left: auto;
}

.avatar-glow {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #000;
  border: 3px solid #00f3ff;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 0 20px rgba(0, 243, 255, 0.5);
}

.char-emoji {
  font-size: 40px;
}

.walking .avatar-glow {
  animation: bounce 0.4s infinite alternate;
}

.target-icon {
  font-size: 60px;
  filter: drop-shadow(0 0 10px red);
}

.target-icon.GOLD {
  filter: drop-shadow(0 0 10px gold);
}

@keyframes bounce {
  from {
    transform: translateY(0);
  }

  to {
    transform: translateY(-10px);
  }
}

.exp-popup {
  position: absolute;
  top: 40%;
  left: 22%;
  color: #00f3ff;
  font-weight: bold;
  font-size: 1.5em;
  text-shadow: 0 0 5px #000;
  animation: floatUp 1s forwards;
  z-index: 10;
}

@keyframes floatUp {
  to {
    transform: translateY(-50px);
    opacity: 0;
  }
}

.control-deck {
  height: 250px;
  background: #0b1121;
  display: flex;
  padding: 15px;
  gap: 15px;
}

.log-screen {
  flex: 1;
  background: #000;
  border: 1px solid #333;
  padding: 10px;
  font-family: monospace;
  font-size: 0.85em;
  color: #aaa;
}

.log-line {
  margin-bottom: 4px;
  border-bottom: 1px solid #222;
}

.log-line.GOLD {
  color: #ffd700;
}

.log-line.ENEMY {
  color: #ff0055;
}

.time {
  color: #555;
  margin-right: 5px;
}

.action-pad {
  width: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.btn-explore {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 4px solid #333;
  background: #1e293b;
  color: #00f3ff;
  cursor: pointer;
  transition: 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.btn-explore.active {
  border-color: #00f3ff;
  background: #000;
  box-shadow: 0 0 30px #00f3ff;
  transform: scale(0.95);
}

.btn-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.btn-inner i {
  font-size: 2em;
  margin-bottom: 5px;
}

.btn-inner span {
  font-size: 0.7em;
  font-weight: bold;
}

.side-btns {
  display: flex;
  gap: 5px;
}

.btn-small {
  background: #333;
  border: none;
  color: #fff;
  padding: 5px 10px;
  font-size: 0.7em;
  border-radius: 4px;
  cursor: pointer;
}
</style>