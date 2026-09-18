import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Customer,
  Order,
  ReplenishmentRecord,
  DailyReconciliation,
  MonthlyTarget,
  PaymentMethod,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_MONTHLY_TARGET,
  generateSeedOrders,
} from '../data/initialData';

interface DistributorContextType {
  products: Product[];
  customers: Customer[];
  orders: Order[];
  replenishments: ReplenishmentRecord[];
  dailyReconciliations: Record<string, DailyReconciliation>;
  monthlyTarget: MonthlyTarget;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  currencySymbol: string;
  setCurrencySymbol: (sym: string) => void;

  // Actions
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  replenishInventory: (
    factoryName: string,
    productId: string,
    quantity: number,
    buyingPrice: number,
    invoiceOrNote?: string
  ) => void;
  onboardCustomer: (customer: Omit<Customer, 'id' | 'totalOrdersCount' | 'totalSpent' | 'createdAt'>) => string;
  updateCustomer: (customer: Customer) => void;
  collectCustomerCredit: (customerId: string, amount: number, paymentMethod: PaymentMethod) => void;
  createOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'totalCost' | 'totalProfit'>) => Order;
  reconcileDay: (date: string, actualCashCounted: number, notes?: string) => void;
  updateMonthlyTarget: (target: MonthlyTarget) => void;
  resetToSampleData: () => void;
}

const DistributorContext = createContext<DistributorContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'uzauza_products_v1',
  CUSTOMERS: 'uzauza_customers_v1',
  ORDERS: 'uzauza_orders_v1',
  REPLENISHMENTS: 'uzauza_replenishments_v1',
  RECONCILIATIONS: 'uzauza_reconciliations_v1',
  TARGET: 'uzauza_target_v1',
  CURRENCY: 'uzauza_currency_v1',
};

export const DistributorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-18');
  const [currencySymbol, setCurrencySymbolState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.CURRENCY) || 'KES';
  });

  const setCurrencySymbol = (sym: string) => {
    setCurrencySymbolState(sym);
    localStorage.setItem(STORAGE_KEYS.CURRENCY, sym);
  };

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse products from storage', e);
      }
    }
    return INITIAL_PRODUCTS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse customers from storage', e);
      }
    }
    return INITIAL_CUSTOMERS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse orders from storage', e);
      }
    }
    const seed = generateSeedOrders();
    return seed.orders;
  });

  const [replenishments, setReplenishments] = useState<ReplenishmentRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REPLENISHMENTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse replenishments from storage', e);
      }
    }
    const seed = generateSeedOrders();
    return seed.replenishments;
  });

  const [dailyReconciliations, setDailyReconciliations] = useState<Record<string, DailyReconciliation>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RECONCILIATIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse reconciliations from storage', e);
      }
    }
    return {};
  });

  const [monthlyTarget, setMonthlyTarget] = useState<MonthlyTarget>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TARGET);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse target from storage', e);
      }
    }
    return INITIAL_MONTHLY_TARGET;
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REPLENISHMENTS, JSON.stringify(replenishments));
  }, [replenishments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECONCILIATIONS, JSON.stringify(dailyReconciliations));
  }, [dailyReconciliations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TARGET, JSON.stringify(monthlyTarget));
  }, [monthlyTarget]);

  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const replenishInventory = (
    factoryName: string,
    productId: string,
    quantity: number,
    buyingPrice: number,
    invoiceOrNote?: string
  ) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const newRecord: ReplenishmentRecord = {
      id: `rep-${Date.now()}`,
      date: selectedDate,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      factoryName,
      productId,
      productName: product.name,
      quantityAdded: quantity,
      buyingPrice,
      totalCost: quantity * buyingPrice,
      invoiceOrNote,
    };

    setReplenishments((prev) => [newRecord, ...prev]);

    // Update product stock and update buying price if new factory batch price changed
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            stockOnHand: p.stockOnHand + quantity,
            buyingPrice: buyingPrice > 0 ? buyingPrice : p.buyingPrice,
          };
        }
        return p;
      })
    );
  };

  const onboardCustomer = (custData: Omit<Customer, 'id' | 'totalOrdersCount' | 'totalSpent' | 'createdAt'>) => {
    const newId = `cust-${Date.now()}`;
    const newCustomer: Customer = {
      ...custData,
      id: newId,
      totalOrdersCount: 0,
      totalSpent: 0,
      createdAt: selectedDate,
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    return newId;
  };

  const updateCustomer = (updated: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const collectCustomerCredit = (customerId: string, amount: number, paymentMethod: PaymentMethod) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          return {
            ...c,
            outstandingCredit: Math.max(0, c.outstandingCredit - amount),
          };
        }
        return c;
      })
    );

    // Record as special credit collection transaction in orders or daily reconciliation log
    const cust = customers.find((c) => c.id === customerId);
    if (cust) {
      const creditOrder: Order = {
        id: `debt-col-${Date.now()}`,
        orderNumber: `REC-${Date.now().toString().slice(-6)}`,
        customerId,
        customerName: cust.shopName,
        estate: cust.estate,
        date: selectedDate,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        items: [],
        totalAmount: 0, // Not new merchandise sales, pure debt recovery
        totalCost: 0,
        totalProfit: 0,
        paymentMethod,
        amountPaid: amount,
        amountCredit: 0,
        paymentReference: `Credit Payment Recovery - ${cust.shopName}`,
        status: 'completed',
      };
      setOrders((prev) => [creditOrder, ...prev]);
    }
  };

  const createOrder = (orderData: Omit<Order, 'id' | 'orderNumber' | 'totalCost' | 'totalProfit'>) => {
    // Calculate total cost and total profit
    const totalCost = orderData.items.reduce((acc, item) => acc + item.quantity * item.buyingPrice, 0);
    const totalProfit = orderData.totalAmount - totalCost;

    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber: `ORD-${selectedDate.replace(/-/g, '').slice(2)}-${Math.floor(100 + Math.random() * 900)}`,
      totalCost,
      totalProfit,
    };

    // 1. Decrement product stock on hand
    setProducts((prev) =>
      prev.map((p) => {
        const orderedItem = orderData.items.find((item) => item.productId === p.id);
        if (orderedItem) {
          return {
            ...p,
            stockOnHand: Math.max(0, p.stockOnHand - orderedItem.quantity),
          };
        }
        return p;
      })
    );

    // 2. Update customer records (totalSpent, totalOrdersCount, outstandingCredit)
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === orderData.customerId) {
          return {
            ...c,
            totalOrdersCount: c.totalOrdersCount + 1,
            totalSpent: c.totalSpent + orderData.totalAmount,
            outstandingCredit: c.outstandingCredit + orderData.amountCredit,
          };
        }
        return c;
      })
    );

    // 3. Add to orders list
    setOrders((prev) => [newOrder, ...prev]);

    return newOrder;
  };

  const reconcileDay = (date: string, actualCashCounted: number, notes?: string) => {
    const dayOrders = orders.filter((o) => o.date === date);

    const totalSalesRevenue = dayOrders.reduce((acc, o) => acc + o.totalAmount, 0);
    const totalCOGS = dayOrders.reduce((acc, o) => acc + o.totalCost, 0);
    const grossProfit = totalSalesRevenue - totalCOGS;

    // Cash and M-Pesa collected today from orders and credit collections
    let cashCollected = 0;
    let mpesaCollected = 0;
    let creditIssued = 0;

    dayOrders.forEach((o) => {
      if (o.paymentMethod === 'cash') {
        cashCollected += o.amountPaid;
      } else if (o.paymentMethod === 'mpesa') {
        mpesaCollected += o.amountPaid;
      } else if (o.paymentMethod === 'split') {
        // Assume split cash portion is paid, rest is credit
        cashCollected += o.amountPaid;
      }
      creditIssued += o.amountCredit;
    });

    const dayReplenishments = replenishments.filter((r) => r.date === date);
    const restockValue = dayReplenishments.reduce((acc, r) => acc + r.totalCost, 0);

    const cashVariance = actualCashCounted - cashCollected;

    const recon: DailyReconciliation = {
      date,
      isClosed: true,
      closedAt: new Date().toISOString(),
      openingStockValue: 0,
      restockValue,
      totalSalesRevenue,
      totalCOGS,
      grossProfit,
      cashCollected,
      mpesaCollected,
      creditIssued,
      creditCollected: 0,
      actualCashCounted,
      cashVariance,
      reconciliationNotes: notes,
    };

    setDailyReconciliations((prev) => ({
      ...prev,
      [date]: recon,
    }));
  };

  const updateMonthlyTarget = (target: MonthlyTarget) => {
    setMonthlyTarget(target);
  };

  const resetToSampleData = () => {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.REPLENISHMENTS);
    localStorage.removeItem(STORAGE_KEYS.RECONCILIATIONS);
    localStorage.removeItem(STORAGE_KEYS.TARGET);

    const seed = generateSeedOrders();
    setProducts(INITIAL_PRODUCTS);
    setCustomers(INITIAL_CUSTOMERS);
    setOrders(seed.orders);
    setReplenishments(seed.replenishments);
    setDailyReconciliations({});
    setMonthlyTarget(INITIAL_MONTHLY_TARGET);
  };

  return (
    <DistributorContext.Provider
      value={{
        products,
        customers,
        orders,
        replenishments,
        dailyReconciliations,
        monthlyTarget,
        selectedDate,
        setSelectedDate,
        currencySymbol,
        setCurrencySymbol,
        addProduct,
        updateProduct,
        replenishInventory,
        onboardCustomer,
        updateCustomer,
        collectCustomerCredit,
        createOrder,
        reconcileDay,
        updateMonthlyTarget,
        resetToSampleData,
      }}
    >
      {children}
    </DistributorContext.Provider>
  );
};

export function useDistributor() {
  const context = useContext(DistributorContext);
  if (!context) {
    throw new Error('useDistributor must be used within a DistributorProvider');
  }
  return context;
}
