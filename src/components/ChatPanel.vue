<template>
  <div class="chat-wrapper">
    <div class="chat-header">
      <div class="header-left">
        <i class="fas fa-bullhorn text-red"></i>
        <span class="channel-name">GIANG HỒ ĐÀM</span>
      </div>
      <div class="header-right">
        <span class="status-dot">●</span>
      </div>
    </div>

    <div class="chat-body custom-scroll" ref="msgContainer">
      <div
        v-for="(msg, index) in chatStore.messages"
        :key="index"
        class="chat-row"
        :class="{
          'admin-line': msg.role === 'ADMIN',
          me: isMe(msg.senderName),
        }"
      >
        <div class="msg-meta">
          <span class="time">[{{ msg.time }}]</span>
          <span v-if="msg.role === 'ADMIN'" class="seal adm">QUAN</span>
          <span v-else class="seal usr">HIỆP</span>
          <span class="sender">{{ msg.senderName }}:</span>
        </div>
        <div class="msg-text">{{ msg.content }}</div>
      </div>

      <div class="chat-row waiting">
        <span class="dots">...</span>
      </div>
    </div>

    <form @submit.prevent="handleSend" class="chat-footer">
      <div class="input-box">
        <input
          v-model="inputMsg"
          placeholder="Nhập tin nhắn..."
          maxlength="100"
          class="ink-input"
        />
        <button type="submit" class="btn-send">
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useChatStore } from "../stores/chatStore";
import { useAuthStore } from "../stores/authStore";

const chatStore = useChatStore();
const authStore = useAuthStore();
const inputMsg = ref("");
const msgContainer = ref(null);
let pollingInterval = null;

const isMe = (senderName) => {
  return authStore.user?.username === senderName;
};

const scrollToBottom = () => {
  nextTick(() => {
    if (msgContainer.value) {
      msgContainer.value.scrollTop = msgContainer.value.scrollHeight;
    }
  });
};

const handleSend = async () => {
  if (!inputMsg.value.trim()) return;
  await chatStore.sendMessage(inputMsg.value);
  inputMsg.value = "";
  await chatStore.fetchMessages();
  scrollToBottom();
};

onMounted(async () => {
  await chatStore.fetchMessages();
  scrollToBottom();
  pollingInterval = setInterval(async () => {
    await chatStore.fetchMessages();
  }, 2000);
});

onUnmounted(() => {
  if (pollingInterval) clearInterval(pollingInterval);
});

watch(
  () => chatStore.messages,
  () => {
    scrollToBottom();
  },
  { deep: true }
);
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@500;700&display=swap");

/* --- CẤU TRÚC CHÍNH (FLEXBOX FIX) --- */
.chat-wrapper {
  /* Chiếm toàn bộ không gian cha */
  height: 100%;
  min-height: 400px; /* Chiều cao tối thiểu để không bị bẹp */
  display: flex;
  flex-direction: column;

  background: #e3d5b8; /* Nền giấy */
  border: 2px solid #5d4037; /* Viền gỗ */
  border-radius: 4px;
  overflow: hidden;
  font-family: "Noto Serif TC", serif;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
}

/* --- HEADER --- */
.chat-header {
  flex: 0 0 45px; /* Cố định chiều cao */
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 15px;
  background: #3e2723; /* Gỗ tối */
  color: #d7ccc8;
  border-bottom: 2px solid #5d4037;
  z-index: 2;
}

.text-red {
  color: #ff4444;
  margin-right: 8px;
  animation: pulse 2s infinite;
}
.channel-name {
  font-weight: bold;
  color: #ffccbc;
  letter-spacing: 1px;
}
.status-dot {
  color: #4caf50;
  font-size: 1.2em;
  text-shadow: 0 0 5px #4caf50;
}

/* --- BODY (SCROLL) --- */
.chat-body {
  flex: 1 1 auto; /* Tự động giãn nở */
  min-height: 0; /* Cho phép scroll trong flex item */
  overflow-y: auto;
  padding: 15px;

  /* Nền giấy có vân */
  background-color: #e3d5b8;
  background-image: url("https://www.transparenttextures.com/patterns/aged-paper.png");
}

/* Tin nhắn */
.chat-row {
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px dashed rgba(62, 39, 35, 0.2);
  font-size: 0.95rem;
  line-height: 1.5;
  color: #3e2723; /* Chữ nâu đậm mặc định */
}

.msg-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
  font-size: 0.85em;
  flex-wrap: wrap;
}
.time {
  color: #8d6e63;
  font-style: italic;
}

.seal {
  font-size: 0.7em;
  padding: 1px 5px;
  border: 1px solid;
  border-radius: 2px;
  font-weight: bold;
}
.seal.usr {
  color: #3e2723;
  border-color: #3e2723;
}
.seal.adm {
  background: #b71c1c;
  color: #fff;
  border-color: #b71c1c;
}

.sender {
  font-weight: bold;
  color: #1a1a1a;
}
.msg-text {
  word-break: break-word;
  font-weight: 500;
}

/* Màu đặc biệt */
.admin-line .sender {
  color: #b71c1c;
}
.admin-line .msg-text {
  color: #b71c1c;
  font-weight: bold;
}

.me .sender {
  color: #0d47a1;
}
.me .msg-text {
  color: #000;
  font-weight: 600;
} /* Chữ đen đậm cho bản thân */

.waiting {
  text-align: center;
  border: none;
  opacity: 0.5;
  font-size: 1.5em;
  line-height: 0.5;
}

/* --- FOOTER (INPUT) --- */
.chat-footer {
  flex: 0 0 auto; /* Không cho phép co lại */
  padding: 10px;
  background: #d7ccc8; /* Nền tối hơn giấy chút */
  border-top: 2px solid #5d4037;
  z-index: 2;
}

.input-box {
  display: flex;
  align-items: center;
  background: #ffffff; /* Nền trắng tinh */
  border: 1px solid #5d4037;
  border-radius: 4px;
  padding: 0 5px;
  height: 45px;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.1);
}

.ink-input {
  flex: 1;
  border: none;
  outline: none;
  height: 100%;
  padding: 0 10px;
  font-family: "Noto Serif TC", serif;
  font-size: 1rem;
  color: #000000; /* Chữ đen tuyền */
  font-weight: 600;
  background: transparent;
}

.ink-input::placeholder {
  color: #999;
  font-style: italic;
  font-weight: normal;
}

.btn-send {
  background: #b71c1c; /* Đỏ ấn triện */
  color: #fff;
  border: none;
  border-radius: 2px;
  width: 40px;
  height: 35px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
.btn-send:hover {
  background: #d32f2f;
  transform: translateY(-1px);
}

/* Scrollbar */
.custom-scroll::-webkit-scrollbar {
  width: 6px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #8d6e63;
  border-radius: 3px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style>
