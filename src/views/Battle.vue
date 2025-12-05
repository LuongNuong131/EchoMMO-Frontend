<template>
  <div class="page-container battle-arena">
    <div v-if="battleStore.status === 'IDLE'" class="start-screen glass-panel">
      <div class="holo-circle"><i class="fas fa-swords"></i></div>
      <h2 class="text-gradient">HỆ THỐNG SẴN SÀNG</h2>
      <p>Đang quét mục tiêu trong khu vực...</p>
      <button @click="battleStore.startBattle()" class="btn-3d glitch-btn">BẮT ĐẦU TRẬN ĐẤU</button>
      <button @click="$router.push('/game')" class="btn-text">QUAY VỀ CĂN CỨ</button>
    </div>

    <div v-else class="combat-zone">
      <transition name="bounce">
        <div v-if="showLevelUp" class="levelup-overlay">
          <h2>🌟 LEVEL UP! {{ charStore.character?.level }} 🌟</h2>
          <p>Sức mạnh gia tăng!</p>
        </div>
      </transition>
      <div v-if="showParryBtn" class="parry-overlay"><button class="btn-parry" @click="handleParry">🛡️ ĐỠ
          NGAY!</button>
        <div class="parry-timer-bar"></div>
      </div>

      <div class="fighter enemy" :class="{ 'shake-anim': isHit }">
        <div class="fighter-stats">
          <div class="name text-gradient">{{ battleStore.enemy?.name }} <span class="lvl">Lv.{{ battleStore.enemy?.level
              }}</span></div>
          <div class="hp-bar-wrap">
            <div class="hp-bar-fill enemy-fill" :style="{ width: enemyHpPercent + '%' }"></div>
          </div>
          <div class="hp-text">{{ battleStore.enemyHp }} / {{ battleStore.enemyMaxHp }}</div>
        </div>
        <div class="fighter-model">
          <div class="enemy-sprite">👿</div>
          <div class="hit-effect" v-if="isHit">-{{ lastDmg }}</div>
        </div>
      </div>

      <div class="vs-badge">VS</div>

      <div class="fighter player">
        <div class="fighter-model">
          <div class="player-sprite">🦸‍♂️</div>
        </div>
        <div class="fighter-stats">
          <div class="name text-gradient">YOU <span class="lvl">Lv.{{ charStore.character?.level }}</span></div>
          <div class="hp-bar-wrap">
            <div class="hp-bar-fill player-fill" :style="{ width: playerHpPercent + '%' }"></div>
          </div>
          <div class="energy-bar-wrap">
            <div class="energy-fill" :style="{ width: energyPercent + '%' }"></div>
          </div>
          <div class="energy-text">⚡ {{ charStore.character?.energy }} / {{ charStore.character?.maxEnergy }}</div>
        </div>
      </div>

      <div class="combat-log custom-scroll" ref="logContainer">
        <div v-for="(log, i) in battleStore.combatLogs" :key="i" class="log-line" v-html="formatLog(log)"></div>
      </div>

      <div class="controls-panel glass-panel">
        <div v-if="battleStore.status === 'ONGOING'" class="skills-grid">
          <template v-if="!isAutoBattling">
            <button @click="handleManualTurn('normal')" class="btn-skill atk"><span>🗡️</span> TẤN CÔNG</button>
            <button @click="handleManualTurn('strong')" class="btn-skill strong"
              :disabled="charStore.character?.energy < 5"
              :class="{ 'disabled': charStore.character?.energy < 5 }"><span>💥</span> ĐÁNH MẠNH
              <small>-5⚡</small></button>
            <button @click="startAutoBattle" class="btn-skill auto"><span>🤖</span> AUTO</button>
          </template>
          <button v-else @click="stopAutoBattle" class="btn-skill stop">🛑 DỪNG AUTO</button>
        </div>
        <div v-else class="end-game-actions">
          <h2 v-if="battleStore.status === 'VICTORY'" class="win-title">CHIẾN THẮNG</h2>
          <h2 v-else class="lose-title">THẤT BẠI</h2>
          <button @click="battleStore.resetBattle()" class="btn-3d mt-20">TIẾP TỤC</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted, nextTick } from "vue";
import { useBattleStore } from "../stores/battleStore";
import { useCharacterStore } from "../stores/characterStore";

const battleStore = useBattleStore();
const charStore = useCharacterStore();
const isHit = ref(false); const lastDmg = ref(0); const showLevelUp = ref(false); const logContainer = ref(null);
const showParryBtn = ref(false); const isAutoBattling = ref(false);
let autoTimer = null; let parrySuccess = false;

const enemyHpPercent = computed(() => (battleStore.enemyHp / battleStore.enemyMaxHp) * 100);
const playerHpPercent = computed(() => (battleStore.playerHp / battleStore.playerMaxHp) * 100);
const energyPercent = computed(() => charStore.character ? (charStore.character.energy / charStore.character.maxEnergy) * 100 : 0);

const executeTurn = async (attackType = 'normal') => {
  const chance = Math.random() * 100; parrySuccess = false;
  if (chance < 30 && battleStore.status === 'ONGOING') await triggerParryEvent();
  await battleStore.attack(attackType, parrySuccess);
  triggerShake();
  if (battleStore.levelUp) { showLevelUp.value = true; setTimeout(() => showLevelUp.value = false, 3000); charStore.fetchCharacter(); }
  nextTick(() => { if (logContainer.value) logContainer.value.scrollTop = logContainer.value.scrollHeight; });
};

const handleManualTurn = async (type) => { await executeTurn(type); };
const startAutoBattle = () => { isAutoBattling.value = true; runAutoLoop(); };
const stopAutoBattle = () => { isAutoBattling.value = false; if (autoTimer) clearTimeout(autoTimer); };
const runAutoLoop = async () => {
  if (!isAutoBattling.value || battleStore.status !== 'ONGOING') { isAutoBattling.value = false; return; }
  await executeTurn(charStore.character?.energy >= 5 ? 'strong' : 'normal');
  if (battleStore.status === 'ONGOING') autoTimer = setTimeout(runAutoLoop, 1500); else isAutoBattling.value = false;
};
const triggerParryEvent = () => { return new Promise((resolve) => { showParryBtn.value = true; setTimeout(() => { showParryBtn.value = false; resolve(); }, 800); }); };
const handleParry = () => { parrySuccess = true; showParryBtn.value = false; };
const triggerShake = () => { isHit.value = true; setTimeout(() => (isHit.value = false), 300); };
const formatLog = (text) => text.replace("CHÍ MẠNG", "<span class='crit'>CRITICAL</span>").replace("PARRY", "<span class='parry'>PARRY</span>");
onUnmounted(() => stopAutoBattle());
</script>

<style scoped>
/* Copy style cũ và thêm style mới cho Parry/Energy */
.battle-arena {
  height: 100vh;
  overflow: hidden;
  background: radial-gradient(circle at center, #1a0b2e 0%, #000 100%);
  display: flex;
  flex-direction: column;
}

.start-screen {
  margin: auto;
  text-align: center;
  padding: 50px;
  width: 400px;
  border: 1px solid var(--primary);
  gap: 20px;
  display: flex;
  flex-direction: column;
}

.holo-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px solid var(--primary);
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  font-size: 2em;
  color: var(--primary);
  box-shadow: 0 0 20px var(--primary-glow);
}

.combat-zone {
  flex: 1;
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
}

.fighter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.enemy {
  flex-direction: row-reverse;
}

.player {
  margin-top: auto;
}

.fighter-stats {
  width: 60%;
}

.name {
  font-weight: bold;
  margin-bottom: 5px;
  font-family: var(--font-display);
}

.hp-bar-wrap,
.energy-bar-wrap {
  height: 10px;
  background: #333;
  border-radius: 2px;
  overflow: hidden;
  border: 1px solid #555;
  margin-bottom: 2px;
}

.hp-bar-fill {
  height: 100%;
  transition: width 0.3s;
}

.enemy-fill {
  background: var(--accent);
}

.player-fill {
  background: var(--success);
}

.energy-fill {
  height: 100%;
  background: #f1c40f;
  transition: width 0.3s;
}

.energy-text {
  color: #f1c40f;
  font-size: 0.7em;
  text-align: right;
  font-family: monospace;
}

.combat-log {
  height: 120px;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid #333;
  margin-bottom: 10px;
  padding: 10px;
  font-family: monospace;
  font-size: 0.85em;
  color: #aaa;
  overflow-y: auto;
}

.skills-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.btn-skill {
  padding: 15px;
  border: 1px solid #444;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  cursor: pointer;
  border-radius: 6px;
  font-weight: bold;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.btn-skill:hover:not(.disabled) {
  border-color: var(--primary);
  background: rgba(0, 243, 255, 0.1);
}

.atk {
  border-color: var(--success);
  color: var(--success);
}

.strong {
  border-color: var(--warning);
  color: var(--warning);
}

.auto {
  grid-column: span 2;
  border-color: var(--primary);
  color: var(--primary);
}

.stop {
  grid-column: span 2;
  border-color: var(--accent);
  color: var(--accent);
}

/* New styles */
.parry-overlay {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.btn-parry {
  background: #ffd700;
  color: #000;
  font-size: 1.5rem;
  font-weight: 900;
  padding: 15px 40px;
  border: 4px solid #fff;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 0 30px #ffd700;
  animation: popIn 0.1s;
}

.parry-timer-bar {
  width: 100%;
  height: 6px;
  background: #ff0055;
  margin-top: 10px;
  animation: shrink 0.8s linear forwards;
}

.levelup-overlay {
  position: absolute;
  top: 15%;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(45deg, #ffd700, #ff8c00);
  color: #fff;
  padding: 15px 30px;
  border-radius: 12px;
  border: 2px solid #fff;
  z-index: 99;
  text-align: center;
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
}

@keyframes shrink {
  from {
    width: 100%;
  }

  to {
    width: 0%;
  }
}

@keyframes popIn {
  from {
    transform: scale(0);
  }

  to {
    transform: scale(1);
  }
}
</style>