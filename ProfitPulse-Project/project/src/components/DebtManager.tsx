import React, { useState, useEffect } from 'react';
import { CreditCard, Trash2, Save } from 'lucide-react';
import { Debt, AmortizationSchedule } from '../types';
import { InfoTooltip } from './InfoTooltip';
import { addMonths, format } from 'date-fns';
import { useCurrency } from '../contexts/CurrencyContext';

interface DebtManagerProps {
  debts: Debt[];
  onAddDebt: (debt: Omit<Debt, 'id'>) => void;
  onUpdateDebt: (id: string, debt: Partial<Debt>) => void;
  onDeleteDebt: (id: string) => void;
}

export function DebtManager({ 
  debts, 
  onAddDebt, 
  onUpdateDebt, 
  onDeleteDebt,
}: DebtManagerProps) {
  const { formatAmount } = useCurrency();
  const [editingDebt, setEditingDebt] = useState<string | null>(null);
  const [newDebt, setNewDebt] = useState({
    name: '',
    balance: 0,
    interestRate: 0,
    minimumPayment: 0,
    monthlyPayment: 0,
  });

  const calculateAmortization = (debt: Debt): AmortizationSchedule[] => {
    const schedule: AmortizationSchedule[] = [];
    let balance = debt.balance;
    let currentDate = new Date();
    
    while (balance > 0) {
      const interest = (balance * (debt.interestRate / 100)) / 12;
      const principal = Math.min(debt.monthlyPayment - interest, balance);
      balance -= principal;
      
      schedule.push({
        payment: debt.monthlyPayment,
        principal,
        interest,
        remainingBalance: balance,
        date: currentDate,
      });
      
      currentDate = addMonths(currentDate, 1);
      
      if (schedule.length > 360) break; // Prevent infinite loops
    }
    
    return schedule;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDebt) {
      onUpdateDebt(editingDebt, newDebt);
      setEditingDebt(null);
    } else {
      onAddDebt(newDebt);
    }
    setNewDebt({
      name: '',
      balance: 0,
      interestRate: 0,
      minimumPayment: 0,
      monthlyPayment: 0,
    });
  };

  const handleEdit = (debt: Debt) => {
    setEditingDebt(debt.id);
    setNewDebt({
      name: debt.name,
      balance: debt.balance,
      interestRate: debt.interestRate,
      minimumPayment: debt.minimumPayment,
      monthlyPayment: debt.monthlyPayment,
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center mb-6">
        <h2 className="text-2xl font-bold">Debt & Loan Management</h2>
        <InfoTooltip text="Manage your loans, credit cards, and other debts. Track interest rates, payment schedules, and see amortization schedules to plan your debt repayment strategy." />
      </div>
      
      {/* Add New Debt Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Add New Debt</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label htmlFor="debtName" className="block text-sm font-medium text-gray-700">
              Debt Name
            </label>
            <input
              id="debtName"
              type="text"
              placeholder="e.g., Car Loan"
              value={newDebt.name}
              onChange={(e) => setNewDebt({ ...newDebt, name: e.target.value })}
              className="px-4 py-2 border rounded-lg w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="balance" className="block text-sm font-medium text-gray-700">
              Current Balance
            </label>
            <input
              id="balance"
              type="text"
              placeholder="Enter amount"
              value={newDebt.balance || ''}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d.]/g, '');
                const parts = value.split('.');
                if (parts.length > 2) return;
                if (parts[1] && parts[1].length > 2) return;
                const numericValue = parseFloat(value);
                setNewDebt({ ...newDebt, balance: isNaN(value) ? 0 : value });
              }}
              className="px-4 py-2 border rounded-lg w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700">
              Interest Rate (%)
            </label>
            <input
              id="interestRate"
              type="text"
              placeholder="Enter rate"
              value={newDebt.interestRate || ''}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d.]/g, '');
                const parts = value.split('.');
                if (parts.length > 2) return;
                if (parts[1] && parts[1].length > 2) return;
                const numericValue = parseFloat(value);
                setNewDebt({ ...newDebt, interestRate: isNaN(value) ? 0 : value });
              }}
              className="px-4 py-2 border rounded-lg w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="minimumPayment" className="block text-sm font-medium text-gray-700">
              Minimum Payment
            </label>
            <input
              id="minimumPayment"
              type="text"
              placeholder="Enter amount"
              value={newDebt.minimumPayment || ''}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d.]/g, '');
                const parts = value.split('.');
                if (parts.length > 2) return;
                if (parts[1] && parts[1].length > 2) return;
                const numericValue = parseFloat(value);
                setNewDebt({ ...newDebt, minimumPayment: isNaN(value) ? 0 : value });
              }}
              className="px-4 py-2 border rounded-lg w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="monthlyPayment" className="block text-sm font-medium text-gray-700">
              Planned Monthly Payment
            </label>
            <input
              id="monthlyPayment"
              type="text"
              placeholder="Enter amount"
              value={newDebt.monthlyPayment || ''}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d.]/g, '');
                const parts = value.split('.');
                if (parts.length > 2) return;
                if (parts[1] && parts[1].length > 2) return;
                const numericValue = parseFloat(value);
                setNewDebt({ ...newDebt, monthlyPayment: isNaN(value) ? 0 : value });
              }}
              className="px-4 py-2 border rounded-lg w-full"
              required
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 w-full flex items-center justify-center gap-2"
            >
              <Save size={20} /> {editingDebt ? 'Update Debt' : 'Add Debt'}
            </button>
            {editingDebt && (
              <button
                type="button"
                onClick={() => {
                  setEditingDebt(null);
                  setNewDebt({
                    name: '',
                    balance: 0,
                    interestRate: 0,
                    minimumPayment: 0,
                    monthlyPayment: 0,
                  });
                }}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 w-full flex items-center justify-center gap-2"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Debt List */}
      <div className="space-y-6">
        {debts.map(debt => {
          const schedule = calculateAmortization(debt);
          const monthsToPayoff = schedule.length;
          const totalInterest = schedule.reduce((sum, payment) => sum + payment.interest, 0);
          
          return (
            <div key={debt.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="text-blue-500" />
                  <h3 className="text-lg font-semibold">{debt.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(debt)}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteDebt(debt.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Current Balance</p>
                  <p className="text-xl font-semibold">{formatAmount(debt.balance)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Annual Interest Rate</p>
                  <p className="text-xl font-semibold">{debt.interestRate}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Monthly Payment</p>
                  <p className="text-xl font-semibold">{formatAmount(debt.monthlyPayment)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Time to Payoff</p>
                  <p className="text-xl font-semibold">{monthsToPayoff} months</p>
                </div>
              </div>

              {/* Amortization Schedule */}
              <div>
                <h4 className="text-md font-semibold mb-3">Payment Schedule</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="pb-2">Payment Date</th>
                        <th className="pb-2">Payment Amount</th>
                        <th className="pb-2">Principal</th>
                        <th className="pb-2">Interest</th>
                        <th className="pb-2">Remaining Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedule.slice(0, 12).map((payment, index) => (
                        <tr key={index} className="border-b last:border-0">
                          <td className="py-2">{format(payment.date, 'MMM yyyy')}</td>
                          <td className="py-2">{formatAmount(payment.payment)}</td>
                          <td className="py-2">{formatAmount(payment.principal)}</td>
                          <td className="py-2">{formatAmount(payment.interest)}</td>
                          <td className="py-2">{formatAmount(payment.remainingBalance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}