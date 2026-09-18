import { Product, Order, ReplenishmentRecord } from '../types';

export interface ProductDemandStat {
  product: Product;
  unitsSoldMonth: number;
  revenueMonth: number;
  profitMonth: number;
  ordersCount: number;
  marginPercent: number;
  velocityScore: 'HOT' | 'STEADY' | 'LOW';
  runRatePerDay: number;
  daysOfInventoryLeft: number;
}

export function calculateProductDemand(
  products: Product[],
  orders: Order[],
  monthStr: string // e.g. "2026-09"
): ProductDemandStat[] {
  // Filter orders for the specified month
  const monthOrders = orders.filter((o) => o.date.startsWith(monthStr));

  // Determine how many days have elapsed in this month
  const currentDayNumber = 18; // In September 2026

  const stats: ProductDemandStat[] = products.map((product) => {
    let unitsSold = 0;
    let revenue = 0;
    let profit = 0;
    let ordersCount = 0;

    monthOrders.forEach((order) => {
      const item = order.items.find((it) => it.productId === product.id);
      if (item) {
        unitsSold += item.quantity;
        revenue += item.total;
        profit += item.profit;
        ordersCount += 1;
      }
    });

    const marginPercent =
      product.sellingPrice > 0
        ? Math.round(((product.sellingPrice - product.buyingPrice) / product.sellingPrice) * 100)
        : 0;

    const runRatePerDay = currentDayNumber > 0 ? Number((unitsSold / currentDayNumber).toFixed(1)) : 0;
    const daysOfInventoryLeft =
      runRatePerDay > 0 ? Math.round(product.stockOnHand / runRatePerDay) : 99;

    let velocityScore: 'HOT' | 'STEADY' | 'LOW' = 'STEADY';
    if (unitsSold >= 25 || ordersCount >= 8) {
      velocityScore = 'HOT';
    } else if (unitsSold <= 6 && ordersCount <= 2) {
      velocityScore = 'LOW';
    }

    return {
      product,
      unitsSoldMonth: unitsSold,
      revenueMonth: revenue,
      profitMonth: profit,
      ordersCount,
      marginPercent,
      velocityScore,
      runRatePerDay,
      daysOfInventoryLeft,
    };
  });

  // Sort by units sold descending (highest demand first)
  return stats.sort((a, b) => b.unitsSoldMonth - a.unitsSoldMonth);
}

export interface DaySummary {
  date: string;
  orderCount: number;
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  marginPercent: number;
  cashCollected: number;
  mpesaCollected: number;
  creditIssued: number;
  unitsSold: number;
  stockReplenishedCount: number;
  stockReplenishedValue: number;
}

export function calculateDaySummary(
  date: string,
  orders: Order[],
  replenishments: ReplenishmentRecord[]
): DaySummary {
  const dayOrders = orders.filter((o) => o.date === date);
  const dayReplenishments = replenishments.filter((r) => r.date === date);

  let totalRevenue = 0;
  let totalCost = 0;
  let unitsSold = 0;
  let cashCollected = 0;
  let mpesaCollected = 0;
  let creditIssued = 0;

  dayOrders.forEach((o) => {
    totalRevenue += o.totalAmount;
    totalCost += o.totalCost;

    if (o.paymentMethod === 'cash') {
      cashCollected += o.amountPaid;
    } else if (o.paymentMethod === 'mpesa') {
      mpesaCollected += o.amountPaid;
    } else if (o.paymentMethod === 'split') {
      cashCollected += o.amountPaid;
    }
    creditIssued += o.amountCredit;

    o.items.forEach((it) => {
      unitsSold += it.quantity;
    });
  });

  const grossProfit = totalRevenue - totalCost;
  const marginPercent = totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 100) : 0;

  const stockReplenishedCount = dayReplenishments.reduce((acc, r) => acc + r.quantityAdded, 0);
  const stockReplenishedValue = dayReplenishments.reduce((acc, r) => acc + r.totalCost, 0);

  return {
    date,
    orderCount: dayOrders.length,
    totalRevenue,
    totalCost,
    grossProfit,
    marginPercent,
    cashCollected,
    mpesaCollected,
    creditIssued,
    unitsSold,
    stockReplenishedCount,
    stockReplenishedValue,
  };
}

export interface DayCumulativeItem {
  dayNumber: number;
  dateStr: string;
  dailyRevenue: number;
  dailyProfit: number;
  dailyUnits: number;
  cumulativeRevenue: number;
  cumulativeProfit: number;
  cumulativeUnits: number;
  orderCount: number;
  isToday: boolean;
  isFuture: boolean;
}

export interface MonthlyCumulativeStats {
  monthStr: string;
  daysInMonth: number;
  currentDay: number;
  cumulativeRevenue: number;
  cumulativeProfit: number;
  cumulativeUnits: number;
  totalOrders: number;
  averageDailyRevenue: number;
  projectedMonthEndRevenue: number;
  bestDay: { date: string; revenue: number } | null;
  dailyTrend: DayCumulativeItem[];
}

export function calculateMonthlyCumulative(
  orders: Order[],
  monthStr: string = '2026-09',
  todayDateStr: string = '2026-09-18'
): MonthlyCumulativeStats {
  const [year, month] = monthStr.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const currentDay = parseInt(todayDateStr.split('-')[2], 10);

  const monthOrders = orders.filter((o) => o.date.startsWith(monthStr));

  let runningRev = 0;
  let runningProfit = 0;
  let runningUnits = 0;
  let bestDay: { date: string; revenue: number } | null = null;

  const dailyTrend: DayCumulativeItem[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = `${monthStr}-${String(day).padStart(2, '0')}`;
    const isToday = dayStr === todayDateStr;
    const isFuture = day > currentDay;

    const ordersForDay = monthOrders.filter((o) => o.date === dayStr);

    let dayRev = 0;
    let dayProfit = 0;
    let dayUnits = 0;

    ordersForDay.forEach((o) => {
      dayRev += o.totalAmount;
      dayProfit += o.totalProfit;
      o.items.forEach((it) => {
        dayUnits += it.quantity;
      });
    });

    if (!isFuture) {
      runningRev += dayRev;
      runningProfit += dayProfit;
      runningUnits += dayUnits;

      if (dayRev > 0 && (!bestDay || dayRev > bestDay.revenue)) {
        bestDay = { date: dayStr, revenue: dayRev };
      }
    }

    dailyTrend.push({
      dayNumber: day,
      dateStr: dayStr,
      dailyRevenue: dayRev,
      dailyProfit: dayProfit,
      dailyUnits: dayUnits,
      cumulativeRevenue: runningRev,
      cumulativeProfit: runningProfit,
      cumulativeUnits: runningUnits,
      orderCount: ordersForDay.length,
      isToday,
      isFuture,
    });
  }

  const elapsedDays = Math.max(1, currentDay);
  const averageDailyRevenue = Math.round(runningRev / elapsedDays);
  const projectedMonthEndRevenue = averageDailyRevenue * daysInMonth;

  return {
    monthStr,
    daysInMonth,
    currentDay,
    cumulativeRevenue: runningRev,
    cumulativeProfit: runningProfit,
    cumulativeUnits: runningUnits,
    totalOrders: monthOrders.filter((o) => {
      const d = parseInt(o.date.split('-')[2], 10);
      return d <= currentDay;
    }).length,
    averageDailyRevenue,
    projectedMonthEndRevenue,
    bestDay,
    dailyTrend,
  };
}

export function formatCurrency(amount: number, symbol: string = 'KES'): string {
  return `${symbol} ${amount.toLocaleString('en-US')}`;
}
