import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, ArrowRight, Clock } from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';
import { useCurrency } from '../contexts/CurrencyContext';

export function ExchangeRates() {
  const { currency, currencies, exchangeRates, updateExchangeRates } = useCurrency();
  const [amount, setAmount] = useState<number>(1);
  const [fromCurrency, setFromCurrency] = useState<string>(currency.code);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [timeUntilUpdate, setTimeUntilUpdate] = useState(30);
  const updateTimeoutRef = useRef<NodeJS.Timeout>();
  const updateIntervalRef = useRef<NodeJS.Timeout>();

  // Update fromCurrency when currency changes
  useEffect(() => {
    setFromCurrency(currency.code);
  }, [currency.code]);

  // Handle automatic updates
  const convertAmount = (amount: number, from: string, to: string): number => {
    if (!exchangeRates[from] || !exchangeRates[to]) return amount;
    const inUSD = amount / exchangeRates[from];
    return inUSD * exchangeRates[to];
  };

  // Update countdown timer
  useEffect(() => {
    // Clear any existing timers
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
    }

    // Set up countdown timer
    updateIntervalRef.current = setInterval(() => {
      setTimeUntilUpdate(prev => {
        if (prev <= 0) {
          // Schedule the update slightly after the countdown reaches 0
          updateTimeoutRef.current = setTimeout(() => {
            updateExchangeRates();
          }, 0);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [updateExchangeRates]);

  const handleRefresh = async () => {
    await updateExchangeRates();
    setLastUpdated(new Date());
    setTimeUntilUpdate(30);
  };

  // Update lastUpdated when rates change
  useEffect(() => {
    setLastUpdated(new Date());
    setTimeUntilUpdate(30);
  }, [exchangeRates]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold">Exchange Rates</h2>
          <InfoTooltip text="Convert between different currencies using real-time exchange rates. Track currency fluctuations and manage multi-currency transactions." />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock size={16} />
            <span>Next update in:</span>
            <span className="font-mono bg-gray-100 px-2 py-1 rounded">
              {timeUntilUpdate}s
            </span>
          </div>
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
          <RefreshCw size={16} />
          Refresh Rates
        </button>
        </div>
      </div>

      {/* Currency Converter */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Currency Converter</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="px-4 py-2 border rounded-lg"
            min="0"
            step="0.01"
          />
          
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>

          <div className="flex justify-center">
            <ArrowRight size={24} className="text-gray-400" />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {currencies.map((c) => (
              <div key={c.code} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <span className="font-medium">{c.code}</span>
                <span className="text-gray-700">
                  {new Intl.NumberFormat(undefined, {
                    style: 'currency',
                    currency: c.code,
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(convertAmount(amount, fromCurrency, c.code))}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}