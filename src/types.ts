export type PaymentMethod = 'cash' | 'mpesa' | 'credit' | 'split';

export type ProductUnit = 'carton' | 'bale' | 'crate' | 'box' | 'pack' | 'dozen' | 'kg' | 'piece';

export interface Product {
  id: string;
  name: string;
  category: string;
  unit: ProductUnit;
  unitPackSize: string; // e.g. "12 x 1L", "24 x 500ml", "12 x 2kg"
  buyingPrice: number; // Cost from factory per unit
  sellingPrice: number; // Wholesale price to retail shops per unit
  stockOnHand: number; // Current quantity in the van/storage
  minStockAlert: number;
  imageUrl?: string;
}

export interface Customer {
  id: string;
  shopName: string;
  ownerName: string;
  phone: string;
  estate: string; // Neighborhood / Estate name (e.g. Umoja, Roysambu, Fedha)
  landmark?: string;
  outstandingCredit: number; // Amount the shop owes the distributor
  creditLimit: number;
  totalOrdersCount: number;
  totalSpent: number;
  notes?: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  unit: ProductUnit;
  quantity: number;
  buyingPrice: number; // Snapshot of buying price at time of sale
  sellingPrice: number; // Unit price charged
  total: number;
  profit: number; // (sellingPrice - buyingPrice) * quantity
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  estate: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  items: OrderItem[];
  totalAmount: number;
  totalCost: number;
  totalProfit: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  amountCredit: number;
  paymentReference?: string; // M-Pesa code or cash note
  status: 'completed' | 'pending_payment';
}

export interface ReplenishmentRecord {
  id: string;
  date: string; // YYYY-MM-DD
  time: string;
  factoryName: string;
  productId: string;
  productName: string;
  quantityAdded: number;
  buyingPrice: number;
  totalCost: number;
  invoiceOrNote?: string;
}

export interface DailyReconciliation {
  date: string; // YYYY-MM-DD
  isClosed: boolean;
  closedAt?: string;
  openingStockValue: number;
  restockValue: number;
  totalSalesRevenue: number;
  totalCOGS: number;
  grossProfit: number;
  cashCollected: number;
  mpesaCollected: number;
  creditIssued: number;
  creditCollected: number;
  actualCashCounted?: number;
  cashVariance?: number;
  reconciliationNotes?: string;
}

export interface MonthlyTarget {
  month: string; // YYYY-MM
  targetRevenue: number;
  targetProfit: number;
  targetUnitsSold: number;
}
