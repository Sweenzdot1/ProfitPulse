import React, { useState, useEffect } from 'react';
import { Plus, Filter, Trash2, Calendar, RefreshCw, Tag } from 'lucide-react';
import { Transaction } from '../types';
import { format, addDays, addWeeks, addMonths, isSameDay } from 'date-fns';
import { useCurrency } from '../contexts/CurrencyContext';
import { InfoTooltip } from './InfoTooltip';

interface TransactionManagerProps {
  transactions: Transaction[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
}

const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Investments', 'Rental', 'Other'],
  expense: ['Housing', 'Transportation', 'Food', 'Utilities', 'Healthcare', 'Entertainment', 'Debt', 'Other'],
};

const RECURRENCE_OPTIONS = [
  { value: 'none', label: 'One-time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: '4weekly', label: '4 Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export function TransactionManager({ transactions, onAddTransaction, onDeleteTransaction }: TransactionManagerProps) {
  const { formatAmount, currency, convertAmount } = useCurrency();
  const [editingTransaction, setEditingTransaction] = useState<string | null>(null);
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense' as 'income' | 'expense',
    category: '',
    amount: 0,
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    isRecurring: false,
    recurrence: 'none' as 'none' | 'daily' | 'weekly' | '4weekly' | 'monthly',
    label: '',
    paymentDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const [filter, setFilter] = useState({
    type: 'all' as 'all' | 'income' | 'expense',
    category: 'all',
  });

  // Check for due recurring transactions
  useEffect(() => {
    const today = new Date();
    transactions.forEach(transaction => {
      if (transaction.isRecurring && transaction.nextDueDate && isSameDay(new Date(transaction.nextDueDate), today)) {
        const nextDueDate = calculateNextDueDate(today, transaction.recurrence!);
        onAddTransaction({
          ...transaction,
          date: today,
          nextDueDate,
          lastPaidDate: today,
        });
      }
    });
  }, [transactions]);

  const calculateNextDueDate = (currentDate: Date, recurrence: string): Date => {
    switch (recurrence) {
      case 'daily':
        return addDays(currentDate, 1);
      case 'weekly':
        return addWeeks(currentDate, 1);
      case '4weekly':
        return addWeeks(currentDate, 4);
      case 'monthly':
        return addMonths(currentDate, 1);
      default:
        return currentDate;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTransaction) {
      // Update existing transaction
      onAddTransaction({
        ...newTransaction,
        id: editingTransaction,
        date: new Date(newTransaction.date),
        nextDueDate: newTransaction.isRecurring ? 
          calculateNextDueDate(new Date(newTransaction.date), newTransaction.recurrence) : 
          undefined,
        originalAmount: Number(newTransaction.amount),
        originalCurrency: currency.code,
        paymentDate: new Date(newTransaction.paymentDate),
      });
      setEditingTransaction(null);
    } else {
      // Add new transaction
      const date = new Date(newTransaction.date);
      const nextDueDate = newTransaction.isRecurring ? 
        calculateNextDueDate(date, newTransaction.recurrence) : 
        undefined;

      onAddTransaction({
        ...newTransaction,
        date: new Date(newTransaction.date),
        nextDueDate,
        originalAmount: Number(newTransaction.amount),
        originalCurrency: currency.code,
        isRecurring: newTransaction.isRecurring,
        recurrence: newTransaction.recurrence === 'none' ? undefined : newTransaction.recurrence,
        paymentDate: new Date(newTransaction.paymentDate),
      });
    }

    setNewTransaction({
      type: 'expense',
      category: '',
      amount: 0,
      date: format(new Date(), 'yyyy-MM-dd'),
      description: '',
      isRecurring: false,
      recurrence: 'none',
      label: '',
      paymentDate: format(new Date(), 'yyyy-MM-dd'),
    });
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction.id);
    setNewTransaction({
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      date: format(transaction.date, 'yyyy-MM-dd'),
      description: transaction.description,
      isRecurring: transaction.isRecurring || false,
      recurrence: transaction.recurrence || 'none',
      label: transaction.label || '',
      paymentDate: transaction.paymentDate ? format(transaction.paymentDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    });
  };

  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow decimal points and numbers
    const value = e.target.value.replace(/[^0-9.]/g, '');
    // Ensure only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
      e.target.value = `${parts[0]}.${parts.slice(1).join('')}`;
    } else {
      e.target.value = value;
    }
  };

  const allCategories = Array.from(new Set([
    ...CATEGORIES.income.map(cat => ({ type: 'income', category: cat })),
    ...CATEGORIES.expense.map(cat => ({ type: 'expense', category: cat }))
  ]));

  const getDisplayAmount = (transaction: Transaction) => {
    if (transaction.originalCurrency && transaction.originalAmount) {
      return convertAmount(
        transaction.originalAmount,
        transaction.originalCurrency,
        currency.code
      );
    }
    return transaction.amount;
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter.type !== 'all' && transaction.type !== filter.type) return false;
    if (filter.category !== 'all' && transaction.category !== filter.category) return false;
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center mb-6">
        <h2 className="text-2xl font-bold">Income & Expense Tracking</h2>
        <InfoTooltip text="Record and categorize your income and expenses. Set up recurring transactions and track payment schedules to maintain accurate financial records." />
      </div>
      
      {/* Add New Transaction Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="text-blue-500" />
          <h3 className="text-lg font-semibold">Add New Transaction</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <select
            value={newTransaction.type}
            onChange={(e) => setNewTransaction({ 
              ...newTransaction, 
              type: e.target.value as 'income' | 'expense',
              category: '',
            })}
            className="px-4 py-2 border rounded-lg"
            required
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          
          <select
            value={newTransaction.category}
            onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
            className="px-4 py-2 border rounded-lg"
            required
          >
            <option value="">Select Category</option>
            {CATEGORIES[newTransaction.type].map(category => (
              <option key={`new-${category}`} value={category}>{category}</option>
            ))}
          </select>
          
          <input
            type="text"
            placeholder="Amount"
            value={newTransaction.amount || ''}
            onChange={(e) => {
              const value = e.target.value.replace(/[^\d.]/g, '');
              const parts = value.split('.');
              if (parts.length > 2) return;
              if (parts[1] && parts[1].length > 2) return;
              const numericValue = parseFloat(value);
              setNewTransaction({ ...newTransaction, amount: isNaN(value) ? 0 : value });
            }}
            className="px-4 py-2 border rounded-lg"
            required
          />
          
          <input
            type="date"
            value={newTransaction.date}
            onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
            className="px-4 py-2 border rounded-lg"
            required
          />
          
          <input
            type="text"
            placeholder="Description"
            value={newTransaction.description}
            onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
            className="px-4 py-2 border rounded-lg"
            required
          />

          <input
            type="text"
            placeholder="Label"
            value={newTransaction.label || ''}
            onChange={(e) => setNewTransaction({ ...newTransaction, label: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          />

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newTransaction.isRecurring}
                onChange={(e) => setNewTransaction({ 
                  ...newTransaction, 
                  isRecurring: e.target.checked,
                  recurrence: e.target.checked ? 'monthly' : 'none'
                })}
                className="rounded border-gray-300"
              />
              <span>Recurring</span>
            </label>

            {newTransaction.isRecurring && (
              <select
                value={newTransaction.recurrence}
                onChange={(e) => setNewTransaction({ 
                  ...newTransaction, 
                  recurrence: e.target.value as 'daily' | 'weekly' | '4weekly' | 'monthly'
                })}
                className="px-4 py-2 border rounded-lg flex-1"
              >
                {RECURRENCE_OPTIONS.slice(1).map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          {newTransaction.isRecurring && (
            <div className="flex items-center gap-2">
              <label className="whitespace-nowrap">Payment Date:</label>
              <input
                type="date"
                value={newTransaction.paymentDate}
                onChange={(e) => setNewTransaction({ ...newTransaction, paymentDate: e.target.value })}
                className="px-4 py-2 border rounded-lg flex-1"
              />
            </div>
          )}
          
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
          </button>
          {editingTransaction && (
            <button
              type="button"
              onClick={() => {
                setEditingTransaction(null);
                setNewTransaction({
                  type: 'expense',
                  category: '',
                  amount: 0,
                  date: format(new Date(), 'yyyy-MM-dd'),
                  description: '',
                  isRecurring: false,
                  recurrence: 'none',
                  label: '',
                  paymentDate: format(new Date(), 'yyyy-MM-dd'),
                });
              }}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="text-blue-500" />
          <h3 className="text-lg font-semibold">Filters</h3>
        </div>
        
        <div className="flex gap-4">
          <select
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value as 'all' | 'income' | 'expense' })}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          
          <select
            value={filter.category}
            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Categories</option>
            {allCategories.map(({ type, category }) => (
              <option key={`filter-${type}-${category}`} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="table-container">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Label</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Due</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTransactions.map(transaction => (
              <tr key={transaction.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {transaction.date ? format(new Date(transaction.date), 'MMM dd, yyyy') : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {transaction.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{transaction.category}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {transaction.description}
                    {transaction.isRecurring && (
                      <RefreshCw size={16} className="text-blue-500" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {transaction.label && (
                    <div className="flex items-center gap-2">
                      <Tag size={16} className="text-blue-500" />
                      {transaction.label}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                    {formatAmount(getDisplayAmount(transaction))}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {transaction.nextDueDate && (
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-blue-500" />
                      {format(new Date(transaction.nextDueDate), 'MMM dd, yyyy')}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {transaction.paymentDate && (
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-green-500" />
                      {format(new Date(transaction.paymentDate), 'MMM dd, yyyy')}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleEdit(transaction)}
                    className="text-blue-500 hover:text-blue-600 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteTransaction(transaction.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}