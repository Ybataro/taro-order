/** 取得台灣時區今日日期 (YYYY-MM-DD) */
export function getTaiwanToday(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' });
}

/** 取得台灣時區今日起始 ISO 字串 (含 +08:00) */
export function getTaiwanDayStart(date?: string): string {
  const d = date || getTaiwanToday();
  return `${d}T00:00:00+08:00`;
}

/** 取得台灣時區今日結束 ISO 字串 (含 +08:00) */
export function getTaiwanDayEnd(date?: string): string {
  const d = date || getTaiwanToday();
  return `${d}T23:59:59+08:00`;
}
