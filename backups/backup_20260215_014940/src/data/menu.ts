import type { Category, MenuItem } from '../types';

export const categories: Category[] = [
  {
    id: 'shaved-ice',
    name: '蔗片冰區',
    sortOrder: 1,
    subcategories: [
      { id: 'taro', name: '就愛芋頭系列', categoryId: 'shaved-ice', sortOrder: 1 },
      { id: 'classic', name: '經典組合系列', categoryId: 'shaved-ice', sortOrder: 2 },
      { id: 'sesame', name: '就愛芝麻系列', categoryId: 'shaved-ice', sortOrder: 3 },
      { id: 'pineapple', name: '就愛鳳梨系列', categoryId: 'shaved-ice', sortOrder: 4 },
    ],
  },
  {
    id: 'sweet-soup',
    name: '甜湯區',
    sortOrder: 2,
    subcategories: [
      { id: 'handmade-tofu', name: '手沖豆花系列', categoryId: 'sweet-soup', sortOrder: 1 },
      { id: 'soymilk-tofu', name: '豆漿豆花系列', categoryId: 'sweet-soup', sortOrder: 2 },
      { id: 'barley', name: '消暑薏仁湯系列', categoryId: 'sweet-soup', sortOrder: 3 },
      { id: 'snow-fungus', name: '養身銀耳系列', categoryId: 'sweet-soup', sortOrder: 4 },
    ],
  },
  {
    id: 'frozen',
    name: '產量限定',
    sortOrder: 3,
    subcategories: [
      { id: 'frozen-items', name: '冷凍 / 冰淇淋', categoryId: 'frozen', sortOrder: 1 },
    ],
  },
  {
    id: 'almond-tea',
    name: '就愛杏仁',
    sortOrder: 4,
    subcategories: [
      { id: 'almond-items', name: '厚杏仁茶', categoryId: 'almond-tea', sortOrder: 1 },
    ],
  },
];

export const menuItems: MenuItem[] = [
  // ═══════════════════════════════════════
  // 蔗片冰區 — 就愛芋頭系列
  // ═══════════════════════════════════════
  { id: 'm1', name: '花生冰淇淋蔗片冰', description: '花生冰淇淋、芋圓、白芋湯圓、紅豆、小薏仁、芋泥漿（限內用）', price: 150, image: '', categoryId: 'shaved-ice', subcategoryId: 'taro', isAvailable: true },
  { id: 'm2', name: '招牌芋見泥蔗片冰', description: '芋球、芋泥漿、芋圓、白芋湯圓、粉圓、小薏仁', price: 145, image: '', categoryId: 'shaved-ice', subcategoryId: 'taro', isAvailable: true },
  { id: 'm3', name: '芋泥相遇蔗片冰', description: '芋泥漿、芋圓、白芋湯圓', price: 125, image: '', categoryId: 'shaved-ice', subcategoryId: 'taro', isAvailable: true },
  { id: 'm4', name: '3Q芋泥蔗片冰', description: '芋泥漿、白芋湯圓、粉圓、芋泥球', price: 120, image: '', categoryId: 'shaved-ice', subcategoryId: 'taro', isAvailable: true },
  { id: 'm5', name: '芋泥白玉花生蔗片冰', description: '芋泥漿、白芋湯圓、花生', price: 100, image: '', categoryId: 'shaved-ice', subcategoryId: 'taro', isAvailable: true },

  // ═══════════════════════════════════════
  // 蔗片冰區 — 經典組合系列
  // ═══════════════════════════════════════
  { id: 'm6', name: '銀耳嫩仙草蔗片冰', description: '嫩仙草、紅棗冰糖銀耳、芋圓、白芋湯圓', price: 120, image: '', categoryId: 'shaved-ice', subcategoryId: 'classic', isAvailable: true },
  { id: 'm7', name: '嫩仙草鮮奶蔗片冰', description: '嫩仙草、芋圓、小薏仁、鮮奶', price: 90, image: '', categoryId: 'shaved-ice', subcategoryId: 'classic', isAvailable: true },
  { id: 'm8', name: '芋圓嫩仙草蔗片冰沙', description: '嫩仙草、芋圓、小薏仁、炒糖糖水', price: 90, image: '', categoryId: 'shaved-ice', subcategoryId: 'classic', isAvailable: true },
  { id: 'm9', name: '芋圓豆花蔗片冰沙', description: '豆花、芋圓、綠豆、炒糖糖水', price: 90, image: '', categoryId: 'shaved-ice', subcategoryId: 'classic', isAvailable: true },
  { id: 'm10', name: '3Q蔗片冰', description: '芋圓、白芋湯圓、粉圓', price: 90, image: '', categoryId: 'shaved-ice', subcategoryId: 'classic', isAvailable: true },
  { id: 'm11', name: '芋圓蔗片冰', description: '芋圓、粉圓、綠豆、花生', price: 90, image: '', categoryId: 'shaved-ice', subcategoryId: 'classic', isAvailable: true },
  { id: 'm12', name: '白玉蔗片冰', description: '白芋湯圓、花生、紅豆、小薏仁', price: 90, image: '', categoryId: 'shaved-ice', subcategoryId: 'classic', isAvailable: true },

  // ═══════════════════════════════════════
  // 蔗片冰區 — 就愛芝麻系列
  // ═══════════════════════════════════════
  { id: 'm13', name: '芝麻冰淇淋蔗片冰', description: '芝麻冰淇淋、芋圓、白芋湯圓、紅豆、小薏仁、芝麻醬（限內用）', price: 160, image: '', categoryId: 'shaved-ice', subcategoryId: 'sesame', isAvailable: true },
  { id: 'm14', name: '3Q芝麻蔗片冰', description: '芋圓、白芋湯圓、粉圓、芝麻醬', price: 130, image: '', categoryId: 'shaved-ice', subcategoryId: 'sesame', isAvailable: true },
  { id: 'm15', name: '芝麻就醬吃蔗片冰', description: '白芋湯圓、花生、芝麻醬', price: 110, image: '', categoryId: 'shaved-ice', subcategoryId: 'sesame', isAvailable: true },

  // ═══════════════════════════════════════
  // 蔗片冰區 — 就愛鳳梨系列（新鮮鳳梨熬煮）
  // ═══════════════════════════════════════
  { id: 'm16', name: '鳳梨粉圓蔗片冰', description: '鳳梨醬、粉圓', price: 95, image: '', categoryId: 'shaved-ice', subcategoryId: 'pineapple', isAvailable: true },
  { id: 'm17', name: '鳳梨芋圓薏仁蔗片冰', description: '鳳梨醬、芋圓、小薏仁', price: 110, image: '', categoryId: 'shaved-ice', subcategoryId: 'pineapple', isAvailable: true },
  { id: 'm18', name: '鳳梨嫩仙草蔗片冰', description: '鳳梨醬、嫩仙草', price: 115, image: '', categoryId: 'shaved-ice', subcategoryId: 'pineapple', isAvailable: true },
  { id: 'm19', name: '3Q鳳梨蔗片冰', description: '鳳梨醬、芋圓、白芋湯圓、粉圓', price: 125, image: '', categoryId: 'shaved-ice', subcategoryId: 'pineapple', isAvailable: true },
  { id: 'm20', name: '鳳梨銀耳蔗片冰', description: '鳳梨、紅棗冰糖銀耳、白芋湯圓', price: 135, image: '', categoryId: 'shaved-ice', subcategoryId: 'pineapple', isAvailable: true },

  // ═══════════════════════════════════════
  // 甜湯區 — 手沖豆花系列（手工炒糖水）
  // ═══════════════════════════════════════
  { id: 'm21', name: '花生豆花', description: '豆花、花生', price: 55, image: '', categoryId: 'sweet-soup', subcategoryId: 'handmade-tofu', isAvailable: true },
  { id: 'm22', name: '粉圓豆花', description: '豆花、粉圓', price: 55, image: '', categoryId: 'sweet-soup', subcategoryId: 'handmade-tofu', isAvailable: true },
  { id: 'm23', name: '芋圓綜合豆花', description: '豆花、芋圓、粉圓、小薏仁', price: 70, image: '', categoryId: 'sweet-soup', subcategoryId: 'handmade-tofu', isAvailable: true },
  { id: 'm24', name: '白玉綜合豆花', description: '豆花、白芋湯圓、粉圓、小薏仁', price: 70, image: '', categoryId: 'sweet-soup', subcategoryId: 'handmade-tofu', isAvailable: true },
  { id: 'm25', name: '嫩仙草芋圓豆花', description: '豆花、嫩仙草、芋圓', price: 70, image: '', categoryId: 'sweet-soup', subcategoryId: 'handmade-tofu', isAvailable: true },
  { id: 'm26', name: '3Q豆花', description: '豆花、芋圓、白芋湯圓、粉圓', price: 80, image: '', categoryId: 'sweet-soup', subcategoryId: 'handmade-tofu', isAvailable: true },
  { id: 'm27', name: '私藏杏仁茶豆花', description: '杏仁茶、芋圓、白芋湯圓、粉圓', price: 105, image: '', categoryId: 'sweet-soup', subcategoryId: 'handmade-tofu', isAvailable: true },

  // ═══════════════════════════════════════
  // 甜湯區 — 豆漿豆花系列
  // ═══════════════════════════════════════
  { id: 'm28', name: '芋圓豆漿豆花', description: '芋圓、小薏仁、8度濃純豆漿', price: 75, image: '', categoryId: 'sweet-soup', subcategoryId: 'soymilk-tofu', isAvailable: true },
  { id: 'm29', name: '芋泥芋圓豆漿豆花', description: '芋泥漿、芋圓、小薏仁、8度濃純豆漿', price: 90, image: '', categoryId: 'sweet-soup', subcategoryId: 'soymilk-tofu', isAvailable: true },

  // ═══════════════════════════════════════
  // 甜湯區 — 消暑薏仁湯系列
  // ═══════════════════════════════════════
  { id: 'm30', name: '花生紅豆薏仁湯', description: '花生、紅豆、薏仁湯', price: 65, image: '', categoryId: 'sweet-soup', subcategoryId: 'barley', isAvailable: true },
  { id: 'm31', name: '花生豆花薏仁湯', description: '花生、豆花、薏仁湯', price: 70, image: '', categoryId: 'sweet-soup', subcategoryId: 'barley', isAvailable: true },
  { id: 'm32', name: '芋圓豆花薏仁湯', description: '芋圓、豆花、薏仁湯', price: 75, image: '', categoryId: 'sweet-soup', subcategoryId: 'barley', isAvailable: true },
  { id: 'm33', name: '芋圓綜合薏仁湯', description: '芋圓、紅豆、綠豆、薏仁湯', price: 75, image: '', categoryId: 'sweet-soup', subcategoryId: 'barley', isAvailable: true },
  { id: 'm34', name: '綜合薏仁湯', description: '芋圓、白芋湯圓、紅豆、薏仁湯', price: 80, image: '', categoryId: 'sweet-soup', subcategoryId: 'barley', isAvailable: true },

  // ═══════════════════════════════════════
  // 甜湯區 — 養身銀耳系列
  // ═══════════════════════════════════════
  { id: 'm35', name: '養身銀耳湯', description: '紅棗冰糖銀耳', price: 60, image: '', categoryId: 'sweet-soup', subcategoryId: 'snow-fungus', isAvailable: true },
  { id: 'm36', name: '嫩仙草銀耳湯', description: '嫩仙草、紅棗冰糖銀耳', price: 75, image: '', categoryId: 'sweet-soup', subcategoryId: 'snow-fungus', isAvailable: true },
  { id: 'm37', name: '芋圓銀耳湯', description: '芋圓、紅棗冰糖銀耳', price: 75, image: '', categoryId: 'sweet-soup', subcategoryId: 'snow-fungus', isAvailable: true },
  { id: 'm38', name: '綜合銀耳湯', description: '芋圓、白芋湯圓、小薏仁、紅棗冰糖銀耳', price: 90, image: '', categoryId: 'sweet-soup', subcategoryId: 'snow-fungus', isAvailable: true },

  // ═══════════════════════════════════════
  // 產量限定（外帶冷凍 / 冰淇淋）
  // ═══════════════════════════════════════
  { id: 'm39', name: '阿爸冷凍生芋圓', description: '1包300g', price: 135, image: '', categoryId: 'frozen', subcategoryId: 'frozen-items', isAvailable: true },
  { id: 'm40', name: '阿爸冷凍生白玉', description: '1包350g', price: 135, image: '', categoryId: 'frozen', subcategoryId: 'frozen-items', isAvailable: true },
  { id: 'm41', name: '花生牛奶冰淇淋', description: '1杯380ml', price: 235, image: '', categoryId: 'frozen', subcategoryId: 'frozen-items', isAvailable: true },
  { id: 'm42', name: '芝麻牛奶冰淇淋', description: '1杯380ml', price: 235, image: '', categoryId: 'frozen', subcategoryId: 'frozen-items', isAvailable: true },

  // ═══════════════════════════════════════
  // 就愛杏仁 — 厚杏仁茶（歡迎試喝）
  // ═══════════════════════════════════════
  { id: 'm43', name: '厚杏仁茶 300ml', description: '冷', price: 65, image: '', categoryId: 'almond-tea', subcategoryId: 'almond-items', isAvailable: true },
  { id: 'm44', name: '厚杏仁茶 1000ml', description: '冷', price: 180, image: '', categoryId: 'almond-tea', subcategoryId: 'almond-items', isAvailable: true },
];
