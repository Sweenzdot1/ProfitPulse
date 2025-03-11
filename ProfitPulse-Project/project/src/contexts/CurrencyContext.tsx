import React, { createContext, useContext, useState, useEffect } from 'react';
import { ExchangeRates } from '../types';
import axios from 'axios';

type Currency = {
  code: string;
  symbol: string;
  name: string;
};

const currencies: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
];

type CurrencyContextType = {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  currencies: Currency[];
  formatAmount: (amount: number) => string;
  convertAmount: (amount: number, fromCurrency: string, toCurrency: string) => number;
  exchangeRates: ExchangeRates;
  updateExchangeRates: () => Promise<void>;
  convertBusinessTransaction: (transaction: BusinessTransaction) => BusinessTransaction;
  convertBusinessTransactionItem: (item: BusinessTransactionItem) => BusinessTransactionItem;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(currencies[0]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
  const [isUpdating, setIsUpdating] = useState(false);

  // Detect user's locale and set initial currency
  useEffect(() => {
    try {
      const defaultCurrency = currencies.find(c => c.code === 'GBP');
      if (defaultCurrency) {
        setCurrency(defaultCurrency);
      }
    } catch (error) {
      console.error('Error detecting user currency:', error);
    }
  }, []);

  const updateExchangeRates = async () => {
    try {
      setIsUpdating(true);
      // Fetch exchange rates from a reliable API since Google Finance doesn't provide a public API
      const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
      setExchangeRates(response.data.rates);
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      // Use default rates if there's an error
      setExchangeRates({
        USD: 1,
        EUR: 0.92,
        GBP: 0.79,
        JPY: 151.67,
        AUD: 1.53,
        CAD: 1.35,
        CHF: 0.90,
        CNY: 7.23
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Initial fetch of exchange rates
  useEffect(() => {
    updateExchangeRates();
    // Update rates every minute to avoid rate limits
    const interval = setInterval(updateExchangeRates, 60000);
    return () => clearInterval(interval);
  }, []);

  const convertAmount = (amount: number, fromCurrency: string, toCurrency: string): number => {
    if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) return amount;
    const inUSD = amount / exchangeRates[fromCurrency];
    return inUSD * exchangeRates[toCurrency];
  };

  const convertBusinessTransaction = (transaction: BusinessTransaction): BusinessTransaction => {
    const convertedItems = transaction.items.map(item => convertBusinessTransactionItem(item));
    
    return {
      ...transaction,
      items: convertedItems,
      totalAmount: convertAmount(transaction.totalAmount, 'USD', currency.code),
      profitMargin: convertAmount(transaction.profitMargin, 'USD', currency.code),
    };
  };

  const convertBusinessTransactionItem = (item: BusinessTransactionItem): BusinessTransactionItem => {
    return {
      ...item,
      unitPrice: convertAmount(item.unitPrice, 'USD', currency.code),
      totalPrice: convertAmount(item.totalPrice, 'USD', currency.code),
      cost: convertAmount(item.cost, 'USD', currency.code),
    };
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
    }).format(amount);
  };

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      setCurrency, 
      currencies, 
      formatAmount, 
      convertAmount,
      exchangeRates,
      updateExchangeRates: () => {
        if (!isUpdating) {
          return updateExchangeRates();
        }
      },
      convertBusinessTransaction,
      convertBusinessTransactionItem
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}