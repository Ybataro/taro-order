import { forwardRef, useImperativeHandle, useEffect, useState } from 'react';
import type { Order } from '../types';
import { useMenuStore } from '../stores/menuStore';

interface LabelPrintProps {
  order: Order;
}

export interface LabelPrintRef {
  print: () => void;
}

const LabelPrint = forwardRef<LabelPrintRef, LabelPrintProps>(({ order }, ref) => {
  const menuItems = useMenuStore((s) => s.menuItems);
  const isMenuLoading = useMenuStore((s) => s.isLoading);
  
  useImperativeHandle(ref, () => ({
    print: () => {
      console.log('📋 使用新視窗列印貼紙');
      console.log('menuItems:', menuItems);
      console.log('menuItems 數量:', menuItems?.length);
      console.log('isMenuLoading:', isMenuLoading);
      
      // 檢查必要資料
      if (!menuItems || menuItems.length === 0) {
        console.error('❌ 菜單資料尚未載入');
        alert('菜單資料載入中，請稍候片刻再試（約3秒）');
        return;
      }
      
      // 生成貼紙 HTML
      const labelsHTML = order.items.map((item, index) => {
        const diningType = order.tableNumber === 0 ? '外帶' : order.tableNumber > 100 ? '外送' : '內用';
        const tableInfo = order.tableNumber > 0 && order.tableNumber < 100 ? order.tableNumber : '';
        
        // 使用當前時間
        const now = new Date();
        const date = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
        const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        const productName = item.name.length > 7 ? item.name.substring(0, 6) + '...' : item.name;
        
        // 從菜單資料中取得描述（配料）
        const menuItem = menuItems?.find(m => m.id === item.menuItemId);
        let addons = menuItem?.description || item.customizationText || '';
        
        // 限制配料長度（避免超過2行，大約40個字）
        if (addons.length > 40) {
          addons = addons.substring(0, 38) + '...';
        }
        
        console.log('品項:', item.name, '菜單ID:', item.menuItemId, '找到菜單:', !!menuItem, '配料:', addons);
        
        return `
          <div class="label-print" style="
            width: 40mm;
            height: 30mm;
            padding: 2mm;
            margin-bottom: 2.5mm;
            font-family: 'Microsoft JhengHei', '微軟正黑體', sans-serif;
            font-size: 9pt;
            line-height: 1.3;
            color: #000;
            background: white;
            border: 1px solid #000;
            box-sizing: border-box;
            page-break-after: always;
          ">
            <div style="font-size: 10pt; font-weight: bold; margin-bottom: 0.5mm;">
              阿爸的芋圓 ${order.id}-${order.items.length}-${index + 1}
            </div>
            <div style="font-size: 9pt; margin-bottom: 0.5mm;">
              ${diningType}${tableInfo} ${date} ${time}
            </div>
            <div style="font-size: 9pt; font-weight: bold; margin-bottom: 0.5mm;">
              ${productName} $${item.price}
            </div>
            ${addons ? `<div style="font-size: 7pt; margin-bottom: 0.5mm; line-height: 1.1; max-height: 9mm; overflow: hidden;">${addons} 0元</div>` : ''}
            <div style="flex: 1;"></div>
            <div style="font-size: 8pt; margin-top: 1mm;">
              電話:02-29247461
            </div>
          </div>
        `;
      }).join('');
      
      // 開啟新視窗
      const printWindow = window.open('', '_blank', 'width=400,height=600');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>出餐貼紙</title>
            <style>
              @page {
                size: 40mm 30mm;
                margin: 15mm 10mm;
              }
              @media print {
                @page {
                  margin: 0;
                }
              }
              body {
                margin: 0;
                padding: 0;
              }
              /* 隱藏瀏覽器自動添加的頁首頁尾 */
              @media print {
                body::before,
                body::after {
                  display: none !important;
                }
              }
              .label-print:last-child {
                page-break-after: avoid;
              }
            </style>
          </head>
          <body>
            ${labelsHTML}
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 100);
              };
            </script>
          </body>
          </html>
        `);
        printWindow.document.close();
      }
    },
  }));

  // 格式化產品名稱（最多7個繁體中文字）
  const formatProductName = (name: string): string => {
    if (name.length > 7) {
      return name.substring(0, 6) + '...';
    }
    return name;
  };

  // 格式化配料清單
  const formatAddons = (item: any): string => {
    // 優先使用 customizationText
    if (item.customizationText && item.customizationText.trim() !== '') {
      return item.customizationText;
    }
    
    // 否則嘗試從 customizations 提取
    const addons: string[] = [];
    if (item.customizations) {
      for (const [key, value] of Object.entries(item.customizations)) {
        if (value && typeof value === 'string') {
          addons.push(value);
        } else if (Array.isArray(value)) {
          addons.push(...value);
        }
      }
    }
    
    return addons.length > 0 ? addons.join('、') : '';
  };

  // 判斷用餐方式
  const getDiningType = (): string => {
    // 根據桌號判斷
    if (order.tableNumber === 0) {
      return '外帶';
    } else if (order.tableNumber > 100) {
      return '外送';
    } else {
      return '內用';
    }
  };

  // 格式化日期時間
  const formatDateTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      
      // 檢查日期是否有效
      if (isNaN(date.getTime())) {
        console.error('無效的日期:', dateStr);
        const now = new Date();
        return {
          date: `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`,
          time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
        };
      }
      
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return {
        date: `${month}/${day}`,
        time: `${hours}:${minutes}`
      };
    } catch (error) {
      console.error('日期格式化錯誤:', error);
      const now = new Date();
      return {
        date: `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`,
        time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      };
    }
  };

  const { date, time } = formatDateTime(order.createdAt);
  const diningType = getDiningType();

  return (
    <div className="label-print-container">
      {order.items.map((item, index) => (
        <div key={index} className="label-print">
          {/* 第1行：店名 + 訂單編號-總碗數-第幾碗 */}
          <div className="label-line-1">
            阿爸的芋圓 {order.id}-{order.items.length}-{index + 1}
          </div>
          
          <div className="label-divider"></div>
          
          {/* 第2行：用餐方式 + 桌號 + 日期 + 時間 */}
          <div className="label-line-2">
            {diningType}{order.tableNumber > 0 && order.tableNumber < 100 ? order.tableNumber : ''} {date} {time}
          </div>
          
          {/* 第3行：產品名稱 + 價格 */}
          <div className="label-line-3">
            {formatProductName(item.name)} ${item.price}
          </div>
          
          {/* 第4行：配料 */}
          {formatAddons(item) && (
            <div className="label-line-4">
              {formatAddons(item)} 0元
            </div>
          )}
          
          {/* 第5行：預留空行 */}
          <div className="label-line-5"></div>
          
          {/* 第6行：電話 */}
          <div className="label-line-6">
            電話:02-29247461
          </div>
        </div>
      ))}
    </div>
  );
});

LabelPrint.displayName = 'LabelPrint';

export default LabelPrint;
