<template>
  <div class="page-container battle-holo">
    <div class="holo-stage">
      <div v-if="battleStore.status === 'IDLE'" class="scan-frame">
        <div class="scanner-line"></div>
        <div class="radar-circle">
          <div class="radar-swipe"></div>
        </div>
        <h3>SYSTEM READY</h3>
        <p>Awaiting combat initialization...</p>
        <button @click="battleStore.startBattle()" class="btn-activate">
          INITIATE SEQUENCE
        </button>
      </div>

      <div v-else class="combat-card-layout">
        <div class="holo-card enemy-card" :class="{ shake: isHit }">
          <div class="card-header">
            <span class="bad-guy">{{ battleStore.enemy?.name }}</span>
            <small>Lv.{{ battleStore.enemy?.level }}</small>
          </div>
          <div class="holo-visual">
            <div class="sprite">👿</div>
            <div class="dmg-fly" v-if="isHit">-{{ lastDmg }}</div>
          </div>
          <div class="bar-thin-wrap">
            <div
              class="bar-thin bg-red"
              :style="{ width: enemyHpPercent + '%' }"
            ></div>
          </div>
        </div>

        <div class="vs-text">/// VS ///</div>

        <div class="holo-card player-card">
          <div class="card-header">
            <span class="good-guy">YOU</span>
            <small>Lv.{{ charStore.character?.level }}</small>
          </div>
          <div class="holo-visual">
            <div class="sprite">🦸‍♂️</div>
          </div>
          <div class="bar-thin-wrap">
            <div
              class="bar-thin bg-green"
              :style="{ width: playerHpPercent + '%' }"
            ></div>
          </div>
        </div>

        <div class="control-grid">
          <button
            v-if="battleStore.status === 'ONGOING'"
            @click="handleAttack('normal')"
            class="btn-atk"
          >
            ATK
          </button>
          <button
            v-else
            @click="battleStore.resetBattle()"
            class="btn-atk reset"
          >
            NEXT
          </button>
        </div>

        <div class="mini-log custom-scroll">
          <div
            v-for="(log, i) in battleStore.combatLogs"
            :key="i"
            v-html="formatLog(log)"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// LOGIC GIỮ NGUYÊN NHƯ FILE BATTLE.VUE GỐC
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
const triggerShake = () => {
  isHit.value = true;
  setTimeout(() => (isHit.value = false), 300);
};
const formatLog = (text) =>
  text.replace("CHÍ MẠNG", "<b style='color:yellow'>CRIT</b>");
</script>

<style scoped>
.battle-holo {
  background: #000;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-image: linear-gradient(rgba(0, 255, 0, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 0, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}
.holo-stage {
  max-width: 400px;
  margin: 80px auto;
  padding: 20px;
  border: 1px solid #0f0;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.2);
  position: relative;
}
.scan-frame {
  text-align: center;
  color: #0f0;
  font-family: monospace;
}
.btn-activate {
  background: #0f0;
  color: #000;
  border: none;
  padding: 10px 20px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 20px;
  text-transform: uppercase;
}

.combat-card-layout {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.holo-card {
  border: 1px solid #333;
  padding: 10px;
  background: rgba(0, 20, 0, 0.8);
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  color: #fff;
  font-family: monospace;
}
.holo-visual {
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 3em;
  position: relative;
}
.bar-thin-wrap {
  height: 4px;
  background: #333;
}
.bar-thin {
  height: 100%;
  transition: 0.2s;
}
.bg-red {
  background: #f00;
  box-shadow: 0 0 5px #f00;
}
.bg-green {
  background: #0f0;
  box-shadow: 0 0 5px #0f0;
}

.vs-text {
  text-align: center;
  color: #555;
  font-weight: 900;
  letter-spacing: 5px;
}

.btn-atk {
  background: transparent;
  border: 2px solid #0f0;
  color: #0f0;
  padding: 15px;
  font-weight: 900;
  cursor: pointer;
  text-transform: uppercase;
}
.btn-atk:hover {
  background: #0f0;
  color: #000;
}
.mini-log {
  height: 60px;
  font-size: 0.7em;
  color: #888;
  overflow-y: auto;
  border-top: 1px dashed #333;
  padding-top: 5px;
  font-family: monospace;
}
</style>
