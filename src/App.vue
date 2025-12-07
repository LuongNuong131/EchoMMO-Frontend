<template>
  <div id="app" class="cyber-root">
    <div class="static-noise"></div>

    <transition name="system-boot" mode="out-in">
      <div v-if="isAuthPage" class="auth-layout-wrapper">
        <router-view v-slot="{ Component }">
          <transition name="page-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>

      <MainLayout v-else />
    </transition>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import MainLayout from "./layouts/MainLayout.vue";

const route = useRoute();

// Kiểm tra trang Auth để ẩn MainLayout
const isAuthPage = computed(() => {
  return ["Login", "Register", "ForgotPassword", "VerifyOtp"].includes(
    route.name
  );
});

// --- Đã xóa toàn bộ logic Javascript xử lý chuột (mousemove, click...) ---
</script>

<style>
/* --- GLOBAL RESET & ROOT --- */
body,
html {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  background-color: #020617;
  /* cursor: none;  <-- ĐÃ XÓA DÒNG NÀY ĐỂ HIỆN LẠI CHUỘT */
  overflow: hidden; 
}

#app {
  width: 100%;
  height: 100%;
  font-family: "Rajdhani", sans-serif;
  -webkit-font-smoothing: antialiased;
  position: relative;
}

/* --- Đã xóa CSS của .custom-cursor --- */

/* --- GLOBAL NOISE --- */
.static-noise {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9000;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}

/* --- TRANSITIONS --- */
.system-boot-enter-active,
.system-boot-leave-active {
  transition: opacity 0.5s ease, filter 0.5s ease;
}
.system-boot-enter-from {
  opacity: 0;
  filter: blur(10px);
}
.system-boot-leave-to {
  opacity: 0;
  filter: blur(5px);
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.3s ease;
}
.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}
</style>