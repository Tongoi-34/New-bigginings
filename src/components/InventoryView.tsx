import React, { useState } from 'react';
import { useDistributor } from '../context/DistributorContext';
import { Product } from '../types';
import { calculateProductDemand, formatCurrency } from '../utils/analytics';
import {
  Package,
  Truck,
  Plus,
  Flame,
  AlertTriangle,
  ArrowUpDown,
  Tag,
  Search,
  History,
  CheckCircle,
  Clock,
  Sparkles,
  DollarSign,
  Layers,
  Eraser,
  Trash2,
  PackageMinus,
  ArrowDownToLine,
  Warehouse,
} from 'lucide-react';

interface InventoryViewProps {
  onOpenReplenish: (product?: Product) => void;
  onOpenUnload: (product?: Product) => void;
  onOpenEditProduct: (product?: Product) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  onOpenReplenish,
  onOpenUnload,
  onOpenEditProduct,
}) => {
  const {
    products,
    orders,
    replenishments,
    unloadRecords,
    currencySymbol,
    selectedDate,
    clearProductStock,
    clearAllStock,
  } = useDistributor();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'catalog' | 'replenish_log' | 'unload_log'>('catalog');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [clearingProduct, setClearingProduct] = useState<Product | null>(null);

  const currentMonth = selectedDate.slice(0, 7);
  const demandStats = calculateProductDemand(products, orders, currentMonth);

  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredStats = demandStats.filter((stat) => {
    const matchesSearch =
      stat.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stat.product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || stat.product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate total van inventory valuation
  const totalStockUnits = products.reduce((acc, p) => acc + p.stockOnHand, 0);
  const totalStockCostValuation = products.reduce((acc, p) => acc + p.stockOnHand * p.buyingPrice, 0);
  const totalStockPotentialRevenue = products.reduce((acc, p) => acc + p.stockOnHand * p.sellingPrice, 0);
  const totalStockPotentialProfit = totalStockPotentialRevenue - totalStockCostValuation;

  const lowStockCount = products.filter((p) => p.stockOnHand <= p.minStockAlert).length;
  const highDemandCount = demandStats.filter((s) => s.velocityScore === 'HOT').length;

  return (
    <div className="space-y-5 pb-8">
      {/* Header with Stats & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900/80 p-4 rounded-2xl border border-neutral-800 backdrop-blur-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Package className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-lg font-bold text-neutral-100 font-display">
                Van Stock & Factory Replenishment
              </h1>
              <p className="text-xs text-neutral-400">
                Manage factory costs, selling prices, demand velocity & reload van
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {totalStockUnits > 0 && (
            <button
              type="button"
              onClick={() => onOpenUnload()}
              className="px-3 py-2 bg-neutral-950 hover:bg-amber-500/15 border border-neutral-800 hover:border-amber-500/40 text-amber-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Type items and quantities to unload from vehicle"
            >
              <PackageMinus className="w-3.5 h-3.5" />
              <span>Unload Van</span>
            </button>
          )}

          {totalStockUnits > 0 && (
            <button
              type="button"
              onClick={() => setShowClearAllModal(true)}
              className="px-3 py-2 bg-neutral-950 hover:bg-rose-950/40 border border-neutral-800 hover:border-rose-800/60 text-neutral-400 hover:text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reset all van stock on hand to zero"
            >
              <Eraser className="w-3.5 h-3.5 text-rose-400" />
              <span>Clear All Stock</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onOpenEditProduct()}
            className="px-3 py-2 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Add SKU</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenReplenish()}
            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/10 active:scale-95 cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            <span>Load from Factory</span>
          </button>
        </div>
      </div>

      {/* Hero Stock Valuation Metric Banners */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <div className="text-neutral-400 text-xs mb-1">Total Van Stock</div>
          <div className="text-xl sm:text-2xl font-black text-neutral-100 font-display">
            {totalStockUnits} <span className="text-xs font-normal text-neutral-400">units</span>
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Loaded in vehicle / depot</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <div className="text-neutral-400 text-xs mb-1">Stock Cost (Factory Value)</div>
          <div className="text-xl sm:text-2xl font-black text-neutral-200 font-display">
            {formatCurrency(totalStockCostValuation, currencySymbol)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Acquisition investment</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <div className="text-neutral-400 text-xs mb-1">Potential Gross Profit</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 font-display">
            +{formatCurrency(totalStockPotentialProfit, currencySymbol)}
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-0.5">When fully sold to shops</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
          <div>
            <div className="text-neutral-400 text-xs mb-1">Demand Alerts</div>
            <div className="text-lg font-bold text-neutral-100">
              <span className="text-amber-400 font-black">{highDemandCount}</span> Hot Items
            </div>
            <div className="text-[11px] text-rose-400 font-medium mt-0.5">
              {lowStockCount > 0 ? `${lowStockCount} items low stock` : 'Stock levels optimal'}
            </div>
          </div>
          <Flame className="w-8 h-8 text-amber-500/30" />
        </div>
      </div>

      {/* Sub-Tabs: Products Catalog vs Factory Replenishment Log vs Van Offloads */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setSelectedTab('catalog')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            selectedTab === 'catalog'
              ? 'bg-amber-500 text-neutral-950 font-bold'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
          }`}
        >
          Product Catalog ({products.length})
        </button>

        <button
          type="button"
          onClick={() => setSelectedTab('replenish_log')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            selectedTab === 'replenish_log'
              ? 'bg-amber-500 text-neutral-950 font-bold'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Factory Loads ({replenishments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedTab('unload_log')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            selectedTab === 'unload_log'
              ? 'bg-amber-500 text-neutral-950 font-bold'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
          }`}
        >
          <PackageMinus className="w-3.5 h-3.5" />
          <span>Van Offloads ({unloadRecords.length})</span>
        </button>
      </div>

      {selectedTab === 'catalog' ? (
        <div className="space-y-4">
          {/* Search and Category Filter */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by brand or category..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap capitalize transition-colors ${
                    filterCategory === cat
                      ? 'bg-neutral-800 text-amber-400 font-bold border border-amber-500/30'
                      : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Demand Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredStats.map((stat) => {
              const { product, unitsSoldMonth, revenueMonth, profitMonth, velocityScore, marginPercent, daysOfInventoryLeft } =
                stat;
              const isLowStock = product.stockOnHand <= product.minStockAlert;

              return (
                <div
                  key={product.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isLowStock
                      ? 'bg-neutral-900/90 border-amber-500/40'
                      : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-neutral-100">{product.name}</h3>
                        {velocityScore === 'HOT' && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-extrabold flex items-center gap-1">
                            <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                            HIGH DEMAND
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {product.category} • {product.unitPackSize} ({product.unit})
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold ${
                          isLowStock
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-neutral-800 text-neutral-200'
                        }`}
                      >
                        {product.stockOnHand} in van
                      </span>
                      {isLowStock && (
                        <div className="text-[10px] text-rose-400 font-medium mt-0.5">
                          Low Stock Alert!
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing Matrix */}
                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800/80 my-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <div className="text-[10px] uppercase text-neutral-500">Factory Cost</div>
                      <div className="font-semibold text-neutral-300">
                        {formatCurrency(product.buyingPrice, currencySymbol)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-neutral-500">Selling Price</div>
                      <div className="font-bold text-amber-400">
                        {formatCurrency(product.sellingPrice, currencySymbol)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-neutral-500">Distributor Margin</div>
                      <div className="font-bold text-emerald-400">
                        +{formatCurrency(product.sellingPrice - product.buyingPrice, currencySymbol)} ({marginPercent}%)
                      </div>
                    </div>
                  </div>

                  {/* Monthly Demand Velocity Stats */}
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 py-1 border-t border-neutral-800/80">
                    <div>
                      <span>Month Sold: </span>
                      <strong className="text-neutral-100">{unitsSoldMonth} {product.unit}s</strong>
                      <span className="mx-1.5">•</span>
                      <span>Profit: </span>
                      <strong className="text-emerald-400">{formatCurrency(profitMonth, currencySymbol)}</strong>
                    </div>
                    <div>
                      <span>Est. Runout: </span>
                      <strong className={daysOfInventoryLeft <= 3 ? 'text-rose-400' : 'text-neutral-200'}>
                        {daysOfInventoryLeft > 30 ? '30+ days' : `${daysOfInventoryLeft} days`}
                      </strong>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div
                    className={`grid ${
                      product.stockOnHand > 0 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2'
                    } gap-1.5 mt-3 pt-2 border-t border-neutral-800/80`}
                  >
                    <button
                      type="button"
                      onClick={() => onOpenReplenish(product)}
                      className="py-1.5 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Reload</span>
                    </button>

                    {product.stockOnHand > 0 && (
                      <button
                        type="button"
                        onClick={() => onOpenUnload(product)}
                        className="py-1.5 px-2 bg-neutral-950 hover:bg-amber-500/15 text-neutral-300 hover:text-amber-300 border border-neutral-800 hover:border-amber-500/40 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Unload specific quantity from van"
                      >
                        <PackageMinus className="w-3.5 h-3.5 text-amber-400" />
                        <span>Unload</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onOpenEditProduct(product)}
                      className="py-1.5 px-2 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Tag className="w-3.5 h-3.5 text-amber-400" />
                      <span>Edit SKU</span>
                    </button>

                    {product.stockOnHand > 0 && (
                      <button
                        type="button"
                        onClick={() => setClearingProduct(product)}
                        className="py-1.5 px-2 bg-neutral-950 hover:bg-rose-950/30 text-neutral-400 hover:text-rose-400 border border-neutral-800 hover:border-rose-900/50 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Reset this item's van stock to 0"
                      >
                        <Eraser className="w-3.5 h-3.5" />
                        <span>Clear (0)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : selectedTab === 'replenish_log' ? (
        /* Factory Replenishment History Log */
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-400" />
              Factory Load & Restock Log
            </h3>
            <span className="text-xs text-neutral-400">{replenishments.length} records</span>
          </div>

          <div className="divide-y divide-neutral-800/80 bg-neutral-950 rounded-2xl border border-neutral-800 overflow-hidden">
            {replenishments.map((rep) => (
              <div key={rep.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-100 text-sm">{rep.productName}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                      +{rep.quantityAdded} loaded
                    </span>
                  </div>
                  <div className="text-neutral-400 mt-1 flex items-center gap-2">
                    <span>{rep.factoryName}</span>
                    <span>•</span>
                    <span>{rep.date} at {rep.time}</span>
                  </div>
                  {rep.invoiceOrNote && (
                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      Ref / Waybill: {rep.invoiceOrNote}
                    </div>
                  )}
                </div>

                <div className="text-left sm:text-right">
                  <div className="font-bold text-neutral-100 text-sm">
                    {formatCurrency(rep.totalCost, currencySymbol)}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    Unit Cost: {formatCurrency(rep.buyingPrice, currencySymbol)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Van Offload & Return History Log */
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                <PackageMinus className="w-4 h-4 text-amber-400" />
                Van Offload & Return History
              </h3>
              <p className="text-xs text-neutral-400">
                Log of items typed and unloaded back to warehouse or factory
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenUnload()}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <PackageMinus className="w-3.5 h-3.5" />
              <span>Type Items to Unload</span>
            </button>
          </div>

          {unloadRecords.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-neutral-800 rounded-2xl bg-neutral-950/50 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-500">
                <Warehouse className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-neutral-200">No Unload Records Yet</h4>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                  When you return goods to the depot or offload unsold stock at the end of the shift, your typed unload logs will appear here.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenUnload()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <PackageMinus className="w-4 h-4" />
                <span>Type Items to Unload Now</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {unloadRecords.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-3 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-neutral-800/80">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-neutral-100 text-sm">
                          {rec.destinationOrReason}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-[11px]">
                          -{rec.totalUnits} units offloaded
                        </span>
                      </div>
                      <div className="text-neutral-400 text-[11px] flex items-center gap-2">
                        <span>{rec.date} at {rec.time}</span>
                        {rec.invoiceOrNote && (
                          <>
                            <span>•</span>
                            <span className="text-neutral-300 font-medium">
                              Ref: {rec.invoiceOrNote}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="text-neutral-400 text-[11px]">Inventory Valuation Removed:</div>
                      <div className="text-sm font-black text-neutral-200">
                        {formatCurrency(rec.totalValuation, currencySymbol)}
                      </div>
                    </div>
                  </div>

                  {/* List of individual items unloaded */}
                  <div className="space-y-1.5 pt-0.5">
                    <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                      Offloaded Items Breakdown:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {rec.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-2 bg-neutral-900/80 rounded-xl border border-neutral-800/80 flex items-center justify-between text-xs"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="font-semibold text-neutral-200 truncate">
                              {item.productName}
                            </div>
                            <div className="text-[10px] text-neutral-400">
                              {item.unitPackSize}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-bold text-amber-400">
                              {item.quantity} {item.unit}s
                            </span>
                            <div className="text-[10px] text-neutral-400">
                              {formatCurrency(item.totalValuation, currencySymbol)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* MODAL: Clear All Stock Confirmation */}
      {showClearAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 shrink-0">
                <Eraser className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-100">Clear All Van Stock?</h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  This will reset the stock-on-hand count for all <strong className="text-neutral-200">{products.length} products</strong> in your van to <strong className="text-amber-400">0 units</strong> ({totalStockUnits} total units cleared).
                </p>
                <div className="mt-2.5 p-2.5 bg-neutral-950 rounded-xl border border-neutral-800 text-[11px] text-neutral-400">
                  💡 Use this when offloading unsold stock back to the factory depot or when performing a clean physical cycle count. Product catalog and pricing will not be deleted.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setShowClearAllModal(false)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAllStock();
                  setShowClearAllModal(false);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>Yes, Clear All to 0</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Clear Single Product Stock Confirmation */}
      {clearingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                <Eraser className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-100">Clear Stock for this SKU?</h3>
                <p className="text-xs text-neutral-300 font-medium mt-1">
                  {clearingProduct.name} ({clearingProduct.unitPackSize})
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  Current van stock: <strong className="text-neutral-100">{clearingProduct.stockOnHand} {clearingProduct.unit}s</strong> ({formatCurrency(clearingProduct.stockOnHand * clearingProduct.sellingPrice, currencySymbol)} value).
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setClearingProduct(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  clearProductStock(clearingProduct.id);
                  setClearingProduct(null);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>Clear to 0 Units</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
