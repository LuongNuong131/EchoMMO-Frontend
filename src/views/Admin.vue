<template>
  <div class="page-container admin-view ancient-theme">
    <div class="admin-wrapper">
      <div class="admin-header wood-panel">
        <div class="header-ornament left"></div>
        <div class="header-ornament right"></div>
        <h2 class="header-title">
          <span class="ornament">❖</span> QUẢN TRỊ THIÊN PHỦ
          <span class="ornament">❖</span>
        </h2>

        <div class="tabs">
          <button
            :class="{ active: activeTab === 'stats' }"
            @click="switchTab('stats')"
          >
            <i class="fas fa-chart-line"></i> THỐNG KÊ
          </button>
          <button
            :class="{ active: activeTab === 'users' }"
            @click="switchTab('users')"
          >
            <i class="fas fa-users"></i> NHÂN SĨ
          </button>
          <button
            :class="{ active: activeTab === 'items' }"
            @click="switchTab('items')"
          >
            <i class="fas fa-khanda"></i> KHO TÀNG
          </button>
          <button
            :class="{ active: activeTab === 'market' }"
            @click="switchTab('market')"
          >
            <i class="fas fa-balance-scale"></i> THƯƠNG HỘI
          </button>
          <button
            :class="{ active: activeTab === 'grant' }"
            @click="switchTab('grant')"
          >
            <i class="fas fa-gift"></i> BAN THƯỞNG
          </button>
          <button
            :class="{ active: activeTab === 'notify' }"
            @click="switchTab('notify')"
          >
            <i class="fas fa-scroll"></i> CÁO THỊ
          </button>
        </div>
      </div>

      <div v-if="activeTab === 'stats'" class="stats-panel">
        <div class="stat-card paper-texture">
          <h3>TỔNG NHÂN SĨ</h3>
          <p class="num">{{ stats.totalUsers || 0 }}</p>
          <div class="seal-bg"><i class="fas fa-user"></i></div>
        </div>
        <div class="stat-card paper-texture">
          <h3>TỔNG VẬT PHẨM</h3>
          <p class="num">{{ stats.totalItems || 0 }}</p>
          <div class="seal-bg"><i class="fas fa-box-open"></i></div>
        </div>
        <div class="stat-card paper-texture">
          <h3>NGÂN LƯỢNG LƯU THÔNG</h3>
          <p class="num gold-text">{{ formatNumber(stats.totalGold || 0) }}</p>
          <div class="seal-bg"><i class="fas fa-coins"></i></div>
        </div>
      </div>

      <div v-if="activeTab === 'users'" class="content-panel paper-texture">
        <h3 class="panel-title">DANH SÁCH NHÂN SĨ</h3>
        <div class="table-responsive custom-scroll">
          <table class="ancient-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>DANH TÍNH</th>
                <th>THƯ TÍN (EMAIL)</th>
                <th>VAI TRÒ</th>
                <th>TRẠNG THÁI</th>
                <th>HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in adminStore.users" :key="u.userId">
                <td>#{{ u.userId }}</td>
                <td class="bold-text">{{ u.username }}</td>
                <td>{{ u.email }}</td>
                <td>{{ u.role }}</td>
                <td>
                  <span v-if="u.isActive" class="stamp green">HOẠT ĐỘNG</span>
                  <span v-else class="stamp red">ĐÃ GIAM</span>
                </td>
                <td class="action-cell">
                  <button
                    v-if="u.isActive"
                    @click="openBanModal(u)"
                    class="btn-icon red"
                    title="Giam cầm"
                  >
                    <i class="fas fa-gavel"></i>
                  </button>
                  <button
                    v-else
                    @click="unbanUser(u.userId)"
                    class="btn-icon green"
                    title="Phóng thích"
                  >
                    <i class="fas fa-lock-open"></i>
                  </button>
                  <button
                    @click="deleteUser(u.userId)"
                    class="btn-icon gray"
                    title="Xóa bỏ"
                  >
                    <i class="fas fa-skull"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="activeTab === 'items'" class="content-panel paper-texture">
        <div class="flex-head">
          <h3 class="panel-title">KHO TÀNG VẬT PHẨM</h3>
          <button @click="showCreateItem = !showCreateItem" class="btn-wood">
            <i class="fas fa-plus"></i> CHẾ TÁC MỚI
          </button>
        </div>

        <transition name="fade">
          <div v-if="showCreateItem" class="create-box">
            <form @submit.prevent="createItem" class="ancient-form">
              <div class="form-row">
                <input
                  v-model="itemForm.name"
                  placeholder="Tên vật phẩm..."
                  class="ink-input"
                  required
                />
                <input
                  v-model="itemForm.description"
                  placeholder="Mô tả..."
                  class="ink-input"
                />
              </div>
              <div class="form-row">
                <select v-model="itemForm.type" class="ink-input">
                  <option value="WEAPON">Binh Khí</option>
                  <option value="ARMOR">Y Phục</option>
                  <option value="HELMET">Mũ</option>
                  <option value="BOOTS">Giày</option>
                  <option value="RING">Nhẫn</option>
                  <option value="NECKLACE">Dây Chuyền</option>
                  <option value="CONSUMABLE">Tiêu Hao</option>
                  <option value="MATERIAL">Nguyên Liệu</option>
                </select>
                <select v-model="itemForm.rarity" class="ink-input">
                  <option value="C">Thường (C)</option>
                  <option value="B">Hiếm (B)</option>
                  <option value="A">Sử Thi (A)</option>
                  <option value="S">Truyền Thuyết (S)</option>
                </select>
                <input
                  v-model.number="itemForm.basePrice"
                  type="number"
                  placeholder="Giá bán"
                  class="ink-input"
                />
              </div>
              <div
                class="form-row"
                v-if="
                  [
                    'WEAPON',
                    'ARMOR',
                    'HELMET',
                    'BOOTS',
                    'RING',
                    'NECKLACE',
                  ].includes(itemForm.type)
                "
              >
                <input
                  v-model.number="itemForm.atkBonus"
                  type="number"
                  placeholder="Công Lực"
                  class="ink-input"
                />
                <input
                  v-model.number="itemForm.defBonus"
                  type="number"
                  placeholder="Phòng Thủ"
                  class="ink-input"
                />
                <input
                  v-model.number="itemForm.speedBonus"
                  type="number"
                  placeholder="Thân Pháp"
                  class="ink-input"
                />
              </div>
              <div class="form-row" v-if="itemForm.type === 'CONSUMABLE'">
                <input
                  v-model.number="itemForm.hpBonus"
                  type="number"
                  placeholder="Hồi Phục Sinh Lực"
                  class="ink-input"
                />
              </div>
              <div class="form-row align-center">
                <label class="check-label">
                  <input type="checkbox" v-model="itemForm.isSystemItem" />
                  <span class="label-text">Hàng Shop Vô Hạn?</span>
                </label>
                <button type="submit" class="btn-wood primary">HOÀN TẤT</button>
              </div>
            </form>
          </div>
        </transition>

        <div class="table-responsive custom-scroll">
          <table class="ancient-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>TÊN VẬT PHẨM</th>
                <th>LOẠI</th>
                <th>PHẨM CẤP</th>
                <th>GIÁ</th>
                <th>HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="i in adminStore.items" :key="i.itemId">
                <td>#{{ i.itemId }}</td>
                <td class="bold-text">{{ i.name }}</td>
                <td>{{ translateType(i.type) }}</td>
                <td :class="'text-' + i.rarity">{{ i.rarity }}</td>
                <td>{{ i.basePrice }}</td>
                <td>
                  <button
                    @click="adminStore.deleteItem(i.itemId)"
                    class="btn-icon red"
                  >
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="activeTab === 'market'" class="content-panel paper-texture">
        <h3 class="panel-title">SỔ GIAO DỊCH</h3>
        <div class="table-responsive custom-scroll">
          <table class="ancient-table">
            <thead>
              <tr>
                <th>NGƯỜI BÁN</th>
                <th>VẬT PHẨM</th>
                <th>GIÁ</th>
                <th>SỐ LƯỢNG</th>
                <th>TRẠNG THÁI</th>
                <th>XỬ LÝ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="l in adminStore.listings" :key="l.listingId">
                <td>{{ l.seller.username }}</td>
                <td class="bold-text">{{ l.item.name }}</td>
                <td class="gold-text">{{ l.price }}</td>
                <td>{{ l.quantity }}</td>
                <td>{{ l.status }}</td>
                <td>
                  <button
                    @click="adminStore.deleteListing(l.listingId)"
                    class="btn-wood red small"
                  >
                    GỠ BỎ
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="activeTab === 'grant'" class="content-panel paper-texture">
        <h3 class="panel-title">BAN THƯỞNG</h3>

        <div class="grant-layout">
          <div class="grant-sidebar">
            <button
              @click="grantType = 'GOLD'"
              :class="['grant-opt', { active: grantType === 'GOLD' }]"
            >
              <i class="fas fa-coins"></i> NGÂN LƯỢNG
            </button>
            <button
              @click="grantType = 'ITEM'"
              :class="['grant-opt', { active: grantType === 'ITEM' }]"
            >
              <i class="fas fa-box-open"></i> BẢO VẬT
            </button>
          </div>

          <div class="grant-form-area ancient-border">
            <form
              v-if="grantType === 'GOLD'"
              @submit.prevent="giveGold"
              class="ancient-form"
            >
              <div class="form-header">
                <i class="fas fa-money-bill-wave gold-text"></i> CẤP PHÁT NGÂN
                LƯỢNG
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>NGƯỜI NHẬN</label>
                  <input
                    v-model="goldForm.username"
                    placeholder="Nhập tên nhân sĩ..."
                    class="ink-input large"
                    required
                  />
                </div>
                <div class="form-group">
                  <label>SỐ LƯỢNG</label>
                  <input
                    v-model.number="goldForm.amount"
                    type="number"
                    placeholder="Nhập số lượng..."
                    class="ink-input large"
                    required
                  />
                </div>
              </div>
              <button class="btn-wood primary big-btn">BAN THƯỞNG NGAY</button>
            </form>

            <form v-else @submit.prevent="grantItem" class="ancient-form">
              <div class="form-header">
                <i class="fas fa-gem blue-text"></i> BAN TẶNG BẢO VẬT
              </div>
              <div class="form-group">
                <label>NGƯỜI NHẬN</label>
                <input
                  v-model="itemGrantForm.username"
                  placeholder="Nhập tên nhân sĩ..."
                  class="ink-input large"
                  required
                />
              </div>
              <div class="form-row">
                <div class="form-group flex-2">
                  <label>VẬT PHẨM</label>
                  <select
                    v-model="itemGrantForm.itemId"
                    class="ink-input large"
                    required
                  >
                    <option :value="null" disabled>-- Chọn vật phẩm --</option>
                    <option
                      v-for="i in adminStore.items"
                      :key="i.itemId"
                      :value="i.itemId"
                    >
                      [{{ i.rarity }}] {{ i.name }} -
                      {{ translateType(i.type) }}
                    </option>
                  </select>
                </div>
                <div class="form-group flex-1">
                  <label>SỐ LƯỢNG</label>
                  <input
                    v-model.number="itemGrantForm.quantity"
                    type="number"
                    placeholder="1"
                    class="ink-input large"
                    required
                  />
                </div>
              </div>
              <button class="btn-wood primary big-btn">GỬI VẬT PHẨM</button>
            </form>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'notify'" class="content-panel paper-texture">
        <h3 class="panel-title">PHÁT CÁO THỊ</h3>
        <div class="notify-layout">
          <form
            @submit.prevent="sendNotification"
            class="ancient-form full-width"
          >
            <div class="form-row">
              <div class="form-group flex-3">
                <label>TIÊU ĐỀ CÁO THỊ</label>
                <input
                  v-model="notifForm.title"
                  placeholder="Ví dụ: Thiên hạ thái bình..."
                  class="ink-input large"
                  required
                />
              </div>
              <div class="form-group flex-1">
                <label>LOẠI TIN</label>
                <select v-model="notifForm.type" class="ink-input large">
                  <option value="INFO">Thông Tin</option>
                  <option value="WARNING">Cảnh Báo</option>
                  <option value="SUCCESS">Tin Vui</option>
                  <option value="ERROR">Khẩn Cấp</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>NỘI DUNG CHI TIẾT</label>
              <textarea
                v-model="notifForm.message"
                placeholder="Viết nội dung cáo thị tại đây..."
                class="ink-input text-area big-area"
                required
              ></textarea>
            </div>

            <div class="form-row align-end">
              <div class="form-group flex-1">
                <label>ĐỐI TƯỢNG NHẬN</label>
                <select v-model="notifMode" class="ink-input large">
                  <option value="ALL">Toàn Server (Loa Lớn)</option>
                  <option value="USER">Cá Nhân (Mật Thư)</option>
                </select>
              </div>
              <div class="form-group flex-2" v-if="notifMode === 'USER'">
                <label>TÊN NGƯỜI NHẬN</label>
                <input
                  v-model="notifForm.recipientUsername"
                  placeholder="Nhập tên..."
                  class="ink-input large"
                />
              </div>
              <div class="form-group flex-1">
                <button class="btn-wood primary big-btn">ĐĂNG CÁO THỊ</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div
      v-if="showBanModal"
      class="ancient-modal-overlay"
      @click.self="showBanModal = false"
    >
      <div class="ancient-modal paper-texture">
        <div class="modal-head">
          <span class="ornament">❖</span> PHÁN QUYẾT
          <span class="ornament">❖</span>
        </div>
        <div class="modal-body">
          <h3>
            Giam cầm: <span class="red-text">{{ selectedUser?.username }}</span>
          </h3>
          <textarea
            v-model="banReason"
            placeholder="Lý do trừng phạt..."
            class="ink-input text-area"
            rows="3"
          ></textarea>
          <div class="modal-actions">
            <button @click="confirmBan" class="btn-wood red">XÁC NHẬN</button>
            <button @click="showBanModal = false" class="btn-wood">
              HỦY BỎ
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// --- LOGIC GIỮ NGUYÊN KHÔNG ĐỔI ---
import { ref, reactive, onMounted } from "vue";
import { useAdminStore } from "../stores/adminStore";
import axiosClient from "../api/axiosClient";

const adminStore = useAdminStore();
const activeTab = ref("stats");
const grantType = ref("GOLD");
const showCreateItem = ref(false);
const stats = ref({});

const showBanModal = ref(false);
const selectedUser = ref(null);
const banReason = ref("");

const goldForm = reactive({ username: "", amount: 1000 });
const itemGrantForm = reactive({ username: "", itemId: null, quantity: 1 });
const itemForm = reactive({
  name: "",
  description: "",
  type: "WEAPON",
  rarity: "C",
  basePrice: 100,
  isSystemItem: false,
  atkBonus: 0,
  defBonus: 0,
  speedBonus: 0,
  hpBonus: 0,
});

const notifMode = ref("ALL");
const notifForm = reactive({
  title: "",
  message: "",
  type: "INFO",
  recipientUsername: "",
});

const formatNumber = (n) => Number(n || 0).toLocaleString();

const translateType = (type) => {
  const map = {
    WEAPON: "Binh Khí",
    ARMOR: "Giáp",
    HELMET: "Mũ",
    BOOTS: "Giày",
    CONSUMABLE: "Tiêu Hao",
    MATERIAL: "Nguyên Liệu",
    RING: "Nhẫn",
    NECKLACE: "Dây Chuyền",
  };
  return map[type] || type;
};

const switchTab = (tab) => {
  activeTab.value = tab;
  if (tab === "stats") fetchStats();
  if (tab === "users") adminStore.fetchUsers();
  if (tab === "items" || tab === "grant") adminStore.fetchItems();
  if (tab === "market") adminStore.fetchListings();
};

const fetchStats = async () => {
  try {
    const res = await axiosClient.get("/admin/stats");
    stats.value = res.data;
  } catch (e) {}
};

const createItem = async () => {
  try {
    await axiosClient.post("/admin/item/create", itemForm);
    alert("Tạo Item thành công!");
    showCreateItem.value = false;
    adminStore.fetchItems();
    Object.assign(itemForm, {
      name: "",
      description: "",
      type: "WEAPON",
      rarity: "C",
      basePrice: 100,
      isSystemItem: false,
      atkBonus: 0,
      defBonus: 0,
      speedBonus: 0,
      hpBonus: 0,
    });
  } catch (e) {
    alert(e.message);
  }
};

const openBanModal = (u) => {
  selectedUser.value = u;
  banReason.value = "";
  showBanModal.value = true;
};
const confirmBan = async () => {
  if (!banReason.value) return alert("Vui lòng nhập lý do!");
  await axiosClient.post(`/admin/user/ban/${selectedUser.value.userId}`, {
    reason: banReason.value,
  });
  showBanModal.value = false;
  adminStore.fetchUsers();
};
const unbanUser = async (id) => {
  await axiosClient.post(`/admin/user/unban/${id}`);
  adminStore.fetchUsers();
};
const deleteUser = async (id) => {
  if (confirm("Xóa vĩnh viễn user này?")) await adminStore.deleteUser(id);
};

const giveGold = async () => {
  try {
    await axiosClient.post("/admin/grant-gold", goldForm);
    alert("Đã gửi tiền!");
  } catch (e) {
    alert(e.response?.data);
  }
};
const grantItem = async () => {
  await adminStore.grantItem(itemGrantForm);
};

const sendNotification = async () => {
  if (notifMode.value === "ALL") notifForm.recipientUsername = null;
  if (notifMode.value === "USER" && !notifForm.recipientUsername)
    return alert("Nhập tên người nhận!");
  await adminStore.sendNotification(notifForm);
  notifForm.title = "";
  notifForm.message = "";
};

onMounted(() => fetchStats());
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Cinzel:wght@400;700&display=swap");

:root {
  --bg-dark: #1a1510;
  --wood-dark: #3e2723;
  --wood-light: #5d4037;
  --paper-bg: #fdf5e6;
  --gold-accent: #fbc02d;
  --red-seal: #b71c1c;
  --text-ink: #2c1810;
}

.admin-view.ancient-theme {
  background: var(--bg-dark);
  min-height: 100vh;
  font-family: "Playfair Display", serif;
  color: var(--text-ink);
  overflow-y: auto;
}

.admin-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  padding-bottom: 80px;
}

/* --- TEXTURES --- */
.paper-texture {
  background-color: var(--paper-bg);
  background-image: url("https://www.transparenttextures.com/patterns/aged-paper.png");
}
.wood-panel {
  background: var(--wood-dark);
  background-image: url("https://www.transparenttextures.com/patterns/wood-pattern.png");
  border: 4px solid var(--wood-light);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
}
.custom-scroll::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #8d6e63;
  border-radius: 4px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

/* --- HEADER --- */
.admin-header {
  padding: 20px;
  margin-bottom: 25px;
  text-align: center;
  position: relative;
}
.header-title {
  color: var(--gold-accent);
  font-family: "Cinzel";
  font-size: 1.8em;
  margin-bottom: 15px;
  text-shadow: 2px 2px 4px #000;
}
.ornament {
  color: #8d6e63;
  margin: 0 10px;
}

.tabs {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}
.tabs button {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #8d6e63;
  color: #bcaaa4;
  padding: 8px 15px;
  cursor: pointer;
  font-family: "Cinzel";
  font-weight: bold;
  transition: 0.3s;
}
.tabs button:hover,
.tabs button.active {
  background: var(--red-seal);
  color: #fff;
  border-color: var(--red-seal);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}

/* --- PANELS GENERAL --- */
.content-panel {
  padding: 25px;
  border: 2px solid var(--wood-light);
  border-radius: 4px;
  margin-bottom: 30px;
  min-height: 400px;
}
.panel-title {
  font-family: "Cinzel";
  color: var(--wood-dark);
  border-bottom: 2px double var(--wood-dark);
  padding-bottom: 10px;
  margin-bottom: 25px;
  text-align: center;
  font-size: 1.6em;
  letter-spacing: 2px;
}

/* --- NEW GRANT LAYOUT (Ban Thưởng) --- */
.grant-layout {
  display: flex;
  gap: 20px;
}
.grant-sidebar {
  width: 200px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.grant-opt {
  padding: 15px;
  text-align: left;
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid #d7ccc8;
  font-family: "Cinzel";
  font-weight: bold;
  cursor: pointer;
  color: #5d4037;
  transition: 0.2s;
}
.grant-opt i {
  margin-right: 8px;
  width: 20px;
  text-align: center;
}
.grant-opt.active {
  background: var(--wood-dark);
  color: var(--gold-accent);
  border-color: var(--wood-dark);
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
}

.grant-form-area {
  flex: 1;
  padding: 25px;
  border: 1px dashed #8d6e63;
  background: rgba(255, 255, 255, 0.4);
}
.form-header {
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 20px;
  border-bottom: 1px solid #d7ccc8;
  padding-bottom: 10px;
  font-family: "Cinzel";
}
.gold-text {
  color: #f57f17;
}
.blue-text {
  color: #1565c0;
}

/* --- NOTIFY LAYOUT (Cáo Thị) --- */
.notify-layout {
  max-width: 900px;
  margin: 0 auto;
}
.text-area.big-area {
  min-height: 200px;
  font-size: 1.1em;
  line-height: 1.6;
}

/* --- FORMS & INPUTS (General) --- */
.ancient-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.form-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.flex-1 {
  flex: 1;
}
.flex-2 {
  flex: 2;
}
.flex-3 {
  flex: 3;
}
.align-end {
  align-items: flex-end;
}
.align-center {
  align-items: center;
}

label {
  font-size: 0.85em;
  font-weight: bold;
  color: var(--wood-dark);
  font-family: "Cinzel";
}

.ink-input {
  background: transparent;
  border: none;
  border-bottom: 2px solid var(--wood-light);
  padding: 8px 5px;
  font-family: "Playfair Display";
  font-weight: bold;
  color: var(--text-ink);
  outline: none;
  transition: 0.3s;
  width: 100%;
}
.ink-input.large {
  font-size: 1.2em;
  padding: 10px 5px;
}
.ink-input:focus {
  border-bottom-color: var(--red-seal);
  background: rgba(183, 28, 28, 0.05);
}
.text-area {
  resize: vertical;
  border: 1px solid var(--wood-light);
  padding: 10px;
  border-radius: 4px;
}

/* Buttons */
.btn-wood {
  padding: 10px 25px;
  background: #efebe9;
  border: 2px solid var(--wood-dark);
  color: var(--wood-dark);
  font-family: "Cinzel";
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
}
.btn-wood:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
.btn-wood.primary {
  background: var(--red-seal);
  color: #fff;
  border-color: #b71c1c;
}
.big-btn {
  font-size: 1.1em;
  padding: 12px 30px;
  width: 100%;
}

/* --- STATS PANEL (Giữ nguyên) --- */
.stats-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}
.stat-card {
  padding: 20px;
  text-align: center;
  border: 2px solid var(--wood-light);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}
.stat-card h3 {
  font-family: "Cinzel";
  font-size: 1em;
  color: var(--wood-dark);
  border-bottom: 1px dashed #8d6e63;
  padding-bottom: 5px;
  margin-bottom: 10px;
}
.num {
  font-size: 2.2em;
  font-weight: bold;
  color: var(--red-seal);
  font-family: "Cinzel";
}
.seal-bg {
  position: absolute;
  bottom: -10px;
  right: -10px;
  font-size: 4em;
  opacity: 0.1;
  color: var(--wood-dark);
  transform: rotate(-15deg);
}

/* --- TABLES (Giữ nguyên) --- */
.ancient-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}
.ancient-table th {
  background: var(--wood-light);
  color: #fff;
  padding: 12px;
  font-family: "Cinzel";
  font-size: 0.9em;
  text-align: left;
}
.ancient-table td {
  padding: 10px;
  border-bottom: 1px dashed #8d6e63;
  color: var(--text-ink);
}
.stamp {
  padding: 3px 8px;
  border: 1px solid;
  font-weight: bold;
  font-size: 0.75em;
  border-radius: 4px;
}
.stamp.green {
  color: #2e7d32;
  border-color: #2e7d32;
}
.stamp.red {
  color: #c62828;
  border-color: #c62828;
}
.btn-icon {
  background: transparent;
  border: none;
  font-size: 1.1em;
  margin-right: 5px;
  cursor: pointer;
}
.btn-icon.red {
  color: #c62828;
}
.btn-icon.green {
  color: #2e7d32;
}
.btn-icon.gray {
  color: #5d4037;
}

/* Modal */
.ancient-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
}
.ancient-modal {
  width: 400px;
  border: 4px double var(--wood-dark);
  box-shadow: 0 0 25px rgba(0, 0, 0, 0.8);
}
.modal-head {
  background: var(--wood-dark);
  color: var(--gold-accent);
  padding: 10px;
  text-align: center;
  font-family: "Cinzel";
  font-weight: bold;
}
.modal-body {
  padding: 20px;
  text-align: center;
}
.modal-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: center;
}

/* Responsive Grant/Notify */
@media (max-width: 768px) {
  .grant-layout {
    flex-direction: column;
  }
  .grant-sidebar {
    width: 100%;
    flex-direction: row;
  }
  .grant-opt {
    text-align: center;
  }
  .form-row {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
