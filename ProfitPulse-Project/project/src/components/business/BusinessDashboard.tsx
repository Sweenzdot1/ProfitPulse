import React from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, Package, Users, AlertCircle 
} from 'lucide-react';
import { InfoTooltip } from '../InfoTooltip';
import { useCurrency, CurrencyProvider } from '../../contexts/CurrencyContext';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie
} from 'recharts';

interface BusinessDashboardProps {
  data: {
    transactions: any[];
    inventory: any[];
    accounts: any[];
  };
  isDemo?: boolean;
}

export function BusinessDashboard({ data, isDemo }: BusinessDashboardProps) {
  const { formatAmount, convertAmount, convertBusinessTransaction, currency } = useCurrency();

  // Convert all transactions to current currency
  const convertedTransactions = data.transactions.map(convertBusinessTransaction);

  if (isDemo) {
    // Calculate totals from demo data
    const totalRevenue = convertedTransactions
      .filter(t => t.type === 'sale')
      .reduce((sum, t) => sum + t.totalAmount, 0);

    const totalExpenses = convertedTransactions
      .filter(t => t.type === 'refund')
      .reduce((sum, t) => sum + t.totalAmount, 0) +
      data.inventory.reduce((sum, item) => sum + (convertAmount(item.cost, 'USD', currency.code) * item.quantity), 0);

    const netProfit = totalRevenue - totalExpenses;

    const inventoryValue = data.inventory
      .reduce((sum, item) => sum + (convertAmount(item.price, 'USD', currency.code) * item.quantity), 0);

    const lowStockItems = data.inventory
      .filter(item => item.quantity <= (item.minStockLevel || 0))
      .length;

    // Group transactions by month for the chart
    const salesData = data.transactions.reduce((acc: any[], transaction) => {
      const date = new Date(transaction.timestamp);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const existingMonth = acc.find(d => d.date === monthYear);
      if (existingMonth) {
        if (transaction.type === 'sale') {
          existingMonth.sales += transaction.totalAmount;
        } else if (transaction.type === 'refund') {
          existingMonth.expenses += transaction.totalAmount;
        }
      } else {
        acc.push({
          date: monthYear,
          sales: transaction.type === 'sale' ? transaction.totalAmount : 0,
          expenses: transaction.type === 'refund' ? transaction.totalAmount : 0
        });
      }
      return acc;
    }, []).sort((a, b) => a.date.localeCompare(b.date));

    // Get top products by sales
    const topProducts = data.inventory
      .sort((a, b) => (b.price * b.quantity) - (a.price * a.quantity))
      .slice(0, 3)
      .map(product => ({
        name: product.name,
        sales: product.price * product.quantity
      }));

    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold">Business Dashboard</h1>
            <span className="ml-3 px-2 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">DEMO</span>
            <InfoTooltip text="Get a comprehensive overview of your business performance, including revenue, expenses, profit margins, and inventory metrics. Monitor key performance indicators and track business growth." />
          </div>
          <button
            onClick={() => window.location.href = 'https://buy.stripe.com/aEUbIRfcP2oh27C9AA'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upgrade to Pro - £19.99
          </button>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Total Revenue</h3>
              <DollarSign className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600">{formatAmount(totalRevenue)}</p>
            <p className="text-sm text-gray-500">
              {salesData.length > 1 && `${((salesData[salesData.length - 1].sales / salesData[salesData.length - 2].sales - 1) * 100).toFixed(1)}% from last month`}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Total Expenses</h3>
              <TrendingDown className="text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-600">{formatAmount(totalExpenses)}</p>
            <p className="text-sm text-gray-500">
              {salesData.length > 1 && `${((salesData[salesData.length - 1].expenses / salesData[salesData.length - 2].expenses - 1) * 100).toFixed(1)}% from last month`}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Net Profit</h3>
              <TrendingUp className="text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{formatAmount(netProfit)}</p>
            <p className="text-sm text-gray-500">
              {salesData.length > 1 && `${((netProfit / (totalRevenue - totalExpenses) - 1) * 100).toFixed(1)}% from last month`}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Inventory Value</h3>
              <Package className="text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-purple-600">{formatAmount(inventoryValue)}</p>
            <p className="text-sm text-gray-500">{lowStockItems} items low in stock</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue vs Expenses</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatAmount(Number(value))} />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#10B981" name="Revenue" />
                <Line type="monotone" dataKey="expenses" stroke="#EF4444" name="Expenses" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Top Products</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatAmount(Number(value))} />
                <Bar dataKey="sales" fill="#6366F1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="text-yellow-500" />
            <h3 className="text-lg font-semibold">Recent Alerts</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle size={16} />
              <p>{data.accounts.filter(a => a.status === 'overdue').length} invoices are overdue</p>
            </div>
            <div className="flex items-center gap-2 text-yellow-600">
              <AlertCircle size={16} />
              <p>{lowStockItems} products are low in stock</p>
            </div>
            <div className="flex items-center gap-2 text-blue-600">
              <Users size={16} />
              <p>{data.transactions.filter(t => t.status === 'pending').length} transactions require attention</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate total revenue from transactions
  const totalRevenue = data.transactions
    .filter(t => t.type === 'sale')
    .reduce((sum, t) => sum + t.totalAmount, 0);

  // Calculate total expenses
  const totalExpenses = data.transactions
    .filter(t => t.type === 'refund')
    .reduce((sum, t) => sum + t.totalAmount, 0) +
    data.inventory.reduce((sum, item) => sum + (item.cost * item.quantity), 0);

  // Calculate net profit
  const netProfit = totalRevenue - totalExpenses;

  // Calculate inventory value
  const inventoryValue = data.inventory
    .reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Calculate low stock items
  const lowStockItems = data.inventory
    .filter(item => item.quantity <= (item.minStockLevel || 0))
    .length;

  // Group transactions by month for the chart
  const salesData = data.transactions.reduce((acc: any[], transaction) => {
    const date = new Date(transaction.timestamp);
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    const existingMonth = acc.find(d => d.date === monthYear);
    if (existingMonth) {
      if (transaction.type === 'sale') {
        existingMonth.sales += transaction.totalAmount;
      } else if (transaction.type === 'refund') {
        existingMonth.expenses += transaction.totalAmount;
      }
    } else {
      acc.push({
        date: monthYear,
        sales: transaction.type === 'sale' ? transaction.totalAmount : 0,
        expenses: transaction.type === 'refund' ? transaction.totalAmount : 0
      });
    }
    return acc;
  }, []).sort((a, b) => a.date.localeCompare(b.date));

  // Get top products by sales
  const topProducts = data.inventory
    .sort((a, b) => (b.price * b.quantity) - (a.price * a.quantity))
    .slice(0, 3)
    .map(product => ({
      name: product.name,
      sales: product.price * product.quantity
    }));


  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center mb-8">
        <h1 className="text-3xl font-bold">Business Dashboard</h1>
        <InfoTooltip text="Get a comprehensive overview of your business performance, including revenue, expenses, profit margins, and inventory metrics. Monitor key performance indicators and track business growth." />
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Total Revenue</h3>
            <DollarSign className="text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">{formatAmount(totalRevenue)}</p>
          <p className="text-sm text-gray-500">
            {salesData.length > 1 && `${((salesData[salesData.length - 1].sales / salesData[salesData.length - 2].sales - 1) * 100).toFixed(1)}% from last month`}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Total Expenses</h3>
            <TrendingDown className="text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">{formatAmount(totalExpenses)}</p>
          <p className="text-sm text-gray-500">
            {salesData.length > 1 && `${((salesData[salesData.length - 1].expenses / salesData[salesData.length - 2].expenses - 1) * 100).toFixed(1)}% from last month`}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Net Profit</h3>
            <TrendingUp className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{formatAmount(netProfit)}</p>
          <p className="text-sm text-gray-500">
            {salesData.length > 1 && `${((netProfit / (totalRevenue - totalExpenses) - 1) * 100).toFixed(1)}% from last month`}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Inventory Value</h3>
            <Package className="text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-600">{formatAmount(inventoryValue)}</p>
          <p className="text-sm text-gray-500">{lowStockItems} items low in stock</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue vs Expenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => formatAmount(Number(value))} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="#10B981" 
                name="Revenue"
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#EF4444" 
                name="Expenses"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Top Products</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatAmount(Number(value))} />
              <Bar dataKey="sales" fill="#6366F1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alerts & Notifications */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="text-yellow-500" />
          <h3 className="text-lg font-semibold">Recent Alerts</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle size={16} />
            <p>{data.accounts.filter(a => a.status === 'overdue').length} invoices are overdue</p>
          </div>
          <div className="flex items-center gap-2 text-yellow-600">
            <AlertCircle size={16} />
            <p>{lowStockItems} products are low in stock</p>
          </div>
          <div className="flex items-center gap-2 text-blue-600">
            <Users size={16} />
            <p>{data.transactions.filter(t => t.status === 'pending').length} transactions require attention</p>
          </div>
        </div>
      </div>
    </div>
  );
}