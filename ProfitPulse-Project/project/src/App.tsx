import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { TransactionManager } from './components/TransactionManager';
import { DebtManager } from './components/DebtManager';
import { ExchangeRates } from './components/ExchangeRates';
import { BusinessDashboard } from './components/business/BusinessDashboard';
import { BusinessTransactions } from './components/business/BusinessTransactions';
import { AccountsManager } from './components/business/AccountsManager';
import { Inventory } from './components/business/Inventory';
import { CurrencySelector } from './components/CurrencySelector';
import { Transaction, Debt, Budget } from './types';
import { 
  LayoutDashboard, CreditCard, Download, Upload, Menu, X, DollarSign,
  Briefcase, UserCircle, Building2, Home, Wallet
} from 'lucide-react';
import { CurrencyProvider, useCurrency } from './contexts/CurrencyContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsDropdown } from './components/SettingsDropdown';
import { AuthModal } from './components/AuthModal';

function CurrencyIcon() {
  const { currency } = useCurrency();
  return (
    <div className="h-8 w-8 flex items-center justify-center text-blue-500 font-bold text-xl">
      {currency.symbol}
    </div>
  );
}

interface LandingPageProps {
  onSelect: (type: 'personal' | 'business') => void;
  setIsAuthModalOpen: (isOpen: boolean) => void;
}

function LandingPage({ onSelect, setIsAuthModalOpen }: LandingPageProps) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setIsAuthModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsAuthModalOpen(false);
  };

  return (
    <>
      <div className={`min-h-screen flex items-center justify-center p-4 ${
        theme === 'dark' 
          ? 'bg-gradient-to-b from-gray-900 to-gray-800' 
          : 'bg-gradient-to-b from-blue-50 to-white'
      }`}>
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Wallet className="h-12 w-12 text-blue-500" />
              <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>ProfitPulse</h1>
            </div>
            <p className={`text-xl mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Stay on top of your finances</p>
            <button
              onClick={handleOpenModal}
              className="inline-flex items-center px-6 py-3 text-lg font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors mb-4"
            >
              Get Started
            </button>
            <p className={`text-xl mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Choose your financial management interface</p>
            {!user?.hasPaidSubscription && (
              <p className="text-lg text-blue-600 font-semibold">
                Unlock Business Features for £19.99 - One-time Payment
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <button
              onClick={() => onSelect('personal')}
              className={`rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow group ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}>
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mb-6 mx-auto group-hover:bg-blue-200 transition-colors">
                <UserCircle size={32} />
              </div>
              <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Personal Finance</h2>
              <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Track personal expenses, manage budgets, and monitor your financial goals
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">Expense Tracking</span>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">Budgeting</span>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">Debt Management</span>
              </div>
            </button>

            <button
              className={`rounded-2xl shadow-lg p-8 transition-shadow group relative ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'} ${
                !user?.hasPaidSubscription ? 'opacity-90' : 'hover:shadow-xl'
              }`}
              onClick={() => {
                onSelect('business');
              }}
            >
              <div className={`absolute -top-3 -right-3 transform rotate-45 ${
                user?.hasPaidSubscription ? 'bg-green-500' : 'bg-blue-500'
              } text-white px-8 py-1 text-sm font-semibold shadow-lg`}>
                {user?.hasPaidSubscription ? 'PRO' : 'DEMO'}
              </div>
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-6 mx-auto group-hover:bg-green-200 transition-colors">
                <Briefcase size={32} />
              </div>
              <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Business Finance</h2>
              <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {user?.hasPaidSubscription 
                  ? "Manage business transactions, inventory, and financial operations"
                  : "Subscribe to access business features including inventory management, invoicing, and analytics"}
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">Invoicing</span>
                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">Inventory</span>
                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">Analytics</span>
              </div>
            </button>
          </div>
        </div>
      </div>
      <AuthModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}

function AppContent() {
  const [interfaceType, setInterfaceType] = useState<'landing' | 'personal' | 'business'>('landing');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const DEMO_BUSINESS_DATA = {
    products: [
      { id: 'demo-1', name: 'Laptop Pro X1', sku: 'LAP001', price: 1299.99, cost: 899.99, quantity: 15, category: 'Electronics', description: 'High-performance laptop with 16GB RAM', minStockLevel: 5 },
      { id: 'demo-2', name: 'Wireless Earbuds', sku: 'AUD002', price: 159.99, cost: 79.99, quantity: 45, category: 'Audio', description: 'Premium wireless earbuds with noise cancellation', minStockLevel: 10 },
      { id: 'demo-3', name: 'Smart Watch', sku: 'WAT003', price: 249.99, cost: 149.99, quantity: 3, category: 'Wearables', description: 'Fitness tracking smartwatch', minStockLevel: 8 },
      { id: 'demo-4', name: 'Phone Case', sku: 'ACC004', price: 29.99, cost: 9.99, quantity: 120, category: 'Accessories', description: 'Protective phone case', minStockLevel: 25 },
      { id: 'demo-5', name: 'USB-C Cable', sku: 'CAB005', price: 19.99, cost: 5.99, quantity: 200, category: 'Accessories', description: 'Fast charging USB-C cable', minStockLevel: 50 }
    ],
    transactions: [
      {
        id: 'demo-tx-1', invoiceNumber: 'INV-20240301-001',
        timestamp: new Date('2024-03-01T10:30:00'),
        type: 'sale',
        items: [
          { id: 'item-1', description: 'Laptop Pro X1', quantity: 2, unitPrice: 1299.99, totalPrice: 2599.98, cost: 899.99, sku: 'LAP001' }
        ],
        totalAmount: 2599.98,
        profitMargin: 800,
        employeeId: 'EMP001',
        status: 'completed',
        paymentStatus: 'paid',
        customerInfo: { name: 'John Smith', email: 'john@example.com' }
      },
      {
        id: 'demo-tx-2', invoiceNumber: 'INV-20240302-002',
        timestamp: new Date('2024-03-02T15:45:00'),
        type: 'sale',
        items: [
          { id: 'item-2', description: 'Wireless Earbuds', quantity: 3, unitPrice: 159.99, totalPrice: 479.97, cost: 79.99, sku: 'AUD002' },
          { id: 'item-3', description: 'Phone Case', quantity: 2, unitPrice: 29.99, totalPrice: 59.98, cost: 9.99, sku: 'ACC004' }
        ],
        totalAmount: 539.95,
        profitMargin: 240,
        employeeId: 'EMP002',
        status: 'completed',
        paymentStatus: 'paid',
        customerInfo: { name: 'Sarah Johnson', email: 'sarah@example.com' }
      },
      {
        id: 'demo-tx-3', invoiceNumber: 'INV-20240303-003',
        timestamp: new Date('2024-03-03T09:15:00'),
        type: 'refund',
        items: [
          { id: 'item-4', description: 'Smart Watch', quantity: 1, unitPrice: 249.99, totalPrice: 249.99, cost: 149.99, sku: 'WAT003' }
        ],
        totalAmount: 249.99,
        profitMargin: -100,
        employeeId: 'EMP001',
        status: 'completed',
        paymentStatus: 'refunded',
        customerInfo: { name: 'Mike Wilson', email: 'mike@example.com' }
      }
    ],
    accounts: [
      {
        id: 'acc-1', type: 'payable',
        amount: 5000.00,
        dueDate: new Date('2024-03-15'),
        description: 'Monthly Inventory Restock',
        status: 'pending',
        recurrence: 'monthly',
        contactInfo: { name: 'Tech Suppliers Inc', email: 'orders@techsuppliers.com', phone: '555-0123' }
      },
      {
        id: 'acc-2', type: 'receivable',
        amount: 2599.98,
        dueDate: new Date('2024-03-10'),
        description: 'Bulk Order - Laptops',
        status: 'overdue',
        recurrence: 'none',
        contactInfo: { name: 'Corporate Solutions Ltd', email: 'accounts@corpsolutions.com', phone: '555-0124' }
      },
      {
        id: 'acc-3', type: 'payable',
        amount: 1200.00,
        dueDate: new Date('2024-03-05'),
        description: 'Utility Bills',
        status: 'paid',
        recurrence: 'monthly',
        contactInfo: { name: 'City Utilities', email: 'billing@cityutils.com', phone: '555-0125' }
      }
    ],
    inventory: [
      { id: 'demo-1', name: 'Laptop Pro X1', sku: 'LAP001', price: 1299.99, cost: 899.99, quantity: 15, category: 'Electronics', description: 'High-performance laptop with 16GB RAM', minStockLevel: 5 },
      { id: 'demo-2', name: 'Wireless Earbuds', sku: 'AUD002', price: 159.99, cost: 79.99, quantity: 45, category: 'Audio', description: 'Premium wireless earbuds with noise cancellation', minStockLevel: 10 },
      { id: 'demo-3', name: 'Smart Watch', sku: 'WAT003', price: 249.99, cost: 149.99, quantity: 3, category: 'Wearables', description: 'Fitness tracking smartwatch', minStockLevel: 8 },
      { id: 'demo-4', name: 'Phone Case', sku: 'ACC004', price: 29.99, cost: 9.99, quantity: 120, category: 'Accessories', description: 'Protective phone case', minStockLevel: 25 },
      { id: 'demo-5', name: 'USB-C Cable', sku: 'CAB005', price: 19.99, cost: 5.99, quantity: 200, category: 'Accessories', description: 'Fast charging USB-C cable', minStockLevel: 50 }
    ]
  };
  const [businessData, setBusinessData] = useState(DEMO_BUSINESS_DATA);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load data from localStorage on mount
  React.useEffect(() => {
    const savedData = localStorage.getItem('financeTrackerData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setTransactions(parsed.transactions.map((t: any) => ({
        ...t,
        date: new Date(t.date),
        nextDueDate: t.nextDueDate ? new Date(t.nextDueDate) : undefined,
        lastPaidDate: t.lastPaidDate ? new Date(t.lastPaidDate) : undefined,
        paymentDate: t.paymentDate ? new Date(t.paymentDate) : undefined,
      })));
      setDebts(parsed.debts);
      setBudgets(parsed.budgets);
    }
  }, []);

  // Save data to localStorage whenever it changes
  React.useEffect(() => {
    localStorage.setItem('financeTrackerData', JSON.stringify({
      transactions,
      debts,
      budgets,
    }));
  }, [transactions, debts, budgets]);

  // Load business data from localStorage
  React.useEffect(() => {
    const savedBusinessData = localStorage.getItem('financeTrackerBusinessData');
    if (user?.hasPaidSubscription) {
      if (savedBusinessData) {
        setBusinessData(JSON.parse(savedBusinessData));
      } else {
        setBusinessData({
          products: [],
          transactions: [],
          accounts: [],
          inventory: []
        });
      }
    } else {
      setBusinessData(DEMO_BUSINESS_DATA);
    }
  }, [user?.hasPaidSubscription]);

  // Save business data to localStorage whenever it changes
  React.useEffect(() => {
    if (user?.hasPaidSubscription) {
      localStorage.setItem('financeTrackerBusinessData', JSON.stringify(businessData));
    }
  }, [businessData, user?.hasPaidSubscription]);

  const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
    if (transaction.id) {
      // Update existing transaction
      setTransactions(prevTransactions =>
        prevTransactions.map(t => t.id === transaction.id ? { ...transaction, id: t.id } : t)
      );
    } else {
      // Add new transaction
      const newTransaction = {
        ...transaction,
        id: Math.random().toString(36).substr(2, 9),
      };
      setTransactions(prevTransactions => [...prevTransactions, newTransaction]);
    }

    if (transaction.type === 'expense') {
      setBudgets(prevBudgets => {
        const existingBudget = prevBudgets.find(b => b.category === transaction.category);
        if (existingBudget) {
          return prevBudgets.map(b =>
            b.category === transaction.category
              ? { ...b, spent: b.spent + transaction.amount }
              : b
          );
        } else {
          return [...prevBudgets, {
            category: transaction.category,
            limit: transaction.amount * 1.2,
            spent: transaction.amount,
          }];
        }
      });
    }
  };

  const handleDeleteTransaction = (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (transaction && transaction.type === 'expense') {
      setBudgets(prevBudgets =>
        prevBudgets.map(b =>
          b.category === transaction.category
            ? { ...b, spent: b.spent - transaction.amount }
            : b
        )
      );
    }
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleAddDebt = (debt: Omit<Debt, 'id'>) => {
    // Create a unique ID for the debt
    const debtId = Math.random().toString(36).substr(2, 9);
    const newDebt = { ...debt, id: debtId };
    setDebts(prevDebts => [...prevDebts, newDebt]);
    
    // Add a recurring transaction for the monthly payment
    handleAddTransaction({
      type: 'expense',
      category: 'Debt',
      amount: Number(debt.monthlyPayment),
      date: new Date(),
      description: `Monthly Payment - ${debt.name}`,
      isRecurring: true,
      recurrence: 'monthly',
      label: debt.name,
      paymentDate: new Date(),
      nextDueDate: addMonths(new Date(), 1)
    });
  };

  const handleUpdateDebt = (id: string, updates: Partial<Debt>) => {
    setDebts(prevDebts => {
      const oldDebt = prevDebts.find(d => d.id === id);
      
      // If monthly payment changed, update the corresponding transaction
      if (oldDebt && oldDebt.monthlyPayment !== updates.monthlyPayment) {
        const existingTransaction = transactions.find(t => 
          t.category === 'Debt' && t.label === oldDebt.name
        );
        
        if (existingTransaction) {
          // Update existing transaction with new amount
          const updatedTransaction = {
            ...existingTransaction,
            amount: Number(updates.monthlyPayment) || 0,
            description: `Monthly Payment - ${oldDebt.name}`,
          };
          handleAddTransaction(updatedTransaction);
        }
      }
      
      return prevDebts.map(debt => debt.id === id ? { ...debt, ...updates } : debt);
    });
  };

  const handleDeleteDebt = (id: string) => {
    // Get the debt before deleting it
    const debtToDelete = debts.find(d => d.id === id);
    
    // Remove associated transactions
    if (debtToDelete) {
      setTransactions(prevTransactions => 
        prevTransactions.filter(t => 
          !(t.category === 'Debt' && t.label === debtToDelete.name)
        )
      );
    }
    
    setDebts(debts.filter(d => d.id !== id));
  };

  const handleExportData = () => {
    const data = JSON.stringify({
      transactions,
      debts,
      budgets,
    }, null, 2);
    
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'finance-tracker-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target?.result as string);
          setTransactions(parsed.transactions.map((t: any) => ({
            ...t,
            date: new Date(t.date),
            nextDueDate: t.nextDueDate ? new Date(t.nextDueDate) : undefined,
            lastPaidDate: t.lastPaidDate ? new Date(t.lastPaidDate) : undefined,
            paymentDate: t.paymentDate ? new Date(t.paymentDate) : undefined,
          })));
          setDebts(parsed.debts);
          setBudgets(parsed.budgets);
        } catch (error) {
          alert('Error importing data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const getNavItems = () => {
    if (interfaceType === 'personal') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'transactions', label: 'Transactions', icon: CurrencyIcon },
        { id: 'debt', label: 'Debt Management', icon: CreditCard },
        { id: 'exchange', label: 'Exchange Rates', icon: DollarSign },
      ];
    } else {
      return [
        { id: 'business-dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'business-transactions', label: 'Transactions', icon: Briefcase },
        { id: 'accounts', label: 'Accounts', icon: Building2 },
        { id: 'inventory', label: 'Inventory', icon: CreditCard },
      ];
    }
  };

  if (interfaceType === 'landing') {
    return (
      <LandingPage 
        setIsAuthModalOpen={setIsAuthModalOpen}
        onSelect={(type) => {
          setInterfaceType(type);
          setActiveTab(type === 'personal' ? 'dashboard' : 'business-dashboard');
        }} 
      />
    );
  }

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <button
                onClick={() => setInterfaceType('landing')}
                className="flex-shrink-0 flex items-center hover:bg-gray-100 px-2 sm:px-3 rounded-lg transition-colors"
              >
                <Home className="h-5 w-5 text-gray-500" />
              </button>
              
              <div className="flex-shrink-0 flex items-center ml-1 sm:ml-2">
                <CurrencyIcon />
                <span className="ml-2 text-lg sm:text-xl font-bold hidden xs:block">ProfitPulse</span>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:ml-6 md:flex md:space-x-4 lg:space-x-8">
                {navItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`inline-flex items-center px-2 pt-1 border-b-2 text-sm font-medium whitespace-nowrap ${
                      activeTab === item.id
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 relative'
                    }`}
                  >
                    {typeof item.icon === 'function' ? (
                      <item.icon className="mr-1 sm:mr-2" size={18} />
                    ) : (
                      <item.icon />
                    )}
                    {item.label}
                    {interfaceType === 'business' && (
                      <span className={`absolute -top-2 -right-2 px-1.5 py-0.5 text-xs font-medium rounded-full ${
                        user?.hasPaidSubscription ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user?.hasPaidSubscription ? 'PRO' : 'DEMO'}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Export/Import buttons */}
              <div className="hidden lg:flex items-center space-x-2">
                <button
                  onClick={handleExportData}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Download size={16} className="mr-1" />
                  Save
                </button>
                <label className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 cursor-pointer">
                  <Upload size={16} className="mr-1" />
                  Load
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                </label>
              </div>
              
              <CurrencySelector />
              <SettingsDropdown />

              {/* Mobile menu button */}
              <div className="md:hidden flex items-center">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                  aria-expanded={isMobileMenuOpen}
                >
                  <span className="sr-only">Open main menu</span>
                  {isMobileMenuOpen ? (
                    <X className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Menu className="block h-6 w-6" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div 
          className={`md:hidden transition-all duration-200 ease-in-out ${
            isMobileMenuOpen ? 'max-h-screen' : 'max-h-0 overflow-hidden'
          }`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200 shadow-lg">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-150 ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {typeof item.icon === 'function' ? (
                  <item.icon className="mr-3" size={20} />
                ) : (
                  <item.icon />
                )}
                {item.label}
              </button>
            ))}

            {/* Mobile Export/Import buttons */}
            <div className="grid grid-cols-2 gap-2 px-3 py-2">
              <button
                onClick={handleExportData}
                className="flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Download size={16} className="mr-2" />
                Save
              </button>
              <label className="flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 cursor-pointer">
                <Upload size={16} className="mr-2" />
                Load
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </nav>
      
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Main Content */}
      <main className="py-6 mt-16">
        {interfaceType === 'personal' ? (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard
                transactions={transactions}
                debts={debts}
                budgets={budgets}
              />
            )}
            
            {activeTab === 'transactions' && (
              <TransactionManager
                transactions={transactions}
                onAddTransaction={handleAddTransaction}
                onDeleteTransaction={handleDeleteTransaction}
              />
            )}
            
            {activeTab === 'debt' && (
              <DebtManager
                debts={debts}
                onAddDebt={handleAddDebt}
                onUpdateDebt={handleUpdateDebt}
                onDeleteDebt={handleDeleteDebt}
              />
            )}

            {activeTab === 'exchange' && (
              <ExchangeRates />
            )}
          </>
        ) : (
          <>
            {activeTab === 'business-dashboard' && (
              <BusinessDashboard 
                data={businessData}
                isDemo={!user?.hasPaidSubscription}
              />
            )}
            
            {activeTab === 'business-transactions' && (
              <BusinessTransactions
                transactions={businessData.transactions}
                inventory={businessData.inventory}
                onUpdateTransactions={(transactions) => 
                  setBusinessData(prev => ({ ...prev, transactions }))
                }
                isDemo={!user?.hasPaidSubscription}
                onUpdateInventory={(inventory) =>
                  setBusinessData(prev => ({ ...prev, inventory }))
                }
              />
            )}
            
            {activeTab === 'accounts' && (
              <AccountsManager
                accounts={businessData.accounts}
                isDemo={!user?.hasPaidSubscription}
                onUpdateAccounts={(accounts) =>
                  setBusinessData(prev => ({ ...prev, accounts }))
                }
              />
            )}
            
            {activeTab === 'inventory' && (
              <Inventory
                products={businessData.inventory}
                isDemo={!user?.hasPaidSubscription}
                onUpdateProducts={(inventory) =>
                  setBusinessData(prev => ({ ...prev, inventory }))
                }
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CurrencyProvider>
          <AppContent />
        </CurrencyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;