import React, { useState } from 'react';
import { useDistributor } from '../context/DistributorContext';
import { Customer, OrderItem, PaymentMethod } from '../types';
import { formatCurrency } from '../utils/analytics';
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  Store,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle,
  AlertTriangle,
  Search,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';

interface NewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCustomerId?: string;
  onSuccess: (orderId: string) => void;
  onOpenOnboard: () => void;
}

export const NewSaleModal: React.FC<NewSaleModalProps> = ({
  isOpen,
  onClose,
  preselectedCustomerId,
  onSuccess,
  onOpenOnboard,
}) => {
  const { products, customers, createOrder, selectedDate, currencySymbol } = useDistributor();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(preselectedCustomerId || '');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [productSearch, setProductSearch] = useState<string>('');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');
  const [mpesaRef, setMpesaRef] = useState<string>('');
  const [splitCashAmount, setSplitCashAmount] = useState<string>('');
  const [estateFilter, setEstateFilter] = useState<string>('all');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const estates = Array.from(new Set(customers.map((c) => c.estate)));
  const filteredCustomers = estateFilter === 'all' 
    ? customers 
    : customers.filter((c) => c.estate === estateFilter);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Typeable quantity handler
  const handleQuantityInput = (productId: string, rawValue: string) => {
    setErrorMsg('');
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    if (rawValue === '') {
      setQuantities((prev) => {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      });
      return;
    }

    const parsed = parseInt(rawValue, 10);
    if (isNaN(parsed) || parsed < 0) return;

    if (parsed > prod.stockOnHand) {
      setErrorMsg(
        `Cannot sell ${parsed} ${prod.unit}s of ${prod.name}. Van only has ${prod.stockOnHand} on hand!`
      );
      setTimeout(() => setErrorMsg(''), 4000);
      setQuantities((prev) => ({
        ...prev,
        [productId]: prod.stockOnHand,
      }));
      return;
    }

    setQuantities((prev) => ({
      ...prev,
      [productId]: parsed,
    }));
  };

  const handleStepQty = (productId: string, delta: number) => {
    setErrorMsg('');
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const current = quantities[productId] || 0;
    const next = Math.max(0, Math.min(prod.stockOnHand, current + delta));

    setQuantities((prev) => {
      if (next === 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return {
        ...prev,
        [productId]: next,
      };
    });
  };

  const handleSetMax = (productId: string) => {
    setErrorMsg('');
    const prod = products.find((p) => p.id === productId);
    if (!prod || prod.stockOnHand === 0) return;

    setQuantities((prev) => ({
      ...prev,
      [productId]: prod.stockOnHand,
    }));
  };

  const handleResetQuantities = () => {
    setErrorMsg('');
    setQuantities({});
  };

  // Filtered products list
  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      prod.category.toLowerCase().includes(productSearch.toLowerCase()) ||
      prod.unitPackSize.toLowerCase().includes(productSearch.toLowerCase());

    if (!matchesSearch) return false;
    if (onlyInStock) return prod.stockOnHand > 0;
    return true;
  });

  const selectedItems: OrderItem[] = [];
  let subtotal = 0;
  let estimatedProfit = 0;

  Object.entries(quantities).forEach(([prodId, qty]) => {
    if (qty > 0) {
      const prod = products.find((p) => p.id === prodId);
      if (prod) {
        const itemTotal = qty * prod.sellingPrice;
        const itemProfit = qty * (prod.sellingPrice - prod.buyingPrice);
        subtotal += itemTotal;
        estimatedProfit += itemProfit;
        selectedItems.push({
          productId: prod.id,
          productName: prod.name,
          unit: prod.unit,
          quantity: qty,
          buyingPrice: prod.buyingPrice,
          sellingPrice: prod.sellingPrice,
          total: itemTotal,
          profit: itemProfit,
        });
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setErrorMsg('Please select a retail shop/customer');
      return;
    }
    if (selectedItems.length === 0) {
      setErrorMsg('Please add at least one item to this sale');
      return;
    }

    const cust = selectedCustomer!;
    let amountPaid = subtotal;
    let amountCredit = 0;

    if (paymentMethod === 'credit') {
      amountPaid = 0;
      amountCredit = subtotal;
    } else if (paymentMethod === 'split') {
      const cashVal = parseFloat(splitCashAmount) || 0;
      amountPaid = Math.min(subtotal, Math.max(0, cashVal));
      amountCredit = subtotal - amountPaid;
    }

    // Check credit limit warning
    if (amountCredit > 0 && cust.outstandingCredit + amountCredit > cust.creditLimit) {
      const confirmExceed = window.confirm(
        `Warning: ${cust.shopName} currently owes ${formatCurrency(cust.outstandingCredit, currencySymbol)}. Adding this credit will exceed their limit of ${formatCurrency(cust.creditLimit, currencySymbol)}. Do you still want to approve this delivery?`
      );
      if (!confirmExceed) return;
    }

    const newOrder = createOrder({
      customerId: cust.id,
      customerName: cust.shopName,
      estate: cust.estate,
      date: selectedDate,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      items: selectedItems,
      totalAmount: subtotal,
      paymentMethod,
      amountPaid,
      amountCredit,
      paymentReference: paymentMethod === 'mpesa' ? mpesaRef || 'MPESA-AUTO' : undefined,
      status: amountCredit > 0 && amountPaid === 0 ? 'pending_payment' : 'completed',
    });

    onSuccess(newOrder.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-t-2xl sm:rounded-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100">Record Field Sale</h2>
              <p className="text-xs text-neutral-400">Date: {selectedDate} • Van Dispatch</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto p-5 space-y-5 flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-400 text-xs font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Customer Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-amber-400" />
                Select Estate Shop
              </label>
              <button
                type="button"
                onClick={onOpenOnboard}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Onboard New Shop
              </button>
            </div>

            {/* Estate quick filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar mb-2 text-xs">
              <button
                type="button"
                onClick={() => setEstateFilter('all')}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                  estateFilter === 'all'
                    ? 'bg-amber-500 text-neutral-950 font-bold'
                    : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                }`}
              >
                All Estates
              </button>
              {estates.map((est) => (
                <button
                  key={est}
                  type="button"
                  onClick={() => setEstateFilter(est)}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                    estateFilter === est
                      ? 'bg-amber-500 text-neutral-950 font-bold'
                      : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                  }`}
                >
                  {est}
                </button>
              ))}
            </div>

            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
            >
              <option value="">-- Choose shop to deliver --</option>
              {filteredCustomers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.shopName} ({c.estate}) {c.outstandingCredit > 0 ? `• Owes ${formatCurrency(c.outstandingCredit, currencySymbol)}` : ''}
                </option>
              ))}
            </select>

            {selectedCustomer && (
              <div className="mt-2 p-2.5 bg-neutral-950/80 border border-neutral-800/80 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-neutral-400">Contact:</span>{' '}
                  <span className="text-neutral-200 font-medium">{selectedCustomer.ownerName}</span> ({selectedCustomer.phone})
                </div>
                <div>
                  <span className="text-neutral-400">Credit Balance:</span>{' '}
                  <span className={`font-semibold ${selectedCustomer.outstandingCredit > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {formatCurrency(selectedCustomer.outstandingCredit, currencySymbol)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Product Items Selector */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <span>Van Stock Items to Sell</span>
                <span className="text-[11px] text-amber-400 font-normal lowercase">
                  (type quantity or name)
                </span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOnlyInStock(!onlyInStock)}
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border transition-colors cursor-pointer flex items-center gap-1 ${
                    onlyInStock
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                  }`}
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  <span>In Stock Only</span>
                </button>

                {Object.keys(quantities).length > 0 && (
                  <button
                    type="button"
                    onClick={handleResetQuantities}
                    className="text-[11px] font-semibold text-neutral-400 hover:text-rose-400 flex items-center gap-0.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>

            {/* Search Input for Products */}
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Type item name to filter (e.g. Cooking Oil, Flour, Milk)..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-8 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
              {productSearch && (
                <button
                  type="button"
                  onClick={() => setProductSearch('')}
                  className="absolute right-2.5 top-2 text-neutral-400 hover:text-neutral-200 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Products List with Direct Quantity Typing */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {filteredProducts.length === 0 ? (
                <div className="p-5 text-center border border-dashed border-neutral-800 rounded-xl bg-neutral-950/40 text-xs text-neutral-400">
                  {productSearch ? (
                    <span>No loaded products match "{productSearch}"</span>
                  ) : (
                    <span>No products available in the van stock.</span>
                  )}
                  {onlyInStock && (
                    <button
                      type="button"
                      onClick={() => setOnlyInStock(false)}
                      className="block mx-auto mt-1 text-amber-400 font-semibold hover:underline cursor-pointer"
                    >
                      Show out-of-stock items
                    </button>
                  )}
                </div>
              ) : (
                filteredProducts.map((prod) => {
                  const qty = quantities[prod.id] || 0;
                  const isOutOfStock = prod.stockOnHand === 0;
                  const isSelected = qty > 0;
                  const lineTotal = qty * prod.sellingPrice;
                  const remaining = prod.stockOnHand - qty;

                  return (
                    <div
                      key={prod.id}
                      className={`p-3 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-amber-500/5 border-amber-500/40 ring-1 ring-amber-500/20'
                          : isOutOfStock
                          ? 'bg-neutral-950/30 border-neutral-800/40 opacity-50'
                          : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        {/* Product Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-xs sm:text-sm font-semibold text-neutral-100 truncate">
                              {prod.name}
                            </h4>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 shrink-0">
                              {prod.unitPackSize || prod.unit}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-400 flex-wrap">
                            <span className="font-semibold text-neutral-200">
                              {formatCurrency(prod.sellingPrice, currencySymbol)}
                            </span>
                            <span>•</span>
                            <span
                              className={
                                prod.stockOnHand <= prod.minStockAlert
                                  ? 'text-amber-400 font-medium'
                                  : 'text-neutral-400'
                              }
                            >
                              Van Stock: {prod.stockOnHand} {prod.unit}s
                            </span>
                            {isSelected && (
                              <>
                                <span>•</span>
                                <span className="text-amber-400 font-bold">
                                  Line: {formatCurrency(lineTotal, currencySymbol)}
                                </span>
                                <span>•</span>
                                <span className="text-neutral-400">
                                  Left: {remaining}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Direct Type Input + Quick Steppers + Max */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                          {/* Decrement */}
                          <button
                            type="button"
                            disabled={isOutOfStock || qty === 0}
                            onClick={() => handleStepQty(prod.id, -1)}
                            className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:hover:bg-neutral-800 text-neutral-200 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>

                          {/* Direct Type Number Input */}
                          <div className="relative">
                            <input
                              type="number"
                              inputMode="numeric"
                              min="0"
                              max={prod.stockOnHand}
                              value={qty === 0 ? '' : qty}
                              disabled={isOutOfStock}
                              placeholder="0"
                              onChange={(e) => handleQuantityInput(prod.id, e.target.value)}
                              className={`w-16 h-7 text-center font-bold text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors ${
                                isSelected
                                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                                  : 'bg-neutral-900 border-neutral-800 text-neutral-300'
                              } disabled:opacity-40`}
                            />
                          </div>

                          {/* Increment */}
                          <button
                            type="button"
                            disabled={isOutOfStock || qty >= prod.stockOnHand}
                            onClick={() => handleStepQty(prod.id, 1)}
                            className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:hover:bg-neutral-800 text-neutral-200 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>

                          {/* Max Button */}
                          <button
                            type="button"
                            disabled={isOutOfStock || qty === prod.stockOnHand}
                            onClick={() => handleSetMax(prod.id)}
                            className="px-2 h-7 rounded-lg bg-neutral-800 hover:bg-amber-500/20 hover:text-amber-300 hover:border-amber-500/40 border border-neutral-700 disabled:opacity-40 text-[10px] font-bold text-neutral-300 transition-colors cursor-pointer"
                          >
                            Max
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
              Payment Terms & Mode
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPaymentMethod('mpesa')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-left ${
                  paymentMethod === 'mpesa'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-semibold'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div>M-Pesa / Mobile</div>
                  <div className="text-[10px] text-neutral-500 font-normal">Instant mobile transfer</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-left ${
                  paymentMethod === 'cash'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-semibold'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <Banknote className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div>Cash in Hand</div>
                  <div className="text-[10px] text-neutral-500 font-normal">Physical paper cash</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('credit')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-left ${
                  paymentMethod === 'credit'
                    ? 'bg-rose-500/10 border-rose-500 text-rose-400 font-semibold'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <CreditCard className="w-4 h-4 text-rose-400 shrink-0" />
                <div>
                  <div>Shop Credit (Pay Later)</div>
                  <div className="text-[10px] text-neutral-500 font-normal">Collect on next visit</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('split')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-left ${
                  paymentMethod === 'split'
                    ? 'bg-blue-500/10 border-blue-500 text-blue-400 font-semibold'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">
                  ½
                </div>
                <div>
                  <div>Part Cash / Part Credit</div>
                  <div className="text-[10px] text-neutral-500 font-normal">Split payment</div>
                </div>
              </button>
            </div>

            {paymentMethod === 'mpesa' && (
              <div className="mt-3">
                <label className="text-[11px] text-neutral-400 block mb-1">M-Pesa Transaction Ref Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. RK992178B"
                  value={mpesaRef}
                  onChange={(e) => setMpesaRef(e.target.value.toUpperCase())}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            )}

            {paymentMethod === 'split' && (
              <div className="mt-3 p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
                <label className="text-xs text-neutral-300 block">Cash Paid Today ({currencySymbol}):</label>
                <input
                  type="number"
                  placeholder="e.g. 2000"
                  value={splitCashAmount}
                  onChange={(e) => setSplitCashAmount(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100"
                />
                <div className="text-xs text-neutral-400 flex justify-between">
                  <span>Balance Added to Debt:</span>
                  <span className="text-rose-400 font-bold">
                    {formatCurrency(
                      Math.max(0, subtotal - (parseFloat(splitCashAmount) || 0)),
                      currencySymbol
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Sticky Footer with Totals */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950">
          <div className="flex items-center justify-between mb-3 text-xs">
            <div>
              <span className="text-neutral-400">Items: </span>
              <span className="font-semibold text-neutral-200">{selectedItems.reduce((a, b) => a + b.quantity, 0)} units</span>
              <span className="mx-2 text-neutral-600">•</span>
              <span className="text-neutral-400">Est. Profit: </span>
              <span className="font-bold text-emerald-400">{formatCurrency(estimatedProfit, currencySymbol)}</span>
            </div>
            <div className="text-right">
              <span className="text-neutral-400 mr-1">Total Bill:</span>
              <span className="text-lg font-extrabold text-neutral-100 font-display">
                {formatCurrency(subtotal, currencySymbol)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={subtotal === 0 || !selectedCustomerId}
            className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 disabled:bg-neutral-800 disabled:text-neutral-600 text-neutral-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer shadow-lg shadow-amber-500/10"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Complete Field Delivery & Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
