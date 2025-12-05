import { createI18n } from "vue-i18n";

// Lấy ngôn ngữ đã lưu, mặc định là 'vi'
const savedLocale = localStorage.getItem("user_lang") || "vi";

const messages = {
  vi: {
    menu: {
      home: "Sảnh Chính", // Thay cho Trung Tâm
      game: "Giang Hồ", // Thay cho Thế Giới
      inventory: "Hành Trang", // Thay cho Kho Vũ Khí
      market: "Thương Hội", // Thay cho Chợ Đen
      friends: "Hảo Hữu", // Thay cho Mạng Lưới
      rank: "Bảng Vàng", // Thay cho Danh Vọng
      admin: "Quan Phủ", // Thay cho Hệ Thống
      logout: "Quy Ẩn", // Thay cho Ngắt Kết Nối
      profile: "Bản Thân", // Thay cho Hồ Sơ
    },
    stats: {
      atk: "Công Lực", // Sát Thương -> Công Lực
      def: "Hộ Thể", // Giáp -> Hộ Thể
      hp: "Sinh Lực", // Sinh Lực
      spd: "Thân Pháp", // Tốc Độ -> Thân Pháp
      crit: "Bạo Kích", // Chí Mạng -> Bạo Kích
      energy: "Thể Lực", // Năng Lượng -> Thể Lực
      level: "Cảnh Giới", // Cấp Độ -> Cảnh Giới
    },
    actions: {
      explore: "Du Ngoạn", // Trinh Sát -> Du Ngoạn/Hành Tẩu
      attack: "Xuất Chiêu", // Tham Chiến -> Xuất Chiêu
      buy: "Mua Vào",
      sell: "Bán Ra",
      equip: "Trang Bị",
      unequip: "Tháo Gỡ",
      enhance: "Luyện Hóa", // Cường Hóa -> Luyện Hóa
      sell_system: "Bán Thương Buôn",
      sell_p2p: "Treo Sàn",
    },
    market: {
      tab_sys: "Tiệm Tạp Hóa", // Kho Tiếp Tế -> Tiệm Tạp Hóa
      tab_p2p: "Chợ Trời", // Sàn Giao Dịch -> Chợ Trời
      tab_sell: "Bán Vật Phẩm",
      stock: "Tồn kho",
      price: "Giá bán",
      seller: "Người bán",
    },
    common: {
      confirm: "Chấp Thuận",
      cancel: "Bỏ Qua",
      success: "Thành Công",
      error: "Thất Bại",
    },
  },
  en: {
    menu: {
      home: "Main Hall",
      game: "Jianghu", // Thế giới võ hiệp
      inventory: "Inventory",
      market: "Marketplace",
      friends: "Friends",
      rank: "Leaderboard",
      admin: "Admin Hall",
      logout: "Retire", // Rời khỏi giang hồ
      profile: "Profile",
    },
    stats: {
      atk: "Attack",
      def: "Defense",
      hp: "Health",
      spd: "Agility", // Speed -> Agility (Hợp võ hiệp hơn)
      crit: "Crit Rate",
      energy: "Stamina", // Energy -> Stamina
      level: "Realm", // Level -> Realm (Cảnh giới tu luyện)
    },
    actions: {
      explore: "Explore",
      attack: "Attack",
      buy: "Buy",
      sell: "Sell",
      equip: "Equip",
      unequip: "Unequip",
      enhance: "Refine", // Upgrade -> Refine (Luyện khí)
      sell_system: "Sell to NPC",
      sell_p2p: "List Item",
    },
    market: {
      tab_sys: "General Store",
      tab_p2p: "Open Market",
      tab_sell: "Sell Items",
      stock: "Stock",
      price: "Price",
      seller: "Seller",
    },
    common: {
      confirm: "Confirm",
      cancel: "Cancel",
      success: "Success",
      error: "Failed",
    },
  },
};

const i18n = createI18n({
  legacy: false, // Dùng Composition API
  locale: savedLocale,
  fallbackLocale: "vi",
  messages,
});

export default i18n;
