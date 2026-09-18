import React, { useState } from 'react';
import { useDistributor } from '../context/DistributorContext';
import { calculateDaySummary, formatCurrency } from '../utils/analytics';
import {
  Calculator,
  Calendar,
  DollarSign,
  TrendingUp,
  Banknote,
  Smartphone,
  CreditCard,
  Package,
  CheckCircle2,
  Copy,
  Check,
  Share2,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export const ReconciliationView: React.FC = () => {
  const {
    selectedDate,
    setSelectedDate,
    orders,
    replenishments,
    dailyReconciliations,
    reconcileDay,
    currencySymbol,
    products,
  } = useDistributor();

  const [actualCashInput, setActualCashInput] = useState<string>('');
  const [reconcileNotes, setReconcileNotes] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [showCountDrawer, setShowCountDrawer] = useState<boolean>(false);

  const daySummary = calculateDaySummary(selectedDate, orders, replenishments);
  const isReconciled = !!dailyReconciliations[selectedDate]?.isClosed;
  const savedRecon = dailyReconciliations[selectedDate];

  // Group products sold today
  const dayOrders = orders.filter((o) => o.date === selectedDate);
  const productsSoldMap: Record<
    string,
    { name: string; unit: string; qty: number; revenue: number; profit: number }
  > = {};

  dayOrders.forEach((order) => {
    order.items.forEach((item) => {
      if (!productsSoldMap[item.productId]) {
        productsSoldMap[item.productId] = {
          name: item.productName,
          unit: item.unit,
          qty: 0,
          revenue: 0,
          profit: 0,
        };
      }
      productsSoldMap[item.productId].qty += item.quantity;
      productsSoldMap[item.productId].revenue += item.total;
      productsSoldMap[item.productId].profit += item.profit;
    });
  });

  const productsSoldList = Object.values(productsSoldMap).sort((a, b) => b.qty - a.qty);

  // Cash variance logic
  const cashCountedNum =
    actualCashInput !== ''
      ? parseFloat(actualCashInput)
      : savedRecon?.actualCashCounted ?? daySummary.cashCollected;
  const cashVariance = (cashCountedNum || 0) - daySummary.cashCollected;

  const handleCloseDay = (e: React.FormEvent) => {
    e.preventDefault();
    const cashVal = parseFloat(actualCashInput) || daySummary.cashCollected;
    reconcileDay(selectedDate, cashVal, reconcileNotes);
    setShowCountDrawer(false);
  };

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const dailyReportText = `*UZA-UZA CLOSE-OF-DAY RECONCILIATION*
Date: ${selectedDate}
Status: ${isReconciled ? 'RECONCILED & CLOSED' : 'ACTIVE / OPEN'}
------------------------------------
*FINANCIAL PERFORMANCE:*
• Total Gross Sales: ${formatCurrency(daySummary.totalRevenue, currencySymbol)}
• Cost of Goods Sold (COGS): ${formatCurrency(daySummary.totalCost, currencySymbol)}
• Net Gross Profit: ${formatCurrency(daySummary.grossProfit, currencySymbol)} (${daySummary.marginPercent}% margin)
• Completed Shop Orders: ${daySummary.orderCount}
• Total Physical Units Sold: ${daySummary.unitsSold}

*PAYMENT COLLECTION BREAKDOWN:*
• Cash in Hand Collected: ${formatCurrency(daySummary.cashCollected, currencySymbol)}
• M-Pesa / Mobile Money: ${formatCurrency(daySummary.mpesaCollected, currencySymbol)}
• Shop Credit Extended: ${formatCurrency(daySummary.creditIssued, currencySymbol)}

*PHYSICAL CASH AUDIT:*
• Expected Cash: ${formatCurrency(daySummary.cashCollected, currencySymbol)}
• Cash Counted: ${formatCurrency(cashCountedNum, currencySymbol)}
• Cash Variance: ${cashVariance === 0 ? 'Balanced (KES 0.00)' : formatCurrency(cashVariance, currencySymbol)}

*MERCHANDISE DISPATCHED TODAY:*
${productsSoldList.map((p) => `• ${p.name}: ${p.qty} ${p.unit}s (${formatCurrency(p.revenue, currencySymbol)})`).join('\n') || '• No products sold'}
------------------------------------
Generated automatically by uza-uza distributor engine.`;

  const handleCopyReport = () => {
    navigator.clipboard.writeText(dailyReportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(dailyReportText);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Date Switcher & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900/80 p-4 rounded-2xl border border-neutral-800 backdrop-blur-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Calculator className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-lg font-bold text-neutral-100 font-display">
                Close-of-Day Reconciliation
              </h1>
              <p className="text-xs text-neutral-400">
                Zero manual math • Automatic audit of sales, stock & cash
              </p>
            </div>
          </div>
        </div>

        {/* Date Selector Navigation */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handlePrevDay}
            className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 hover:text-neutral-100 hover:border-neutral-700 transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl">
            <Calendar className="w-4 h-4 text-amber-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-semibold text-neutral-100 focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={handleNextDay}
            className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 hover:text-neutral-100 hover:border-neutral-700 transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {isReconciled ? (
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Closed
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Active
            </span>
          )}
        </div>
      </div>

      {/* Hero Financial Ticker Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Gross Revenue */}
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-medium mb-1">
            <span>Gross Sales Revenue</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-neutral-100 font-display">
            {formatCurrency(daySummary.totalRevenue, currencySymbol)}
          </div>
          <div className="mt-1 text-[11px] text-neutral-400">
            {daySummary.orderCount} shop deliveries today
          </div>
        </div>

        {/* Cost of Goods Sold */}
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-medium mb-1">
            <span>Merchandise Cost (COGS)</span>
            <Package className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-neutral-200 font-display">
            {formatCurrency(daySummary.totalCost, currencySymbol)}
          </div>
          <div className="mt-1 text-[11px] text-neutral-400">
            Factory load acquisition cost
          </div>
        </div>

        {/* Net Profit */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-neutral-900 to-neutral-900 border border-emerald-500/30">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold mb-1">
            <span>Day's Net Gross Profit</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 font-display">
            {formatCurrency(daySummary.grossProfit, currencySymbol)}
          </div>
          <div className="mt-1 text-[11px] text-emerald-400/80 font-medium">
            {daySummary.marginPercent}% average gross margin
          </div>
        </div>

        {/* Physical Units Dispatched */}
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-medium mb-1">
            <span>Units Delivered</span>
            <Package className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-neutral-100 font-display">
            {daySummary.unitsSold} <span className="text-sm font-normal text-neutral-400">packs</span>
          </div>
          <div className="mt-1 text-[11px] text-neutral-400">
            Across {productsSoldList.length} different product lines
          </div>
        </div>
      </div>

      {/* Cash vs Mobile vs Credit Reconciliation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Cash in Hand */}
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Banknote className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-neutral-300">Cash in Hand</div>
              <div className="text-[10px] text-neutral-500">Physical paper currency</div>
            </div>
          </div>
          <div className="text-lg font-bold text-amber-400 font-display">
            {formatCurrency(daySummary.cashCollected, currencySymbol)}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            Cash collected from estate shopkeepers
          </p>
        </div>

        {/* M-Pesa / Mobile Money */}
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-neutral-300">Mobile Money / M-Pesa</div>
              <div className="text-[10px] text-neutral-500">Direct mobile transfers</div>
            </div>
          </div>
          <div className="text-lg font-bold text-emerald-400 font-display">
            {formatCurrency(daySummary.mpesaCollected, currencySymbol)}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            Sent to Till / Paybill / Phone wallet
          </p>
        </div>

        {/* Shop Credit / Debt Extended */}
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-neutral-300">Shop Credit Allowed</div>
              <div className="text-[10px] text-neutral-500">Accounts Receivable (Debts)</div>
            </div>
          </div>
          <div className="text-lg font-bold text-rose-400 font-display">
            {formatCurrency(daySummary.creditIssued, currencySymbol)}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            To be collected on subsequent route rounds
          </p>
        </div>
      </div>

      {/* PHYSICAL CASH AUDIT & CLOSE-OF-DAY LOCK */}
      <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800/80 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-neutral-100">End-of-Day Cash Drawer Audit</h3>
              <p className="text-xs text-neutral-400">Verify pocket cash against calculated sales</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowCountDrawer(!showCountDrawer)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-colors self-start sm:self-auto"
          >
            {showCountDrawer ? 'Hide Cash Input' : 'Audit Physical Cash'}
          </button>
        </div>

        {showCountDrawer && (
          <form onSubmit={handleCloseDay} className="p-4 bg-neutral-950 rounded-xl border border-neutral-800/90 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Physical Cash Counted in Pocket ({currencySymbol})
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder={String(daySummary.cashCollected)}
                  value={actualCashInput}
                  onChange={(e) => setActualCashInput(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-neutral-100 font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Reconciliation Notes / Trip Observations
                </label>
                <input
                  type="text"
                  placeholder="e.g. Spent 500 on van fuel, all shops paid on time"
                  value={reconcileNotes}
                  onChange={(e) => setReconcileNotes(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Variance indicator */}
            <div className="p-3 bg-neutral-900 rounded-lg flex items-center justify-between text-xs">
              <div>
                <span className="text-neutral-400">Expected Cash: </span>
                <span className="font-semibold text-neutral-200">
                  {formatCurrency(daySummary.cashCollected, currencySymbol)}
                </span>
              </div>
              <div>
                <span className="text-neutral-400">Variance: </span>
                <span
                  className={`font-extrabold ${
                    cashVariance === 0
                      ? 'text-emerald-400'
                      : cashVariance > 0
                      ? 'text-blue-400'
                      : 'text-rose-400'
                  }`}
                >
                  {cashVariance === 0
                    ? 'Perfect Balance (0.00)'
                    : cashVariance > 0
                    ? `+${formatCurrency(cashVariance, currencySymbol)} (Surplus)`
                    : `${formatCurrency(cashVariance, currencySymbol)} (Shortage)`}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Cash Audit & Mark Day as Reconciled</span>
            </button>
          </form>
        )}

        {/* Quick Report Share Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
          <div className="text-xs text-neutral-400">
            Send this daily reconciliation to factory partners, route accountants, or store for records.
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyReport}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Day Sheet'}</span>
            </button>
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-emerald-600/10"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share via WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* Product Dispatches / Sales Breakdown Table */}
      <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-400" />
            Products Delivered Today
          </h3>
          <span className="text-xs text-neutral-400">
            {productsSoldList.length} items moved
          </span>
        </div>

        {productsSoldList.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 text-xs">
            No products sold on {selectedDate} yet. Tap "+ New Sale" to record sales on your route!
          </div>
        ) : (
          <div className="divide-y divide-neutral-800/80 bg-neutral-950 rounded-xl border border-neutral-800/80 overflow-hidden">
            {productsSoldList.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 flex items-center justify-between text-xs hover:bg-neutral-900/40 transition-colors"
              >
                <div>
                  <div className="font-semibold text-neutral-200 text-sm">{item.name}</div>
                  <div className="text-neutral-400 mt-0.5">
                    Quantity Delivered:{' '}
                    <strong className="text-neutral-200">
                      {item.qty} {item.unit}s
                    </strong>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-neutral-100 text-sm">
                    {formatCurrency(item.revenue, currencySymbol)}
                  </div>
                  <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                    +{formatCurrency(item.profit, currencySymbol)} profit
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Today's individual shop delivery tickets */}
      <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-100">
            Today's Shop Delivery Tickets ({dayOrders.length})
          </h3>
          <span className="text-xs text-neutral-500">Detailed transaction log</span>
        </div>

        {dayOrders.length === 0 ? (
          <div className="text-center py-6 text-neutral-500 text-xs">
            No delivery tickets recorded for this day.
          </div>
        ) : (
          <div className="space-y-2">
            {dayOrders.map((ord) => (
              <div
                key={ord.id}
                className="p-3 bg-neutral-950 rounded-xl border border-neutral-800/80 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-200">{ord.customerName}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
                      {ord.estate}
                    </span>
                  </div>
                  <div className="text-neutral-400 mt-1">
                    {ord.time} • {ord.items.map((it) => `${it.quantity}x ${it.productName}`).join(', ')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-neutral-100">
                    {formatCurrency(ord.totalAmount, currencySymbol)}
                  </div>
                  <div className="text-[10px] uppercase font-semibold text-amber-400">
                    {ord.paymentMethod}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
