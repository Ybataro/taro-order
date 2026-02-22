import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import { useTranslation } from '../../stores/i18nStore';
import { useNavigate } from 'react-router-dom';

export default function CartFab() {
  const count = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (count === 0) return null;

  return (
    <button
      onClick={() => navigate('/cart')}
      className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-[var(--shadow-md)] flex items-center justify-center hover:bg-primary-dark transition-colors cursor-pointer active:scale-95 z-50"
      aria-label={t('cart.viewCart')}
    >
      <ShoppingCart size={24} />
      <span className="absolute -top-1 -right-1 w-6 h-6 bg-error text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
        {count}
      </span>
    </button>
  );
}
