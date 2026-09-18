import { Product, Customer, Order, ReplenishmentRecord, MonthlyTarget } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Pwani Gold Cooking Oil',
    category: 'Edible Oils',
    unit: 'carton',
    unitPackSize: '12 x 1L Bottles',
    buyingPrice: 2650,
    sellingPrice: 3100,
    stockOnHand: 28,
    minStockAlert: 10,
  },
  {
    id: 'prod-2',
    name: 'Taifa Supreme Maize Flour',
    category: 'Grains & Flour',
    unit: 'bale',
    unitPackSize: '12 x 2kg Packets',
    buyingPrice: 1680,
    sellingPrice: 1950,
    stockOnHand: 42,
    minStockAlert: 15,
  },
  {
    id: 'prod-3',
    name: 'Supa White Bar Soap',
    category: 'Hygiene & Cleaners',
    unit: 'box',
    unitPackSize: '25 x 800g Bars',
    buyingPrice: 2100,
    sellingPrice: 2480,
    stockOnHand: 18,
    minStockAlert: 8,
  },
  {
    id: 'prod-4',
    name: 'Biko Sparkling Soda Crate',
    category: 'Beverages',
    unit: 'crate',
    unitPackSize: '24 x 300ml RGB Bottles',
    buyingPrice: 1100,
    sellingPrice: 1350,
    stockOnHand: 35,
    minStockAlert: 12,
  },
  {
    id: 'prod-5',
    name: 'Mara Mountain Pure Tea',
    category: 'Beverages',
    unit: 'carton',
    unitPackSize: '40 x 100g Packets',
    buyingPrice: 1450,
    sellingPrice: 1750,
    stockOnHand: 14,
    minStockAlert: 8,
  },
  {
    id: 'prod-6',
    name: 'Kavirondo Premium Sugar',
    category: 'Grains & Flour',
    unit: 'bale',
    unitPackSize: '20 x 1kg Bags',
    buyingPrice: 2800,
    sellingPrice: 3200,
    stockOnHand: 9, // Low stock on purpose to show alert
    minStockAlert: 10,
  },
  {
    id: 'prod-7',
    name: 'Jumbo Glucose Biscuits',
    category: 'Snacks & Confectionery',
    unit: 'box',
    unitPackSize: '48 x 50g Packs',
    buyingPrice: 920,
    sellingPrice: 1150,
    stockOnHand: 22,
    minStockAlert: 10,
  },
  {
    id: 'prod-8',
    name: 'Kibao Iodized Table Salt',
    category: 'Pantry Essentials',
    unit: 'bale',
    unitPackSize: '40 x 500g Packets',
    buyingPrice: 650,
    sellingPrice: 820,
    stockOnHand: 31,
    minStockAlert: 10,
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    shopName: 'Mama Brian Wholesale & Grocers',
    ownerName: 'Grace Muthoni',
    phone: '+254 722 891 042',
    estate: 'Umoja Innercore',
    landmark: 'Opposite Stage 4 Matatu terminus',
    outstandingCredit: 4500,
    creditLimit: 15000,
    totalOrdersCount: 14,
    totalSpent: 92600,
    notes: 'Pays promptly every Tuesday via M-Pesa. High-volume buyer.',
    createdAt: '2026-08-01',
  },
  {
    id: 'cust-2',
    shopName: 'Baraka Mini Supermarket',
    ownerName: 'Peter Otieno',
    phone: '+254 733 415 678',
    estate: 'Pipeline Estate',
    landmark: 'Plot 14 Near Chief Camp',
    outstandingCredit: 0,
    creditLimit: 20000,
    totalOrdersCount: 19,
    totalSpent: 134200,
    notes: 'Always checks expiry dates. Prefers cash delivery.',
    createdAt: '2026-08-04',
  },
  {
    id: 'cust-3',
    shopName: 'Zawadi Duka & Mobile Money',
    ownerName: 'Amina Hassan',
    phone: '+254 711 556 789',
    estate: 'Donholm Phase 5',
    landmark: 'Green gate next to St. Jude Academy',
    outstandingCredit: 2800,
    creditLimit: 10000,
    totalOrdersCount: 8,
    totalSpent: 48900,
    notes: 'Takes 1 carton oil and 2 bales flour weekly.',
    createdAt: '2026-08-12',
  },
  {
    id: 'cust-4',
    shopName: 'Sunrise Kiosk',
    ownerName: 'James Mwangi',
    phone: '+254 700 334 112',
    estate: 'Fedha Estate',
    landmark: 'Corner house near Total petrol station',
    outstandingCredit: 6200,
    creditLimit: 8000,
    totalOrdersCount: 6,
    totalSpent: 33100,
    notes: 'Near credit limit. Remind about pending balance before unloading.',
    createdAt: '2026-08-20',
  },
  {
    id: 'cust-5',
    shopName: 'Good Shepherd Traders',
    ownerName: 'Pastor Daniel Korir',
    phone: '+254 724 990 123',
    estate: 'Roysambu',
    landmark: 'Behind TRM junction, Lumumba drive',
    outstandingCredit: 0,
    creditLimit: 12000,
    totalOrdersCount: 11,
    totalSpent: 76500,
    notes: 'Strict delivery hours between 9am - 12pm.',
    createdAt: '2026-08-25',
  },
  {
    id: 'cust-6',
    shopName: 'Esther & Sons Duka',
    ownerName: 'Esther Wanjiku',
    phone: '+254 718 221 445',
    estate: 'Umoja Phase 2',
    landmark: 'Near Redeemed Gospel Church',
    outstandingCredit: 1950,
    creditLimit: 10000,
    totalOrdersCount: 9,
    totalSpent: 51200,
    notes: 'Always orders Supa White Soap and Taifa Flour.',
    createdAt: '2026-09-02',
  }
];

// Helper to generate cumulative daily history for the current month
export function generateSeedOrders(): { orders: Order[]; replenishments: ReplenishmentRecord[] } {
  const orders: Order[] = [];
  const replenishments: ReplenishmentRecord[] = [];

  // Factory replenish events earlier in the month
  replenishments.push({
    id: 'rep-1',
    date: '2026-09-01',
    time: '06:30',
    factoryName: 'Bidco Industrial Depot',
    productId: 'prod-1',
    productName: 'Pwani Gold Cooking Oil',
    quantityAdded: 40,
    buyingPrice: 2650,
    totalCost: 106000,
    invoiceOrNote: 'Factory Invoice #BD-9042',
  });
  replenishments.push({
    id: 'rep-2',
    date: '2026-09-01',
    time: '07:15',
    factoryName: 'Mombasa Grain Millers Factory',
    productId: 'prod-2',
    productName: 'Taifa Supreme Maize Flour',
    quantityAdded: 60,
    buyingPrice: 1680,
    totalCost: 100800,
    invoiceOrNote: 'Millers Delivery Note #MGM-771',
  });
  replenishments.push({
    id: 'rep-3',
    date: '2026-09-08',
    time: '06:45',
    factoryName: 'Kapa Oil Refineries',
    productId: 'prod-3',
    productName: 'Supa White Bar Soap',
    quantityAdded: 30,
    buyingPrice: 2100,
    totalCost: 63000,
    invoiceOrNote: 'Kapa Direct Gatepass #4490',
  });
  replenishments.push({
    id: 'rep-4',
    date: '2026-09-12',
    time: '07:00',
    factoryName: 'Crown Bottlers Factory',
    productId: 'prod-4',
    productName: 'Biko Sparkling Soda Crate',
    quantityAdded: 50,
    buyingPrice: 1100,
    totalCost: 55000,
    invoiceOrNote: 'Bottler Route Order #CB-3321',
  });
  replenishments.push({
    id: 'rep-5',
    date: '2026-09-17',
    time: '06:15',
    factoryName: 'Bidco Industrial Depot',
    productId: 'prod-1',
    productName: 'Pwani Gold Cooking Oil',
    quantityAdded: 25,
    buyingPrice: 2650,
    totalCost: 66250,
    invoiceOrNote: 'Van Reload Dispatch #BD-9411',
  });

  // Cumulative past days orders for September 1 to 17
  const dayPatterns = [
    { day: '01', custIndex: 0, pIndex: 0, qty: 3, p2Index: 1, q2: 4, pay: 'mpesa' as const, time: '09:30' },
    { day: '02', custIndex: 1, pIndex: 1, qty: 5, p2Index: 3, q2: 4, pay: 'cash' as const, time: '11:15' },
    { day: '03', custIndex: 2, pIndex: 0, qty: 2, p2Index: 2, q2: 2, pay: 'mpesa' as const, time: '14:20' },
    { day: '04', custIndex: 3, pIndex: 1, qty: 3, p2Index: 6, q2: 3, pay: 'credit' as const, time: '10:00' },
    { day: '05', custIndex: 4, pIndex: 3, qty: 6, p2Index: 0, q2: 2, pay: 'mpesa' as const, time: '12:45' },
    { day: '06', custIndex: 5, pIndex: 2, qty: 3, p2Index: 1, q2: 3, pay: 'cash' as const, time: '15:10' },
    { day: '08', custIndex: 0, pIndex: 0, qty: 4, p2Index: 4, q2: 3, pay: 'mpesa' as const, time: '09:40' },
    { day: '09', custIndex: 1, pIndex: 1, qty: 6, p2Index: 2, q2: 4, pay: 'cash' as const, time: '10:50' },
    { day: '10', custIndex: 2, pIndex: 5, qty: 3, p2Index: 7, q2: 4, pay: 'split' as const, time: '13:00' },
    { day: '11', custIndex: 3, pIndex: 3, qty: 4, p2Index: 0, q2: 2, pay: 'mpesa' as const, time: '14:15' },
    { day: '12', custIndex: 4, pIndex: 1, qty: 5, p2Index: 6, q2: 4, pay: 'cash' as const, time: '11:30' },
    { day: '13', custIndex: 5, pIndex: 2, qty: 4, p2Index: 7, q2: 3, pay: 'mpesa' as const, time: '16:00' },
    { day: '14', custIndex: 0, pIndex: 0, qty: 3, p2Index: 1, q2: 4, pay: 'mpesa' as const, time: '09:15' },
    { day: '15', custIndex: 1, pIndex: 3, qty: 5, p2Index: 5, q2: 2, pay: 'cash' as const, time: '11:45' },
    { day: '16', custIndex: 2, pIndex: 1, qty: 4, p2Index: 2, q2: 2, pay: 'mpesa' as const, time: '14:30' },
    { day: '17', custIndex: 4, pIndex: 0, qty: 4, p2Index: 3, q2: 4, pay: 'cash' as const, time: '10:20' },
  ];

  dayPatterns.forEach((dp, idx) => {
    const cust = INITIAL_CUSTOMERS[dp.custIndex];
    const p1 = INITIAL_PRODUCTS[dp.pIndex];
    const p2 = INITIAL_PRODUCTS[dp.p2Index];

    const item1 = {
      productId: p1.id,
      productName: p1.name,
      unit: p1.unit,
      quantity: dp.qty,
      buyingPrice: p1.buyingPrice,
      sellingPrice: p1.sellingPrice,
      total: dp.qty * p1.sellingPrice,
      profit: dp.qty * (p1.sellingPrice - p1.buyingPrice),
    };

    const item2 = {
      productId: p2.id,
      productName: p2.name,
      unit: p2.unit,
      quantity: dp.q2,
      buyingPrice: p2.buyingPrice,
      sellingPrice: p2.sellingPrice,
      total: dp.q2 * p2.sellingPrice,
      profit: dp.q2 * (p2.sellingPrice - p2.buyingPrice),
    };

    const total = item1.total + item2.total;
    const totalCost = (item1.quantity * item1.buyingPrice) + (item2.quantity * item2.buyingPrice);
    const totalProfit = total - totalCost;

    let amountPaid = total;
    let amountCredit = 0;
    if (dp.pay === 'credit') {
      amountPaid = 0;
      amountCredit = total;
    } else if (dp.pay === 'split') {
      amountPaid = Math.round(total * 0.6);
      amountCredit = total - amountPaid;
    }

    orders.push({
      id: `ord-${idx + 1}`,
      orderNumber: `ORD-2609${dp.day}-${String(idx + 1).padStart(3, '0')}`,
      customerId: cust.id,
      customerName: cust.shopName,
      estate: cust.estate,
      date: `2026-09-${dp.day}`,
      time: dp.time,
      items: [item1, item2],
      totalAmount: total,
      totalCost,
      totalProfit,
      paymentMethod: dp.pay,
      amountPaid,
      amountCredit,
      paymentReference: dp.pay === 'mpesa' ? `QL89T${idx}9X` : undefined,
      status: dp.pay === 'credit' ? 'pending_payment' : 'completed',
    });
  });

  // Today's active date (2026-09-18) orders
  const todayOrder1 = {
    productId: INITIAL_PRODUCTS[0].id,
    productName: INITIAL_PRODUCTS[0].name,
    unit: INITIAL_PRODUCTS[0].unit,
    quantity: 2,
    buyingPrice: INITIAL_PRODUCTS[0].buyingPrice,
    sellingPrice: INITIAL_PRODUCTS[0].sellingPrice,
    total: 2 * INITIAL_PRODUCTS[0].sellingPrice,
    profit: 2 * (INITIAL_PRODUCTS[0].sellingPrice - INITIAL_PRODUCTS[0].buyingPrice),
  };
  const todayOrder2 = {
    productId: INITIAL_PRODUCTS[1].id,
    productName: INITIAL_PRODUCTS[1].name,
    unit: INITIAL_PRODUCTS[1].unit,
    quantity: 3,
    buyingPrice: INITIAL_PRODUCTS[1].buyingPrice,
    sellingPrice: INITIAL_PRODUCTS[1].sellingPrice,
    total: 3 * INITIAL_PRODUCTS[1].sellingPrice,
    profit: 3 * (INITIAL_PRODUCTS[1].sellingPrice - INITIAL_PRODUCTS[1].buyingPrice),
  };

  orders.push({
    id: 'ord-today-1',
    orderNumber: 'ORD-260918-001',
    customerId: INITIAL_CUSTOMERS[0].id,
    customerName: INITIAL_CUSTOMERS[0].shopName,
    estate: INITIAL_CUSTOMERS[0].estate,
    date: '2026-09-18',
    time: '08:45',
    items: [todayOrder1, todayOrder2],
    totalAmount: todayOrder1.total + todayOrder2.total,
    totalCost: (todayOrder1.quantity * todayOrder1.buyingPrice) + (todayOrder2.quantity * todayOrder2.buyingPrice),
    totalProfit: todayOrder1.profit + todayOrder2.profit,
    paymentMethod: 'mpesa',
    amountPaid: todayOrder1.total + todayOrder2.total,
    amountCredit: 0,
    paymentReference: 'RK99824XA',
    status: 'completed',
  });

  const todayOrder3 = {
    productId: INITIAL_PRODUCTS[2].id,
    productName: INITIAL_PRODUCTS[2].name,
    unit: INITIAL_PRODUCTS[2].unit,
    quantity: 2,
    buyingPrice: INITIAL_PRODUCTS[2].buyingPrice,
    sellingPrice: INITIAL_PRODUCTS[2].sellingPrice,
    total: 2 * INITIAL_PRODUCTS[2].sellingPrice,
    profit: 2 * (INITIAL_PRODUCTS[2].sellingPrice - INITIAL_PRODUCTS[2].buyingPrice),
  };

  orders.push({
    id: 'ord-today-2',
    orderNumber: 'ORD-260918-002',
    customerId: INITIAL_CUSTOMERS[5].id,
    customerName: INITIAL_CUSTOMERS[5].shopName,
    estate: INITIAL_CUSTOMERS[5].estate,
    date: '2026-09-18',
    time: '10:15',
    items: [todayOrder3],
    totalAmount: todayOrder3.total,
    totalCost: todayOrder3.quantity * todayOrder3.buyingPrice,
    totalProfit: todayOrder3.profit,
    paymentMethod: 'cash',
    amountPaid: todayOrder3.total,
    amountCredit: 0,
    status: 'completed',
  });

  return { orders, replenishments };
}

export const INITIAL_MONTHLY_TARGET: MonthlyTarget = {
  month: '2026-09',
  targetRevenue: 450000,
  targetProfit: 75000,
  targetUnitsSold: 300,
};
