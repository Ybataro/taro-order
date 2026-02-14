import { Plus } from 'lucide-react';
import { useState } from 'react';
import type { MenuItem } from '../../types';
import ItemCustomizeModal from './ItemCustomizeModal';

interface MenuCardProps {
  item: MenuItem;
}

export default function MenuCard({ item }: MenuCardProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="bg-card rounded-[12px] shadow-[var(--shadow-card)] p-4 flex gap-4 items-center">
        {/* 品項圖片 */}
        <div className="w-20 h-20 rounded-[8px] bg-secondary flex-shrink-0 flex items-center justify-center overflow-hidden">
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl">🍠</span>
          )}
        </div>

        {/* 品項資訊 */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-text-primary truncate">{item.name}</h3>
          <p className="text-sm text-text-hint mt-1 line-clamp-1">{item.description}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xl font-semibold text-primary font-['Poppins']">
              NT$ {item.price}
            </span>
            <button
              onClick={() => setShowModal(true)}
              className="h-9 px-4 bg-primary text-white rounded-[8px] flex items-center gap-1 text-sm font-semibold hover:bg-primary-dark transition-colors cursor-pointer active:scale-95"
              aria-label={`加入 ${item.name}`}
            >
              <Plus size={16} />
              加入
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <ItemCustomizeModal item={item} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
