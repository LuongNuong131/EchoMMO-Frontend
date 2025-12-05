<template>
  <div class="page-wrapper wuxia-layout" :class="pageClass">
    <div class="bg-texture"></div>
    <div class="fog-overlay"></div>

    <div class="ornamental-frame">
      <div class="corner top-left"></div>
      <div class="corner top-right"></div>
      <div class="corner bottom-left"></div>
      <div class="corner bottom-right"></div>
      <div class="border-decor left"></div>
      <div class="border-decor right"></div>
    </div>

    <div class="header-zone" v-if="!noHeader">
      <GameHeader />
    </div>

    <main class="page-content" :class="contentClass">
      <slot></slot>
    </main>

    <transition name="float-up">
      <div
        v-if="showBackToTop && scrolled"
        class="scroll-top-seal"
        @click="scrollToTop"
      >
        <div class="seal-inner">
          <span class="kanji-up">上</span>
          <i class="fas fa-arrow-up tiny-arrow"></i>
        </div>
        <div class="seal-glow"></div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import GameHeader from "./GameHeader.vue";

const props = defineProps({
  noHeader: { type: Boolean, default: false },
  pageClass: { type: String, default: "" },
  contentClass: { type: String, default: "" },
  showBackToTop: { type: Boolean, default: true },
});

const scrolled = ref(false);

const handleScroll = () => {
  // Chỉ hiện khi content bên trong scroll (nếu có)
  const mainContent = document.querySelector(".page-content");
  if (mainContent) {
    scrolled.value = mainContent.scrollTop > 300;
  }
};

const scrollToTop = () => {
  const mainContent = document.querySelector(".page-content");
  if (mainContent) {
    mainContent.scrollTo({ top: 0, behavior: "smooth" });
  }
};

// Lưu ý: Lắng nghe scroll trên main content chứ không phải window
onMounted(() => {
  const mainContent = document.querySelector(".page-content");
  if (mainContent) mainContent.addEventListener("scroll", handleScroll);
});
onUnmounted(() => {
  const mainContent = document.querySelector(".page-content");
  if (mainContent) mainContent.removeEventListener("scroll", handleScroll);
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@500;700;900&display=swap");

/* --- PALETTE --- */
:root {
  --bg-deep: #020617;
  --border-jade: #10b981;
  --border-gold: #f59e0b;
  --text-main: #f3f4f6;
  --text-dim: #9ca3af;
}

.page-wrapper {
  height: 100vh; /* Cố định chiều cao bằng màn hình */
  width: 100vw;
  background-color: var(--bg-deep);
  font-family: "Noto Serif TC", serif;
  color: var(--text-main);
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Ngăn scroll body chính */
}

/* --- BACKGROUNDS --- */
.bg-texture {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-image: repeating-linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.01) 0,
      rgba(255, 255, 255, 0.01) 1px,
      transparent 1px,
      transparent 10px
    ),
    radial-gradient(circle at top center, #1e293b 0%, #020617 80%);
}
.fog-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(to top, rgba(16, 185, 129, 0.05), transparent);
  opacity: 0.6;
}

/* --- DECOR FRAME --- */
.ornamental-frame {
  position: absolute;
  inset: 15px;
  pointer-events: none;
  z-index: 8000;
  border: 1px solid rgba(16, 185, 129, 0.2);
  box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.5);
}
.corner {
  position: absolute;
  width: 30px;
  height: 30px;
  border: 2px solid var(--border-jade);
  transition: 0.3s;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
}
.top-left {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
}
.top-right {
  top: 0;
  right: 0;
  border-left: none;
  border-bottom: none;
}
.bottom-left {
  bottom: 0;
  left: 0;
  border-right: none;
  border-top: none;
}
.bottom-right {
  bottom: 0;
  right: 0;
  border-left: none;
  border-top: none;
}

.border-decor {
  position: absolute;
  top: 50%;
  width: 2px;
  height: 100px;
  background: linear-gradient(
    to bottom,
    transparent,
    var(--border-gold),
    transparent
  );
  transform: translateY(-50%);
  opacity: 0.8;
  box-shadow: 0 0 10px var(--border-gold);
}
.border-decor.left {
  left: 0;
}
.border-decor.right {
  right: 0;
}

/* --- CONTENT STRUCTURE --- */
.header-zone {
  position: relative;
  z-index: 50;
  flex-shrink: 0;
}

.page-content {
  position: relative;
  z-index: 10;
  flex: 1; /* Chiếm toàn bộ không gian còn lại */
  overflow-y: auto; /* Scroll nội dung ở đây */
  overflow-x: hidden;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

/* --- SCROLL TOP BTN --- */
.scroll-top-seal {
  position: fixed;
  bottom: 40px;
  right: 40px;
  width: 50px;
  height: 50px;
  cursor: pointer;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.3s;
}
.seal-inner {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #34d399, #059669);
  border: 2px solid #a7f3d0;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(5, 150, 105, 0.4);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #064e3b;
  position: relative;
  z-index: 2;
}
.kanji-up {
  font-size: 1.4em;
  font-weight: 900;
  line-height: 1;
}
.tiny-arrow {
  font-size: 0.6em;
  margin-top: 2px;
}
.seal-glow {
  position: absolute;
  inset: -6px;
  border: 1px solid var(--border-jade);
  border-radius: 12px;
  opacity: 0;
  transition: 0.3s;
  animation: pulse 2s infinite;
}
.scroll-top-seal:hover {
  transform: translateY(-5px);
}
.scroll-top-seal:hover .seal-glow {
  opacity: 1;
}

@keyframes pulse {
  0% {
    opacity: 0.3;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(1.3);
  }
}

@media (max-width: 768px) {
  .page-content {
    padding: 15px;
    padding-bottom: 80px;
  }
  .ornamental-frame {
    inset: 5px;
  }
}
</style>
