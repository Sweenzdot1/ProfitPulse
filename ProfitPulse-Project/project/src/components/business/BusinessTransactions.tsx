import React, { useState } from 'react';
import { nanoid } from 'nanoid';
import { 
  Plus, Filter, Trash2, FileText, Package, DollarSign, User 
} from 'lucide-react';
import { InfoTooltip } from '../InfoTooltip';
import { BusinessTransaction, BusinessTransactionItem } from '../../types';
import { format } from 'date-fns';
import { useCurrency, CurrencyProvider } from '../../contexts/CurrencyContext';

interface BusinessTransactionsProps {
  transactions: BusinessTransaction[];
  inventory: Product[];
  onUpdateTransactions: (transactions: BusinessTransaction[]) => void;
  onUpdateInventory: (inventory: Product[]) => void;
  isDemo?: boolean;
}

export function BusinessTransactions({ 
  transactions, 
  inventory,
  onUpdateTransactions,
  onUpdateInventory,
  isDemo
}: BusinessTransactionsProps) {
  const { formatAmount, convertAmount, convertBusinessTransaction } = useCurrency();

  // Convert all transactions to current currency
  const convertedTransactions = transactions.map(convertBusinessTransaction);

  if (isDemo) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-bold">Business Transactions</h2>
            <span className="ml-3 px-2 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">DEMO</span>
            <InfoTooltip text="Process sales, refunds, and exchanges while automatically updating inventory levels. Track profit margins and manage customer information for each transaction." />
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map(transaction => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText size={16} className="text-gray-400 mr-2" />
                      {transaction.invoiceNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(transaction.timestamp, 'MMM dd, yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      transaction.type === 'sale' 
                        ? 'bg-green-100 text-green-800'
                        : transaction.type === 'refund'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {transaction.customerInfo?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <DollarSign size={16} className="text-gray-400 mr-1" />
                      {formatAmount(transaction.totalAmount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      transaction.paymentStatus === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : transaction.paymentStatus === 'partial'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.paymentStatus}
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

  const [newTransaction, setNewTransaction] = useState<Partial<BusinessTransaction>>({
    type: 'sale',
    items: [],
    status: 'pending',
    paymentStatus: 'unpaid',
  });
  const [newItem, setNewItem] = useState<Partial<BusinessTransactionItem>>({
    quantity: 1,
    unitPrice: 0,
  });

  const handleAddItem = () => {
    if (!newItem.sku || !newItem.quantity) return;
    
    const product = inventory.find(p => p.sku === newItem.sku);
    if (!product) {
      alert('Product not found in inventory');
      return;
    }

    if (newTransaction.type === 'sale' && product.quantity < newItem.quantity!) {
      alert(`Insufficient stock. Only ${product.quantity} units available.`);
      return;
    }

    const item: BusinessTransactionItem = {
      id: nanoid(),
      description: product.name,
      quantity: newItem.quantity!,
      unitPrice: product.price,
      totalPrice: newItem.quantity! * product.price,
      sku: product.sku,
      category: product.category,
      cost: product.cost,
      taxRate: newItem.taxRate,
      discountAmount: newItem.discountAmount,
    };

    setNewTransaction(prev => ({
      ...prev,
      items: [...(prev.items || []), item],
    }));

    setNewItem({
      quantity: 1,
      unitPrice: 0,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransaction.items?.length) return;
    
    // Update inventory quantities
    const updatedInventory = [...inventory];
    newTransaction.items.forEach(item => {
      const productIndex = updatedInventory.findIndex(p => p.sku === item.sku);
      if (productIndex !== -1) {
        const quantityChange = newTransaction.type === 'sale' ? -item.quantity : item.quantity;
        updatedInventory[productIndex] = {
          ...updatedInventory[productIndex],
          quantity: updatedInventory[productIndex].quantity + quantityChange
        };
      }
    });
    
    // Calculate profit margins for sales
    const profitMargin = newTransaction.type === 'sale' ?
      newTransaction.items.reduce((total, item) => {
        const product = inventory.find(p => p.sku === item.sku);
        if (product) {
          return total + ((item.unitPrice - product.cost) * item.quantity);
        }
        return total;
      }, 0) : 0;

    const transaction: BusinessTransaction = {
      id: nanoid(),
      invoiceNumber: `INV-${format(new Date(), 'yyyyMMdd')}-${nanoid(4)}`,
      timestamp: new Date(),
      type: newTransaction.type as 'sale' | 'refund' | 'exchange',
      items: newTransaction.items,
      totalAmount: newTransaction.items.reduce((sum, item) => sum + item.totalPrice, 0),
      employeeId: newTransaction.employeeId || 'default',
      notes: newTransaction.notes,
      status: newTransaction.status as 'pending' | 'completed' | 'cancelled',
      paymentStatus: newTransaction.paymentStatus as 'paid' | 'unpaid' | 'partial',
      paymentMethod: newTransaction.paymentMethod,
      profitMargin,
      customerInfo: newTransaction.customerInfo,
    };

    onUpdateTransactions([...transactions, transaction]);
    setNewTransaction({
      type: 'sale',
      items: [],
      status: 'pending',
      paymentStatus: 'unpaid',
    });
    
    onUpdateInventory(updatedInventory);
  };

  const handleDeleteTransaction = (id: string) => {
    onUpdateTransactions(transactions.filter(t => t.id !== id));
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
        <h2 className="text-2xl font-bold">Business Transactions</h2>
        <InfoTooltip text="Process sales, refunds, and exchanges while automatically updating inventory levels. Track profit margins and manage customer information for each transaction." />
      </div>
      
      {/* Add New Transaction Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="text-blue-500" />
          <h3 className="text-lg font-semibold">New Transaction</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <select
            value={newTransaction.type}
            onChange={(e) => setNewTransaction({ 
              ...newTransaction, 
              type: e.target.value as 'sale' | 'refund' | 'exchange'
            })}
            className="px-4 py-2 border rounded-lg"
            required
          >
            <option value="sale">Sale</option>
            <option value="refund">Refund</option>
            <option value="exchange">Exchange</option>
          </select>

          <input
            type="text"
            placeholder="Employee ID"
            value={newTransaction.employeeId || ''}
            onChange={(e) => setNewTransaction({ 
              ...newTransaction, 
              employeeId: e.target.value 
            })}
            className="px-4 py-2 border rounded-lg"
            required
          />

          <select
            value={newTransaction.paymentMethod || ''}
            onChange={(e) => setNewTransaction({ 
              ...newTransaction, 
              paymentMethod: e.target.value 
            })}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">Select Payment Method</option>
            <option value="cash">Cash</option>
            <option value="credit">Credit Card</option>
            <option value="debit">Debit Card</option>
            <option value="transfer">Bank Transfer</option>
          </select>
        </div>

        {/* Customer Information */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="text-blue-500" />
            <h4 className="font-semibold">Customer Information</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Customer Name"
              value={newTransaction.customerInfo?.name || ''}
              onChange={(e) => setNewTransaction({ 
                ...newTransaction, 
                customerInfo: {
                  ...newTransaction.customerInfo,
                  name: e.target.value
                }
              })}
              className="px-4 py-2 border rounded-lg"
            />
            <input
              type="email"
              placeholder="Customer Email"
              value={newTransaction.customerInfo?.email || ''}
              onChange={(e) => setNewTransaction({ 
                ...newTransaction, 
                customerInfo: {
                  ...newTransaction.customerInfo,
                  email: e.target.value
                }
              })}
              className="px-4 py-2 border rounded-lg"
            />
            <input
              type="tel"
              placeholder="Customer Phone"
              value={newTransaction.customerInfo?.phone || ''}
              onChange={(e) => setNewTransaction({ 
                ...newTransaction, 
                customerInfo: {
                  ...newTransaction.customerInfo,
                  phone: e.target.value
                }
              })}
              className="px-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        {/* Add Items */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="text-blue-500" />
            <h4 className="font-semibold">Add Items</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label htmlFor="itemSku" className="block text-sm font-medium text-gray-700 mb-1">
                Select Product
              </label>
              <select
                id="itemSku"
                value={newItem.sku || ''}
                onChange={(e) => {
                  const product = inventory.find(p => p.sku === e.target.value);
                  setNewItem({ 
                    ...newItem, 
                    sku: e.target.value,
                    unitPrice: product?.price || 0
                  });
                }}
                className="px-4 py-2 border rounded-lg w-full"
              >
                <option value="">Select a product</option>
                {inventory.map(product => (
                  <option key={product.sku} value={product.sku}>
                    {product.name} ({product.quantity} in stock)
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                id="quantity"
                type="number"
                placeholder="Enter quantity"
                value={newItem.quantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setNewItem({ ...newItem, quantity: value });
                }}
                onInput={handleNumberInput}
                className="px-4 py-2 border rounded-lg w-full"
                min="1"
              />
            </div>
            
            <div className="flex items-end">
              {newItem.sku && (
                <p className="text-gray-600">
                  Unit Price: {formatAmount(inventory.find(p => p.sku === newItem.sku)?.price || 0)}
                </p>
              )}
            </div>
            
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleAddItem}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 w-full"
              >
                Add Item
              </button>
            </div>
          </div>

          {/* Items List */}
          {newTransaction.items && newTransaction.items.length > 0 && (
            <div className="mt-4">
              <h5 className="font-semibold mb-2">Added Items:</h5>
              <div className="space-y-2">
                {newTransaction.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                    <div>
                      <p className="font-medium">{item.description}</p>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity} × {formatAmount(item.unitPrice)}
                      </p>
                    </div>
                    <p className="font-semibold">{formatAmount(item.totalPrice)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-right">
                <p className="text-lg font-bold">
                  Total: {formatAmount(
                    newTransaction.items.reduce((sum, item) => sum + item.totalPrice, 0)
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <textarea
            placeholder="Additional Notes"
            value={newTransaction.notes || ''}
            onChange={(e) => setNewTransaction({ ...newTransaction, notes: e.target.value })}
            className="px-4 py-2 border rounded-lg w-2/3"
            rows={2}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Create Transaction
          </button>
        </div>
      </form>

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="table-container">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {convertedTransactions.map(transaction => (
              <tr key={transaction.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FileText size={16} className="text-gray-400 mr-2" />
                    {transaction.invoiceNumber}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {format(transaction.timestamp, 'MMM dd, yyyy HH:mm')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    transaction.type === 'sale' 
                      ? 'bg-green-100 text-green-800'
                      : transaction.type === 'refund'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {transaction.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {transaction.customerInfo?.name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <DollarSign size={16} className="text-gray-400 mr-1" />
                    {formatAmount(transaction.totalAmount)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    transaction.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : transaction.paymentStatus === 'partial'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {transaction.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleDeleteTransaction(transaction.id)}
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