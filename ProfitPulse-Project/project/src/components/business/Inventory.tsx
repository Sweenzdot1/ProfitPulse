import React, { useState } from 'react';
import { nanoid } from 'nanoid';
import { 
  Plus, Filter, Trash2, Package, AlertCircle, Tag, Truck 
} from 'lucide-react';
import { InfoTooltip } from '../InfoTooltip';
import { Product } from '../../types';
import { useCurrency, CurrencyProvider } from '../../contexts/CurrencyContext';

interface InventoryProps {
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
  isDemo?: boolean;
}

export function Inventory({ products, onUpdateProducts, isDemo }: InventoryProps) {
  const { formatAmount, convertAmount, currency } = useCurrency();

  const convertProduct = (product: Product) => ({
    ...product,
    price: convertAmount(product.price, 'USD', currency.code),
    cost: convertAmount(product.cost, 'USD', currency.code),
  });

  // Convert all products to current currency
  const convertedProducts = products.map(convertProduct);

  if (isDemo) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-bold">Inventory Management</h2>
            <span className="ml-3 px-2 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">DEMO</span>
            <InfoTooltip text="Manage your product inventory, track stock levels, and monitor product costs and selling prices. Set minimum stock alerts and track supplier information." />
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {convertedProducts.map(product => (
                <tr key={product.id}>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.sku}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {formatAmount(product.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {formatAmount(product.cost)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        product.quantity === 0
                          ? 'bg-red-100 text-red-800'
                          : product.minStockLevel && product.quantity <= product.minStockLevel
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {product.quantity}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {formatAmount(product.price * product.quantity)}
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

  const [newProduct, setNewProduct] = useState<Partial<Product>>({});
  const [filter, setFilter] = useState({
    category: 'all',
    stock: 'all' as 'all' | 'in-stock' | 'low-stock' | 'out-of-stock',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.sku || !newProduct.price) return;

    const product: Product = {
      id: nanoid(),
      name: newProduct.name,
      description: newProduct.description || '',
      sku: newProduct.sku,
      price: newProduct.price,
      cost: newProduct.cost || 0,
      quantity: newProduct.quantity || 0,
      category: newProduct.category || 'Uncategorized',
      minStockLevel: newProduct.minStockLevel,
      supplier: newProduct.supplier,
    };

    onUpdateProducts([...products, product]);
    setNewProduct({});
  };

  const handleDeleteProduct = (id: string) => {
    onUpdateProducts(products.filter(p => p.id !== id));
  };

  const filteredProducts = products.filter(product => {
    if (filter.category !== 'all' && product.category !== filter.category) return false;
    if (filter.stock !== 'all') {
      if (filter.stock === 'out-of-stock' && product.quantity > 0) return false;
      if (filter.stock === 'low-stock' && 
          (!product.minStockLevel || product.quantity > product.minStockLevel)) return false;
      if (filter.stock === 'in-stock' && product.quantity <= 0) return false;
    }
    return true;
  });

  const categories = Array.from(new Set(products.map(p => p.category)));
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  const totalCost = products.reduce((sum, p) => sum + (p.cost * p.quantity), 0);
  const potentialProfit = totalValue - totalCost;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center mb-6">
        <h2 className="text-2xl font-bold">Inventory Management</h2>
        <InfoTooltip text="Manage your product inventory, track stock levels, and monitor product costs and selling prices. Set minimum stock alerts and track supplier information." />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Total Inventory Value</h3>
            <Package className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{formatAmount(totalValue)}</p>
          <p className="text-sm text-gray-500">Based on selling price</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Total Cost</h3>
            <Tag className="text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">{formatAmount(totalCost)}</p>
          <p className="text-sm text-gray-500">Purchase value</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Potential Profit</h3>
            <Truck className="text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">{formatAmount(potentialProfit)}</p>
          <p className="text-sm text-gray-500">If all inventory sold</p>
        </div>
      </div>
      
      {/* Add New Product Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="text-blue-500" />
          <h3 className="text-lg font-semibold">Add New Product</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Product Name"
            value={newProduct.name || ''}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            className="px-4 py-2 border rounded-lg"
            required
          />

          <input
            type="text"
            placeholder="SKU"
            value={newProduct.sku || ''}
            onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
            className="px-4 py-2 border rounded-lg"
            required
          />

          <input
            type="text"
            placeholder="Category"
            value={newProduct.category || ''}
            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          />

          <input
            type="text"
            placeholder="Selling Price"
            value={newProduct.price || ''}
            onChange={(e) => {
              const value = e.target.value.replace(/[^\d.]/g, '');
              const parts = value.split('.');
              if (parts.length > 2) return;
              if (parts[1] && parts[1].length > 2) return;
              const numericValue = parseFloat(value);
              setNewProduct({ ...newProduct, price: isNaN(value) ? 0 : value });
            }}
            className="px-4 py-2 border rounded-lg"
            required
          />

          <input
            type="text"
            placeholder="Cost Price"
            value={newProduct.cost || ''}
            onChange={(e) => {
              const value = e.target.value.replace(/[^\d.]/g, '');
              const parts = value.split('.');
              if (parts.length > 2) return;
              if (parts[1] && parts[1].length > 2) return;
              const numericValue = parseFloat(value);
              setNewProduct({ ...newProduct, cost: isNaN(value) ? 0 : value });
            }}
            className="px-4 py-2 border rounded-lg"
          />

          <input
            type="number"
            placeholder="Current Quantity"
            value={newProduct.quantity || ''}
            onChange={(e) => setNewProduct({ ...newProduct, quantity: Number(e.target.value) })}
            className="px-4 py-2 border rounded-lg"
            min="0"
          />

          <input
            type="number"
            placeholder="Minimum Stock Level"
            value={newProduct.minStockLevel || ''}
            onChange={(e) => setNewProduct({ ...newProduct, minStockLevel: Number(e.target.value) })}
            className="px-4 py-2 border rounded-lg"
            min="0"
          />

          <input
            type="text"
            placeholder="Supplier"
            value={newProduct.supplier || ''}
            onChange={(e) => setNewProduct({ ...newProduct, supplier: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          />

          <textarea
            placeholder="Description"
            value={newProduct.description || ''}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            className="px-4 py-2 border rounded-lg"
            rows={2}
          />

          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Add Product
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
            value={filter.category}
            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <select
            value={filter.stock}
            onChange={(e) => setFilter({ 
              ...filter, 
              stock: e.target.value as 'all' | 'in-stock' | 'low-stock' | 'out-of-stock'
            })}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Stock Levels</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Products List */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="table-container">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {convertedProducts.map(product => (
              <tr key={product.id}>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.description}</p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{product.sku}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  {formatAmount(product.price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  {formatAmount(product.cost)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.quantity === 0
                        ? 'bg-red-100 text-red-800'
                        : product.minStockLevel && product.quantity <= product.minStockLevel
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {product.quantity}
                    </span>
                    {product.minStockLevel && product.quantity <= product.minStockLevel && (
                      <AlertCircle size={16} className="text-yellow-500 ml-2" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  {formatAmount(product.price * product.quantity)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
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