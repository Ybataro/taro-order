import { useEffect } from 'react';

/**
 * 監聽 localStorage 變化並同步 store
 * 這個 hook 會定期檢查 localStorage 的變化並觸發 store 重新載入
 */
export function useStorageSync(storeName: string, callback: () => void, interval = 2000) {
  useEffect(() => {
    // 監聽 storage 事件（同一瀏覽器的不同分頁會觸發）
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storeName) {
        callback();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // 定期檢查 localStorage 變化（用於跨裝置同步）
    const timer = setInterval(() => {
      callback();
    }, interval);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(timer);
    };
  }, [storeName, callback, interval]);
}
