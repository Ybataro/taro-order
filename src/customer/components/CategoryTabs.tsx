import type { Category } from '../../types';
import { useTranslation } from '../../stores/i18nStore';

interface CategoryTabsProps {
  categories: Category[];
  activeId: string;
  onSelect: (id: string) => void;
}

export default function CategoryTabs({ categories, activeId, onSelect }: CategoryTabsProps) {
  const { tMenu } = useTranslation();

  return (
    <div className="flex gap-1 overflow-x-auto no-scrollbar bg-dark-brown shadow-[var(--shadow-card)] sticky top-[56px] z-10">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`flex-shrink-0 px-5 py-3 text-base font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeId === cat.id
              ? 'text-primary-light border-b-[3px] border-primary-light'
              : 'text-text-hint border-b-[3px] border-transparent hover:text-primary-light'
          }`}
        >
          {tMenu('cat', cat.name)}
        </button>
      ))}
    </div>
  );
}
