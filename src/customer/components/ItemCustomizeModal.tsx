import { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import type { MenuItem, CartCustomization, Addon, TemperatureOption } from '../../types';
import { addonItems, noAddonCategories, getTemperatureOptions } from '../../data/addons';
import { useCartStore } from '../../stores/cartStore';
import { useTranslation } from '../../stores/i18nStore';
import Button from '../../components/ui/Button';
import ImageViewer from './ImageViewer';

interface Props {
  item: MenuItem;
  onClose: () => void;
}

export default function ItemCustomizeModal({ item, onClose }: Props) {
  const addItemWithCustomization = useCartStore((s) => s.addItemWithCustomization);
  const { t } = useTranslation();

  const allowAddons = !noAddonCategories.includes(item.categoryId);
  const temperatureOptions = getTemperatureOptions(item.categoryId);

  const [addonQuantities, setAddonQuantities] = useState<Record<string, number>>({});
  const [temperature, setTemperature] = useState<TemperatureOption | null>(
    temperatureOptions
      ? (temperatureOptions.includes('涼' as TemperatureOption) ? '涼' : temperatureOptions[0])
      : null
  );
  const [showViewer, setShowViewer] = useState(false);

  const updateAddon = (addonId: string, delta: number) => {
    setAddonQuantities((prev) => {
      const current = prev[addonId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [addonId]: next };
    });
  };

  const addonSubtotal = addonItems.reduce((sum, a) => sum + a.price * (addonQuantities[a.id] || 0), 0);
  const totalPrice = item.price + addonSubtotal;

  const handleConfirm = () => {
    const selectedAddons: { addon: Addon; quantity: number }[] = addonItems
      .filter((a) => (addonQuantities[a.id] || 0) > 0)
      .map((a) => ({ addon: a, quantity: addonQuantities[a.id] }));

    const customization: CartCustomization = {
      addons: selectedAddons,
      temperature,
    };

    addItemWithCustomization(item, customization);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center backdrop-blur-xs">
      <div className="bg-card rounded-t-[20px] sm:rounded-[20px] shadow-[var(--shadow-lg)] w-full max-w-md max-h-[85vh] overflow-y-auto">
        {/* 標題 */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm p-4 border-b border-border flex items-center justify-between z-10 rounded-t-[20px]">
          <h2 className="text-lg font-bold text-text-primary font-serif">{item.name}</h2>
          <button onClick={onClose} className="p-1 text-text-hint hover:text-text-primary cursor-pointer">
            <X size={24} />
          </button>
        </div>

        <div className="p-4">
          {/* 品項基本資訊 */}
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
            <div
              className={`w-16 h-16 rounded-[12px] bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden ${item.image ? 'cursor-pointer' : ''}`}
              onClick={() => item.image && setShowViewer(true)}
            >
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">🍠</span>
              )}
            </div>
            <div>
              <p className="text-sm text-text-secondary leading-relaxed">{item.description}</p>
              <p className="text-lg font-bold text-primary font-['Poppins'] mt-1">NT$ {item.price}</p>
            </div>
          </div>

          {/* 溫度選擇 */}
          {temperatureOptions && (
            <div className="mb-5 pb-4 border-b border-border">
              <h3 className="text-base font-bold text-text-primary mb-3">{t('customize.temperature')}</h3>
              <div className="flex gap-2">
                {temperatureOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setTemperature(opt)}
                    className={`flex-1 py-3 rounded-[12px] border-2 text-center font-semibold cursor-pointer transition-all ${
                      temperature === opt
                        ? 'border-primary bg-primary/15 text-primary shadow-sm'
                        : 'border-border bg-card text-text-secondary hover:border-accent'
                    }`}
                  >
                    {t('temp.' + opt)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 加購區 */}
          {allowAddons && (
            <div className="mb-4">
              <h3 className="text-base font-bold text-text-primary mb-3">{t('customize.addons')}</h3>
              <div className="flex flex-col gap-2">
                {addonItems.map((addon) => {
                  const qty = addonQuantities[addon.id] || 0;
                  return (
                    <div key={addon.id} className="flex items-center justify-between py-2.5 px-3.5 bg-bg rounded-[12px]">
                      <div>
                        <span className="text-sm font-semibold text-text-primary">{addon.name}</span>
                        <span className="text-sm text-primary font-['Poppins'] ml-2 font-semibold">+${addon.price}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {qty > 0 && (
                          <button
                            onClick={() => updateAddon(addon.id, -1)}
                            className="w-8 h-8 rounded-full bg-secondary text-primary flex items-center justify-center cursor-pointer hover:bg-accent/20"
                          >
                            <Minus size={14} />
                          </button>
                        )}
                        {qty > 0 && (
                          <span className="text-sm font-bold w-5 text-center font-['Poppins']">{qty}</span>
                        )}
                        <button
                          onClick={() => updateAddon(addon.id, 1)}
                          className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer hover:bg-primary-dark"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 底部確認列 */}
        <div className="sticky bottom-0 bg-card/95 backdrop-blur-sm border-t border-border p-4">
          <Button fullWidth size="lg" onClick={handleConfirm}>
            {t('customize.addToCart', { price: totalPrice })}
          </Button>
        </div>
      </div>

      {showViewer && item.image && (
        <ImageViewer src={item.image} alt={item.name} onClose={() => setShowViewer(false)} />
      )}
    </div>
  );
}
