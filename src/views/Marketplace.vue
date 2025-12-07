<template>
  <div class="page-container wuxia-market dark-theme">
    <div class="ink-bg-layer">
      <div class="mountain-bg"></div>
      <div class="fog-anim"></div>
    </div>

    <div class="market-overlay">
      <div class="market-header">
        <div class="header-decor left"></div>
        <h2 class="market-title">THƯƠNG HỘI</h2>
        <div class="header-decor right"></div>
        
        <div class="market-tabs">
          <button :class="{ active: activeTab === 'buy' }" @click="activeTab = 'buy'" class="tab-btn">
            <i class="fas fa-store"></i> TIỆM TẠP HÓA
          </button>
          <div class="tab-divider"></div>
          <button :class="{ active: activeTab === 'p2p' }" @click="activeTab = 'p2p'" class="tab-btn">
            <i class="fas fa-handshake"></i> CHỢ TRỜI
          </button>
          <div class="tab-divider"></div>
          <button :class="{ active: activeTab === 'my_listings' }" @click="loadMyListings" class="tab-btn">
            <i class="fas fa-clipboard-list"></i> SẠP CỦA TA
          </button>
          <div class="tab-divider"></div>
          <button :class="{ active: activeTab === 'sell_sys' }" @click="activeTab = 'sell_sys'" class="tab-btn">
            <i class="fas fa-coins"></i> BÁN ĐỒ
          </button>
        </div>
      </div>

      <div class="market-content custom-scroll">
        <transition name="fade-slide" mode="out-in">
          
          <div v-if="activeTab === 'buy'" class="grid-layout" key="buy">
            <div v-for="item in marketStore.shopItems" :key="item.itemId" class="item-card system-card">
              <div class="card-top">
                <div class="img-frame" :class="'border-' + item.rarity">
                  <img v-if="item.imageUrl" :src="item.imageUrl" />
                  <i v-else class="fas fa-box-open placeholder-icon"></i>
                  <span class="rarity-tag" :class="'bg-' + item.rarity">{{ item.rarity }}</span>
                </div>
              </div>
              <div class="card-body">
                <div class="item-name">{{ item.name }}</div>
                <div class="item-type">{{ item.type }}</div>
                <div class="price-row">
                  <span class="label">Giá:</span>
                  <span class="val gold-text">{{ formatNumber(item.basePrice) }} <i class="fas fa-coins"></i></span>
                </div>
              </div>
              <div class="card-footer">
                <input type="number" v-model.number="buyQty[item.itemId]" min="1" class="dark-input" placeholder="1" />
                <button @click="askBuySystem(item)" class="btn-action btn-buy-sys">
                  MUA
                </button>
              </div>
            </div>
          </div>

          <div v-else-if="activeTab === 'p2p'" class="grid-layout" key="p2p">
            <div v-if="marketStore.playerListings.length === 0" class="empty-state">
              <i class="fas fa-wind"></i> <p>Chợ hôm nay vắng lặng...</p>
            </div>
            <div v-for="listing in marketStore.playerListings" :key="listing.listingId" class="item-card p2p-card">
              <div class="seller-badge">
                <i class="fas fa-user-tag"></i> {{ listing.seller.username }}
              </div>
              <div class="card-body p2p-body">
                <div class="item-name gold-glow">
                  {{ listing.item.name }}
                  <span v-if="listing.enhanceLevel > 0" class="enhance-txt">(+{{ listing.enhanceLevel }})</span>
                </div>
                <div class="stock-info">Tồn kho: <span class="highlight">{{ listing.quantity }}</span></div>
                <div class="price-row">
                  <span class="val gold-text large">{{ formatNumber(listing.price) }} <i class="fas fa-coins"></i></span>
                </div>
              </div>
              <div class="card-footer">
                <input type="number" v-model.number="p2pQty[listing.listingId]" min="1" :max="listing.quantity" class="dark-input" placeholder="1" />
                <button @click="askBuyP2P(listing)" class="btn-action btn-buy-p2p">
                  <i class="fas fa-shopping-basket"></i> MUA NGAY
                </button>
              </div>
            </div>
          </div>

          <div v-else-if="activeTab === 'my_listings'" class="grid-layout" key="my_listings">
            <div v-if="marketStore.myListings.length === 0" class="empty-state">
              <i class="fas fa-scroll"></i> <p>Chưa bày bán vật phẩm nào.</p>
            </div>
            <div v-for="listing in marketStore.myListings" :key="listing.listingId" class="item-card my-card">
              <div class="card-body">
                <div class="item-name">{{ listing.item.name }}</div>
                <div class="stock-info">Đang bán: {{ listing.quantity }}</div>
                <div class="price-row">
                  <span class="val gold-text">{{ formatNumber(listing.price) }} <i class="fas fa-coins"></i></span>
                </div>
              </div>
              <div class="card-footer full-width">
                <button @click="marketStore.cancelListing(listing.listingId)" class="btn-action btn-cancel">
                  THU HỒI
                </button>
              </div>
            </div>
          </div>

          <div v-else-if="activeTab === 'sell_sys'" class="grid-layout" key="sell_sys">
            <div v-if="inventoryStore.items.length === 0" class="empty-state">
              <i class="fas fa-box-open"></i> <p>Hành trang trống rỗng.</p>
            </div>
            <div v-for="uItem in inventoryStore.items" :key="uItem.userItemId" class="item-card sell-card">
              <div class="card-top small-top">
                <div class="img-frame small">
                  <img v-if="uItem.item.imageUrl" :src="uItem.item.imageUrl" />
                  <span class="qty-badge">x{{ uItem.quantity }}</span>
                </div>
              </div>
              <div class="card-body">
                <div class="item-name">{{ uItem.item.name }}</div>
                <div class="price-row">
                  <span class="label">Thu mua:</span>
                  <span class="val red-text">{{ formatNumber(uItem.item.basePrice * 0.8) }} <i class="fas fa-coins"></i></span>
                </div>
              </div>
              <div class="card-footer">
                <input type="number" v-model.number="sellQty[uItem.userItemId]" min="1" :max="uItem.quantity" class="dark-input" placeholder="All" />
                <button v-if="!uItem.isEquipped" @click="sellSystem(uItem)" class="btn-action btn-sell">
                  BÁN
                </button>
                <div v-else class="equipped-warn">ĐANG DÙNG</div>
              </div>
            </div>
          </div>

        </transition>
      </div>
    </div>

    <transition name="pop-up">
      <div v-if="confirmModal.visible" class="modal-overlay" @click.self="closeConfirm">
        <div class="bill-modal">
          <div class="bill-header">
            <div class="bill-seal">KHẾ ƯỚC</div>
            <h3>XÁC NHẬN GIAO DỊCH</h3>
          </div>
          
          <div class="bill-body">
            <div class="item-preview-row">
              <div class="preview-img">
                <img :src="confirmModal.data.img" />
              </div>
              <div class="preview-info">
                <div class="p-name">{{ confirmModal.data.name }}</div>
                <div class="p-type">{{ confirmModal.type === 'P2P' ? 'Mua từ Chợ Trời' : 'Mua từ Cửa Tiệm' }}</div>
              </div>
            </div>

            <div class="bill-calc">
              <div class="calc-row">
                <span>Đơn giá:</span>
                <span>{{ formatNumber(confirmModal.data.price) }}</span>
              </div>
              <div class="calc-row">
                <span>Số lượng:</span>
                <span>x {{ confirmModal.data.qty }}</span>
              </div>
              <div class="divider-dashed"></div>
              <div class="calc-row total">
                <span>TỔNG CỘNG:</span>
                <span class="total-gold">{{ formatNumber(confirmModal.data.total) }} <i class="fas fa-coins"></i></span>
              </div>
            </div>
          </div>

          <div class="bill-footer">
            <button class="btn-wood cancel" @click="closeConfirm">HỦY BỎ</button>
            <button class="btn-wood confirm" @click="confirmTransaction">
              <i class="fas fa-fingerprint"></i> XÁC NHẬN
            </button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useMarketStore } from "../stores/marketStore";
import { useInventoryStore } from "../stores/inventoryStore";

const marketStore = useMarketStore();
const inventoryStore = useInventoryStore();

const activeTab = ref("buy");
const sellQty = reactive({});
const buyQty = reactive({});
const p2pQty = reactive({});

// State cho Modal Xác nhận
const confirmModal = reactive({
  visible: false,
  type: '', // 'SYS' or 'P2P'
  data: {
    id: null, name: '', img: '', price: 0, qty: 0, total: 0
  }
});

const formatNumber = (n) => Number(n).toLocaleString("en-US");

// --- LOGIC MỞ MODAL ---
const askBuySystem = (item) => {
  const qty = buyQty[item.itemId] || 1;
  openConfirm('SYS', {
    id: item.itemId, name: item.name, img: item.imageUrl,
    price: item.basePrice, qty: qty, total: item.basePrice * qty
  });
};

const askBuyP2P = (listing) => {
  const qty = p2pQty[listing.listingId] || 1;
  openConfirm('P2P', {
    id: listing.listingId, name: listing.item.name, img: listing.item.imageUrl,
    price: listing.price, qty: qty, total: listing.price * qty
  });
};

const openConfirm = (type, data) => {
  confirmModal.type = type; confirmModal.data = data; confirmModal.visible = true;
};
const closeConfirm = () => { confirmModal.visible = false; };

// --- LOGIC MUA HÀNG & XỬ LÝ LỖI (ĐÃ CẬP NHẬT) ---
const confirmTransaction = async () => {
  const { type, data } = confirmModal;
  
  try {
    if (type === 'SYS') {
      await marketStore.buyItem(data.id, data.qty);
      buyQty[data.id] = 1;
      // alert("Mua thành công!"); // Có thể mở lại nếu cần
    } else if (type === 'P2P') {
      await marketStore.buyPlayerListing(data.id, data.qty);
      p2pQty[data.id] = 1;
      // alert("Mua thành công!");
    }
    closeConfirm();
  } catch (e) {
    // Đóng modal xác nhận trước
    closeConfirm();

    // Xử lý lỗi đặc biệt cho P2P (Hàng đã bị mua mất)
    if (type === 'P2P') {
      // Refresh lại danh sách để xóa món hàng ảo
      await marketStore.fetchPlayerListings();
      
      // Thông báo đậm chất kiếm hiệp
      alert("Đại hiệp chậm tay mất òi!");
    } else {
      // Các lỗi khác (ví dụ thiếu tiền)
      alert(e.response?.data?.message || "Giao dịch thất bại.");
    }
  }
};

const loadMyListings = async () => {
  activeTab.value = "my_listings";
  await marketStore.fetchMyListings();
};

const sellSystem = async (uItem) => {
  const qty = sellQty[uItem.userItemId] || uItem.quantity;
  if(confirm(`Bán ${qty} ${uItem.item.name} với giá ${formatNumber(uItem.item.basePrice * 0.8 * qty)} xu?`)) {
      await marketStore.sellItem(uItem.userItemId, qty);
      inventoryStore.fetchInventory();
  }
};

onMounted(() => {
  marketStore.fetchShopItems();
  marketStore.fetchPlayerListings();
  inventoryStore.fetchInventory();
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;700;900&display=swap");
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css");

/* --- PALETTE --- */
:root {
  --wood-dark: #3e2723;
  --wood-light: #5d4037;
  --gold: #ffecb3;
  --text-light: #f3f4f6;
  --text-dim: #bdbdbd;
  --red-seal: #b71c1c;
  --jade-green: #2e7d32; /* Màu xanh ngọc cho nút P2P */
  --jade-light: #4caf50;
  --card-bg: #261815;
  --panel-bg: rgba(30, 20, 15, 0.95);
}

.dark-theme {
  background-color: #212121;
  min-height: 100vh;
  font-family: "Noto Serif TC", serif;
  color: var(--text-light);
  position: relative;
  overflow: hidden;
}

/* Backgrounds */
.ink-bg-layer { position: absolute; inset: 0; z-index: 0; background-color: #3e2723; }
.mountain-bg {
    position: absolute; inset: 0;
    background-image: url("https://images.unsplash.com/photo-1518182170546-0766ce6fec56?q=80&w=2000&auto=format&fit=crop");
    background-size: cover; filter: sepia(40%) brightness(0.5) contrast(1.2); opacity: 0.6;
}
.fog-anim {
    position: absolute; inset: 0;
    background: linear-gradient(to top, #261815 10%, transparent 90%);
}

.market-overlay {
  position: relative; z-index: 10; max-width: 1200px; margin: 0 auto;
  padding: 30px 20px; height: 100vh; display: flex; flex-direction: column;
}

/* --- HEADER --- */
.market-header {
  text-align: center; margin-bottom: 30px; background: var(--panel-bg);
  border-top: 4px solid var(--wood-light); border-bottom: 4px solid var(--wood-light);
  padding: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.8); position: relative;
}
.market-title {
  font-size: 2.5rem; color: var(--gold); margin: 0 0 20px 0;
  text-transform: uppercase; letter-spacing: 5px; text-shadow: 0 0 10px rgba(255, 236, 179, 0.3); font-weight: 900;
}
.header-decor { width: 60px; height: 2px; background: var(--gold); position: absolute; top: 50px; }
.left { left: 20%; } .right { right: 20%; }

.market-tabs { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; }
.tab-btn {
  background: transparent; border: none; color: var(--text-dim);
  font-family: inherit; font-weight: bold; font-size: 1rem;
  cursor: pointer; padding: 10px 15px; transition: 0.3s;
  border-bottom: 2px solid transparent;
}
.tab-btn:hover { color: var(--gold); }
.tab-btn.active {
  color: var(--gold); border-bottom-color: var(--gold);
  text-shadow: 0 0 8px rgba(255, 236, 179, 0.4);
}
.tab-divider { width: 1px; height: 20px; background: #555; }

/* --- CONTENT --- */
.market-content { flex: 1; overflow-y: auto; padding: 10px; }
.grid-layout { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 25px; }
.empty-state {
  grid-column: 1 / -1; text-align: center; padding: 50px;
  color: #757575; font-size: 1.2rem; border: 2px dashed #444; background: rgba(0,0,0,0.2);
}
.empty-state i { font-size: 3rem; opacity: 0.5; margin-bottom: 10px;}

/* --- CARD STYLES --- */
.item-card {
  background: var(--card-bg); border: 1px solid var(--wood-light);
  border-radius: 4px; padding: 15px; display: flex; flex-direction: column; gap: 12px;
  transition: 0.3s; box-shadow: 0 5px 15px rgba(0,0,0,0.5); position: relative;
}
.item-card:hover {
  transform: translateY(-5px); border-color: var(--gold);
  box-shadow: 0 10px 25px rgba(0,0,0,0.7), 0 0 10px rgba(255, 236, 179, 0.1);
}

.card-top { display: flex; justify-content: center; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); }
.img-frame {
  width: 80px; height: 80px; background: rgba(0,0,0,0.3); border: 2px solid #5d4037;
  display: flex; align-items: center; justify-content: center; position: relative;
}
.img-frame img { max-width: 90%; max-height: 90%; }
.placeholder-icon { font-size: 2rem; color: #5d4037; }

/* Rarity */
.border-C { border-color: #bdbdbd; } .bg-C { background: #bdbdbd; }
.border-A { border-color: #ab47bc; } .bg-A { background: #ab47bc; color: #fff; }
.border-S { border-color: var(--gold); box-shadow: 0 0 10px rgba(255, 215, 0, 0.3); } .bg-S { background: var(--gold); }
.rarity-tag {
  position: absolute; bottom: -8px; font-size: 0.7rem; font-weight: bold;
  padding: 2px 6px; border-radius: 3px; color: #000;
}

.card-body { flex: 1; text-align: center; }
.item-name { font-size: 1.1rem; font-weight: bold; color: var(--text-light); margin-bottom: 5px; }
.item-type { font-size: 0.8rem; color: #9e9e9e; font-style: italic; margin-bottom: 8px; }
.price-row { font-size: 1rem; display: flex; justify-content: center; align-items: center; gap: 5px; }
.label { font-size: 0.8rem; color: #aaa; }
.gold-text { color: var(--gold); font-weight: bold; }
.red-text { color: #ef5350; font-weight: bold; }

.card-footer { display: flex; gap: 8px; margin-top: auto; }
.dark-input {
  width: 50px; background: #121212; border: 1px solid #444;
  color: var(--gold); text-align: center; font-weight: bold; padding: 8px;
}

/* BUTTONS */
.btn-action {
  flex: 1; border: none; font-family: inherit; font-weight: bold; cursor: pointer;
  color: #fff; transition: 0.2s; text-transform: uppercase; font-size: 0.9rem;
  border-radius: 4px; box-shadow: 0 4px 0 rgba(0,0,0,0.3);
}
.btn-action:hover { filter: brightness(1.2); transform: translateY(-2px); box-shadow: 0 6px 0 rgba(0,0,0,0.3); }
.btn-action:active { transform: translateY(2px); box-shadow: none; }

.btn-buy-sys { background: var(--red-seal); border: 1px solid #b71c1c; }
.btn-sell { background: #c62828; border: 1px solid #b71c1c; }
.btn-cancel { background: #4e342e; width: 100%; padding: 10px; }

/* --- P2P BUTTON STYLE (UPDATED: JADE GREEN) --- */
.btn-buy-p2p {
  background: linear-gradient(to bottom, var(--jade-light), var(--jade-green));
  border: 1px solid var(--jade-green);
  color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center; gap: 5px;
}
.p2p-card { border-color: #81c784; } /* Viền xanh nhạt cho thẻ P2P */
.seller-badge {
  position: absolute; top: 0; left: 0; right: 0; background: rgba(46, 125, 50, 0.2);
  font-size: 0.75rem; color: #a5d6a7; text-align: center; padding: 2px;
}
.p2p-body { padding-top: 15px; }
.stock-info { font-size: 0.85rem; color: #aaa; margin-bottom: 5px; }
.highlight { color: #fff; }

/* --- MODAL CONFIRMATION (BILL STYLE) --- */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 1000;
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(4px);
}

.bill-modal {
  width: 400px; background: #fdf5e6; /* Giấy cũ sáng màu để dễ đọc */
  background-image: url("https://www.transparenttextures.com/patterns/aged-paper.png");
  color: #3e2723; border: 4px double #3e2723;
  box-shadow: 0 0 50px rgba(0,0,0,0.9);
  position: relative; animation: popIn 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
}

.bill-header {
  background: #3e2723; color: var(--gold); padding: 15px; text-align: center;
  border-bottom: 4px solid var(--red-seal); position: relative;
}
.bill-header h3 { margin: 0; font-size: 1.4rem; letter-spacing: 1px; }
.bill-seal {
  position: absolute; top: 5px; left: 10px; border: 2px solid var(--red-seal);
  color: var(--red-seal); padding: 2px 5px; font-weight: bold; transform: rotate(-15deg);
  opacity: 0.8; font-size: 0.8rem; background: rgba(255,255,255,0.1);
}

.bill-body { padding: 25px; }

.item-preview-row {
  display: flex; gap: 15px; align-items: center; margin-bottom: 20px;
  background: rgba(0,0,0,0.05); padding: 10px; border-radius: 4px;
}
.preview-img {
  width: 60px; height: 60px; border: 1px solid #3e2723; background: #fff;
  display: flex; align-items: center; justify-content: center;
}
.preview-img img { max-width: 90%; }
.preview-info .p-name { font-weight: bold; font-size: 1.2rem; color: #bf360c; }
.preview-info .p-type { font-size: 0.9rem; color: #5d4037; font-style: italic; }

.bill-calc { font-family: 'Courier New', monospace; font-weight: bold; }
.calc-row { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 1rem; }
.divider-dashed { border-bottom: 2px dashed #3e2723; margin: 10px 0; }
.calc-row.total { font-size: 1.3rem; margin-top: 5px; }
.total-gold { color: #d84315; font-weight: 900; }

.bill-footer {
  padding: 15px; background: rgba(0,0,0,0.05); border-top: 1px solid #ccc;
  display: flex; gap: 15px;
}
.btn-wood {
  flex: 1; padding: 12px; font-weight: bold; font-family: "Noto Serif TC";
  cursor: pointer; border: 2px solid #3e2723; transition: 0.2s;
}
.btn-wood.cancel { background: transparent; color: #3e2723; }
.btn-wood.cancel:hover { background: #d7ccc8; }
.btn-wood.confirm { background: #bf360c; color: #fff; border-color: #bf360c; }
.btn-wood.confirm:hover { background: #d84315; box-shadow: 0 0 10px rgba(191, 54, 12, 0.4); }

@keyframes popIn {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* Scrollbar */
.custom-scroll::-webkit-scrollbar { width: 6px; }
.custom-scroll::-webkit-scrollbar-thumb { background: #5d4037; border-radius: 3px; }
.custom-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }

/* Transition */
.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.3s ease; }
.fade-slide-enter-from, .fade-slide-leave-to { opacity: 0; transform: translateY(10px); }
</style>