export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  originalAmount?: number;
  originalCurrency?: string;
  date: Date;
  description: string;
  isRecurring?: boolean;
  recurrence?: 'daily' | 'weekly' | 'monthly' | '4weekly';
  nextDueDate?: Date;
  lastPaidDate?: Date;
  label?: string;
  paymentDate?: Date;
}

export interface BusinessTransaction {
  id: string;
  invoiceNumber: string;
  timestamp: Date;
  type: 'sale' | 'refund' | 'exchange';
  items: BusinessTransactionItem[];
  totalAmount: number;
  profitMargin: number;
  employeeId: string;
  notes?: string;
  status: 'pending' | 'completed' | 'cancelled';
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  paymentMethod?: string;
  customerInfo?: {
    name: string;
    email: string;
    phone?: string;
  };
}

export interface BusinessTransactionItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  cost: number;
  sku?: string;
  category?: string;
  taxRate?: number;
  discountAmount?: number;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  email: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  cost: number;
  quantity: number;
  category: string;
  minStockLevel?: number;
  supplier?: string;
}

export interface AccountsEntry {
  id: string;
  type: 'payable' | 'receivable';
  amount: number;
  dueDate: Date;
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly';
  nextDueDate?: Date;
  description: string;
  status: 'pending' | 'paid' | 'overdue';
  relatedTransactionId?: string;
  contactInfo: {
    name: string;
    email: string;
    phone?: string;
  };
}

export interface Debt {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
  monthlyPayment: number;
}

export interface AmortizationSchedule {
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
  date: Date;
}

export interface Budget {
  category: string;
  limit: number;
  spent: number;
}

export interface ExchangeRates {
  [key: string]: number;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  hasPaidSubscription?: boolean;
  stripeCustomerId?: string;
}

export type Theme = 'light' | 'dark';