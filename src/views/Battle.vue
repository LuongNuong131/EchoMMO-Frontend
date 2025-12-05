<template>
  <div class="page-container battle-arena">
    <div v-if="battleStore.status === 'IDLE'" class="start-screen glass-panel">
      <div class="radar-scan">
        <div class="radar-line"></div>
        <i class="fas fa-crosshairs center-icon"></i>
      </div>
      <h2 class="text-gradient">ĐANG TÌM MỤC TIÊU...</h2>
      <p>Khu vực: Rừng Hắc Ám (Cấp {{ charStore.character?.level }})</p>
      <div class="btn-group">
        <button @click="battleStore.startBattle()" class="btn-3d glitch-btn">
          <i class="fas fa-skull"></i> CHIẾN ĐẤU NGAY
        </button>
        <button @click="$router.push('/explore')" class="btn-3d btn-back">
          <i class="fas fa-running"></i> BỎ CHẠY
        </button>
      </div>
    </div>

    <div v-else class="combat-ui">
      <div class="combat-header">
        <div class="fighter-card player">
          <div class="avatar-box">
            <img v-if="authStore.user?.avatarUrl" :src="authStore.user.avatarUrl" />
            <span v-else>🦸‍♂️</span>
          </div>
          <div class="stats-box">
            <div class="name">BẠN <span class="lvl">Lv.{{ charStore.character?.level }}</span></div>
            <div class="bar-container hp">
              <div class="bar-fill" :style="{ width: playerHpPercent + '%' }"></div>
              <span class="bar-text">{{ battleStore.playerHp }} / {{ battleStore.playerMaxHp }}</span>
            </div>
            <div class="bar-container mp">
              <div class="bar-fill" :style="{ width: energyPercent + '%' }"></div>
              <span class="bar-text">{{ charStore.character?.energy }} / {{ charStore.character?.maxEnergy }}</span>
            </div>
          </div>
        </div>

        <div class="vs-badge">VS</div>

        <div class="fighter-card enemy">
          <div class="stats-box text-right">
            <div class="name">{{ battleStore.enemy?.name }} <span class="lvl">Lv.{{ battleStore.enemy?.level }}</span>
            </div>
            <div class="bar-container hp enemy-hp">
              <div class="bar-fill" :style="{ width: enemyHpPercent + '%' }"></div>
              <span class="bar-text">{{ battleStore.enemyHp }} / {{ battleStore.enemyMaxHp }}</span>
            </div>
          </div>
          <div class="avatar-box enemy-avatar" :class="{ 'shake-anim': isHit }">
            <img v-if="battleStore.enemy?.imageUrl" :src="battleStore.enemy.imageUrl" />
            <span v-else>👿</span>
            <div v-if="isHit" class="dmg-popup">-{{ lastDmg }}</div>
          </div>
        </div>
      </div>

      <div class="battle-log-window custom-scroll" ref="logContainer">
        <div v-for="(log, i) in battleStore.combatLogs" :key="i" class="log-entry" v-html="formatLog(log)"></div>
      </div>

      <div class="action-bar glass-panel">
        <div v-if="battleStore.status === 'ONGOING'" class="skill-grid">
          <button @click="executeTurn('normal')" class="btn-action atk">
            <div class="icon">🗡️</div>
            <span>TẤN CÔNG</span>
          </button>

          <button @click="executeTurn('strong')" class="btn-action skill" :disabled="charStore.character?.energy < 5">
            <div class="icon">⚡</div>
            <span>SẤM SÉT (-5)</span>
          </button>

          <button @click="toggleAuto" class="btn-action auto" :class="{ active: isAuto }">
            <div class="icon">🤖</div>
            <span>{{ isAuto ? 'DỪNG AUTO' : 'TỰ ĐÁNH' }}</span>
          </button>
        </div>

        <div v-else class="end-game-box">
          <h2 v-if="battleStore.status === 'VICTORY'" class="win-text">CHIẾN THẮNG!</h2>
          <h2 v-else class="lose-text">THẤT BẠI...</h2>

          <div class="loot-info" v-if="battleStore.status === 'VICTORY'">
            <span>+{{ battleStore.goldEarned }} Vàng</span>
            <span>+{{ battleStore.expEarned }} EXP</span>
          </div>

          <button @click="battleStore.resetBattle()" class="btn-3d next-btn">TIẾP TỤC</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onUnmounted } from "vue";
import { useBattleStore } from "../stores/battleStore";
import { useCharacterStore } from "../stores/characterStore";
import { useAuthStore } from "../stores/authStore";

const battleStore = useBattleStore();
const charStore = useCharacterStore();
const authStore = useAuthStore();

const isHit = ref(false);
const lastDmg = ref(0); // Cần lấy từ log nếu muốn chính xác, ở đây làm hiệu ứng giả
const isAuto = ref(false);
const logContainer = ref(null);
let autoTimer = null;

const playerHpPercent = computed(() => (battleStore.playerHp / battleStore.playerMaxHp) * 100);
const enemyHpPercent = computed(() => (battleStore.enemyHp / battleStore.enemyMaxHp) * 100);
const energyPercent = computed(() => (charStore.character?.energy / charStore.character?.maxEnergy) * 100);

const executeTurn = async (type) => {
  // Rung lắc
  isHit.value = true;
  setTimeout(() => isHit.value = false, 200);

  await battleStore.attack(type);

  // Auto scroll log
  nextTick(() => {
    if (logContainer.value) logContainer.value.scrollTop = logContainer.value.scrollHeight;
  });

  // Nếu đang Auto và chưa kết thúc, đánh tiếp
  if (isAuto.value && battleStore.status === 'ONGOING') {
    autoTimer = setTimeout(() => executeTurn('normal'), 1000); // 1s đánh 1 cái
  } else if (battleStore.status !== 'ONGOING') {
    isAuto.value = false;
  }
};

const toggleAuto = () => {
  isAuto.value = !isAuto.value;
  if (isAuto.value) executeTurn('normal');
  else clearTimeout(autoTimer);
};

const formatLog = (text) => {
  // Highlight từ khóa
  return text
    .replace('CHÍ MẠNG', '<span class="crit">CHÍ MẠNG</span>')
    .replace('PARRY', '<span class="parry">ĐỠ ĐÒN</span>')
    .replace(/(\d+) dmg/, '<b class="dmg">$1</b>');
};

onUnmounted(() => clearTimeout(autoTimer));
</script>

<style scoped>
.battle-arena {
  background: #000;
  height: 100vh;
  display: flex;
  flex-direction: column;
  color: #fff;
  padding: 10px;
}

/* START SCREEN */
.start-screen {
  margin: auto;
  text-align: center;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  border: 1px solid #333;
}

.radar-scan {
  width: 100px;
  height: 100px;
  border: 2px solid #00f3ff;
  border-radius: 50%;
  margin: 0 auto 20px;
  position: relative;
  overflow: hidden;
  background: rgba(0, 243, 255, 0.1);
}

.radar-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 50%;
  border-bottom: 2px solid #00f3ff;
  transform-origin: bottom center;
  animation: radarSpin 2s linear infinite;
}

@keyframes radarSpin {
  to {
    transform: rotate(360deg);
  }
}

.center-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #00f3ff;
}

/* COMBAT UI */
.combat-ui {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

.combat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #111;
  padding: 10px;
  border: 1px solid #333;
  border-radius: 8px;
}

.fighter-card {
  display: flex;
  gap: 10px;
  align-items: center;
  flex: 1;
}

.fighter-card.enemy {
  justify-content: flex-end;
}

.avatar-box {
  width: 50px;
  height: 50px;
  background: #222;
  border: 1px solid #555;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  border-radius: 4px;
  position: relative;
}

.avatar-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.stats-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.text-right {
  text-align: right;
  align-items: flex-end;
}

.name {
  font-weight: bold;
  font-size: 0.9rem;
}

.lvl {
  font-size: 0.7rem;
  color: #888;
  background: #222;
  padding: 1px 4px;
  border-radius: 3px;
}

.bar-container {
  width: 100%;
  height: 10px;
  background: #333;
  border-radius: 2px;
  position: relative;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  transition: width 0.3s;
}

.bar-text {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  text-align: center;
  font-size: 0.6rem;
  line-height: 10px;
  color: #fff;
  text-shadow: 1px 1px 1px #000;
}

.hp .bar-fill {
  background: #4caf50;
}

.enemy-hp .bar-fill {
  background: #f44336;
}

.mp .bar-fill {
  background: #2196f3;
}

.vs-badge {
  font-weight: 900;
  color: #ff5252;
  font-style: italic;
  font-size: 1.2rem;
}

/* BATTLE LOG (Style SimpleMMO) */
.battle-log-window {
  flex: 1;
  background: #000;
  border: 1px solid #333;
  padding: 10px;
  font-family: monospace;
  font-size: 0.85rem;
  overflow-y: auto;
  border-radius: 4px;
}

.log-entry {
  margin-bottom: 5px;
  border-bottom: 1px dashed #222;
  padding-bottom: 2px;
}

.log-entry:last-child {
  border-bottom: none;
  font-weight: bold;
  color: #fff;
}

/* ACTION BAR */
.action-bar {
  padding: 10px;
  background: #1a1a1a;
}

.skill-grid {
  display: flex;
  gap: 10px;
}

.btn-action {
  flex: 1;
  padding: 10px 5px;
  background: #263238;
  border: 1px solid #37474f;
  color: #fff;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: 0.1s;
}

.btn-action:active {
  transform: scale(0.95);
}

.btn-action.atk {
  border-bottom: 3px solid #f44336;
}

.btn-action.skill {
  border-bottom: 3px solid #2196f3;
}

.btn-action.auto {
  border-bottom: 3px solid #ff9800;
}

.btn-action.auto.active {
  background: #e65100;
  border-color: #ff9800;
}

.end-game-box {
  text-align: center;
}

.win-text {
  color: #4caf50;
  font-size: 1.5rem;
  margin-bottom: 5px;
}

.lose-text {
  color: #f44336;
  font-size: 1.5rem;
  margin-bottom: 5px;
}

.loot-info {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-bottom: 15px;
  color: #ffeb3b;
  font-weight: bold;
}

.next-btn {
  width: 100%;
  background: #00f3ff;
  color: #000;
  border: none;
  padding: 12px;
  font-weight: bold;
  cursor: pointer;
}

/* Animations */
.shake-anim {
  animation: shake 0.3s;
}

.dmg-popup {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  color: #f44336;
  font-weight: bold;
  font-size: 1.2rem;
  animation: floatUp 0.5s forwards;
  text-shadow: 1px 1px 0 #fff;
}

@keyframes shake {
  0% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(5px);
  }

  75% {
    transform: translateX(-5px);
  }

  100% {
    transform: translateX(0);
  }
}

@keyframes floatUp {
  to {
    top: -40px;
    opacity: 0;
  }
}
</style>