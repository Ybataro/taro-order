import { Plus } from 'lucide-react';
import { useState } from 'react';
import type { MenuItem } from '../../types';
import { useTranslation } from '../../stores/i18nStore';
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
  const { t } = useTranslation();

  return (
    <>
      <div className="bg-card rounded-[12px] shadow-[var(--shadow-card)] p-4 flex gap-4 items-center">
        {/* 品項圖片 */}
        <div
          className={`w-20 h-20 rounded-[8px] bg-secondary flex-shrink-0 flex items-center justify-center overflow-hidden ${item.image ? 'cursor-pointer' : ''}`}
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
          <h3 className="text-lg font-semibold text-text-primary truncate">{item.name}</h3>
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {item.tags.map(tag => (
                <span key={tag} className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${tagStyle(tag)}`}>
                  {t('tag.' + tag)}
                </span>
              ))}
            </div>
          )}
          <p className="text-sm text-text-hint mt-1 line-clamp-1">{item.description}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xl font-semibold text-primary font-['Poppins']">
              NT$ {item.price}
            </span>
            <button
              onClick={() => setShowModal(true)}
              className="h-9 px-4 bg-primary text-white rounded-[8px] flex items-center gap-1 text-sm font-semibold hover:bg-primary-dark transition-colors cursor-pointer active:scale-95"
              aria-label={`${t('menu.add')} ${item.name}`}
            >
              <Plus size={16} />
              {t('menu.add')}
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
