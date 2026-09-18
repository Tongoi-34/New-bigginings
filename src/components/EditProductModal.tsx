import React, { useState } from 'react';
import { useDistributor } from '../context/DistributorContext';
import { Product, ProductUnit } from '../types';
import { formatCurrency } from '../utils/analytics';
import { X, Tag, Percent, DollarSign, Package, AlertCircle } from 'lucide-react';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product; // If null, creating new product
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const { addProduct, updateProduct, currencySymbol } = useDistributor();

  const [name, setName] = useState(product?.name || '');
  const [category, setCategory] = useState(product?.category || 'Edible Oils');
  const [unit, setUnit] = useState<ProductUnit>(product?.unit || 'carton');
  const [unitPackSize, setUnitPackSize] = useState(product?.unitPackSize || '12 x 1L');
  const [buyingPrice, setBuyingPrice] = useState(product ? String(product.buyingPrice) : '2000');
  const [sellingPrice, setSellingPrice] = useState(product ? String(product.sellingPrice) : '2400');
  const [stockOnHand, setStockOnHand] = useState(product ? String(product.stockOnHand) : '20');
  const [minStockAlert, setMinStockAlert] = useState(product ? String(product.minStockAlert) : '10');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const cost = parseFloat(buyingPrice) || 0;
  const price = parseFloat(sellingPrice) || 0;
  const margin = price - cost;
  const marginPercent = price > 0 ? Math.round((margin / price) * 100) : 0;
  const markupPercent = cost > 0 ? Math.round((margin / cost) * 100) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Product name is required');
      return;
    }
    if (cost < 0 || price < 0) {
      setErrorMsg('Prices cannot be negative');
      return;
    }

    if (product) {
      updateProduct({
        ...product,
        name: name.trim(),
        category: category.trim(),
        unit,
        unitPackSize: unitPackSize.trim(),
        buyingPrice: cost,
        sellingPrice: price,
        stockOnHand: parseInt(stockOnHand, 10) || 0,
        minStockAlert: parseInt(minStockAlert, 10) || 5,
      });
    } else {
      addProduct({
        name: name.trim(),
        category: category.trim(),
        unit,
        unitPackSize: unitPackSize.trim(),
        buyingPrice: cost,
        sellingPrice: price,
        stockOnHand: parseInt(stockOnHand, 10) || 0,
        minStockAlert: parseInt(minStockAlert, 10) || 5,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-t-2xl sm:rounded-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-900 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100">
                {product ? 'Edit Prices & Product' : 'Add Product SKU'}
              </h2>
              <p className="text-xs text-neutral-400">Configure factory buying and shop selling prices</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-400 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Product Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
              Product Brand & Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pwani Gold Cooking Oil"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-amber-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Edible Oils, Flour"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Packaging Unit */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                Wholesale Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as ProductUnit)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
              >
                <option value="carton">Carton</option>
                <option value="bale">Bale</option>
                <option value="crate">Crate</option>
                <option value="box">Box</option>
                <option value="pack">Pack</option>
                <option value="dozen">Dozen</option>
                <option value="piece">Piece</option>
              </select>
            </div>
          </div>

          {/* Pack description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
              Inner Pack Specification
            </label>
            <input
              type="text"
              value={unitPackSize}
              onChange={(e) => setUnitPackSize(e.target.value)}
              placeholder="e.g. 12 x 1L Bottles, 24 x 500ml, 12 x 2kg"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* BUYING PRICE & SELLING PRICE SETTING */}
          <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <DollarSign className="w-3.5 h-3.5" />
              Pricing & Profit Margins
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">
                  Buying Price (Factory Cost) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-semibold text-neutral-500">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={buyingPrice}
                    onChange={(e) => setBuyingPrice(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-12 pr-3 py-2 text-sm text-neutral-100 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">
                  Selling Price (To Shops) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-semibold text-neutral-500">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-12 pr-3 py-2 text-sm text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Calculated profit preview */}
            <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-neutral-400">Distributor Profit per {unit}:</span>{' '}
                <span className={`font-bold ${margin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrency(margin, currencySymbol)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-neutral-400">
                <Percent className="w-3 h-3 text-amber-400" />
                <span>Margin: <strong className="text-neutral-200">{marginPercent}%</strong></span>
                <span className="text-neutral-600">|</span>
                <span>Markup: <strong className="text-neutral-200">{markupPercent}%</strong></span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Stock on hand */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1">
                <Package className="w-3 h-3 text-amber-400" />
                Current Van Stock
              </label>
              <input
                type="number"
                min="0"
                value={stockOnHand}
                onChange={(e) => setStockOnHand(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Min stock reorder alert */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                Low Stock Alert Limit
              </label>
              <input
                type="number"
                min="1"
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
            >
              <span>{product ? 'Save Pricing & Updates' : 'Add to Catalog'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
