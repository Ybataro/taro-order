import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Order } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';

const steps = [
  { key: 'preparing', label: '準備中' },
  { key: 'completed', label: '完成取餐' },
] as const;

function getStepIndex(status: string): number {
  if (status === 'pending') return -1;
  const idx = steps.findIndex((s) => s.key === status);
  return idx;
}

export default function OrderStatusPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 載入單個訂單資料並啟用即時訂閱
  useEffect(() => {
    let mounted = true;
    let channel: any;

    const loadOrder = async () => {
      if (!orderId) return;
      
      try {
        setIsLoading(true);
        
        // 直接從 Supabase 查詢這個訂單
        const { data, error: fetchError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (fetchError) {
          console.error('查詢訂單失敗:', fetchError);
          if (mounted) {
            setOrder(null);
            setIsLoading(false);
          }
          return;
        }

        if (mounted) {
          setOrder(data);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('載入訂單時發生錯誤:', err);
        if (mounted) {
          setOrder(null);
          setIsLoading(false);
        }
      }
    };

    // 初始載入
    loadOrder();

    // 訂閱這個訂單的即時更新
    channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          console.log('訂單更新:', payload);
          if (payload.eventType === 'UPDATE' && mounted) {
            setOrder(payload.new as Order);
          } else if (payload.eventType === 'DELETE' && mounted) {
            setOrder(null);
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ 訂單狀態訂閱成功');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ 訂單狀態訂閱失敗:', err);
        }
      });

    return () => {
      mounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="text-5xl block mb-4">⏳</span>
          <p className="text-lg text-text-secondary">載入中...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="text-5xl block mb-4">🔍</span>
          <p className="text-lg text-text-secondary">找不到此訂單</p>
          <p className="text-sm text-text-hint mt-2">訂單編號：{orderId}</p>
          <Button
            className="mt-6"
            onClick={() => navigate('/')}
          >
            返回首頁
          </Button>
        </div>
      </div>
    );
  }

  const currentStep = getStepIndex(order.status);
  const createdTime = new Date(order.created_at).toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-bg pb-24">
      {/* 頂部導航 */}
      <header className="bg-dark-brown shadow-[var(--shadow-card)] h-14 flex items-center px-4 sticky top-0 z-20">
        <button onClick={() => navigate(`/order?table=${order.table_number}`)} className="p-2 -ml-2 cursor-pointer" aria-label="返回菜單">
          <ArrowLeft size={24} className="text-primary-light" />
        </button>
        <h1 className="text-lg font-bold text-primary-light ml-2 font-serif">訂單進度</h1>
      </header>

      <main className="px-4 pt-6">
        {/* 訂單編號 & 桌號 */}
        <div className="text-center mb-6">
          <p className="text-sm text-text-hint">訂單編號</p>
          <p className="text-2xl font-bold text-primary font-['Poppins']">
            #{String(order.display_number || 0).padStart(2, '0')}
          </p>
          <p className="text-base text-primary font-semibold mt-1">第 {order.table_number} 桌</p>
        </div>

        {/* 進度條 */}
        <div className="bg-card rounded-[12px] shadow-[var(--shadow-card)] p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-center flex-1">
                {/* 圓點 */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-500 ${
                      index <= currentStep
                        ? 'bg-primary text-white'
                        : 'bg-border text-text-hint'
                    }`}
                  >
                    {index <= currentStep ? '✓' : index + 1}
                  </div>
                  <span className={`text-xs mt-2 font-semibold ${
                    index <= currentStep ? 'text-primary' : 'text-text-hint'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {/* 連接線 */}
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded-full transition-colors duration-500 ${
                    index < currentStep ? 'bg-primary' : 'bg-border'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <div className="text-center pt-2 border-t border-border">
            <span className="text-sm text-text-secondary">目前狀態：</span>
            <StatusBadge status={order.status} />
          </div>
        </div>

        {/* 訂單資訊 */}
        <div className="bg-card rounded-[12px] shadow-[var(--shadow-card)] p-4 mb-6">
          <p className="text-sm text-text-hint mb-3">下單時間：{createdTime}</p>

          <h3 className="text-base font-bold text-text-primary mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-primary rounded-full" />
            訂單內容
          </h3>

          <div className="flex flex-col gap-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-2 border-b border-border last:border-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-text-primary">{item.name}</span>
                    <span className="text-sm text-text-hint">x{item.quantity}</span>
                  </div>
                  <span className="font-semibold text-text-primary font-['Poppins']">
                    NT$ {item.price * item.quantity}
                  </span>
                </div>
                {item.customizationText && (
                  <p className="text-xs text-text-hint mt-1 ml-1">{item.customizationText}</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 mt-2 border-t-2 border-border">
            <span className="font-bold text-text-primary">合計</span>
            <span className="text-xl font-bold text-primary font-['Poppins']">
              NT$ {order.total_price}
            </span>
          </div>

          <div className="mt-3 text-sm text-text-secondary">
            付款方式：{order.payment_method === 'cash' ? '💵 現場結帳' : '📱 線上付款'}
          </div>

          {order.notes && (
            <div className="mt-2 text-sm text-text-secondary">
              備註：{order.notes}
            </div>
          )}
        </div>

        {/* 加點按鈕 */}
        {order.status !== 'completed' && order.status !== 'cancelled' && (
          <Button
            variant="secondary"
            fullWidth
            size="lg"
            onClick={() => navigate(`/order?table=${order.table_number}`)}
          >
            <span className="flex items-center justify-center gap-2">
              <Plus size={20} />
              我要加點
            </span>
          </Button>
        )}
      </main>
    </div>
  );
}
