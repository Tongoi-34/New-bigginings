import React, { useState } from 'react';
import { DistributorProvider, useDistributor } from './context/DistributorContext';
import { SalesView } from './components/SalesView';
import { InventoryView } from './components/InventoryView';
import { CustomersView } from './components/CustomersView';
import { ReconciliationView } from './components/ReconciliationView';
import { CumulativeMonthView } from './components/CumulativeMonthView';
import { NewSaleModal } from './components/NewSaleModal';
import { ReplenishModal } from './components/ReplenishModal';
import { UnloadModal } from './components/UnloadModal';
import { OnboardCustomerModal } from './components/OnboardCustomerModal';
import { EditProductModal } from './components/EditProductModal';
import { CollectCreditModal } from './components/CollectCreditModal';
import { SaleReceiptModal } from './components/SaleReceiptModal';
import { Product, Customer } from './types';
import {
  ShoppingBag,
  Package,
  Store,
  Calculator,
  TrendingUp,
  Truck,
  Plus,
  Smartphone,
  RotateCcw,
  Monitor,
  ChevronDown,
} from 'lucide-react';

type ActiveTab = 'sales' | 'inventory' | 'customers' | 'reconciliation' | 'monthly';

function MainApp() {
  const { currencySymbol, setCurrencySymbol, resetToSampleData } = useDistributor();

  const [activeTab, setActiveTab] = useState<ActiveTab>('sales');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);

  // Modals state
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
  const [salePreselectedCustomerId, setSalePreselectedCustomerId] = useState<string | undefined>(undefined);

  const [isReplenishOpen, setIsReplenishOpen] = useState(false);
  const [replenishPreselectedProduct, setReplenishPreselectedProduct] = useState<Product | undefined>(undefined);

  const [isUnloadOpen, setIsUnloadOpen] = useState(false);
  const [unloadPreselectedProduct, setUnloadPreselectedProduct] = useState<Product | undefined>(undefined);

  const [isOnboardOpen, setIsOnboardOpen] = useState(false);

  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [editProductTarget, setEditProductTarget] = useState<Product | undefined>(undefined);

  const [collectCreditTarget, setCollectCreditTarget] = useState<Customer | null>(null);

  const [receiptOrderId, setReceiptOrderId] = useState<string | null>(null);

  const handleSaleSuccess = (orderId: string) => {
    setIsNewSaleOpen(false);
    setReceiptOrderId(orderId);
  };

  return (
    <div className={`min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center ${isMobileFrame ? 'p-0 sm:py-6' : ''}`}>
      {/* Container wrapper: either full width or bounded mobile preview */}
      <div
        className={`w-full flex-1 flex flex-col bg-neutral-950 border-neutral-800 transition-all duration-300 ${
          isMobileFrame
            ? 'max-w-md sm:rounded-3xl sm:border sm:shadow-2xl sm:overflow-hidden min-h-[844px]'
            : 'max-w-5xl'
        }`}
      >
        {/* Top App Header */}
        <header className="sticky top-0 z-30 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/80 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-neutral-950 font-black shadow-md shadow-amber-500/20">
              <Truck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-neutral-100 font-display tracking-tight">
                  uza-uza
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                  DISTRIBUTOR
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 -mt-0.5">Route Distribution & Inventory</p>
            </div>
          </div>

          {/* Quick Header Controls */}
          <div className="flex items-center gap-2">
            {/* Currency Selector */}
            <div className="relative">
              <select
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 text-xs font-semibold rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer appearance-none pr-6"
                title="Change Currency"
              >
                <option value="KES">KES</option>
                <option value="$">USD ($)</option>
                <option value="UGX">UGX</option>
                <option value="TZS">TZS</option>
              </select>
              <ChevronDown className="w-3 h-3 text-neutral-500 absolute right-2 top-2.5 pointer-events-none" />
            </div>

            {/* Mobile / Responsive Frame Toggle (Hidden on narrow viewports) */}
            <button
              type="button"
              onClick={() => setIsMobileFrame(!isMobileFrame)}
              className="hidden sm:flex items-center justify-center p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
              title={isMobileFrame ? 'Switch to Full Width' : 'Preview in Mobile Phone Frame'}
            >
              {isMobileFrame ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4 text-amber-400" />}
            </button>

            {/* Reset / Reload Sample Data */}
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset all transactions, products & customers to realistic estate distributor sample data?')) {
                  resetToSampleData();
                }
              }}
              className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
              title="Reset Sample Data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-5 overflow-y-auto mb-16">
          {activeTab === 'sales' && (
            <SalesView
              onOpenNewSale={() => {
                setSalePreselectedCustomerId(undefined);
                setIsNewSaleOpen(true);
              }}
              onOpenReceipt={(orderId) => setReceiptOrderId(orderId)}
              onNavigateToReconcile={() => setActiveTab('reconciliation')}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryView
              onOpenReplenish={(prod) => {
                setReplenishPreselectedProduct(prod);
                setIsReplenishOpen(true);
              }}
              onOpenUnload={(prod) => {
                setUnloadPreselectedProduct(prod);
                setIsUnloadOpen(true);
              }}
              onOpenEditProduct={(prod) => {
                setEditProductTarget(prod);
                setIsEditProductOpen(true);
              }}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersView
              onOpenOnboard={() => setIsOnboardOpen(true)}
              onOpenNewSaleForCustomer={(cId) => {
                setSalePreselectedCustomerId(cId);
                setIsNewSaleOpen(true);
              }}
              onOpenCollectCredit={(cust) => setCollectCreditTarget(cust)}
            />
          )}

          {activeTab === 'reconciliation' && <ReconciliationView />}

          {activeTab === 'monthly' && <CumulativeMonthView />}
        </main>

        {/* Mobile Floating Action Button (Quick New Field Sale) */}
        {activeTab !== 'sales' && (
          <button
            type="button"
            onClick={() => {
              setSalePreselectedCustomerId(undefined);
              setIsNewSaleOpen(true);
            }}
            className="fixed bottom-20 right-5 sm:right-8 z-40 p-3.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black rounded-full shadow-2xl shadow-amber-500/30 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span className="text-xs font-bold pr-1">New Sale</span>
          </button>
        )}

        {/* Bottom Mobile Navigation Bar */}
        <nav className="fixed sm:sticky bottom-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-lg border-t border-neutral-800/80 px-2 py-2 flex items-center justify-around max-w-5xl mx-auto">
          {/* 1. Field Sales */}
          <button
            type="button"
            onClick={() => setActiveTab('sales')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl transition-all ${
              activeTab === 'sales'
                ? 'text-amber-400 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-[10px] mt-1">Field Sales</span>
          </button>

          {/* 2. Van Inventory */}
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl transition-all ${
              activeTab === 'inventory'
                ? 'text-amber-400 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Package className="w-5 h-5" />
            <span className="text-[10px] mt-1">Van Stock</span>
          </button>

          {/* 3. Customers / Estate Shops */}
          <button
            type="button"
            onClick={() => setActiveTab('customers')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl transition-all ${
              activeTab === 'customers'
                ? 'text-amber-400 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Store className="w-5 h-5" />
            <span className="text-[10px] mt-1">Shops</span>
          </button>

          {/* 4. Close of Day Reconciliation */}
          <button
            type="button"
            onClick={() => setActiveTab('reconciliation')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl transition-all ${
              activeTab === 'reconciliation'
                ? 'text-amber-400 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Calculator className="w-5 h-5" />
            <span className="text-[10px] mt-1">Close Day</span>
          </button>

          {/* 5. Monthly Cumulative Progress */}
          <button
            type="button"
            onClick={() => setActiveTab('monthly')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl transition-all ${
              activeTab === 'monthly'
                ? 'text-amber-400 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px] mt-1">Month Total</span>
          </button>
        </nav>
      </div>

      {/* Global Modals */}
      <NewSaleModal
        isOpen={isNewSaleOpen}
        onClose={() => setIsNewSaleOpen(false)}
        preselectedCustomerId={salePreselectedCustomerId}
        onSuccess={handleSaleSuccess}
        onOpenOnboard={() => {
          setIsNewSaleOpen(false);
          setIsOnboardOpen(true);
        }}
      />

      <ReplenishModal
        isOpen={isReplenishOpen}
        onClose={() => setIsReplenishOpen(false)}
        preselectedProduct={replenishPreselectedProduct}
      />

      <UnloadModal
        isOpen={isUnloadOpen}
        onClose={() => setIsUnloadOpen(false)}
        preselectedProduct={unloadPreselectedProduct}
      />

      <OnboardCustomerModal
        isOpen={isOnboardOpen}
        onClose={() => setIsOnboardOpen(false)}
        onCustomerCreated={(cId) => {
          setSalePreselectedCustomerId(cId);
          setIsNewSaleOpen(true);
        }}
      />

      <EditProductModal
        isOpen={isEditProductOpen}
        onClose={() => setIsEditProductOpen(false)}
        product={editProductTarget}
      />

      {collectCreditTarget && (
        <CollectCreditModal
          isOpen={!!collectCreditTarget}
          onClose={() => setCollectCreditTarget(null)}
          customer={collectCreditTarget}
        />
      )}

      <SaleReceiptModal
        orderId={receiptOrderId}
        onClose={() => setReceiptOrderId(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <DistributorProvider>
      <MainApp />
    </DistributorProvider>
  );
}
