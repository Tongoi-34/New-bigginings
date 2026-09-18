import React, { useState } from 'react';
import { useDistributor } from '../context/DistributorContext';
import { Order } from '../types';
import { formatCurrency } from '../utils/analytics';
import { X, CheckCircle, Share2, Copy, Check, Printer, MessageSquare } from 'lucide-react';

interface SaleReceiptModalProps {
  orderId: string | null;
  onClose: () => void;
}

export const SaleReceiptModal: React.FC<SaleReceiptModalProps> = ({ orderId, onClose }) => {
  const { orders, customers, currencySymbol } = useDistributor();
  const [copied, setCopied] = useState(false);

  if (!orderId) return null;

  const order = orders.find((o) => o.id === orderId);
  if (!order) return null;

  const customer = customers.find((c) => c.id === order.customerId);

  const whatsappReceiptText = `*UZA-UZA DELIVERY RECEIPT*
Receipt: ${order.orderNumber}
Date: ${order.date} ${order.time}
Shop: ${order.customerName} (${order.estate})
-----------------------------
${order.items
  .map(
    (it) =>
      `• ${it.productName} (${it.quantity} ${it.unit}s x ${formatCurrency(it.sellingPrice, currencySymbol)}) = ${formatCurrency(it.total, currencySymbol)}`
  )
  .join('\n')}
-----------------------------
*TOTAL AMOUNT:* ${formatCurrency(order.totalAmount, currencySymbol)}
Payment Mode: ${order.paymentMethod.toUpperCase()}
Paid Today: ${formatCurrency(order.amountPaid, currencySymbol)}
${order.amountCredit > 0 ? `*Balance/Credit Added:* ${formatCurrency(order.amountCredit, currencySymbol)}\n` : ''}${
    customer ? `Shop Total Outstanding Balance: ${formatCurrency(customer.outstandingCredit, currencySymbol)}\n` : ''
  }Thank you for your business! Delivered via uza-uza.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(whatsappReceiptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(whatsappReceiptText);
    window.open(`https://wa.me/${customer?.phone.replace(/[^0-9]/g, '')}?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-t-2xl sm:rounded-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-900 sticky top-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100">Delivery Receipt</h2>
              <p className="text-xs text-neutral-400">{order.orderNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Shop and route info */}
          <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800/80 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-neutral-100 text-sm">{order.customerName}</h3>
                <p className="text-xs text-neutral-400">{order.estate}</p>
              </div>
              <span className="text-[11px] font-mono text-neutral-400 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800">
                {order.time}
              </span>
            </div>
            {customer?.phone && (
              <div className="text-xs text-neutral-400">
                Contact: <span className="text-neutral-200">{customer.phone}</span>
              </div>
            )}
          </div>

          {/* Line items */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Items Delivered ({order.items.length})
            </h4>
            <div className="divide-y divide-neutral-800/60 bg-neutral-950 rounded-xl border border-neutral-800/80 overflow-hidden">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-neutral-200">{item.productName}</div>
                    <div className="text-neutral-400 text-[11px]">
                      {item.quantity} {item.unit}s @ {formatCurrency(item.sellingPrice, currencySymbol)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-neutral-100">
                      {formatCurrency(item.total, currencySymbol)}
                    </div>
                    <div className="text-[10px] text-emerald-400">
                      Margin: +{formatCurrency(item.profit, currencySymbol)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment breakdown */}
          <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2 text-xs">
            <div className="flex justify-between text-neutral-400">
              <span>Total Sale Value:</span>
              <span className="font-extrabold text-neutral-100 text-sm">
                {formatCurrency(order.totalAmount, currencySymbol)}
              </span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Payment Mode:</span>
              <span className="uppercase font-semibold text-amber-400">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Amount Paid:</span>
              <span className="font-bold text-emerald-400">
                {formatCurrency(order.amountPaid, currencySymbol)}
              </span>
            </div>
            {order.amountCredit > 0 && (
              <div className="flex justify-between text-rose-400 font-medium">
                <span>Credit Balance (Owing):</span>
                <span className="font-bold">{formatCurrency(order.amountCredit, currencySymbol)}</span>
              </div>
            )}
            {order.paymentReference && (
              <div className="flex justify-between text-neutral-400 pt-1 border-t border-neutral-800/60">
                <span>Reference:</span>
                <span className="font-mono text-neutral-300">{order.paymentReference}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="py-2.5 px-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 font-semibold rounded-xl flex items-center justify-center gap-2 text-xs border border-neutral-700 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Text'}</span>
          </button>

          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-xs transition-colors shadow-lg shadow-emerald-600/20"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Send to WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
