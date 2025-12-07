<template>
    <div class="page-container wuxia-market">
        <div class="ink-bg-layer">
            <div class="mountain-bg"></div>
            <div class="paper-overlay"></div>
        </div>

        <div class="market-overlay">
            <div class="market-header">
                <h2 class="market-title">THƯƠNG HỘI</h2>
                <div class="market-tabs">
                    <button
                        :class="{ active: activeTab === 'buy' }"
                        @click="activeTab = 'buy'"
                        class="tab-btn"
                    >
                        <i class="fas fa-store"></i> TIỆM TẠP HÓA
                    </button>
                    <button
                        :class="{ active: activeTab === 'p2p' }"
                        @click="activeTab = 'p2p'"
                        class="tab-btn"
                    >
                        <i class="fas fa-handshake"></i> CHỢ TRỜI
                    </button>
                    <button
                        :class="{ active: activeTab === 'my_listings' }"
                        @click="loadMyListings"
                        class="tab-btn"
                    >
                        <i class="fas fa-clipboard-list"></i> SẠP CỦA TA
                    </button>
                    <button
                        :class="{ active: activeTab === 'sell_sys' }"
                        @click="activeTab = 'sell_sys'"
                        class="tab-btn"
                    >
                        <i class="fas fa-coins"></i> BÁN VẬT PHẨM
                    </button>
                </div>
            </div>

            <div class="market-content custom-scroll">
                <transition name="tab-fade" mode="out-in">
                    <div v-if="activeTab === 'buy'" class="grid-layout" key="buy">
                        <div
                            v-for="item in marketStore.shopItems"
                            :key="item.itemId"
                            class="item-card premium-wood-card"
                        >
                            <div class="card-img-box">
                                <img
                                    v-if="item.imageUrl"
                                    :src="item.imageUrl"
                                    @error="$event.target.style.display = 'none'"
                                />
                                <div v-else class="placeholder-icon">
                                    {{ item.name.charAt(0) }}
                                </div>
                                <div class="rarity-seal" :class="'rarity-' + item.rarity">
                                    {{ item.rarity }}
                                </div>
                            </div>

                            <div class="card-info">
                                <div class="item-name">{{ item.name }}</div>
                                <div class="item-type">{{ item.type }}</div>
                                <div class="price-tag gold-text-shadow">
                                    <i class="fas fa-coins text-gold"></i>
                                    <span class="val">{{ formatNumber(item.basePrice) }} Lượng</span>
                                </div>
                            </div>

                            <div class="card-actions">
                                <input
                                    type="number"
                                    v-model.number="buyQty[item.itemId]"
                                    min="1"
                                    class="ink-input-qty"
                                    placeholder="1"
                                />
                                <button @click="handleBuySystem(item)" class="btn-action btn-buy-system">
                                    MUA
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div v-else-if="activeTab === 'p2p'" class="grid-layout" key="p2p">
                        <div
                            v-if="marketStore.playerListings.length === 0"
                            class="empty-scroll"
                        >
                            _Chưa có ai bày bán_
                        </div>

                        <div
                            v-for="listing in marketStore.playerListings"
                            :key="listing.listingId"
                            class="item-card p2p-card"
                        >
                            <div class="seller-tag">
                                <i class="fas fa-user-tag"></i> {{ listing.seller.username }}
                            </div>

                            <div class="card-info">
                                <div class="item-name">
                                    {{ listing.item.name }}
                                    <span v-if="listing.enhanceLevel > 0" class="enhance-txt">
                                        (+{{ listing.enhanceLevel }})
                                    </span>
                                </div>
                                <div class="stock-count">Tồn: {{ listing.quantity }}</div>
                                <div class="price-tag gold-text-shadow p2p-price">
                                    <i class="fas fa-coins text-gold"></i>
                                    <span class="val">{{ formatNumber(listing.price) }} Lượng</span>
                                </div>
                            </div>

                            <div class="card-actions">
                                <input
                                    type="number"
                                    v-model.number="p2pQty[listing.listingId]"
                                    min="1"
                                    :max="listing.quantity"
                                    class="ink-input-qty"
                                    placeholder="1"
                                />
                                <button @click="handleBuyP2P(listing)" class="btn-action btn-buy-p2p">
                                    MUA LẠI
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div v-else-if="activeTab === 'my_listings'" class="grid-layout" key="my_listings">
                        <div v-if="marketStore.myListings.length === 0" class="empty-scroll">
                            _Sạp hàng trống không_
                        </div>

                        <div
                            v-for="listing in marketStore.myListings"
                            :key="listing.listingId"
                            class="item-card my-card"
                        >
                            <div class="card-info">
                                <div class="item-name">{{ listing.item.name }}</div>
                                <div class="stock-count">Số lượng: {{ listing.quantity }}</div>
                                <div class="price-tag gold-text-shadow">
                                    <span class="val">{{ formatNumber(listing.price) }}</span> Xu
                                </div>
                            </div>
                            <button
                                @click="marketStore.cancelListing(listing.listingId)"
                                class="btn-action btn-cancel-listing"
                            >
                                THU HỒI
                            </button>
                        </div>
                    </div>

                    <div v-else-if="activeTab === 'sell_sys'" class="grid-layout" key="sell_sys">
                        <div v-if="inventoryStore.items.length === 0" class="empty-scroll">
                            _Hành trang trống rỗng_
                        </div>

                        <div
                            v-for="uItem in inventoryStore.items"
                            :key="uItem.userItemId"
                            class="item-card sell-card"
                        >
                            <div class="card-img-box small">
                                <img v-if="uItem.item.imageUrl" :src="uItem.item.imageUrl" />
                                <div class="qty-seal">x{{ uItem.quantity }}</div>
                            </div>
                            <div class="card-info">
                                <div class="item-name">{{ uItem.item.name }}</div>
                                <div class="price-tag sell-price">
                                    Giá thu:
                                    <span class="val">{{
                                        formatNumber(uItem.item.basePrice * 0.8)
                                    }}</span> Lượng
                                </div>
                            </div>

                            <div class="card-actions">
                                <input
                                    type="number"
                                    v-model.number="sellQty[uItem.userItemId]"
                                    min="1"
                                    :max="uItem.quantity"
                                    class="ink-input-qty"
                                    placeholder="All"
                                />
                                <button
                                    v-if="!uItem.isEquipped"
                                    @click="sellSystem(uItem)"
                                    class="btn-action btn-sell-system"
                                >
                                    BÁN
                                </button>
                                <div v-else class="equipped-warn">ĐANG DÙNG</div>
                            </div>
                        </div>
                    </div>
                </transition>
            </div>
        </div>
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

const formatNumber = (n) => Number(n).toLocaleString("en-US");

const handleBuySystem = async (item) => {
    const qty = buyQty[item.itemId] || 1;
    await marketStore.buyItem(item.itemId, qty);
    buyQty[item.itemId] = 1;
};

const handleBuyP2P = async (listing) => {
    const qty = p2pQty[listing.listingId] || 1;
    await marketStore.buyPlayerListing(listing.listingId, qty);
    p2pQty[listing.listingId] = 1;
};

const loadMyListings = async () => {
    activeTab.value = "my_listings";
    await marketStore.fetchMyListings();
};

const sellSystem = async (uItem) => {
    const qty = sellQty[uItem.userItemId] || uItem.quantity;
    await marketStore.sellItem(uItem.userItemId, qty);
    inventoryStore.fetchInventory();
};

onMounted(() => {
    marketStore.fetchShopItems();
    marketStore.fetchPlayerListings();
    inventoryStore.fetchInventory();
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Noto+Serif+TC:wght@500;700;900&display=swap");

/* --- VARIABLES --- */
:root {
    --page-bg-dark: #1f140e; 
    --item-card-bg: #fffbf5; 
    --wood-dark: #20130e; 
    --wood-light: #5d4037;
    --ink: #1a1a1a;
    --red-seal: #8a0303; /* Đỏ ấn chương */
    --gold: #ffc857; 
    --gold-shadow: #ffeb3b;
    --border-bronze: #6b5c4f; 
    --highlight-blue: #1565c0;
    --text-primary: var(--wood-dark);
}

/* --- BASE STYLE --- */
.wuxia-market {
    min-height: 100vh;
    background-color: var(--page-bg-dark);
    font-family: "Noto Serif TC", serif;
    color: var(--text-primary);
    position: relative;
    overflow: hidden;
}

/* --- BACKGROUND --- */
.ink-bg-layer {
    position: absolute;
    inset: 0;
    z-index: 0;
    background-color: #d7ccc8;
}
.mountain-bg {
    position: absolute;
    inset: 0;
    background-image: url("https://images.unsplash.com/photo-1518182170546-0766ce6fec56?q=80&w=2000&auto=format&fit=crop");
    background-size: cover;
    filter: sepia(70%) grayscale(50%) brightness(0.9) opacity(0.7);
}
.paper-overlay {
    position: absolute;
    inset: 0;
    background-image: url("https://www.transparenttextures.com/patterns/wood-pattern.png");
    opacity: 0.6; 
    pointer-events: none;
}

.market-overlay {
    position: relative;
    z-index: 10;
    max-width: 1200px;
    margin: 0 auto;
    padding: 30px 20px; 
    height: 100vh;
    display: flex;
    flex-direction: column;
}

/* --- HEADER & TABS (Refined) --- */
.market-header {
    text-align: center;
    margin-bottom: 30px;
    background: var(--item-card-bg); 
    border: 6px double var(--wood-dark); 
    padding: 25px;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.75); 
}

.market-title {
    font-family: "Playfair Display", serif; 
    font-size: 3em;
    font-weight: 700;
    color: var(--red-seal);
    margin-bottom: 20px;
    text-transform: uppercase;
    letter-spacing: 5px; 
    text-shadow: 1px 1px 1px var(--wood-dark), 2px 2px 0 rgba(255, 255, 255, 0.7);
    border-bottom: 3px solid var(--border-bronze);
    display: inline-block;
    padding-bottom: 8px;
}

.market-tabs {
    display: flex;
    justify-content: center;
    gap: 15px;
    flex-wrap: wrap;
}

.tab-btn {
    /* MÀU NỀN MỚI: NÂU SÁNG */
    background: var(--border-bronze); /* Màu Nâu */
    border: 2px solid var(--wood-dark);
    /* MÀU CHỮ MỚI: TRẮNG HOẶC VÀNG/ĐỎ */
    color: #fff; 
    padding: 10px 18px;
    font-family: "Noto Serif TC";
    font-weight: 700; 
    cursor: pointer;
    transition: 0.3s all;
    box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.3);
    position: relative;
    transform: none; 
}

/* CẬP NHẬT HIỆU ỨNG HOVER */
.tab-btn:hover {
    background: var(--wood-light); /* Nền Nâu đậm hơn khi hover */
    /* CHỮ ĐỎ KHI HOVER */
    color: var(--red-seal); 
    transform: none; 
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.4);
}
.tab-btn.active {
    /* ACTIVE MÀU NỀN ĐẬM NHẤT, CHỮ VÀNG/GLOW */
    background: var(--wood-dark);
    color: var(--gold);
    border-color: var(--gold);
    box-shadow: 0 0 20px rgba(255, 200, 87, 0.7); 
    transform: translateY(-2px); 
}

/* --- CONTENT & TRANSITIONS --- */
.market-content {
    flex: 1;
    overflow-y: auto;
    padding: 10px 0;
}

.grid-layout {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 25px; 
}

/* Transition cho Tabs */
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity 0.3s ease;
}
.tab-fade-enter-from,
.tab-fade-leave-to {
  opacity: 0;
}


/* --- ITEM CARD (Premium) --- */
.item-card {
    background: var(--item-card-bg); 
    border: 2px solid var(--border-bronze); 
    padding: 15px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    position: relative;
    transition: 0.3s all;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
    overflow: hidden;
    border-radius: 5px;
}
.item-card::before {
    content: "";
    position: absolute;
    inset: 0;
    border: 4px ridge var(--border-bronze); 
    pointer-events: none;
    z-index: 1;
}

.item-card:hover {
    transform: translateY(-8px); 
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.8);
    border-color: var(--gold);
}

/* Card Image */
.card-img-box {
    width: 100%;
    height: 140px; 
    background: #e0e0e0;
    border: 4px solid var(--border-bronze); 
    box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.4); 
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
}
.card-img-box img {
    max-width: 90%;
    max-height: 90%;
    filter: none; 
}

/* Rarity Seal (Ấn chương) */
.rarity-seal {
    position: absolute;
    bottom: 0; 
    left: 0;
    font-size: 0.8em;
    padding: 4px 10px;
    font-weight: 700;
    background: var(--wood-dark);
    color: #fff;
    border-top-right-radius: 5px;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.5);
    text-shadow: 0 0 5px rgba(255, 255, 255, 0.7);
}
.rarity-C {
    background: #795548; 
}
.rarity-A {
    background: var(--highlight-blue); 
    box-shadow: 0 0 15px rgba(30, 136, 229, 0.8);
}
.rarity-S {
    background: var(--red-seal); 
    box-shadow: 0 0 20px rgba(138, 3, 3, 0.9);
}

/* Info */
.card-info {
    flex: 1;
    border-bottom: 2px solid rgba(44, 24, 16, 0.1);
    padding-bottom: 10px;
}
.item-name {
    font-weight: 900; 
    font-size: 1.3em;
    color: var(--text-primary);
    text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.8);
}
.item-type {
    font-size: 0.9em;
    color: var(--wood-light);
    font-style: italic;
    margin-bottom: 5px;
}
.price-tag {
    margin-top: 10px;
    font-size: 1.2em;
    font-weight: 700;
}
.gold-text-shadow {
    color: var(--gold);
    text-shadow: 0 0 2px var(--gold-shadow), 0 0 8px rgba(255, 200, 87, 0.5);
}
.text-gold {
    color: var(--gold);
    margin-right: 5px;
}
.val {
    font-size: 1.4em;
    font-weight: 900; 
}

/* Actions & Buttons (Premium) */
.card-actions {
    display: flex;
    gap: 8px;
    margin-top: 5px;
}
.ink-input-qty {
    width: 60px; 
    background: #fff;
    border: 3px inset var(--wood-dark); 
    color: var(--text-primary);
    text-align: center;
    font-family: "Noto Serif TC";
    font-weight: 900;
    padding: 8px;
}

.btn-action {
    flex: 1;
    border: none;
    font-family: "Noto Serif TC";
    font-weight: 700;
    cursor: pointer;
    transition: 0.2s all;
    padding: 10px; 
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.5);
    border-radius: 3px;
}

.btn-buy-system {
    background: var(--red-seal);
    color: #fff;
}
.btn-buy-system:hover {
    background: #b80303;
    transform: translateY(-2px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.7);
}

/* P2P Specifics */
.p2p-card {
    border: 3px solid var(--gold);
    box-shadow: 0 0 15px rgba(255, 200, 87, 0.8);
}
.seller-tag {
    font-size: 0.9em;
    color: var(--text-primary);
    border-bottom: 1px solid var(--gold);
    padding-bottom: 5px;
    margin-bottom: 5px;
    font-weight: 700;
}

.btn-buy-p2p {
    background: var(--gold);
    color: var(--wood-dark);
    box-shadow: 0 5px 10px rgba(255, 200, 87, 0.9);
}
.btn-buy-p2p:hover {
    background: #ffdb85;
    transform: translateY(-2px);
}

/* Sell Specifics */
.sell-price {
    color: var(--red-seal);
    font-weight: 900;
}
.btn-sell-system {
    background: var(--red-seal);
    color: #fff;
}
.btn-sell-system:hover {
    background: #b80303;
    transform: translateY(-2px);
}
.equipped-warn {
    flex: 1;
    background: #e0e0e0;
    color: #616161;
    text-align: center;
    padding: 10px;
    font-size: 0.9em;
    font-weight: 700;
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.3);
    border-radius: 3px;
}
.qty-seal {
    position: absolute;
    bottom: 5px;
    right: 5px;
    background: var(--wood-dark);
    color: var(--gold);
    font-size: 0.8em;
    padding: 3px 6px;
    border-radius: 4px;
    font-weight: 700;
    border: 2px solid var(--gold); 
}

/* My Listings (Thu Hồi) */
.my-card {
    border: 3px dashed var(--wood-light);
}
.btn-cancel-listing {
    width: 100%;
    background: #757575;
    color: #fff;
    padding: 10px;
}
.btn-cancel-listing:hover {
    background: #5a5a5a;
    transform: translateY(-1px);
}

.empty-scroll {
    grid-column: 1/-1;
    text-align: center;
    padding: 60px; 
    color: var(--border-bronze);
    font-style: italic;
    font-size: 1.4em;
    border: 3px dashed var(--border-bronze);
    background: rgba(255, 255, 255, 0.3);
}

/* Scrollbar (Giữ nguyên) */
.custom-scroll::-webkit-scrollbar {
    width: 8px;
}
.custom-scroll::-webkit-scrollbar-thumb {
    background: var(--border-bronze);
    border-radius: 4px;
}
.custom-scroll::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
}
</style>