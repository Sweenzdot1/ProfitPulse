import React, { useState } from 'react';
import { nanoid } from 'nanoid';
import { 
  Plus, Filter, Trash2, Calendar, AlertCircle, ArrowUpRight, ArrowDownRight, RefreshCw
} from 'lucide-react';
import { InfoTooltip } from '../InfoTooltip';
import { AccountsEntry } from '../../types';
import { format, isPast, addDays, addWeeks, addMonths } from 'date-fns';
import { useCurrency, CurrencyProvider } from '../../contexts/CurrencyContext';

const RECURRENCE_OPTIONS = [
  { value: 'none', label: 'One-time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

interface AccountsManagerProps {
  accounts: AccountsEntry[];
  onUpdateAccounts: (accounts: AccountsEntry[]) => void;
  isDemo?: boolean;
}

export function AccountsManager({ accounts, onUpdateAccounts, isDemo }: AccountsManagerProps) {
  const { formatAmount, convertAmount, currency } = useCurrency();

  const convertAccount = (account: AccountsEntry) => ({
    ...account,
    amount: convertAmount(account.amount, 'USD', currency.code),
  });

  // Convert all accounts to current currency
  const convertedAccounts = accounts.map(convertAccount);

  if (isDemo) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-bold">Accounts Manager</h2>
            <span className="ml-3 px-2 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">DEMO</span>
            <InfoTooltip text="Manage your business expenses including overhead costs, utilities (gas, electric, water), staff payroll, and other operational expenses. Track payables and receivables to maintain healthy cash flow and ensure timely payments." />
          </div>
          <button
            onClick={() => window.location.href = 'https://buy.stripe.com/aEUbIRfcP2oh27C9AA'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upgrade to Pro - £19.99
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-lg">
          <div className="table-container">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {convertedAccounts.map(entry => (
                <tr key={entry.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      entry.type === 'payable'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {entry.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">{entry.description}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{entry.contactInfo.name}</p>
                      <p className="text-sm text-gray-500">{entry.contactInfo.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {formatAmount(entry.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar size={16} className="text-gray-400 mr-2" />
                      {format(entry.dueDate, 'MMM dd, yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      entry.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : entry.status === 'overdue'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {entry.status}
                    </span>
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

  const [entries, setEntries] = useState<AccountsEntry[]>(accounts);
  const [newEntry, setNewEntry] = useState<Partial<AccountsEntry>>({
    type: 'payable',
    status: 'pending',
    recurrence: 'none',
  });
  const [filter, setFilter] = useState({
    type: 'all' as 'all' | 'payable' | 'receivable',
    status: 'all' as 'all' | 'pending' | 'paid' | 'overdue',
    recurrence: 'all' as 'all' | 'none' | 'recurring',
  });

  const calculateNextDueDate = (currentDate: Date, recurrence: string): Date => {
    switch (recurrence) {
      case 'daily':
        return addDays(currentDate, 1);
      case 'weekly':
        return addWeeks(currentDate, 1);
      case 'monthly':
        return addMonths(currentDate, 1);
      default:
        return currentDate;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.amount || !newEntry.description || !newEntry.dueDate) return;

    const dueDate = new Date(newEntry.dueDate);
    const nextDueDate = newEntry.recurrence !== 'none' ? 
      calculateNextDueDate(dueDate, newEntry.recurrence!) : 
      undefined;

    const entry: AccountsEntry = {
      id: nanoid(),
      type: newEntry.type as 'payable' | 'receivable',
      amount: newEntry.amount,
      dueDate,
      nextDueDate,
      recurrence: newEntry.recurrence as 'none' | 'daily' | 'weekly' | 'monthly',
      description: newEntry.description,
      status: newEntry.status as 'pending' | 'paid' | 'overdue',
      relatedTransactionId: newEntry.relatedTransactionId,
      contactInfo: {
        name: newEntry.contactInfo?.name || '',
        email: newEntry.contactInfo?.email || '',
        phone: newEntry.contactInfo?.phone,
      },
    };

    const updatedEntries = [...entries, entry];
    setEntries(updatedEntries);
    onUpdateAccounts(updatedEntries);
    setNewEntry({
      type: 'payable',
      status: 'pending',
      recurrence: 'none',
    });
  };

  const handleDeleteEntry = (id: string) => {
    const updatedEntries = entries.filter(e => e.id !== id);
    setEntries(updatedEntries);
    onUpdateAccounts(updatedEntries);
  };

  const filteredEntries = entries.filter(entry => {
    if (filter.type !== 'all' && entry.type !== filter.type) return false;
    if (filter.status !== 'all' && entry.status !== filter.status) return false;
    if (filter.recurrence !== 'all' && entry.recurrence === (filter.recurrence === 'recurring' ? 'none' : 'none')) return false;
    return true;
  });

  // Calculate totals
  const totalPayable = entries
    .filter(e => e.type === 'payable' && e.status !== 'paid')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalReceivable = entries
    .filter(e => e.type === 'receivable' && e.status !== 'paid')
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center mb-6">
        <h2 className="text-2xl font-bold">Accounts Manager</h2>
        <InfoTooltip text="Manage your business expenses including overhead costs, utilities (gas, electric, water), staff payroll, and other operational expenses. Track payables and receivables to maintain healthy cash flow and ensure timely payments." />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Accounts Payable</h3>
            <ArrowUpRight className="text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">{formatAmount(totalPayable)}</p>
          <p className="text-sm text-gray-500">Outstanding payments</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Accounts Receivable</h3>
            <ArrowDownRight className="text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">{formatAmount(totalReceivable)}</p>
          <p className="text-sm text-gray-500">Expected income</p>
        </div>
      </div>
      
      {/* Add New Entry Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="text-blue-500" />
          <h3 className="text-lg font-semibold">New Entry</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <select
            value={newEntry.type}
            onChange={(e) => setNewEntry({ 
              ...newEntry, 
              type: e.target.value as 'payable' | 'receivable'
            })}
            className="px-4 py-2 border rounded-lg"
            required
          >
            <option value="payable">Payable</option>
            <option value="receivable">Receivable</option>
          </select>

          <input
            type="text"
            placeholder="Amount"
            value={newEntry.amount || ''}
            onChange={(e) => {
              const value = e.target.value.replace(/[^\d.]/g, '');
              const parts = value.split('.');
              if (parts.length > 2) return;
              if (parts[1] && parts[1].length > 2) return;
              const numericValue = parseFloat(value);
              setNewEntry({ ...newEntry, amount: isNaN(value) ? 0 : value });
            }}
            className="px-4 py-2 border rounded-lg"
            required
          />

          <input
            type="date"
            value={newEntry.dueDate ? format(new Date(newEntry.dueDate), 'yyyy-MM-dd') : ''}
            onChange={(e) => setNewEntry({ ...newEntry, dueDate: new Date(e.target.value) })}
            className="px-4 py-2 border rounded-lg"
            required
          />

          <input
            type="text"
            placeholder="Description"
            value={newEntry.description || ''}
            onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
            className="px-4 py-2 border rounded-lg"
            required
          />

          <input
            type="text"
            placeholder="Contact Name"
            value={newEntry.contactInfo?.name || ''}
            onChange={(e) => setNewEntry({ 
              ...newEntry, 
              contactInfo: {
                ...newEntry.contactInfo,
                name: e.target.value
              }
            })}
            className="px-4 py-2 border rounded-lg"
            required
          />

          <input
            type="email"
            placeholder="Contact Email"
            value={newEntry.contactInfo?.email || ''}
            onChange={(e) => setNewEntry({ 
              ...newEntry, 
              contactInfo: {
                ...newEntry.contactInfo,
                email: e.target.value
              }
            })}
            className="px-4 py-2 border rounded-lg"
            required
          />

          <input
            type="tel"
            placeholder="Contact Phone (Optional)"
            value={newEntry.contactInfo?.phone || ''}
            onChange={(e) => setNewEntry({ 
              ...newEntry, 
              contactInfo: {
                ...newEntry.contactInfo,
                phone: e.target.value
              }
            })}
            className="px-4 py-2 border rounded-lg"
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Recurrence
            </label>
            <select
              value={newEntry.recurrence}
              onChange={(e) => setNewEntry({ 
                ...newEntry, 
                recurrence: e.target.value as 'none' | 'daily' | 'weekly' | 'monthly'
              })}
              className="px-4 py-2 border rounded-lg w-full"
            >
              {RECURRENCE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Add Entry
          </button>
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
            onChange={(e) => setFilter({ 
              ...filter, 
              type: e.target.value as 'all' | 'payable' | 'receivable'
            })}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Types</option>
            <option value="payable">Payable</option>
            <option value="receivable">Receivable</option>
          </select>
          
          <select
            value={filter.status}
            onChange={(e) => setFilter({ 
              ...filter, 
              status: e.target.value as 'all' | 'pending' | 'paid' | 'overdue'
            })}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
          
          <select
            value={filter.recurrence}
            onChange={(e) => setFilter({ 
              ...filter, 
              recurrence: e.target.value as 'all' | 'none' | 'recurring'
            })}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Types</option>
            <option value="none">One-time</option>
            <option value="recurring">Recurring</option>
          </select>
        </div>
      </div>

      {/* Entries List */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="table-container">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recurrence</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEntries.map(entry => (
              <tr key={entry.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    entry.type === 'payable'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {entry.type}
                  </span>
                </td>
                <td className="px-6 py-4">{entry.description}</td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium">{entry.contactInfo.name}</p>
                    <p className="text-sm text-gray-500">{entry.contactInfo.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  {formatAmount(entry.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {entry.recurrence !== 'none' && (
                    <div className="flex items-center gap-2">
                      <RefreshCw size={16} className="text-blue-500" />
                      <span className="capitalize">
                        {entry.recurrence}
                      </span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Calendar size={16} className="text-gray-400 mr-2" />
                    {format(entry.dueDate, 'MMM dd, yyyy')}
                    {entry.nextDueDate && (
                      <span className="ml-2 text-sm text-gray-500">
                        (Next: {format(entry.nextDueDate, 'MMM dd')})
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    entry.status === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : entry.status === 'overdue'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {entry.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
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