import React, { useState } from 'react';
import { useDistributor } from '../context/DistributorContext';
import { Customer, PaymentMethod } from '../types';
import { formatCurrency } from '../utils/analytics';
import { X, HandCoins, Smartphone, Banknote, AlertCircle } from 'lucide-react';

interface CollectCreditModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
}

export const CollectCreditModal: React.FC<CollectCreditModalProps> = ({
  isOpen,
  onClose,
  customer,
}) => {
  const { collectCustomerCredit, currencySymbol } = useDistributor();

  const [amount, setAmount] = useState(String(customer.outstandingCredit));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payVal = parseFloat(amount);
    if (isNaN(payVal) || payVal <= 0) {
      setErrorMsg('Please enter a valid payment amount');
      return;
    }
    if (payVal > customer.outstandingCredit) {
      setErrorMsg(`Amount cannot exceed current debt of ${formatCurrency(customer.outstandingCredit, currencySymbol)}`);
      return;
    }

    collectCustomerCredit(customer.id, payVal, paymentMethod);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-900 sticky top-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <HandCoins className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100">Collect Debt / Credit</h2>
              <p className="text-xs text-neutral-400">{customer.shopName}</p>
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

          <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1 text-xs">
            <div className="flex justify-between text-neutral-400">
              <span>Customer Shop:</span>
              <span className="font-semibold text-neutral-200">{customer.shopName}</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Total Current Debt:</span>
              <span className="font-bold text-rose-400 text-sm">
                {formatCurrency(customer.outstandingCredit, currencySymbol)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
              Amount Being Paid ({currencySymbol})
            </label>
            <input
              type="number"
              min="1"
              max={customer.outstandingCredit}
              step="any"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-lg font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
              Payment Received Via
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('mpesa')}
                className={`p-3 rounded-xl border flex items-center gap-2 text-xs transition-all ${
                  paymentMethod === 'mpesa'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>M-Pesa Mobile</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-xl border flex items-center gap-2 text-xs transition-all ${
                  paymentMethod === 'cash'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>Cash in Hand</span>
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
            >
              <span>Record Debt Recovery</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
