import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface SystemState {
  lastShiftResetTime: string | null;
  loading: boolean;
  
  // 獲取最後交班時間
  fetchLastShiftResetTime: () => Promise<string>;
  
  // 更新交班時間（交班歸零時調用）
  updateShiftResetTime: (time?: string) => Promise<void>;
  
  // 獲取「今天」的開始時間（用於查詢）
  getTodayStartTime: () => Promise<string>;
  
  // 檢查是否需要自動交班（過了 00:00）
  checkAutoShiftReset: () => Promise<boolean>;
}

export const useSystemStore = create<SystemState>((set, get) => ({
  lastShiftResetTime: null,
  loading: false,

  // 獲取最後交班時間
  fetchLastShiftResetTime: async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'last_shift_reset_time')
        .single();

      if (error) throw error;

      const time = data?.setting_value || new Date().toISOString().split('T')[0];
      set({ lastShiftResetTime: time });
      return time;
    } catch (error) {
      console.error('獲取交班時間失敗:', error);
      // 如果獲取失敗，返回今天 00:00
      const today = new Date().toISOString().split('T')[0];
      set({ lastShiftResetTime: today });
      return today;
    }
  },

  // 更新交班時間
  updateShiftResetTime: async (time?: string) => {
    try {
      const resetTime = time || new Date().toISOString();
      
      const { error } = await supabase
        .from('system_settings')
        .update({ setting_value: resetTime })
        .eq('setting_key', 'last_shift_reset_time');

      if (error) throw error;

      set({ lastShiftResetTime: resetTime });
    } catch (error) {
      console.error('更新交班時間失敗:', error);
    }
  },

  // 獲取「今天」的開始時間（台灣時區 UTC+8）
  getTodayStartTime: async () => {
    const lastResetTime = get().lastShiftResetTime || await get().fetchLastShiftResetTime();

    // 如果最後交班時間是日期格式（YYYY-MM-DD），轉換為台灣時區的 00:00:00 UTC
    if (lastResetTime.length === 10) {
      // "2026-02-20" → 台灣 00:00 = UTC 前一天 16:00
      return `${lastResetTime}T00:00:00+08:00`;
    }

    return lastResetTime;
  },

  // 檢查是否需要自動交班（使用台灣時區）
  checkAutoShiftReset: async () => {
    try {
      const lastResetTime = get().lastShiftResetTime || await get().fetchLastShiftResetTime();
      // lastResetTime 是 YYYY-MM-DD 格式
      const lastResetDate = lastResetTime.length === 10
        ? lastResetTime
        : new Date(lastResetTime).toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' });

      // 取得台灣時區的今天日期
      const todayTW = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' });

      // 如果最後交班日期不是今天，表示過了 00:00，需要自動交班
      if (lastResetDate < todayTW) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('檢查自動交班失敗:', error);
      return false;
    }
  },
}));
