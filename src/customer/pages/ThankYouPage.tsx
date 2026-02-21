import { useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function ThankYouPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const displayNumber = searchParams.get('n');

  // 3秒後自動跳轉到訂單狀態頁面
  useEffect(() => {
    const timer = setTimeout(() => {
      if (orderId) {
        navigate(`/status/${orderId}`);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [orderId, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-bg flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* 成功圖示 */}
        <div className="mb-6 animate-bounce">
          <CheckCircle size={80} className="text-primary mx-auto" strokeWidth={2} />
        </div>

        {/* 芋圓圖案 */}
        <div className="text-8xl mb-6 animate-pulse">
          🍡
        </div>

        {/* 感謝訊息 */}
        <h1 className="text-3xl font-bold text-primary mb-4 font-serif">
          阿爸的芋圓
        </h1>
        <p className="text-xl text-text-primary mb-2 font-semibold">
          感謝您的點餐！
        </p>
        <p className="text-base text-text-secondary mb-8">
          我們已收到您的訂單<br />
          廚房正在努力為您準備中...
        </p>

        {/* 訂單編號 */}
        {orderId && (
          <div className="bg-card rounded-xl shadow-md p-4 mb-6">
            <p className="text-sm text-text-hint mb-1">您的訂單編號</p>
            <p className="text-2xl font-bold text-primary font-['Poppins']">
              #{String(displayNumber || '0').padStart(2, '0')}
            </p>
          </div>
        )}

        {/* 提示訊息 */}
        <p className="text-sm text-text-hint mb-6">
          頁面將自動跳轉至訂單狀態頁面...
        </p>

        {/* 立即查看按鈕 */}
        <Button
          variant="primary"
          fullWidth
          size="lg"
          onClick={() => orderId && navigate(`/status/${orderId}`)}
        >
          立即查看訂單狀態
        </Button>
      </div>
    </div>
  );
}
