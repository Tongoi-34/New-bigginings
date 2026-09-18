import React, { useState } from 'react';
import { useDistributor } from '../context/DistributorContext';
import { Product } from '../types';
import { formatCurrency } from '../utils/analytics';
import {
  X,
  PackageMinus,
  Search,
  AlertTriangle,
  CheckCircle2,
  Warehouse,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';

interface UnloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedProduct?: Product;
}

const COMMON_REASONS = [
  'Factory Depot Return',
  'End-of-Day Warehouse Offload',
  'Damaged / Defective Goods',
  'Vehicle Stock Transfer',
  'Slow-moving SKU Return',
  'Other / Custom',
];

export const UnloadModal: React.FC<UnloadModalProps> = ({
  isOpen,
  onClose,
  preselectedProduct,
}) => {
  const { products, unloadInventory, currencySymbol } = useDistributor();

  // Search/type query to quickly find items to unload
  const [searchQuery, setSearchQuery] = useState('');
  // Quantities mapped by productId: string -> quantity to unload
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    if (preselectedProduct && preselectedProduct.stockOnHand > 0) {
      return { [preselectedProduct.id]: Math.min(1, preselectedProduct.stockOnHand) };
    }
    return {};
  });

  const [reason, setReason] = useState<string>('Factory Depot Return');
  const [customReason, setCustomReason] = useState<string>('');
  const [waybillOrNote, setWaybillOrNote] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [onlyShowInStock, setOnlyShowInStock] = useState<boolean>(true);

  if (!isOpen) return null;

  // Filter products by search query (name, category, pack size) and stock availability
  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.unitPackSize.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (onlyShowInStock) return prod.stockOnHand > 0;
    return true;
  });

  // Calculate items with positive unload quantity
  const itemsToUnloadList = Object.entries(quantities)
    .filter(([, qty]) => qty > 0)
    .map(([prodId, qty]) => {
      const prod = products.find((p) => p.id === prodId);
      return {
        product: prod!,
        quantity: qty,
      };
    })
    .filter((item) => item.product !== undefined);

  const totalUnitsToUnload = itemsToUnloadList.reduce((sum, item) => sum + item.quantity, 0);
  const totalValuationToUnload = itemsToUnloadList.reduce(
    (sum, item) => sum + item.quantity * item.product.buyingPrice,
    0
  );

  // Handle typing or incrementing quantity
  const handleQuantityChange = (productId: string, rawValue: string) => {
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
        `Cannot unload ${parsed} ${prod.unit}s of ${prod.name}. Only ${prod.stockOnHand} currently in van!`
      );
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

    setQuantities((prev) => ({
      ...prev,
      [productId]: next,
    }));
  };

  const handleSetMax = (productId: string) => {
    setErrorMsg('');
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    setQuantities((prev) => ({
      ...prev,
      [productId]: prod.stockOnHand,
    }));
  };

  const handleUnloadAllVanStock = () => {
    setErrorMsg('');
    const allStock: Record<string, number> = {};
    products.forEach((p) => {
      if (p.stockOnHand > 0) {
        allStock[p.id] = p.stockOnHand;
      }
    });
    setQuantities(allStock);
  };

  const handleClearAllSelections = () => {
    setErrorMsg('');
    setQuantities({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (itemsToUnloadList.length === 0) {
      setErrorMsg('Please type in quantities for at least one item to unload.');
      return;
    }

    // Verify all quantities are valid and not exceeding stock
    for (const item of itemsToUnloadList) {
      if (item.quantity > item.product.stockOnHand) {
        setErrorMsg(
          `Cannot unload ${item.quantity} ${item.product.unit}s of ${item.product.name}. Van only has ${item.product.stockOnHand}.`
        );
        return;
      }
    }

    const finalReason = reason === 'Other / Custom' ? (customReason.trim() || 'Custom Offload') : reason;

    unloadInventory(
      itemsToUnloadList.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
      finalReason,
      waybillOrNote.trim() || undefined
    );

    onClose();
  };

  const totalLoadedVanUnits = products.reduce((acc, p) => acc + p.stockOnHand, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-xl max-h-[92vh] sm:max-h-[85vh] bg-neutral-900 border border-neutral-800 rounded-t-2xl sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-neutral-900/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <PackageMinus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-neutral-100">Unload Items from Van</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-semibold border border-neutral-700">
                  {totalLoadedVanUnits} units on board
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Type item names and enter quantities to return or offload
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300 text-xs font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Search / Typeahead bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <span>1. Type Items to Unload</span>
                <span className="text-[11px] text-amber-400 font-normal lowercase">
                  (type name to search)
                </span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOnlyShowInStock(!onlyShowInStock)}
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border transition-colors cursor-pointer flex items-center gap-1 ${
                    onlyShowInStock
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                  }`}
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  <span>In Stock Only</span>
                </button>
                {totalLoadedVanUnits > 0 && (
                  <button
                    type="button"
                    onClick={handleUnloadAllVanStock}
                    className="text-[11px] font-semibold text-neutral-300 hover:text-amber-400 underline underline-offset-2 cursor-pointer"
                  >
                    Unload All Stock
                  </button>
                )}
                {Object.keys(quantities).length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllSelections}
                    className="text-[11px] font-semibold text-neutral-400 hover:text-rose-400 flex items-center gap-0.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type item name (e.g. Cooking Oil, Flour, Soap, Soda)..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-8 py-2.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
                autoFocus={!preselectedProduct}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-200 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Product list with editable quantity fields */}
          <div className="space-y-2 max-h-64 sm:max-h-72 overflow-y-auto pr-1">
            {filteredProducts.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-neutral-800 rounded-2xl bg-neutral-950/40 space-y-2">
                <Warehouse className="w-8 h-8 text-neutral-600 mx-auto" />
                <p className="text-xs text-neutral-400">
                  {searchQuery
                    ? `No loaded items matching "${searchQuery}"`
                    : 'No loaded inventory available to unload.'}
                </p>
                {onlyShowInStock && (
                  <button
                    type="button"
                    onClick={() => setOnlyShowInStock(false)}
                    className="text-xs text-amber-400 hover:underline font-semibold"
                  >
                    View zero-stock items
                  </button>
                )}
              </div>
            ) : (
              filteredProducts.map((prod) => {
                const qtySelected = quantities[prod.id] || 0;
                const isSelected = qtySelected > 0;
                const remaining = prod.stockOnHand - qtySelected;

                return (
                  <div
                    key={prod.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-amber-500/5 border-amber-500/40 ring-1 ring-amber-500/20'
                        : 'bg-neutral-950/60 border-neutral-800/80 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      {/* Product Name & Specs */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-neutral-100 truncate">
                            {prod.name}
                          </h4>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 font-medium shrink-0">
                            {prod.unitPackSize}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-neutral-400">
                          <span>
                            Van Stock:{' '}
                            <strong className="text-neutral-200">
                              {prod.stockOnHand} {prod.unit}s
                            </strong>
                          </span>
                          <span>•</span>
                          <span>
                            Cost:{' '}
                            <strong className="text-neutral-300">
                              {formatCurrency(prod.buyingPrice, currencySymbol)}
                            </strong>
                          </span>
                          {isSelected && (
                            <>
                              <span>•</span>
                              <span className="text-amber-400 font-semibold">
                                Remaining: {remaining} {prod.unit}s
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Quantity Input Area */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        {/* Quick Minus */}
                        <button
                          type="button"
                          disabled={prod.stockOnHand === 0 || qtySelected === 0}
                          onClick={() => handleStepQty(prod.id, -1)}
                          className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:hover:bg-neutral-800 text-neutral-200 text-sm font-bold flex items-center justify-center transition-colors cursor-pointer"
                        >
                          -
                        </button>

                        {/* Direct Type Input */}
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max={prod.stockOnHand}
                            value={qtySelected === 0 ? '' : qtySelected}
                            disabled={prod.stockOnHand === 0}
                            placeholder="0"
                            onChange={(e) => handleQuantityChange(prod.id, e.target.value)}
                            className={`w-16 h-7 text-center font-bold text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors ${
                              isSelected
                                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                                : 'bg-neutral-900 border-neutral-800 text-neutral-300'
                            } disabled:opacity-40`}
                          />
                        </div>

                        {/* Quick Plus */}
                        <button
                          type="button"
                          disabled={prod.stockOnHand === 0 || qtySelected >= prod.stockOnHand}
                          onClick={() => handleStepQty(prod.id, 1)}
                          className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:hover:bg-neutral-800 text-neutral-200 text-sm font-bold flex items-center justify-center transition-colors cursor-pointer"
                        >
                          +
                        </button>

                        {/* Max Button */}
                        <button
                          type="button"
                          disabled={prod.stockOnHand === 0 || qtySelected === prod.stockOnHand}
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

          {/* Reason / Destination Selection */}
          <div className="space-y-2 pt-2 border-t border-neutral-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
              2. Destination & Unload Reason
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {COMMON_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-medium text-left border transition-all truncate cursor-pointer ${
                    reason === r
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                      : 'bg-neutral-950 border-neutral-800/90 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                  }`}
                  title={r}
                >
                  {r}
                </button>
              ))}
            </div>

            {reason === 'Other / Custom' && (
              <input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Specify reason (e.g. Returned to Nairobi East Depot)..."
                className="w-full mt-1.5 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
              />
            )}
          </div>

          {/* Waybill / Depot Gate Pass / Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-400">
              Reference / Gate Pass / Notes (Optional)
            </label>
            <input
              type="text"
              value={waybillOrNote}
              onChange={(e) => setWaybillOrNote(e.target.value)}
              placeholder="e.g. Return Waybill #9021, Depot Bay 3, Signed by Storekeeper"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </form>

        {/* Footer Summary & Action */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 shrink-0 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="text-neutral-400">Selected for Unload:</span>
              <div className="font-bold text-neutral-200">
                <span className="text-amber-400 font-extrabold text-sm mr-1">
                  {totalUnitsToUnload}
                </span>{' '}
                Units across {itemsToUnloadList.length} SKUs
              </div>
            </div>
            <div className="text-right space-y-0.5">
              <span className="text-neutral-400">Valuation Deducted:</span>
              <div className="font-bold text-neutral-200 text-sm">
                {formatCurrency(totalValuationToUnload, currencySymbol)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={totalUnitsToUnload === 0}
              className="flex-2 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-neutral-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Unload ({totalUnitsToUnload} Units)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
