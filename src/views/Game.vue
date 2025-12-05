<template>
  <div class="page-container explore-page">
    <div class="explore-container">
      <div class="header-bar">
        <button class="btn-back" @click="$router.push('/game')">
          ⬅ Quay lại
        </button>
        <h2>🌲 RỪNG HOANG DÃ</h2>
      </div>

      <div class="info-bar">
        <span>❤️ {{ charStore.character?.hp }}</span>
        <span>⚡ {{ charStore.character?.energy }}</span>
      </div>

      <div class="log-box custom-scroll" ref="logBox">
        <div
          v-for="(log, i) in charStore.logs"
          :key="i"
          class="log-item"
          :class="log.type"
        >
          <span class="time">{{ new Date(log.id).toLocaleTimeString() }}</span>
          <span v-html="log.message"></span>
        </div>
        <div v-if="charStore.logs.length === 0" class="empty">
          Bắt đầu thám hiểm nào...
        </div>
      </div>

      <div class="controls">
        <button class="btn-explore" @click="handleExplore" :disabled="isBusy">
          {{ isBusy ? "Đang đi..." : "👣 BƯỚC TIẾP (1 Energy)" }}
        </button>
      </div>
    </div>

    <div v-if="showEncounter" class="encounter-modal">
      <div class="modal-content">
        <h3>⚠️ CẢNH BÁO!</h3>
        <p>Phát hiện kẻ địch phía trước!</p>
        <button class="btn-fight" @click="goToBattle">CHIẾN ĐẤU NGAY</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { useCharacterStore } from "../stores/characterStore";
import { useBattleStore } from "../stores/battleStore"; // Import thêm store battle
import { useRouter } from "vue-router";

const charStore = useCharacterStore();
const battleStore = useBattleStore(); // Dùng để init battle
const router = useRouter();
const isBusy = ref(false);
const logBox = ref(null);
const showEncounter = ref(false);

const handleExplore = async () => {
  if (isBusy.value) return;
  isBusy.value = true;

  try {
    // Lưu độ dài log cũ
    const oldLen = charStore.logs.length;

    await charStore.explore();

    // Kiểm tra log mới xem có phải gặp quái không
    if (charStore.logs.length > oldLen) {
      const newLog = charStore.logs[0];
      // Backend trả về type='ENEMY' khi gặp quái (xem ExplorationService.java)
      if (newLog.type === "ENEMY") {
        showEncounter.value = true;

        // Khởi tạo thông tin quái giả lập (vì API explore hiện tại chưa trả về chi tiết quái)
        // Hoặc ta để Battle.vue tự fetch quái khi vào
        // Ở đây ta chỉ cần chuyển trang
      }
    }
  } finally {
    isBusy.value = false;
    scrollToBottom();
  }
};

const goToBattle = () => {
  // Reset trạng thái battle trước khi vào
  battleStore.resetBattle();
  router.push("/battle");
};

const scrollToBottom = () => {
  nextTick(() => {
    if (logBox.value) logBox.value.scrollTop = logBox.value.scrollHeight;
  });
};

onMounted(() => charStore.fetchCharacter());
</script>

<style scoped>
.explore-page {
  background: #111;
  color: #eee;
  min-height: 100vh;
  padding: 20px;
  display: flex;
  justify-content: center;
}
.explore-container {
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  height: 80vh;
}

.header-bar {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}
.btn-back {
  background: #333;
  border: none;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}
h2 {
  margin: 0;
  color: #06d6a0;
}

.info-bar {
  display: flex;
  justify-content: space-around;
  background: #222;
  padding: 10px;
  border-radius: 8px;
  font-weight: bold;
  margin-bottom: 15px;
}

.log-box {
  flex: 1;
  background: #1a1a1a;
  border: 1px solid #444;
  border-radius: 8px;
  padding: 10px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 0.9rem;
}
.log-item {
  margin-bottom: 8px;
  border-bottom: 1px dashed #333;
  padding-bottom: 4px;
}
.log-item.ENEMY {
  color: #ef476f;
  font-weight: bold;
}
.log-item.GOLD {
  color: #ffd166;
}
.time {
  color: #666;
  font-size: 0.8em;
  margin-right: 5px;
}
.empty {
  text-align: center;
  color: #555;
  margin-top: 50px;
}

.controls {
  margin-top: 20px;
}
.btn-explore {
  width: 100%;
  padding: 15px;
  background: #06d6a0;
  color: #000;
  font-weight: 900;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1rem;
}
.btn-explore:disabled {
  background: #555;
  cursor: not-allowed;
}

/* Modal */
.encounter-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal-content {
  background: #222;
  padding: 30px;
  border-radius: 12px;
  border: 2px solid #ef476f;
  text-align: center;
}
.modal-content h3 {
  color: #ef476f;
  font-size: 2rem;
  margin: 0 0 10px;
}
.btn-fight {
  background: #ef476f;
  color: white;
  padding: 12px 30px;
  border: none;
  border-radius: 50px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 15px;
  font-size: 1.1rem;
  animation: pulse 1s infinite;
}
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
</style>
