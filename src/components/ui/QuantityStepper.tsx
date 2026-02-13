import { Minus, Plus } from 'lucide-react';

interface QuantityStepperProps {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
}

export default function QuantityStepper({ quantity, onChange, min = 0 }: QuantityStepperProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(Math.max(min, quantity - 1))}
        className="w-10 h-10 rounded-[8px] bg-secondary text-primary flex items-center justify-center hover:bg-accent/20 transition-colors cursor-pointer"
        aria-label="減少數量"
      >
        <Minus size={18} />
      </button>
      <span className="text-xl font-semibold w-8 text-center font-['Poppins']">{quantity}</span>
      <button
        onClick={() => onChange(quantity + 1)}
        className="w-10 h-10 rounded-[8px] bg-secondary text-primary flex items-center justify-center hover:bg-accent/20 transition-colors cursor-pointer"
        aria-label="增加數量"
      >
        <Plus size={18} />
      </button>
    </div>
  );
}
