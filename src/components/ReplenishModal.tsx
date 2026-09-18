import React, { useState } from 'react';
import { useDistributor } from '../context/DistributorContext';
import { Product } from '../types';
import { formatCurrency } from '../utils/analytics';
import { X, Truck, PackagePlus, AlertCircle } from 'lucide-react';

interface ReplenishModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedProduct?: Product;
}

export const ReplenishModal: React.FC<ReplenishModalProps> = ({
  isOpen,
  onClose,
  preselectedProduct,
}) => {
  const { products, replenishInventory, currencySymbol } = useDistributor();

  const [productId, setProductId] = useState<string>(preselectedProduct?.id || (products[0]?.id || ''));
  const [factoryName, setFactoryName] = useState<string>('Industrial Depot / Main Factory');
  const [quantity, setQuantity] = useState<string>('10');
  const [buyingPrice, setBuyingPrice] = useState<string>(
    preselectedProduct ? String(preselectedProduct.buyingPrice) : (products[0] ? String(products[0].buyingPrice) : '')
  );
  const [invoiceOrNote, setInvoiceOrNote] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const selectedProd = products.find((p) => p.id === productId);

  const handleProductChange = (newProdId: string) => {
    setProductId(newProdId);
    const p = products.find((prod) => prod.id === newProdId);
    if (p) {
      setBuyingPrice(String(p.buyingPrice));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qtyNum = parseInt(quantity, 10);
    const costNum = parseFloat(buyingPrice);

    if (!productId) {
      setErrorMsg('Please select a product');
      return;
    }
    if (isNaN(qtyNum) || qtyNum <= 0) {
      setErrorMsg('Please enter a valid quantity loaded (must be > 0)');
      return;
    }
    if (isNaN(costNum) || costNum <= 0) {
      setErrorMsg('Please specify factory buying price per unit');
      return;
    }

    replenishInventory(factoryName, productId, qtyNum, costNum, invoiceOrNote);
    onClose();
  };

  const qtyVal = parseInt(quantity, 10) || 0;
  const costVal = parseFloat(buyingPrice) || 0;
  const totalInvestment = qtyVal * costVal;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-900 sticky top-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100">Load Van from Factory</h2>
              <p className="text-xs text-neutral-400">Replenish stock & update factory cost</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-400 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Product Select */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
              Product Merchandise
            </label>
            <select
              value={productId}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Current Stock: {p.stockOnHand} {p.unit}s)
                </option>
              ))}
            </select>
          </div>

          {/* Factory / Supplier Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
              Factory / Depot / Wholesaler
            </label>
            <input
              type="text"
              required
              value={factoryName}
              onChange={(e) => setFactoryName(e.target.value)}
              placeholder="e.g. Bidco Depot, Mombasa Grain Millers"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Quantity */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                Qty Loaded ({selectedProd?.unit || 'units'})
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-amber-500 font-bold"
              />
            </div>

            {/* Buying Price (Cost) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                Factory Price ({currencySymbol})
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={buyingPrice}
                onChange={(e) => setBuyingPrice(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-amber-500 font-bold"
              />
            </div>
          </div>

          {/* Invoice / Gatepass note */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
              Gatepass / Delivery Note / Batch Ref (Optional)
            </label>
            <input
              type="text"
              value={invoiceOrNote}
              onChange={(e) => setInvoiceOrNote(e.target.value)}
              placeholder="e.g. Waybill #9822 or Early morning batch"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Load Summary Card */}
          <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800/80 space-y-1.5 text-xs">
            <div className="flex justify-between text-neutral-400">
              <span>New Stock on Hand:</span>
              <span className="text-emerald-400 font-bold">
                {(selectedProd?.stockOnHand || 0) + qtyVal} {selectedProd?.unit}s
              </span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Total Load Investment:</span>
              <span className="text-neutral-100 font-bold">
                {formatCurrency(totalInvestment, currencySymbol)}
              </span>
            </div>
            {selectedProd && (
              <div className="flex justify-between text-neutral-400">
                <span>Current Selling Price:</span>
                <span className="text-amber-400 font-semibold">
                  {formatCurrency(selectedProd.sellingPrice, currencySymbol)} (Margin: {formatCurrency(selectedProd.sellingPrice - costVal, currencySymbol)}/unit)
                </span>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
            >
              <PackagePlus className="w-4 h-4" />
              <span>Confirm Stock Loaded to Van</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
