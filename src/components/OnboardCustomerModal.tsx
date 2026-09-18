import React, { useState } from 'react';
import { useDistributor } from '../context/DistributorContext';
import { Customer } from '../types';
import { X, Store, UserPlus, MapPin, Phone, ShieldCheck, AlertCircle } from 'lucide-react';

interface OnboardCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerCreated?: (customerId: string) => void;
  defaultEstate?: string;
}

export const OnboardCustomerModal: React.FC<OnboardCustomerModalProps> = ({
  isOpen,
  onClose,
  onCustomerCreated,
  defaultEstate = 'Umoja Innercore',
}) => {
  const { onboardCustomer, customers, currencySymbol } = useDistributor();

  const existingEstates = Array.from(new Set(customers.map((c) => c.estate)));

  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [estate, setEstate] = useState(defaultEstate);
  const [customEstate, setCustomEstate] = useState('');
  const [landmark, setLandmark] = useState('');
  const [initialCredit, setInitialCredit] = useState('0');
  const [creditLimit, setCreditLimit] = useState('10000');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim()) {
      setErrorMsg('Please provide a shop name (e.g. Baraka Grocers)');
      return;
    }
    if (!ownerName.trim()) {
      setErrorMsg('Please provide the shop owner or contact name');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Please provide a phone number for orders/receipts');
      return;
    }

    const finalEstate = estate === '__custom__' ? customEstate.trim() || 'General Route' : estate;

    const newId = onboardCustomer({
      shopName: shopName.trim(),
      ownerName: ownerName.trim(),
      phone: phone.trim(),
      estate: finalEstate,
      landmark: landmark.trim() || undefined,
      outstandingCredit: parseFloat(initialCredit) || 0,
      creditLimit: parseFloat(creditLimit) || 10000,
      notes: notes.trim() || undefined,
    });

    if (onCustomerCreated) {
      onCustomerCreated(newId);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-t-2xl sm:rounded-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-900 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100">Onboard Estate Customer</h2>
              <p className="text-xs text-neutral-400">Register new retail shop or kiosk</p>
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

          {/* Shop Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
              Retail Shop / Duka Name *
            </label>
            <input
              type="text"
              required
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="e.g. Mama Kevin Kiosk & Grocers"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-amber-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Owner / Contact Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                Owner / Manager *
              </label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. Kevin Odhiambo"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1">
                <Phone className="w-3 h-3 text-amber-400" />
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +254 712 345 678"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Estate / Route selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-400" />
              Estate / Neighborhood Route *
            </label>
            <select
              value={estate}
              onChange={(e) => setEstate(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-amber-500 mb-2"
            >
              {existingEstates.map((est) => (
                <option key={est} value={est}>
                  {est}
                </option>
              ))}
              <option value="__custom__">+ Add New Estate / Route...</option>
            </select>

            {estate === '__custom__' && (
              <input
                type="text"
                value={customEstate}
                onChange={(e) => setCustomEstate(e.target.value)}
                placeholder="Type new estate name (e.g. Komarock Phase 4)"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
              />
            )}
          </div>

          {/* Landmark / Directions */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
              Specific Landmark / Location Tip
            </label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="e.g. Next to Green Chemists, opposite Stage 2"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Initial Debt / Outstanding */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                Existing Debt ({currencySymbol})
              </label>
              <input
                type="number"
                min="0"
                value={initialCredit}
                onChange={(e) => setInitialCredit(e.target.value)}
                placeholder="0"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Credit Limit */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Credit Limit ({currencySymbol})
              </label>
              <input
                type="number"
                min="0"
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value)}
                placeholder="10000"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Order notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
              Delivery / Preference Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Usually orders oil on Thursdays, cash on delivery"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer shadow-lg shadow-amber-500/10"
            >
              <UserPlus className="w-4 h-4" />
              <span>Save & Onboard Customer Shop</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
