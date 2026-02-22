import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useCartStore, getItemUnitPrice } from '../../stores/cartStore';
import { useOrderStore } from '../../stores/orderStore';
import { useTranslation } from '../../stores/i18nStore';
import Button from '../../components/ui/Button';
import QuantityStepper from '../../components/ui/QuantityStepper';
import { useState } from 'react';

function formatCustomization(item: import('../../types').CartItem): string {
  const parts: string[] = [];
  if (item.customization.temperature) parts.push(`溫度：${item.customization.temperature}`);
  for (const a of item.customization.addons) {
    parts.push(`加購 ${a.addon.name} x${a.quantity}`);
  }
  return parts.join('、');
}

export default function CartPage() {
  const navigate = useNavigate();
  const { t, tMenu } = useTranslation();
  const { items, tableNumber, note, paymentMethod, updateQuantity, removeItem, setNote, setPaymentMethod, clearCart } = useCartStore();
  const addOrder = useOrderStore((s) => s.addOrder);
  const generateDailyOrderNumber = useOrderStore((s) => s.generateDailyOrderNumber);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = items.reduce((sum, i) => sum + getItemUnitPrice(i) * i.quantity, 0);

  const handleSubmit = async () => {
    if (items.length === 0 || !tableNumber || isSubmitting) return;

    try {
      setIsSubmitting(true);

      // 生成訂單編號（UUID + 每日遞增 displayNumber）
      const { id, displayNumber } = await generateDailyOrderNumber();

      const order = {
        id,
        display_number: displayNumber,
        table_number: tableNumber,
        items: items.map((i) => {
          const customText = formatCustomization(i);
          return {
            menuItemId: i.menuItem.id,
            name: i.menuItem.name,
            price: getItemUnitPrice(i),
            quantity: i.quantity,
            customizationText: customText,
          };
        }),
        status: 'pending' as const,
        total_price: total,
        notes: note,
        payment_method: paymentMethod,
        created_at: new Date().toISOString(),
      };

      await addOrder(order);
      clearCart();
      navigate(`/thank-you/${order.id}?n=${displayNumber}`);
    } catch (error) {
      console.error('送出訂單失敗:', error);
      alert(t('cart.submitFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg pb-32">
      {/* 頂部導航 */}
      <header className="bg-dark-brown shadow-[var(--shadow-card)] h-14 flex items-center px-4 sticky top-0 z-20">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 cursor-pointer" aria-label={t('cart.back')}>
          <ArrowLeft size={24} className="text-primary-light" />
        </button>
        <h1 className="text-lg font-bold text-primary-light ml-2 font-serif">{t('cart.title')}</h1>
      </header>

      <main className="px-4 pt-4">
        {/* 桌號 */}
        <div className="bg-secondary rounded-[12px] p-4 mb-4 text-center">
          <span className="text-lg font-bold text-primary">{t('cart.tableOrder', { table: tableNumber })}</span>
        </div>

        {/* 品項列表 */}
        {items.length === 0 ? (
          <div className="text-center py-12 text-text-hint">
            <span className="text-5xl block mb-4">🛒</span>
            <p className="text-lg">{t('cart.empty')}</p>
            <Button variant="secondary" className="mt-4" onClick={() => navigate(-1)}>
              {t('cart.goOrder')}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 mb-6">
              {items.map((cartItem) => {
                const unitPrice = getItemUnitPrice(cartItem);
                return (
                  <div key={cartItem.cartItemId} className="bg-card rounded-[12px] shadow-[var(--shadow-card)] p-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-base font-semibold text-text-primary">{tMenu('item', cartItem.menuItem.name)}</h3>
                      <button onClick={() => removeItem(cartItem.cartItemId)} className="p-1 text-text-hint hover:text-error cursor-pointer" aria-label={t('cart.delete')}>
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* 客製化標籤 */}
                    {(cartItem.customization.temperature || cartItem.customization.addons.length > 0) && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {cartItem.customization.temperature && (
                          <span className="text-xs bg-info/10 text-info px-2 py-0.5 rounded-full font-medium">{t('temp.' + cartItem.customization.temperature)}</span>
                        )}
                        {cartItem.customization.addons.map((a) => (
                          <span key={a.addon.id} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                            +{tMenu('addon', a.addon.name)} x{a.quantity}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-primary font-['Poppins']">
                        NT$ {unitPrice * cartItem.quantity}
                      </span>
                      <QuantityStepper
                        quantity={cartItem.quantity}
                        onChange={(q) => updateQuantity(cartItem.cartItemId, q)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 備註欄 */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-text-secondary mb-2">{t('cart.noteLabel')}</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t('cart.notePlaceholder')}
                className="w-full h-20 p-4 border border-border rounded-[8px] bg-card text-base text-text-primary resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* 付款方式 */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-text-secondary mb-3">{t('cart.paymentMethod')}</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-4 rounded-[12px] border-2 text-center font-semibold cursor-pointer transition-colors ${
                    paymentMethod === 'cash'
                      ? 'border-primary bg-secondary text-primary'
                      : 'border-border bg-card text-text-secondary hover:border-accent'
                  }`}
                >
                  {t('cart.cash')}
                </button>
                <button
                  onClick={() => setPaymentMethod('online')}
                  className={`p-4 rounded-[12px] border-2 text-center font-semibold cursor-pointer transition-colors ${
                    paymentMethod === 'online'
                      ? 'border-primary bg-secondary text-primary'
                      : 'border-border bg-card text-text-secondary hover:border-accent'
                  }`}
                >
                  {t('cart.online')}
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      {/* 底部結帳列 */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-card shadow-[var(--shadow-lg)] p-4 z-30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-base text-text-secondary">{t('cart.subtotal')}</span>
            <span className="text-2xl font-bold text-primary font-['Poppins']">NT$ {total}</span>
          </div>
          <Button fullWidth size="lg" onClick={() => setShowConfirm(true)}>
            {t('cart.submit', { total })}
          </Button>
        </div>
      )}

      {/* 確認對話框 */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6">
          <div className="bg-card rounded-[12px] shadow-[var(--shadow-lg)] p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold text-text-primary text-center mb-2">{t('cart.confirmTitle')}</h2>
            <p className="text-text-secondary text-center mb-6">
              {t('cart.confirmSummary', { table: tableNumber, count: items.length, total })}
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setShowConfirm(false)} disabled={isSubmitting}>
                {t('cart.cancel')}
              </Button>
              <Button fullWidth onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? t('cart.submitting') : t('cart.confirm')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
