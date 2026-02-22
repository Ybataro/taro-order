import { useEffect, useRef, useState, useCallback } from 'react';
import { X } from 'lucide-react';

interface ImageViewerProps {
  src: string;
  alt: string;
  onClose: () => void;
}

export default function ImageViewer({ src, alt, onClose }: ImageViewerProps) {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTouchRef = useRef<{ dist: number; x: number; y: number } | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const lastTapRef = useRef(0);

  // 進場動畫
  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  // 防止背景滾動
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Escape 關閉
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const resetTransform = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, []);

  // 雙擊縮放
  const handleDoubleClick = useCallback(() => {
    if (scale > 1) {
      resetTransform();
    } else {
      setScale(2.5);
    }
  }, [scale, resetTransform]);

  // Touch events for pinch-to-zoom and drag
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch start
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchRef.current = {
        dist: Math.sqrt(dx * dx + dy * dy),
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
    } else if (e.touches.length === 1) {
      // 雙擊偵測
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        handleDoubleClick();
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;

      // 單指拖曳（僅放大狀態下）
      if (scale > 1) {
        dragRef.current = {
          startX: e.touches[0].clientX,
          startY: e.touches[0].clientY,
          originX: translate.x,
          originY: translate.y,
        };
      }
    }
  }, [scale, translate, handleDoubleClick]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTouchRef.current) {
      // Pinch zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const ratio = dist / lastTouchRef.current.dist;
      setScale((prev) => Math.max(0.5, Math.min(5, prev * ratio)));
      lastTouchRef.current.dist = dist;
    } else if (e.touches.length === 1 && dragRef.current && scale > 1) {
      // Pan
      const dx = e.touches[0].clientX - dragRef.current.startX;
      const dy = e.touches[0].clientY - dragRef.current.startY;
      setTranslate({
        x: dragRef.current.originX + dx,
        y: dragRef.current.originY + dy,
      });
    }
  }, [scale]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    lastTouchRef.current = null;
    dragRef.current = null;

    // 如果縮小到 1 以下，重置
    if (scale < 1) {
      resetTransform();
    }

    // 下滑關閉（未放大狀態下）
    if (scale <= 1 && e.changedTouches.length === 1) {
      // 由 handleTouchStart 的 drag 判斷下滑距離
    }
  }, [scale, resetTransform]);

  return (
    <div
      className={`fixed inset-0 z-[60] bg-black/90 flex items-center justify-center transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget && scale <= 1) onClose();
      }}
    >
      {/* 關閉按鈕 */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-[61] w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-black/70 transition-colors"
        aria-label="Close"
      >
        <X size={24} />
      </button>

      {/* 圖片 */}
      <div
        ref={containerRef}
        className={`w-full h-full flex items-center justify-center transition-transform duration-200 ${
          isVisible ? 'scale-100' : 'scale-90'
        }`}
        style={{ touchAction: 'none' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleClick}
      >
        <img
          src={src}
          alt={alt}
          className="max-w-[90vw] max-h-[80vh] object-contain select-none pointer-events-none"
          style={{
            transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
            transition: dragRef.current ? 'none' : 'transform 0.2s ease-out',
          }}
          draggable={false}
        />
      </div>
    </div>
  );
}
