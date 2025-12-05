<template>
  <div class="page-container battle-arena">
    <div v-if="battleStore.status === 'IDLE'" class="start-screen glass-panel">
      <div class="holo-circle">
        <i class="fas fa-swords"></i>
      </div>
      <h2>ARENA READY</h2>
      <p>Tìm kiếm đối thủ trong khu vực...</p>
      <button @click="battleStore.startBattle()" class="btn-3d glitch-btn">
        START BATTLE
      </button>
      <button @click="$router.push('/game')" class="btn-text">
        RETURN TO BASE
      </button>
    </div>

    <div v-else class="combat-zone">
      <div class="fighter enemy" :class="{ 'shake-anim': isHit }">
        <div class="fighter-stats">
          <div class="name">
            {{ battleStore.enemy?.name }}
            <span class="lvl">Lv.{{ battleStore.enemy?.level }}</span>
          </div>
          <div class="hp-bar-wrap">
            <div
              class="hp-bar-fill enemy-fill"
              :style="{ width: enemyHpPercent + '%' }"
            ></div>
          </div>
          <div class="hp-text">
            {{ battleStore.enemyHp }} / {{ battleStore.enemyMaxHp }}
          </div>
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
          <div class="name">
            YOU <span class="lvl">Lv.{{ charStore.character?.level }}</span>
          </div>
          <div class="hp-bar-wrap">
            <div
              class="hp-bar-fill player-fill"
              :style="{ width: playerHpPercent + '%' }"
            ></div>
          </div>
          <div class="hp-text">
            {{ battleStore.playerHp }} / {{ battleStore.playerMaxHp }}
          </div>
        </div>
      </div>

      <div class="combat-log custom-scroll">
        <div
          v-for="(log, i) in battleStore.combatLogs"
          :key="i"
          class="log-line"
          v-html="formatLog(log)"
        ></div>
      </div>

      <div class="controls-panel glass-panel">
        <div v-if="battleStore.status === 'ONGOING'" class="skills-grid">
          <button @click="handleAttack('normal')" class="btn-skill atk">
            <span>🗡️</span> ATTACK
          </button>
          <button
            v-for="skill in battleStore.skills"
            :key="skill.skillId"
            @click="handleSkill(skill.skillId)"
            class="btn-skill special"
          >
            <span>✨</span> {{ skill.name }}
            <small>-{{ skill.manaCost }}MP</small>
          </button>
        </div>

        <div v-else class="end-game-actions">
          <h2 v-if="battleStore.status === 'VICTORY'" class="win-title">
            VICTORY
          </h2>
          <h2 v-else class="lose-title">DEFEATED</h2>

          <button @click="battleStore.resetBattle()" class="btn-3d">
            CONTINUE
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useBattleStore } from "../stores/battleStore";
import { useCharacterStore } from "../stores/characterStore";
import GameHeader from "../components/GameHeader.vue";

const battleStore = useBattleStore();
const charStore = useCharacterStore();
const isHit = ref(false);
const lastDmg = ref(0);

const enemyHpPercent = computed(
  () => (battleStore.enemyHp / battleStore.enemyMaxHp) * 100
);
const playerHpPercent = computed(
  () => (battleStore.playerHp / battleStore.playerMaxHp) * 100
);

const handleAttack = async () => {
  triggerShake();
  await battleStore.attack();
};

const handleSkill = async (id) => {
  triggerShake();
  await battleStore.useSkill(id);
};

const triggerShake = () => {
  isHit.value = true;
  setTimeout(() => (isHit.value = false), 300);
};

const formatLog = (text) => {
  return text
    .replace("CHÍ MẠNG", "<span class='crit'>CRITICAL</span>")
    .replace("hạ gục", "<span class='dead'>ELIMINATED</span>");
};
</script>

<style scoped>
.battle-arena {
  height: 100vh;
  overflow: hidden;
  background: radial-gradient(circle at center, #1a0b2e 0%, #000 100%);
  display: flex;
  flex-direction: column;
}

/* Start Screen */
.start-screen {
  margin: auto;
  text-align: center;
  padding: 50px;
  width: 400px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  border: 1px solid var(--primary);
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
.btn-text {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  text-decoration: underline;
}

/* Combat Zone */
.combat-zone {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
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
.lvl {
  color: var(--warning);
  font-size: 0.8em;
}

.hp-bar-wrap {
  height: 10px;
  background: #333;
  border-radius: 2px;
  overflow: hidden;
  border: 1px solid #555;
}
.hp-bar-fill {
  height: 100%;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.enemy-fill {
  background: var(--accent);
  box-shadow: 0 0 10px var(--accent);
}
.player-fill {
  background: var(--success);
  box-shadow: 0 0 10px var(--success);
}

.hp-text {
  font-size: 0.8em;
  text-align: right;
  margin-top: 2px;
  color: #888;
}

.fighter-model {
  font-size: 4em;
  position: relative;
  filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.8));
}

.hit-effect {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
  font-weight: 900;
  font-size: 0.5em;
  text-shadow: 0 0 5px var(--accent);
  animation: floatUp 0.5s ease-out forwards;
}

@keyframes floatUp {
  to {
    transform: translate(-50%, -50px);
    opacity: 0;
  }
}

.shake-anim {
  animation: shake 0.3s;
}
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
}

.vs-badge {
  text-align: center;
  font-family: var(--font-display);
  font-size: 3em;
  font-weight: 900;
  opacity: 0.1;
  pointer-events: none;
  margin: -20px 0;
}

/* Logs & Controls */
.combat-log {
  height: 100px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid #333;
  margin-bottom: 10px;
  padding: 10px;
  font-family: monospace;
  font-size: 0.85em;
  color: #aaa;
}
:deep(.crit) {
  color: var(--warning);
  font-weight: bold;
}
:deep(.dead) {
  color: var(--accent);
  font-weight: bold;
}

.controls-panel {
  padding: 15px;
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
  transition: 0.2s;
}
.btn-skill:hover {
  border-color: var(--primary);
  background: rgba(0, 243, 255, 0.1);
}
.atk {
  border-color: var(--accent);
  color: var(--accent);
}

.end-game-actions {
  text-align: center;
}
.win-title {
  color: var(--success);
  font-size: 2em;
  margin-bottom: 20px;
}
.lose-title {
  color: var(--accent);
  font-size: 2em;
  margin-bottom: 20px;
}
</style>
