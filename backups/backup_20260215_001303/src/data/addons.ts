import type { Addon, TemperatureOption } from '../types';

// 加購品項
export const addonItems: Addon[] = [
  { id: 'a1', name: '手作芋圓', price: 20 },
  { id: 'a3', name: '白芋湯圓', price: 20 },
  { id: 'a6', name: '芋泥球', price: 30 },
  { id: 'a7', name: '花生', price: 15 },
  { id: 'a8', name: '粉圓', price: 15 },
  { id: 'a9', name: '紅豆', price: 15 },
  { id: 'a10', name: '綠豆', price: 15 },
  { id: 'a11', name: '小薏仁', price: 15 },
];

// 不支援加購的分類
export const noAddonCategories = ['frozen', 'almond-tea'];

// 取得品項可選的溫度選項（null 表示不可選溫度）
export function getTemperatureOptions(categoryId: string): TemperatureOption[] | null {
  if (categoryId === 'sweet-soup') return ['冰', '涼', '熱'];
  return null;
}
