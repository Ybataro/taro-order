import { Plus } from 'lucide-react';
import { useState } from 'react';
import type { MenuItem } from '../../types';
import { useTranslation } from '../../stores/i18nStore';
import { useCartStore } from '../../stores/cartStore';
import ItemCustomizeModal from './ItemCustomizeModal';
import ImageViewer from './ImageViewer';

interface MenuCardProps {
  item: MenuItem;
}

const tagStyle = (tag: string): string => {
  switch (tag) {
    case '招牌': return 'bg-accent/20 text-accent';
    case '熱銷': return 'bg-error/10 text-error';
    case '新品': return 'bg-success/10 text-success';
    case '季節限定': return 'bg-info/10 text-info';
    default: return 'bg-secondary text-text-secondary';
  }
};

export default function MenuCard({ item }: MenuCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const { t, tMenu, localized } = useTranslation();
  const addItemWithCustomization = useCartStore((s) => s.addItemWithCustomization);

  const isSoldOut = item.currentStock === 0 && item.dailyLimit != null;

  const handleAdd = () => {
    if (isSoldOut) return;
    // 套餐直接加入購物車（跳過客製化 Modal）
    if (item.isCombo) {
      addItemWithCustomization(item, { addons: [], temperature: null });
      return;
    }
    setShowModal(true);
  };

  return (
    <>
      <div className={`bg-card rounded-[12px] shadow-[var(--shadow-card)] p-4 flex gap-4 items-center relative ${isSoldOut ? 'opacity-60' : ''}`}>
        {/* 售罄遮罩標籤 */}
        {isSoldOut && (
          <div className="absolute top-2 right-2 bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
            {t('menu.soldOut')}
          </div>
        )}

        {/* 品項圖片 */}
        <div
          className={`w-20 h-20 rounded-[8px] bg-secondary flex-shrink-0 flex items-center justify-center overflow-hidden ${item.image ? 'cursor-pointer' : ''} ${isSoldOut ? 'grayscale' : ''}`}
          onClick={() => item.image && setShowViewer(true)}
        >
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl">🍠</span>
          )}
        </div>

        {/* 品項資訊 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-text-primary truncate">{localized(item.name, item.nameEn, item.nameJa) || tMenu('item', item.name)}</h3>
            {item.isCombo && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary/15 text-primary">
                {t('menu.combo')}
              </span>
            )}
          </div>
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {item.tags.map(tag => (
                <span key={tag} className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${tagStyle(tag)}`}>
                  {t('tag.' + tag)}
                </span>
              ))}
            </div>
          )}
          <p className="text-sm text-text-hint mt-1 line-clamp-1">{localized(item.description, item.descriptionEn, item.descriptionJa) || tMenu('desc', item.name)}</p>

          {/* 套餐內容標籤 */}
          {item.isCombo && item.comboItems && item.comboItems.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {item.comboItems.map((ci) => (
                <span key={ci.menuItemId} className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] bg-secondary text-text-secondary">
                  {ci.name}{ci.quantity > 1 ? ` x${ci.quantity}` : ''}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold text-primary font-['Poppins']">
                NT$ {item.price}
              </span>
              {/* 顯示剩餘庫存 */}
              {item.dailyLimit != null && item.currentStock != null && item.currentStock > 0 && (
                <span className="text-xs text-warning font-semibold">
                  {t('menu.stockRemaining', { n: item.currentStock })}
                </span>
              )}
            </div>
            <button
              onClick={handleAdd}
              disabled={isSoldOut}
              className={`h-9 px-4 rounded-[8px] flex items-center gap-1 text-sm font-semibold transition-colors active:scale-95 ${
                isSoldOut
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary-dark cursor-pointer'
              }`}
              aria-label={`${t('menu.add')} ${item.name}`}
            >
              <Plus size={16} />
              {isSoldOut ? t('menu.soldOut') : t('menu.add')}
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <ItemCustomizeModal item={item} onClose={() => setShowModal(false)} />
      )}

      {showViewer && item.image && (
        <ImageViewer src={item.image} alt={item.name} onClose={() => setShowViewer(false)} />
      )}
    </>
  );
}
