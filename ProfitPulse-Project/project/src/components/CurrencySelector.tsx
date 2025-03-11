import React from 'react';
import { useCurrency } from '../contexts/CurrencyContext';

export function CurrencySelector() {
  const { currency, setCurrency, currencies } = useCurrency();

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <select
        value={currency.code}
        onChange={(e) => {
          const selected = currencies.find(c => c.code === e.target.value);
          if (selected) setCurrency(selected);
        }}
        className="px-1 sm:px-2 py-1 border rounded-lg text-sm bg-white min-w-[80px]"
      >
        {currencies.map((c) => (
          <option key={c.code} value={c.code}>
            {c.symbol} {c.code}
          </option>
        ))}
      </select>
    </div>
  );
}