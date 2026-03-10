import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect } from 'react';
import { useOrderStore } from '../../stores/orderStore';
import Button from '../../components/ui/Button';
import { Printer, Download } from 'lucide-react';

export default function QRCodePage() {
  const tables = useOrderStore((s) => s.tables);
  const fetchTables = useOrderStore((s) => s.fetchTables);
  const [selectedTables, setSelectedTables] = useState<number[]>([]);
  const [baseUrl, setBaseUrl] = useState(() => {
    const { protocol, host } = window.location;
    return `${protocol}//${host}`;
  });
  const [showCustomUrl, setShowCustomUrl] = useState(false);

  // 載入桌位資料
  useEffect(() => {
    fetchTables();
  }, [fetchTables]);
  
  // 取得當前網站的基礎 URL
  const getBaseUrl = () => {
    return baseUrl;
  };

  // 生成桌號的點餐連結
  const getOrderUrl = (tableNumber: number) => {
    return `${getBaseUrl()}/order?table=${tableNumber}`;
  };

  // 全選/取消全選（只針對 5-22 桌）
  const toggleAll = () => {
    const tablesInRange = tables.filter(t => t.table_number >= 5 && t.table_number <= 22);
    if (selectedTables.length === tablesInRange.length) {
      setSelectedTables([]);
    } else {
      setSelectedTables(tablesInRange.map(t => t.table_number));
    }
  };

  // 切換單一桌號選擇
  const toggleTable = (tableNumber: number) => {
    if (selectedTables.includes(tableNumber)) {
      setSelectedTables(selectedTables.filter(n => n !== tableNumber));
    } else {
      setSelectedTables([...selectedTables, tableNumber]);
    }
  };

  // 列印選中的 QR Code
  const handlePrint = () => {
    window.print();
  };

  // 下載單一 QR Code (SVG)
  const downloadQRCode = (tableNumber: number) => {
    const svg = document.getElementById(`qr-${tableNumber}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `桌號${tableNumber}_QRCode.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 篩選桌號範圍 5-22
  const tablesInRange = tables.filter(t => t.table_number >= 5 && t.table_number <= 22);
  
  const displayTables = selectedTables.length > 0 
    ? tablesInRange.filter(t => selectedTables.includes(t.table_number))
    : tablesInRange;

  return (
    <div className="p-6">
      {/* 網址設定區 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 print:hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">網址設定</h2>
          <button
            onClick={() => setShowCustomUrl(!showCustomUrl)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {showCustomUrl ? '使用預設' : '自訂網址'}
          </button>
        </div>
        
        {showCustomUrl ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              自訂網址
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="http://your-domain.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-2 text-sm text-gray-500">
              例如：https://your-domain.com 或 http://192.168.1.100:5173
            </p>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 mb-1">目前使用網址：</p>
            <p className="text-blue-700 font-mono text-lg">{baseUrl}</p>
            <p className="text-xs text-blue-600 mt-3">
              💡 這是你的區域網路 IP，手機連接同一個 WiFi 即可掃描使用
            </p>
          </div>
        )}
      </div>

      {/* 頁面標題與操作按鈕 */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <h1 className="text-2xl font-bold text-text-primary">QR Code 生成器</h1>
        <div className="flex gap-3">
          <Button
            variant={selectedTables.length === tables.length ? 'secondary' : 'primary'}
            onClick={toggleAll}
          >
            {selectedTables.length === tables.length ? '取消全選' : '全選'}
          </Button>
          <Button
            variant="primary"
            onClick={handlePrint}
            disabled={displayTables.length === 0}
          >
            <Printer size={18} className="mr-2" />
            列印 QR Code
          </Button>
        </div>
      </div>

      {/* 說明文字 */}
      <div className="bg-accent/20 border border-accent rounded-[12px] p-4 mb-6 print:hidden">
        <h2 className="font-semibold text-text-primary mb-2">使用說明</h2>
        <ul className="text-sm text-text-secondary space-y-1 list-disc list-inside">
          <li>選擇要生成的桌號，點擊「列印 QR Code」即可列印</li>
          <li>或點擊單一 QR Code 的下載按鈕，儲存為 SVG 檔案</li>
          <li>建議將 QR Code 列印後，護貝並放置在對應桌面上</li>
          <li>顧客掃描 QR Code 後會直接進入該桌號的點餐頁面</li>
        </ul>
      </div>

      {/* QR Code 網格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2">
        {displayTables.map((table) => {
          const orderUrl = getOrderUrl(table.table_number);
          const isSelected = selectedTables.includes(table.table_number);

          return (
            <div
              key={table.table_number}
              className={`bg-card border-2 rounded-[12px] p-6 text-center transition-all print:break-inside-avoid print:border-black ${
                isSelected 
                  ? 'border-primary shadow-[var(--shadow-md)]' 
                  : 'border-border hover:border-accent'
              }`}
            >
              {/* 桌號標題 */}
              <div className="flex items-center justify-between mb-4 print:justify-center print:mb-2">
                <h3 className="text-xl font-bold text-text-primary">
                  第 {table.table_number} 桌
                </h3>
                <button
                  onClick={() => toggleTable(table.table_number)}
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors print:hidden ${
                    isSelected
                      ? 'bg-primary border-primary'
                      : 'border-border hover:border-accent'
                  }`}
                >
                  {isSelected && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </div>

              {/* QR Code */}
              <div className="flex justify-center mb-4">
                <div className="bg-white p-3 rounded-[8px]">
                  <QRCodeSVG
                    id={`qr-${table.table_number}`}
                    value={orderUrl}
                    size={160}
                    level="H"
                    includeMargin={false}
                  />
                </div>
              </div>

              {/* 桌號大字 */}
              <div className="text-6xl font-bold text-primary mb-2 print:text-5xl">
                {table.table_number}
              </div>

              {/* 店名 */}
              <p className="text-lg font-semibold text-text-primary mb-1">
                阿爸的芋圓
              </p>

              {/* 說明文字 */}
              <p className="text-sm text-text-hint mb-4">
                掃描 QR Code 開始點餐
              </p>

              {/* 網址顯示 (隱藏列印) */}
              <p className="text-xs text-text-hint font-['Poppins'] break-all print:hidden">
                {orderUrl}
              </p>

              {/* 下載按鈕 */}
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                className="mt-4 print:hidden"
                onClick={() => downloadQRCode(table.table_number)}
              >
                <Download size={16} className="mr-2" />
                下載 SVG
              </Button>
            </div>
          );
        })}
      </div>

      {/* 列印樣式 */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:grid-cols-2,
          .print\\:grid-cols-2 * {
            visibility: visible;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:break-inside-avoid {
            break-inside: avoid;
          }
          .print\\:grid-cols-2 > div {
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          @page {
            size: A4;
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
}
