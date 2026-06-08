import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  maxStock?: number;
}

export default function QuantitySelector({
  quantity,
  onQuantityChange,
  maxStock = 999,
}: QuantitySelectorProps) {
  const handleDecrease = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < maxStock) {
      onQuantityChange(quantity + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    if (value >= 1 && value <= maxStock) {
      onQuantityChange(value);
    }
  };

  return (
    <div>
      <label className="block font-semibold text-foreground mb-3">
        Quantity
      </label>

      <div className="flex items-center gap-4">
        <button
          onClick={handleDecrease}
          disabled={quantity <= 1}
          className="p-2 border border-border rounded hover:bg-secondary disabled:opacity-50 transition"
          aria-label="Decrease quantity"
        >
          <Minus className="w-4 h-4" />
        </button>

        <input
          type="number"
          value={quantity}
          onChange={handleInputChange}
          min="1"
          max={maxStock}
          className="w-16 text-center border border-border rounded px-2 py-2 text-foreground"
        />

        <button
          onClick={handleIncrease}
          disabled={quantity >= maxStock}
          className="p-2 border border-border rounded hover:bg-secondary disabled:opacity-50 transition"
          aria-label="Increase quantity"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {maxStock < 10 && (
        <p className="text-sm text-muted-foreground mt-2">
          Only {maxStock} available
        </p>
      )}
    </div>
  );
}
