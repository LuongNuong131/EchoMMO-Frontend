<template>
  <div class="page-container profile-page">
    <div class="cyber-grid-bg"></div>
    <div class="vignette"></div>

    <div class="profile-wrapper">
      <div class="profile-header">
        <button @click="$router.push('/')" class="btn-back">
          <i class="fas fa-arrow-left"></i> SYSTEM HOME
        </button>
        <h2 class="header-title">AGENT DOSSIER</h2>
      </div>

      <div class="profile-grid">
        <div class="cyber-panel identity-panel">
          <div class="panel-decor-corner top-left"></div>
          <div class="panel-decor-corner bottom-right"></div>

          <div class="id-header">
            <i class="fas fa-id-card"></i> IDENTITY RECORD
          </div>

          <div class="avatar-container">
            <div class="hex-frame">
              <div class="avatar-display">
                {{ authStore.user?.avatarUrl || "🤠" }}
              </div>
              <div class="spin-ring"></div>
            </div>
            <div class="scan-line"></div>
          </div>

          <div class="avatar-selector">
            <div class="selector-label">MODIFY AVATAR_</div>
            <div class="icon-grid">
              <button
                v-for="icon in avatars"
                :key="icon"
                @click="changeAvatar(icon)"
                class="icon-btn"
                :class="{ active: authStore.user?.avatarUrl === icon }"
              >
                {{ icon }}
              </button>
            </div>
          </div>

          <div class="static-data">
            <div class="data-row">
              <span class="label">USER_ID:</span>
              <span class="value code-font">{{
                authStore.user?.username.toUpperCase()
              }}</span>
            </div>
            <div class="data-row">
              <span class="label">REG_DATE:</span>
              <span class="value code-font">{{
                new Date(authStore.user?.createdAt).toLocaleDateString()
              }}</span>
            </div>
            <div class="data-row">
              <span class="label">STATUS:</span>
              <span class="value active-status">OPERATIONAL</span>
            </div>
          </div>
        </div>

        <div class="right-column">
          <div class="cyber-panel rename-panel">
            <div class="panel-title">
              <i class="fas fa-signature"></i> CODENAME ASSIGNMENT
            </div>
            <form @submit.prevent="updateName" class="cyber-form">
              <div class="input-wrapper">
                <label>DISPLAY NAME</label>
                <div class="input-with-btn">
                  <input
                    v-model="charName"
                    class="cyber-input"
                    required
                    minlength="3"
                    placeholder="Enter new codename..."
                  />
                  <button type="submit" class="btn-save">EXECUTE</button>
                </div>
                <div class="sys-msg warning">
                  <i class="fas fa-exclamation-triangle"></i> Unique identifier
                  required on server network.
                </div>
              </div>
            </form>
          </div>

          <div class="cyber-panel security-panel">
            <div class="panel-title">
              <i class="fas fa-shield-alt"></i> SECURITY PROTOCOL
            </div>
            <form @submit.prevent="changePassword" class="cyber-form">
              <div class="form-group">
                <label>CURRENT ACCESS KEY</label>
                <input
                  v-model="passForm.currentPassword"
                  type="password"
                  class="cyber-input"
                  required
                />
              </div>
              <div class="form-group">
                <label>NEW ACCESS KEY</label>
                <input
                  v-model="passForm.newPassword"
                  type="password"
                  class="cyber-input"
                  required
                />
              </div>
              <button class="btn-security">UPDATE CREDENTIALS</button>
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
import GameHeader from "../components/GameHeader.vue";

const authStore = useAuthStore();
const charStore = useCharacterStore();
const avatars = ["🐲", "🐺", "🧚", "🧙", "🥷", "🧟", "🤖", "👽"];
const charName = ref("");
const passForm = reactive({ currentPassword: "", newPassword: "" });

const updateName = async () => {
  if (!confirm("Confirm codename change?")) return;
  try {
    const res = await axiosClient.post("/character/rename", {
      name: charName.value,
    });
    alert("Codename updated successfully.");
    await charStore.fetchCharacter();
    await authStore.fetchProfile();
  } catch (e) {
    alert(e.response?.data || "Update Failed");
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
    alert("Security credentials updated.");
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
/* --- BASE --- */
.profile-page {
  background: #050505;
  min-height: 100vh;
  font-family: "Rajdhani", sans-serif;
  color: #fff;
  position: relative;
  overflow: hidden;
}

.cyber-grid-bg {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(
      rgba(0, 243, 255, 0.03) 1px,
      transparent 1px
    ),
    linear-gradient(90deg, rgba(0, 243, 255, 0.03) 1px, transparent 1px);
  background-size: 30px 30px;
  z-index: 0;
  pointer-events: none;
}
.vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, transparent 0%, #000 120%);
  pointer-events: none;
  z-index: 1;
}

.profile-wrapper {
  position: relative;
  z-index: 10;
  max-width: 1000px;
  margin: 0 auto;
  padding: 80px 20px 40px;
}

/* --- HEADER --- */
.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 15px;
}
.btn-back {
  background: transparent;
  border: 1px solid #444;
  color: #888;
  padding: 8px 15px;
  cursor: pointer;
  font-family: "Orbitron";
  transition: 0.3s;
}
.btn-back:hover {
  border-color: #00f3ff;
  color: #00f3ff;
}
.header-title {
  font-family: "Orbitron";
  letter-spacing: 3px;
  color: #fff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
  margin: 0;
}

/* --- GRID LAYOUT --- */
.profile-grid {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 20px;
}

.cyber-panel {
  background: rgba(10, 15, 30, 0.85);
  border: 1px solid #334155;
  padding: 25px;
  position: relative;
  backdrop-filter: blur(10px);
}
.panel-decor-corner {
  position: absolute;
  width: 10px;
  height: 10px;
  border: 2px solid #00f3ff;
}
.top-left {
  top: -1px;
  left: -1px;
  border-bottom: none;
  border-right: none;
}
.bottom-right {
  bottom: -1px;
  right: -1px;
  border-top: none;
  border-left: none;
}

/* --- LEFT PANEL: IDENTITY --- */
.identity-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.id-header {
  width: 100%;
  border-bottom: 1px dashed #444;
  padding-bottom: 10px;
  margin-bottom: 20px;
  font-family: "Orbitron";
  color: #00f3ff;
  letter-spacing: 2px;
}

.avatar-container {
  position: relative;
  width: 150px;
  height: 150px;
  margin-bottom: 20px;
}
.hex-frame {
  width: 100%;
  height: 100%;
  background: #000;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  border: 2px solid #333; /* Simulated border */
}
.avatar-display {
  font-size: 5em;
  z-index: 5;
}
.spin-ring {
  position: absolute;
  inset: -5px;
  border: 2px dashed #00f3ff;
  border-radius: 50%;
  animation: spin 10s linear infinite;
  z-index: 1;
  opacity: 0.5;
}
.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: #00f3ff;
  box-shadow: 0 0 10px #00f3ff;
  animation: scan 2s ease-in-out infinite alternate;
  z-index: 10;
  opacity: 0.7;
}

.avatar-selector {
  width: 100%;
  margin-bottom: 25px;
}
.selector-label {
  font-size: 0.8em;
  color: #64748b;
  margin-bottom: 10px;
  font-family: monospace;
}
.icon-grid {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}
.icon-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #333;
  font-size: 1.2em;
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-btn:hover {
  border-color: #fff;
  background: rgba(255, 255, 255, 0.1);
}
.icon-btn.active {
  border-color: #00f3ff;
  box-shadow: 0 0 10px rgba(0, 243, 255, 0.3);
  background: rgba(0, 243, 255, 0.1);
}

.static-data {
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #333;
}
.data-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.9em;
}
.data-row:last-child {
  margin-bottom: 0;
}
.label {
  color: #64748b;
}
.value {
  color: #e2e8f0;
  font-weight: bold;
}
.code-font {
  font-family: monospace;
  color: #00f3ff;
}
.active-status {
  color: #2ecc71;
  text-shadow: 0 0 5px #2ecc71;
}

/* --- RIGHT COLUMN --- */
.right-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.panel-title {
  font-family: "Orbitron";
  color: #cbd5e1;
  border-bottom: 1px solid #334155;
  padding-bottom: 10px;
  margin-bottom: 20px;
  font-size: 1.1em;
}

.cyber-form label {
  display: block;
  font-size: 0.8em;
  color: #94a3b8;
  margin-bottom: 8px;
  letter-spacing: 1px;
}

/* Input Styles */
.cyber-input {
  width: 100%;
  background: #020617;
  border: 1px solid #334155;
  color: #fff;
  padding: 12px;
  font-family: "Rajdhani";
  font-size: 1em;
  outline: none;
  transition: 0.3s;
}
.cyber-input:focus {
  border-color: #00f3ff;
  box-shadow: 0 0 8px rgba(0, 243, 255, 0.2);
}

/* Rename Module */
.input-with-btn {
  display: flex;
  gap: 10px;
}
.btn-save {
  background: rgba(0, 243, 255, 0.1);
  border: 1px solid #00f3ff;
  color: #00f3ff;
  padding: 0 20px;
  cursor: pointer;
  font-weight: bold;
  font-family: "Orbitron";
  transition: 0.3s;
}
.btn-save:hover {
  background: #00f3ff;
  color: #000;
}
.sys-msg {
  font-size: 0.8em;
  margin-top: 10px;
  padding: 8px;
  background: rgba(255, 165, 0, 0.1);
  border-left: 2px solid orange;
  color: orange;
}

/* Security Module */
.form-group {
  margin-bottom: 15px;
}
.btn-security {
  width: 100%;
  padding: 12px;
  margin-top: 10px;
  background: rgba(255, 0, 85, 0.1);
  border: 1px solid #ff0055;
  color: #ff0055;
  font-weight: bold;
  cursor: pointer;
  font-family: "Orbitron";
  transition: 0.3s;
}
.btn-security:hover {
  background: #ff0055;
  color: #fff;
  box-shadow: 0 0 15px rgba(255, 0, 85, 0.4);
}

/* ANIMATIONS */
@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}
@keyframes scan {
  0% {
    top: 0;
  }
  100% {
    top: 100%;
  }
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}
</style>
