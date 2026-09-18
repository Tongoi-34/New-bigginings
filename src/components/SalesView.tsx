import React, { useState } from 'react';
import { useDistributor } from '../context/DistributorContext';
import { calculateDaySummary, formatCurrency } from '../utils/analytics';
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  Receipt,
  Smartphone,
  Banknote,
  CreditCard,
  MapPin,
  Clock,
  CheckCircle2,
  TrendingUp,
  Share2,
  AlertCircle,
  Truck,
  DollarSign,
} from 'lucide-react';

interface SalesViewProps {
  onOpenNewSale: () => void;
  onOpenReceipt: (orderId: string) => void;
  onNavigateToReconcile: () => void;
}

export const SalesView: React.FC<SalesViewProps> = ({
  onOpenNewSale,
  onOpenReceipt,
  onNavigateToReconcile,
}) => {
  const { orders, selectedDate, currencySymbol, products } = useDistributor();

  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [filterEstate, setFilterEstate] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const dayOrders = orders.filter((o) => o.date === selectedDate);
  const daySummary = calculateDaySummary(selectedDate, orders, []);

  const estates = ['all', ...Array.from(new Set(orders.map((o) => o.estate)))];

  const filteredOrders = dayOrders.filter((ord) => {
    const matchesSearch =
      ord.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.estate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPay = filterPayment === 'all' || ord.paymentMethod === filterPayment;
    const matchesEstate = filterEstate === 'all' || ord.estate === filterEstate;
    return matchesSearch && matchesPay && matchesEstate;
  });

  return (
    <div className="space-y-5 pb-8">
      {/* Route Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-neutral-900 to-neutral-900 p-4 sm:p-5 rounded-3xl border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-amber-500 text-neutral-950 font-black text-[10px] tracking-wider uppercase">
              Field Route
            </span>
            <span className="text-xs font-semibold text-neutral-400">Date: {selectedDate}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-100 font-display mt-1">
            Van Route & Field Sales
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Record shop deliveries on the go with real-time stock & instant receipts
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewSale}
          className="py-3 px-5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold rounded-2xl flex items-center justify-center gap-2 text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Record New Delivery</span>
        </button>
      </div>

      {/* Live Route Pulse Ticker */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Today's Total Sales */}
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
          <div className="text-xs text-neutral-400 mb-1 flex items-center justify-between">
            <span>Today's Sales</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-neutral-100 font-display">
            {formatCurrency(daySummary.totalRevenue, currencySymbol)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1">
            <span>{daySummary.orderCount} deliveries done</span>
          </div>
        </div>

        {/* Today's Gross Profit */}
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
          <div className="text-xs text-emerald-400 font-semibold mb-1 flex items-center justify-between">
            <span>Today's Profit</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 font-display">
            +{formatCurrency(daySummary.grossProfit, currencySymbol)}
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-1">
            {daySummary.marginPercent}% distributor margin
          </div>
        </div>

        {/* Cash in Pocket */}
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
          <div className="text-xs text-neutral-400 mb-1 flex items-center justify-between">
            <span>Cash in Hand</span>
            <Banknote className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-400 font-display">
            {formatCurrency(daySummary.cashCollected, currencySymbol)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">Physical collected cash</div>
        </div>

        {/* M-Pesa / Credit balance */}
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
          <div className="text-xs text-neutral-400 mb-1 flex items-center justify-between">
            <span>M-Pesa / Transfers</span>
            <Smartphone className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 font-display">
            {formatCurrency(daySummary.mpesaCollected, currencySymbol)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            {daySummary.creditIssued > 0
              ? `Credit given: ${formatCurrency(daySummary.creditIssued, currencySymbol)}`
              : 'Zero credit today'}
          </div>
        </div>
      </div>

      {/* Quick Close of Day Callout */}
      <div className="p-3.5 bg-neutral-900/60 rounded-2xl border border-neutral-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-neutral-300 font-medium">Finished your route rounds for today?</span>
        </div>
        <button
          type="button"
          onClick={onNavigateToReconcile}
          className="text-amber-400 font-bold hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>Auto-Reconcile Day & Check Cash</span>
          <span>→</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search today's deliveries by shop, estate, or receipt #..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {['all', 'mpesa', 'cash', 'credit', 'split'].map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterPayment(mode)}
                className={`px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap uppercase font-bold transition-colors ${
                  filterPayment === mode
                    ? 'bg-amber-500 text-neutral-950'
                    : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {mode === 'all' ? 'All Payments' : mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Today's Orders / Sales Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <span>Deliveries recorded for {selectedDate} ({filteredOrders.length})</span>
          <span className="text-neutral-500">Tap order to view or share receipt</span>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center bg-neutral-900/50 rounded-2xl border border-neutral-800/80 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-neutral-800/80 text-neutral-400 mx-auto flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-200">No field sales recorded for this date</h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                Ready to unload goods? Tap "Record New Delivery" to pick an estate shop and start logging sales.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenNewSale}
              className="inline-flex items-center gap-2 py-2 px-4 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Record First Delivery</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredOrders.map((ord) => {
              const totalItemsCount = ord.items.reduce((acc, it) => acc + it.quantity, 0);

              return (
                <div
                  key={ord.id}
                  onClick={() => onOpenReceipt(ord.id)}
                  className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all cursor-pointer active:scale-[0.99] group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-neutral-100 text-sm group-hover:text-amber-400 transition-colors truncate">
                          {ord.customerName}
                        </h3>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 shrink-0">
                          {ord.estate}
                        </span>
                      </div>

                      <div className="text-xs text-neutral-400 mt-1 line-clamp-1">
                        {ord.items.map((it) => `${it.quantity}x ${it.productName}`).join(' • ')}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-black text-neutral-100 text-base font-display">
                        {formatCurrency(ord.totalAmount, currencySymbol)}
                      </div>
                      <div className="text-[11px] text-emerald-400 font-semibold">
                        +{formatCurrency(ord.totalProfit, currencySymbol)} profit
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-3 mt-3 border-t border-neutral-800/80">
                    <div className="flex items-center gap-2 text-neutral-500 text-[11px]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{ord.time}</span>
                      <span>•</span>
                      <span className="font-mono">{ord.orderNumber}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                          ord.paymentMethod === 'mpesa'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : ord.paymentMethod === 'cash'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : ord.paymentMethod === 'credit'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}
                      >
                        {ord.paymentMethod}
                      </span>
                      <span className="text-xs font-semibold text-neutral-400 group-hover:text-neutral-200 flex items-center gap-0.5">
                        <Receipt className="w-3 h-3 text-amber-400" />
                        <span>Receipt</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
