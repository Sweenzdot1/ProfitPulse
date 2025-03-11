import React, { useState } from 'react';
import { 
  PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import {
  Wallet, TrendingUp, TrendingDown, CreditCard, AlertCircle, Calendar,
  Clock
} from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';
import { Transaction, Debt, Budget } from '../types';
import { useCurrency } from '../contexts/CurrencyContext';
import { differenceInDays } from 'date-fns';

interface DashboardProps {
  transactions: Transaction[];
  debts: Debt[];
  budgets: Budget[];
}

export function Dashboard({ transactions, debts, budgets }: DashboardProps) {
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const { formatAmount } = useCurrency();
  
  const totalIncome = transactions
    .filter(t => t.type === 'income' && t.amount)
    .reduce((sum, t) => sum + Number(t.amount), 0);
    
  const totalExpenses = transactions
    .filter(t => t.type === 'expense' && t.amount)
    .reduce((sum, t) => sum + Number(t.amount), 0);
    
  // Calculate balance including all transactions
  const balance = transactions.reduce((sum, t) => {
    const amount = Number(t.amount);
    return t.type === 'income' ? sum + amount : sum - amount;
  }, 0);
  
  const totalDebt = debts
    .filter(debt => debt.balance)
    .reduce((sum, debt) => sum + Number(debt.balance), 0);

  // Calculate total monthly debt payments
  const totalMonthlyDebtPayments = debts
    .reduce((sum, debt) => sum + Number(debt.monthlyPayment), 0);
    
  // Get upcoming payments due within 5 days
  const upcomingPayments = transactions
    .filter(t => {
      if (!t.nextDueDate) return false;
      const daysUntilDue = differenceInDays(new Date(t.nextDueDate), new Date());
      return daysUntilDue >= 0 && daysUntilDue <= 5;
    })
    .sort((a, b) => new Date(a.nextDueDate!).getTime() - new Date(b.nextDueDate!).getTime());

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center mb-8">
        <h1 className="text-3xl font-bold">Financial Dashboard</h1>
        <InfoTooltip text="Track your personal finances, including income, expenses, savings, and financial goals. Monitor your spending patterns and budget adherence in real-time." />
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Total Balance</h3>
            <Wallet className="text-blue-500" />
          </div>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatAmount(balance)}
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Total Debt</h3>
            <CreditCard className="text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-yellow-600">
            {formatAmount(totalDebt)}
          </p>
          <p className="text-sm text-gray-500">
            Monthly Payments: {formatAmount(totalMonthlyDebtPayments)}
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Income</h3>
            <TrendingUp className="text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">
            {formatAmount(totalIncome)}
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Expenses</h3>
            <TrendingDown className="text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">
            {formatAmount(totalExpenses)}
          </p>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="flex gap-4 mb-8">
        {(['weekly', 'monthly', 'yearly'] as const).map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-4 py-2 rounded-lg ${
              timeframe === tf 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tf.charAt(0).toUpperCase() + tf.slice(1)}
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={transactions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => formatAmount(Number(value))} />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke="#10B981" name="Income" />
              <Line type="monotone" dataKey="amount" stroke="#EF4444" name="Expenses" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Expense Categories</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={budgets}
                dataKey="spent"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label={({ name, value }) => `${name}: ${formatAmount(value)}`}
              />
              <Tooltip formatter={(value) => formatAmount(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alerts & Reminders */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="text-yellow-500" />
          <h3 className="text-lg font-semibold">Alerts & Reminders</h3>
        </div>
        <div className="space-y-3">
          {/* Upcoming Payments */}
          {upcomingPayments.map(payment => {
            const daysUntilDue = differenceInDays(new Date(payment.nextDueDate!), new Date());
            return (
              <div key={payment.id} className="flex items-center gap-2 text-yellow-600 bg-yellow-50 p-3 rounded-lg">
                <Clock size={16} />
                <div>
                  <p className="font-medium">
                    {payment.description} - {formatAmount(payment.amount)}
                  </p>
                  <p className="text-sm">
                    Due {daysUntilDue === 0 ? 'today' : `in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}`}
                  </p>
                </div>
              </div>
            );
          })}
          
          {/* Budget Alerts */}
          {budgets.map(budget => (
            budget.spent > budget.limit && (
              <div key={budget.category} className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle size={16} />
                <p>You've exceeded your {budget.category} budget of {formatAmount(budget.limit)}!</p>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}