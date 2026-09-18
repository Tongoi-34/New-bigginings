import React, { useState } from 'react';
import { useDistributor } from '../context/DistributorContext';
import { Customer } from '../types';
import { formatCurrency } from '../utils/analytics';
import {
  Store,
  UserPlus,
  Search,
  MapPin,
  Phone,
  CreditCard,
  History,
  ShoppingBag,
  HandCoins,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';

interface CustomersViewProps {
  onOpenOnboard: () => void;
  onOpenNewSaleForCustomer: (customerId: string) => void;
  onOpenCollectCredit: (customer: Customer) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  onOpenOnboard,
  onOpenNewSaleForCustomer,
  onOpenCollectCredit,
}) => {
  const { customers, orders, currencySymbol } = useDistributor();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEstate, setSelectedEstate] = useState('all');
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState<Customer | null>(null);

  const estates = ['all', ...Array.from(new Set(customers.map((c) => c.estate)))];

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.estate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery);
    const matchesEstate = selectedEstate === 'all' || c.estate === selectedEstate;
    return matchesSearch && matchesEstate;
  });

  const totalOutstandingCredit = customers.reduce((acc, c) => acc + c.outstandingCredit, 0);

  // Get orders for selected customer detail view
  const customerOrders = selectedCustomerDetail
    ? orders.filter((o) => o.customerId === selectedCustomerDetail.id)
    : [];

  // Group products ordered by this customer to answer "which customers ordered what product"
  const customerProductHistory: Record<string, { name: string; unit: string; totalQty: number; totalSpent: number }> =
    {};
  customerOrders.forEach((ord) => {
    ord.items.forEach((it) => {
      if (!customerProductHistory[it.productId]) {
        customerProductHistory[it.productId] = {
          name: it.productName,
          unit: it.unit,
          totalQty: 0,
          totalSpent: 0,
        };
      }
      customerProductHistory[it.productId].totalQty += it.quantity;
      customerProductHistory[it.productId].totalSpent += it.total;
    });
  });

  const customerProductsList = Object.values(customerProductHistory).sort(
    (a, b) => b.totalQty - a.totalQty
  );

  return (
    <div className="space-y-5 pb-8">
      {/* Header with Quick Onboard Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900/80 p-4 rounded-2xl border border-neutral-800 backdrop-blur-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Store className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-lg font-bold text-neutral-100 font-display">
                Customer Shops & Estate Accounts
              </h1>
              <p className="text-xs text-neutral-400">
                Onboard retail shops, monitor order histories & collect credit
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={onOpenOnboard}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-lg shadow-amber-500/10"
          >
            <UserPlus className="w-4 h-4" />
            <span>Onboard New Shop</span>
          </button>
        </div>
      </div>

      {/* Credit Risk & Portfolio Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
          <div className="text-neutral-400 text-xs mb-1">Active Retail Accounts</div>
          <div className="text-2xl font-black text-neutral-100 font-display">
            {customers.length} <span className="text-xs font-normal text-neutral-400">shops</span>
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Across {estates.length - 1} estate routes</div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
          <div className="text-neutral-400 text-xs mb-1">Total Shop Credit (Debts)</div>
          <div className="text-2xl font-black text-rose-400 font-display">
            {formatCurrency(totalOutstandingCredit, currencySymbol)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">
            {customers.filter((c) => c.outstandingCredit > 0).length} shops owe balances
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
          <div className="text-neutral-400 text-xs mb-1">Total Delivered Volume</div>
          <div className="text-2xl font-black text-emerald-400 font-display">
            {formatCurrency(
              customers.reduce((acc, c) => acc + c.totalSpent, 0),
              currencySymbol
            )}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Cumulative retail billing</div>
        </div>
      </div>

      {/* Search and Estate Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by shop name, owner, phone, or estate..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {estates.map((est) => (
            <button
              key={est}
              onClick={() => setSelectedEstate(est)}
              className={`px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap capitalize transition-colors ${
                selectedEstate === est
                  ? 'bg-neutral-800 text-amber-400 font-bold border border-amber-500/30'
                  : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:border-neutral-700'
              }`}
            >
              {est === 'all' ? 'All Routes' : est}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Shop Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredCustomers.map((cust) => {
          const hasDebt = cust.outstandingCredit > 0;
          const isNearCreditLimit = hasDebt && cust.outstandingCredit >= cust.creditLimit * 0.8;

          return (
            <div
              key={cust.id}
              className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-neutral-100 text-base">{cust.shopName}</h3>
                    <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                      <span className="text-neutral-200 font-medium">{cust.ownerName}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-amber-400">
                        <MapPin className="w-3 h-3" />
                        {cust.estate}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                      hasDebt
                        ? isNearCreditLimit
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {hasDebt ? `Owes ${formatCurrency(cust.outstandingCredit, currencySymbol)}` : 'Zero Debt'}
                  </span>
                </div>

                {cust.landmark && (
                  <p className="text-[11px] text-neutral-400 mt-2 bg-neutral-950 p-2 rounded-lg border border-neutral-800/80">
                    📍 {cust.landmark}
                  </p>
                )}

                {/* Performance stats mini-bar */}
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-neutral-800/80 text-xs">
                  <div>
                    <div className="text-[10px] uppercase text-neutral-500">Orders</div>
                    <div className="font-bold text-neutral-200">{cust.totalOrdersCount} orders</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-neutral-500">Total Spend</div>
                    <div className="font-bold text-neutral-200">
                      {formatCurrency(cust.totalSpent, currencySymbol)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-neutral-500">Credit Limit</div>
                    <div className="font-semibold text-neutral-400">
                      {formatCurrency(cust.creditLimit, currencySymbol)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => onOpenNewSaleForCustomer(cust.id)}
                  className="py-1.5 px-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Deliver</span>
                </button>

                {hasDebt ? (
                  <button
                    type="button"
                    onClick={() => onOpenCollectCredit(cust)}
                    className="py-1.5 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
                  >
                    <HandCoins className="w-3.5 h-3.5" />
                    <span>Collect</span>
                  </button>
                ) : (
                  <a
                    href={`tel:${cust.phone}`}
                    className="py-1.5 px-2 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 font-semibold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Call Shop</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedCustomerDetail(cust)}
                  className="py-1.5 px-2 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 font-semibold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <History className="w-3.5 h-3.5 text-amber-400" />
                  <span>History</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CUSTOMER DETAIL MODAL / SLIDEOUT SHEET: Shows which products this customer ordered */}
      {selectedCustomerDetail && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4">
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-900 sticky top-0 z-10">
              <div>
                <h2 className="text-base font-bold text-neutral-100">{selectedCustomerDetail.shopName}</h2>
                <p className="text-xs text-neutral-400">
                  {selectedCustomerDetail.estate} • Owner: {selectedCustomerDetail.ownerName}
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomerDetail(null)}
                className="p-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* Debt and Overview */}
              <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between text-xs">
                <div>
                  <div className="text-neutral-400">Total Purchase Volume</div>
                  <div className="text-lg font-black text-neutral-100 font-display">
                    {formatCurrency(selectedCustomerDetail.totalSpent, currencySymbol)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-neutral-400">Outstanding Debt</div>
                  <div
                    className={`text-lg font-black font-display ${
                      selectedCustomerDetail.outstandingCredit > 0 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {formatCurrency(selectedCustomerDetail.outstandingCredit, currencySymbol)}
                  </div>
                </div>
              </div>

              {/* WHICH CUSTOMER ORDERED WHAT PRODUCT BREAKDOWN */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                  Merchandise Ordered by this Customer
                </h3>

                {customerProductsList.length === 0 ? (
                  <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 text-center text-xs text-neutral-500">
                    No orders recorded for this shop yet.
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-800 bg-neutral-950 rounded-xl border border-neutral-800 overflow-hidden text-xs">
                    {customerProductsList.map((prod, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-neutral-200">{prod.name}</div>
                          <div className="text-[11px] text-neutral-400">
                            Total Delivered: <strong className="text-neutral-200">{prod.totalQty} {prod.unit}s</strong>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-neutral-100">
                            {formatCurrency(prod.totalSpent, currencySymbol)}
                          </div>
                          <span className="text-[10px] text-neutral-500">Gross spend</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Specific Order Tickets History */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-amber-400" />
                  Order Delivery Tickets ({customerOrders.length})
                </h3>

                <div className="space-y-2">
                  {customerOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-3 bg-neutral-950 rounded-xl border border-neutral-800/80 text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-mono text-neutral-300 font-bold">{ord.orderNumber}</div>
                        <div className="text-neutral-400 text-[11px]">
                          {ord.date} {ord.time} • {ord.items.map((it) => `${it.quantity}x ${it.productName}`).join(', ')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-neutral-100">
                          {formatCurrency(ord.totalAmount, currencySymbol)}
                        </div>
                        <span className="text-[10px] uppercase font-bold text-amber-400">
                          {ord.paymentMethod}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const cId = selectedCustomerDetail.id;
                  setSelectedCustomerDetail(null);
                  onOpenNewSaleForCustomer(cId);
                }}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>New Sale for this Shop</span>
              </button>

              {selectedCustomerDetail.outstandingCredit > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const c = selectedCustomerDetail;
                    setSelectedCustomerDetail(null);
                    onOpenCollectCredit(c);
                  }}
                  className="py-2.5 px-4 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 font-bold rounded-xl text-xs"
                >
                  Collect Debt
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
