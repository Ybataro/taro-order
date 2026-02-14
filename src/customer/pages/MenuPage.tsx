import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMenuStore } from '../../stores/menuStore';
import { useCartStore } from '../../stores/cartStore';
import { useOrderStore } from '../../stores/orderStore';
import CategoryTabs from '../components/CategoryTabs';
import MenuCard from '../components/MenuCard';
import CartFab from '../components/CartFab';
import Button from '../../components/ui/Button';

export default function MenuPage() {
  const [searchParams] = useSearchParams();
  const tableNumber = Number(searchParams.get('table')) || 0;
  const { 
    categories, 
    menuItems, 
    fetchCategories,
    fetchMenuItems,
    fetchAddons 
  } = useMenuStore();
  const setTableNumber = useCartStore((s) => s.setTableNumber);
  const tables = useOrderStore((s) => s.tables);
  const fetchTables = useOrderStore((s) => s.fetchTables);
  const [activeCategoryId, setActiveCategoryId] = useState(categories[0]?.id || '');
  const [occupiedConfirmed, setOccupiedConfirmed] = useState(false);

  const isTableOccupied = tables.find((t) => t.table_number === tableNumber)?.status === 'occupied';

  // 載入桌位資料並啟用即時訂閱
  useEffect(() => {
    fetchTables();
    
    // 啟用 Supabase 即時訂閱
    const unsubscribe = useOrderStore.getState().subscribeToOrders();
    
    return unsubscribe;
  }, [fetchTables]);

  // 載入菜單資料並啟用即時訂閱
  useEffect(() => {
    fetchCategories();
    fetchMenuItems();
    fetchAddons();
    
    // 啟用菜單即時訂閱
    const unsubscribe = useMenuStore.getState().subscribeToMenu();
    
    return unsubscribe;
  }, [fetchCategories, fetchMenuItems, fetchAddons]);

  useEffect(() => {
    if (tableNumber >= 5 && tableNumber <= 22) {
      setTableNumber(tableNumber);
    }
  }, [tableNumber, setTableNumber]);

  const activeCategory = categories.find((c) => c.id === activeCategoryId);
  const availableItems = menuItems.filter(
    (item) => item.categoryId === activeCategoryId && item.isAvailable
  );

  // 按子分類分組
  const groupedItems = activeCategory?.subcategories.map((sub) => ({
    subcategory: sub,
    items: availableItems.filter((item) => item.subcategoryId === sub.id),
  })) || [];

  if (tableNumber < 5 || tableNumber > 22) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <span className="text-6xl block mb-4">🍠</span>
          <h1 className="text-2xl font-bold text-primary mb-2 font-serif">阿爸的芋圓</h1>
          <p className="text-text-secondary">請掃描桌面上的 QR Code 開始點餐</p>
        </div>
      </div>
    );
  }

  if (isTableOccupied && !occupiedConfirmed) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6">
        <div className="bg-card rounded-[12px] shadow-[var(--shadow-md)] p-8 max-w-sm w-full text-center">
          <span className="text-5xl block mb-4">🍽️</span>
          <h2 className="text-xl font-bold text-text-primary mb-2">第 {tableNumber} 桌</h2>
          <p className="text-text-secondary mb-6">
            此桌號目前仍有人用餐中<br />請確定是否繼續點餐
          </p>
          <Button fullWidth size="lg" onClick={() => setOccupiedConfirmed(true)}>
            確定繼續點餐
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg pb-24">
      {/* 頂部導航列 */}
      <header className="bg-dark-brown shadow-[var(--shadow-card)] h-14 flex items-center justify-between px-4 sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍠</span>
          <h1 className="text-lg font-bold text-primary-light font-serif">阿爸的芋圓</h1>
        </div>
        <span className="bg-primary/20 text-primary-light px-3 py-1 rounded-full text-sm font-semibold">
          第 {tableNumber} 桌
        </span>
      </header>

      {/* 分類標籤列 */}
      <CategoryTabs
        categories={categories}
        activeId={activeCategoryId}
        onSelect={setActiveCategoryId}
      />

      {/* 菜單內容 */}
      <main className="px-4 pt-4">
        {groupedItems.map(({ subcategory, items }) =>
          items.length > 0 ? (
            <section key={subcategory.id} className="mb-6">
              <h2 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2 font-serif">
                <span className="w-1 h-5 bg-primary rounded-full" />
                {subcategory.name}
              </h2>
              <div className="flex flex-col gap-3">
                {items.map((item) => (
                  <MenuCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ) : null
        )}

        {availableItems.length === 0 && (
          <div className="text-center py-12 text-text-hint">
            <p className="text-lg">此分類目前沒有品項</p>
          </div>
        )}
      </main>

      {/* 購物車浮動按鈕 */}
      <CartFab />
    </div>
  );
}
