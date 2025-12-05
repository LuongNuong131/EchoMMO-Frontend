<template>
  <div class="page-container profile-page ancient-theme">
    <div class="wood-bg-layer"></div>
    <div class="ink-vignette"></div>

    <div class="profile-wrapper">
      <div class="profile-header">
        <button @click="$router.push('/')" class="btn-back wood-btn">
          <i class="fas fa-arrow-left"></i> QUAY VỀ SẢNH CHÍNH
        </button>
        <h2 class="header-title">HỒ SƠ TU LUYỆN</h2>
      </div>

      <div class="profile-grid">
        <div class="wood-panel identity-panel">
          <div class="panel-decor-corner top-left"></div>
          <div class="panel-decor-corner bottom-right"></div>

          <div class="id-header">
            <i class="fas fa-id-card-alt"></i> LÝ LỊCH HIỆP KHÁCH
          </div>

          <div class="avatar-container">
            <div class="frame-ornament">
              <div class="avatar-display paper-texture">
                {{ authStore.user?.avatarUrl || "👤" }}
              </div>
            </div>
          </div>

          <div class="avatar-selector">
            <div class="selector-label">THAY ĐỔI CHÂN DUNG_</div>
            <div class="icon-grid">
              <button
                v-for="icon in avatars"
                :key="icon"
                @click="changeAvatar(icon)"
                class="icon-btn paper-texture"
                :class="{ active: authStore.user?.avatarUrl === icon }"
              >
                {{ icon }}
              </button>
            </div>
          </div>

          <div class="static-data paper-texture">
            <div class="data-row">
              <span class="label">MẬT DANH:</span>
              <span class="value ink-text">{{
                authStore.user?.username.toUpperCase() || 'ĐANG THU THẬP'
              }}</span>
            </div>
            <div class="data-row">
              <span class="label">NHẬP MÔN:</span>
              <span class="value ink-text">{{
                authStore.user?.createdAt ? new Date(authStore.user.createdAt).toLocaleDateString() : 'VÔ DANH'
              }}</span>
            </div>
            <div class="data-row">
              <span class="label">TRẠNG THÁI:</span>
              <span class="value status-text status-active">HÀNH TẨU GIANG HỒ</span>
            </div>
          </div>
        </div>

        <div class="right-column">
          <div class="wood-panel rename-panel">
            <div class="panel-title">
              <i class="fas fa-signature"></i> QUYẾT ĐỊNH HIỆU DANH
            </div>
            <form @submit.prevent="updateName" class="ancient-form">
              <div class="input-wrapper">
                <label>HIỆU DANH MỚI</label>
                <div class="input-with-btn">
                  <input
                    v-model="charName"
                    class="ancient-input ink-text"
                    required
                    minlength="3"
                    placeholder="Nhập Hiệu Danh mới..."
                    :disabled="!charStore.character"
                  />
                  <button type="submit" class="btn-seal red" :disabled="!charStore.character || charName.length < 3">BAN CHỦ</button>
                </div>
                <div class="sys-msg warning paper-texture">
                  <i class="fas fa-exclamation-triangle"></i> Mật danh là duy nhất trên giang hồ này.
                </div>
              </div>
            </form>
          </div>

          <div class="wood-panel security-panel">
            <div class="panel-title">
              <i class="fas fa-shield-alt"></i> PHÒNG NGỰ MẬT TỊCH
            </div>
            <form @submit.prevent="changePassword" class="ancient-form">
              <div class="form-group">
                <label>KHÓA VÀO CỬA CŨ</label>
                <input
                  v-model="passForm.currentPassword"
                  type="password"
                  class="ancient-input"
                  required
                />
              </div>
              <div class="form-group">
                <label>KHÓA VÀO CỬA MỚI</label>
                <input
                  v-model="passForm.newPassword"
                  type="password"
                  class="ancient-input"
                  required
                />
              </div>
              <button class="btn-seal green">CẬP NHẬT MẬT LỆNH</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useAuthStore } from "../stores/authStore";
import { useCharacterStore } from "../stores/characterStore";
import axiosClient from "../api/axiosClient";

const authStore = useAuthStore();
const charStore = useCharacterStore();
const avatars = ["🐲", "🐺", "🧚", "🧙", "🥷", "🧟", "🤖", "👽"];
const charName = ref("");
const passForm = reactive({ currentPassword: "", newPassword: "" });

const updateName = async () => {
  if (!confirm("Xác nhận đổi Hiệu Danh?")) return;
  try {
    const res = await axiosClient.post("/character/rename", { name: charName.value });
    alert("Hiệu Danh đã đổi thành công!");
    await charStore.fetchCharacter();
    await authStore.fetchProfile();
  } catch (e) {
    alert(e.response?.data || "Đổi tên thất bại");
  }
};

const changeAvatar = async (icon) => {
  try {
    await axiosClient.put("/user/update", { avatarUrl: icon });
    authStore.fetchProfile();
  } catch (e) {}
};

const changePassword = async () => {
  try {
    const res = await axiosClient.post("/user/change-password", passForm);
    alert("Mật Lệnh đã được cập nhật.");
    passForm.currentPassword = "";
    passForm.newPassword = "";
  } catch (e) {
    alert(e.response?.data);
  }
};

onMounted(async () => {
  await charStore.fetchCharacter();
  if (charStore.character) charName.value = charStore.character.name;
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Noto+Serif+TC:wght@500;700;900&display=swap");

/* --- VARIABLES (WUXIA) --- */
:root {
  --wood-dark: #3e2723;
  --wood-light: #5d4037;
  --paper-bg: #fdf5e6;
  --gold-accent: #fbc02d;
  --red-seal: #b71c1c;
  --text-ink: #2c1810;
  --text-light: #fdf5e6;
  --border-wood: 4px solid var(--wood-light);
  --border-ink: 1px solid var(--text-ink);
}

/* --- BASE LAYOUT --- */
.profile-page.ancient-theme {
  background: var(--wood-dark);
  min-height: 100vh;
  font-family: "Noto Serif TC", serif;
  color: var(--text-light); /* Màu chữ nền sáng */
  position: relative;
  overflow: hidden;
}

.wood-bg-layer {
  position: absolute; inset: 0; z-index: 0;
  background-image: url("https://www.transparenttextures.com/patterns/wood-pattern.png");
  background-color: #261815;
  opacity: 0.9;
}
.ink-vignette {
  position: absolute; inset: 0; z-index: 1;
  background: radial-gradient(circle at center, transparent 0%, #000 120%);
  opacity: 0.5;
}

.profile-wrapper {
  position: relative; z-index: 10;
  max-width: 1000px; margin: 0 auto;
  padding: 80px 20px 40px;
}

/* --- HEADER --- */
.profile-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 30px;
  border-bottom: 2px solid var(--wood-light);
  padding-bottom: 15px;
}
.header-title {
  font-family: "Cinzel", serif;
  letter-spacing: 2px;
  color: var(--gold-accent);
  text-shadow: 1px 1px 2px #000;
  margin: 0;
  font-size: 1.8em;
}
.wood-btn {
  background: var(--wood-light); border: 2px solid var(--wood-dark);
  color: var(--text-light); padding: 8px 15px; cursor: pointer;
  font-family: "Cinzel"; transition: 0.2s;
}
.wood-btn:hover { background: #8d6e63; border-color: var(--gold-accent); }

/* --- GRID LAYOUT --- */
.profile-grid {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 30px;
}

.wood-panel {
  background: var(--wood-dark);
  border: var(--border-wood);
  padding: 25px;
  position: relative;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
  border-radius: 4px;
}
.panel-decor-corner {
  position: absolute; width: 15px; height: 15px; border: 2px solid var(--gold-accent);
}
.top-left { top: -1px; left: -1px; border-bottom: none; border-right: none; }
.bottom-right { bottom: -1px; right: -1px; border-top: none; border-left: none; }

.id-header {
  width: 100%; border-bottom: 1px solid var(--wood-light);
  padding-bottom: 10px; margin-bottom: 20px;
  font-family: "Cinzel", serif;
  color: var(--gold-accent); letter-spacing: 1px; font-weight: bold;
}

/* --- AVATAR FRAME --- */
.avatar-container {
  position: relative; width: 140px; height: 140px; margin-bottom: 25px;
  border: 4px double var(--gold-accent); border-radius: 50%;
  box-shadow: 0 0 15px rgba(251, 192, 45, 0.4);
}
.frame-ornament {
  position: absolute; inset: 0; background: #000; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.avatar-display {
  width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
  font-size: 4em; color: var(--text-ink);
  background-color: var(--paper-bg);
  background-image: url("https://www.transparenttextures.com/patterns/aged-paper.png");
  border-radius: 50%;
}

.avatar-selector { width: 100%; margin-bottom: 25px; }
.selector-label { font-size: 0.8em; color: var(--text-dim); margin-bottom: 10px; font-family: "Cinzel"; text-align: center; }
.icon-grid { display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; }
.icon-btn {
  background: var(--wood-dark); border: 1px solid var(--wood-light);
  font-size: 1.2em; width: 40px; height: 40px; cursor: pointer; transition: 0.2s;
  display: flex; align-items: center; justify-content: center;
}
.icon-btn.active { border-color: var(--gold-accent); box-shadow: 0 0 8px rgba(251, 192, 45, 0.5); }
.icon-btn:hover { background: #4e342e; }


/* --- STATIC DATA (Paper Scroll) --- */
.static-data {
  width: 100%;
  background-color: var(--paper-bg);
  background-image: url("https://www.transparenttextures.com/patterns/aged-paper.png");
  padding: 15px; border-radius: 4px;
  border: 2px solid var(--text-ink);
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
}
.data-row {
  display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.95em;
  border-bottom: 1px dashed #a1887f; padding-bottom: 5px;
}
.label { color: #5d4037; font-weight: bold; font-family: "Cinzel"; }
.value { color: var(--text-ink); font-weight: bold; }
.ink-text { color: var(--red-seal); font-family: "Noto Serif TC"; font-weight: 700; }
.status-text { color: #2e7d32; text-shadow: 0 0 5px #2e7d32; font-weight: 700; }

/* --- FORMS --- */
.panel-title {
  font-family: "Cinzel", serif; color: var(--gold-accent);
  border-bottom: 1px solid var(--wood-light); padding-bottom: 10px;
  margin-bottom: 20px; font-size: 1.1em;
}
.ancient-form label {
  display: block; font-size: 0.85em; color: var(--text-dim); margin-bottom: 8px; font-family: "Cinzel";
}

/* Input (Mực trên giấy) */
.ancient-input {
  width: 100%; background: #00000030; border: none;
  color: var(--text-light); padding: 12px; font-family: "Noto Serif TC";
  font-size: 1em; outline: none; transition: 0.2s;
  border-bottom: 2px solid var(--wood-light);
}
.ancient-input:focus { border-bottom-color: var(--gold-accent); background: #00000050; }

/* Rename Module */
.input-with-btn { display: flex; gap: 10px; }
.btn-seal {
  background: var(--red-seal); border: 2px solid var(--red-seal);
  color: #fff; padding: 0 20px; cursor: pointer;
  font-weight: bold; font-family: "Cinzel"; transition: 0.2s;
  border-radius: 4px;
}
.btn-seal.green { background: #2e7d32; border-color: #1b5e20; }
.btn-seal.green:hover { background: #388e3c; }
.btn-seal:hover:not(:disabled) { background: #d32f2f; }

.sys-msg {
  font-size: 0.8em; margin-top: 10px; padding: 10px;
  background-color: var(--paper-bg); border-left: 4px solid var(--red-seal);
  color: var(--red-seal); font-family: "Noto Serif TC";
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}

/* Security Module */
.form-group { margin-bottom: 15px; }

/* ANIMATIONS */
@keyframes spin { 100% { transform: rotate(360deg); } }
@keyframes scan { 0% { top: 0; } 100% { top: 100%; } }

/* RESPONSIVE */
@media (max-width: 768px) {
  .profile-grid { grid-template-columns: 1fr; gap: 20px; }
}
</style>