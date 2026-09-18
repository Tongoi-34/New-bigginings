import React, { useState } from 'react';
import { useDistributor } from '../context/DistributorContext';
import { calculateMonthlyCumulative, formatCurrency } from '../utils/analytics';
import {
  TrendingUp,
  Target,
  Calendar,
  DollarSign,
  Award,
  Zap,
  BarChart3,
  MapPin,
  FileSpreadsheet,
  CheckCircle2,
  Sliders,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';

export const CumulativeMonthView: React.FC = () => {
  const { orders, monthlyTarget, updateMonthlyTarget, currencySymbol, selectedDate } =
    useDistributor();

  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');
  const [showTargetModal, setShowTargetModal] = useState<boolean>(false);
  const [targetRevInput, setTargetRevInput] = useState<string>(String(monthlyTarget.targetRevenue));
  const [targetProfitInput, setTargetProfitInput] = useState<string>(String(monthlyTarget.targetProfit));
  const [targetUnitsInput, setTargetUnitsInput] = useState<string>(String(monthlyTarget.targetUnitsSold));

  const stats = calculateMonthlyCumulative(orders, selectedMonth, selectedDate);

  const revProgress = Math.min(100, Math.round((stats.cumulativeRevenue / monthlyTarget.targetRevenue) * 100));
  const profitProgress = Math.min(100, Math.round((stats.cumulativeProfit / monthlyTarget.targetProfit) * 100));
  const unitsProgress = Math.min(100, Math.round((stats.cumulativeUnits / monthlyTarget.targetUnitsSold) * 100));

  // Estate breakdown for this month
  const monthOrders = orders.filter((o) => o.date.startsWith(selectedMonth));
  const estateRevMap: Record<string, { revenue: number; profit: number; orderCount: number }> = {};
  monthOrders.forEach((o) => {
    const estateKey = o.estate || 'Unspecified';
    if (!estateRevMap[estateKey]) {
      estateRevMap[estateKey] = { revenue: 0, profit: 0, orderCount: 0 };
    }
    estateRevMap[estateKey].revenue += o.totalAmount;
    estateRevMap[estateKey].profit += o.totalProfit;
    estateRevMap[estateKey].orderCount += 1;
  });

  const estateRankings = Object.entries(estateRevMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue);

  const handleSaveTargets = (e: React.FormEvent) => {
    e.preventDefault();
    updateMonthlyTarget({
      month: selectedMonth,
      targetRevenue: parseFloat(targetRevInput) || monthlyTarget.targetRevenue,
      targetProfit: parseFloat(targetProfitInput) || monthlyTarget.targetProfit,
      targetUnitsSold: parseInt(targetUnitsInput, 10) || monthlyTarget.targetUnitsSold,
    });
    setShowTargetModal(false);
  };

  // Find max daily revenue for bar height normalization
  const maxDailyRevenue = Math.max(1, ...stats.dailyTrend.map((d) => d.dailyRevenue));

  return (
    <div className="space-y-5 pb-8">
      {/* Month Header & Month Target Settings */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900/80 p-4 rounded-2xl border border-neutral-800 backdrop-blur-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <TrendingUp className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-lg font-bold text-neutral-100 font-display">
                Monthly Cumulative Progress
              </h1>
              <p className="text-xs text-neutral-400">
                Track each day cumulatively to monitor monthly milestones & goals
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-semibold text-neutral-200 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>September 2026</span>
          </div>

          <button
            type="button"
            onClick={() => setShowTargetModal(true)}
            className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Set Targets</span>
          </button>
        </div>
      </div>

      {/* Target Modal */}
      {showTargetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-bold text-neutral-100 text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                Monthly Distributor Goals
              </h3>
              <button
                onClick={() => setShowTargetModal(false)}
                className="text-neutral-400 hover:text-neutral-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTargets} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Monthly Revenue Target ({currencySymbol})
                </label>
                <input
                  type="number"
                  value={targetRevInput}
                  onChange={(e) => setTargetRevInput(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-100 font-bold focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Monthly Gross Profit Goal ({currencySymbol})
                </label>
                <input
                  type="number"
                  value={targetProfitInput}
                  onChange={(e) => setTargetProfitInput(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-emerald-400 font-bold focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Total Units Target (cartons/bales/crates)
                </label>
                <input
                  type="number"
                  value={targetUnitsInput}
                  onChange={(e) => setTargetUnitsInput(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-100 font-bold focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl"
                >
                  Save Monthly Targets
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Target Progress Hero Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Cumulative Revenue */}
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400">Cumulative Revenue</span>
            <span className="text-xs font-extrabold text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
              {revProgress}% of goal
            </span>
          </div>

          <div>
            <div className="text-2xl font-black text-neutral-100 font-display">
              {formatCurrency(stats.cumulativeRevenue, currencySymbol)}
            </div>
            <div className="text-xs text-neutral-400 mt-0.5">
              Goal: {formatCurrency(monthlyTarget.targetRevenue, currencySymbol)}
            </div>
          </div>

          <div className="w-full bg-neutral-950 rounded-full h-2 overflow-hidden border border-neutral-800">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${revProgress}%` }}
            />
          </div>
        </div>

        {/* Cumulative Profit */}
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400">Cumulative Gross Profit</span>
            <span className="text-xs font-extrabold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
              {profitProgress}% of goal
            </span>
          </div>

          <div>
            <div className="text-2xl font-black text-emerald-400 font-display">
              {formatCurrency(stats.cumulativeProfit, currencySymbol)}
            </div>
            <div className="text-xs text-neutral-400 mt-0.5">
              Goal: {formatCurrency(monthlyTarget.targetProfit, currencySymbol)}
            </div>
          </div>

          <div className="w-full bg-neutral-950 rounded-full h-2 overflow-hidden border border-neutral-800">
            <div
              className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${profitProgress}%` }}
            />
          </div>
        </div>

        {/* Run-rate Projection */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-400">
            <span>Projected Month End</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>

          <div>
            <div className="text-2xl font-black text-neutral-100 font-display">
              {formatCurrency(stats.projectedMonthEndRevenue, currencySymbol)}
            </div>
            <div className="text-xs text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>
                {Math.round((stats.projectedMonthEndRevenue / monthlyTarget.targetRevenue) * 100)}% of target forecast
              </span>
            </div>
          </div>

          <p className="text-[11px] text-neutral-400 pt-1 border-t border-neutral-800">
            Current daily pace: <strong>{formatCurrency(stats.averageDailyRevenue, currencySymbol)} / day</strong>
          </p>
        </div>
      </div>

      {/* Visual Day-by-Day Daily Bar Distribution Chart */}
      <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              Daily Sales Trajectory (Days 1 to {stats.daysInMonth})
            </h3>
            <p className="text-xs text-neutral-400">
              Bars indicate daily revenue; cumulative total accumulates over time
            </p>
          </div>
          {stats.bestDay && (
            <div className="text-right">
              <span className="text-[10px] text-neutral-400 block">Best Day (Day {stats.bestDay.date.split('-')[2]})</span>
              <span className="text-xs font-bold text-amber-400 font-display">
                {formatCurrency(stats.bestDay.revenue, currencySymbol)}
              </span>
            </div>
          )}
        </div>

        {/* Visual Daily Column Chart */}
        <div className="h-44 flex items-end gap-1.5 sm:gap-2 pt-4 px-2 overflow-x-auto no-scrollbar border-b border-neutral-800 pb-2">
          {stats.dailyTrend.map((d) => {
            const heightPercent =
              d.dailyRevenue > 0 ? Math.max(8, Math.round((d.dailyRevenue / maxDailyRevenue) * 100)) : 3;

            return (
              <div
                key={d.dayNumber}
                className="flex-1 min-w-[16px] sm:min-w-[20px] flex flex-col items-center gap-1.5 group relative"
              >
                {/* Tooltip on hover */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-20 bg-neutral-950 border border-neutral-700 px-2 py-1 rounded text-[10px] whitespace-nowrap pointer-events-none shadow-lg">
                  <span className="font-bold text-neutral-100">Day {d.dayNumber}: {formatCurrency(d.dailyRevenue, currencySymbol)}</span>
                  <span className="text-amber-400">Cumul: {formatCurrency(d.cumulativeRevenue, currencySymbol)}</span>
                </div>

                <div className="w-full flex items-end justify-center h-32">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-sm transition-all duration-300 ${
                      d.isToday
                        ? 'bg-amber-400 shadow-md shadow-amber-400/30'
                        : d.isFuture
                        ? 'bg-neutral-800/40'
                        : d.dailyRevenue > 0
                        ? 'bg-amber-500/80 group-hover:bg-amber-400'
                        : 'bg-neutral-800/60'
                    }`}
                  />
                </div>
                <span
                  className={`text-[9px] font-mono ${
                    d.isToday ? 'text-amber-400 font-bold' : d.isFuture ? 'text-neutral-600' : 'text-neutral-400'
                  }`}
                >
                  {d.dayNumber}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[11px] text-neutral-400 px-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded bg-amber-500" />
              <span>Recorded Sales</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded bg-amber-400 ring-2 ring-amber-400/30" />
              <span>Today (Day 18)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded bg-neutral-800" />
              <span>Remaining Days</span>
            </div>
          </div>
          <span className="text-neutral-500">{stats.daysInMonth - stats.currentDay} days left in month</span>
        </div>
      </div>

      {/* Cumulative Day-by-Day Progression Breakdown Table */}
      <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Day-by-Day Cumulative Ledger
          </h3>
          <span className="text-xs text-neutral-400">Cumulative progress audit</span>
        </div>

        <div className="overflow-x-auto max-h-80 overflow-y-auto rounded-xl border border-neutral-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-neutral-950 text-neutral-400 uppercase tracking-wider text-[10px] sticky top-0 z-10 border-b border-neutral-800">
              <tr>
                <th className="py-2.5 px-3">Day</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Daily Sales</th>
                <th className="py-2.5 px-3 text-right">Daily Profit</th>
                <th className="py-2.5 px-3 text-right text-amber-400 font-bold">Cumulative Sales</th>
                <th className="py-2.5 px-3 text-right text-emerald-400 font-bold">Cumulative Profit</th>
                <th className="py-2.5 px-3 text-center">Orders</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 bg-neutral-900">
              {stats.dailyTrend.map((row) => (
                <tr
                  key={row.dayNumber}
                  className={`hover:bg-neutral-800/40 transition-colors ${
                    row.isToday ? 'bg-amber-500/10 font-medium' : row.isFuture ? 'text-neutral-500' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-mono font-bold">
                    {row.isToday ? (
                      <span className="px-1.5 py-0.5 rounded bg-amber-400 text-neutral-950 text-[10px]">
                        D{row.dayNumber} TODAY
                      </span>
                    ) : (
                      `Day ${row.dayNumber}`
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-neutral-400">{row.dateStr}</td>
                  <td className="py-2.5 px-3 text-right font-medium text-neutral-100">
                    {row.isFuture ? '—' : formatCurrency(row.dailyRevenue, currencySymbol)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-400">
                    {row.isFuture ? '—' : formatCurrency(row.dailyProfit, currencySymbol)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-amber-400">
                    {row.isFuture ? '—' : formatCurrency(row.cumulativeRevenue, currencySymbol)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                    {row.isFuture ? '—' : formatCurrency(row.cumulativeProfit, currencySymbol)}
                  </td>
                  <td className="py-2.5 px-3 text-center text-neutral-400">
                    {row.isFuture ? '—' : row.orderCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Estate Route Distribution Rankings */}
      <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            Top Performing Estate Routes This Month
          </h3>
          <span className="text-xs text-neutral-400">Distribution territory performance</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {estateRankings.map((est, idx) => (
            <div
              key={est.name}
              className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-neutral-800 text-neutral-300 flex items-center justify-center font-bold text-xs">
                  #{idx + 1}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-neutral-100">{est.name}</h4>
                  <span className="text-[11px] text-neutral-400">{est.orderCount} deliveries completed</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-black text-amber-400 font-display">
                  {formatCurrency(est.revenue, currencySymbol)}
                </div>
                <div className="text-[10px] text-emerald-400">
                  +{formatCurrency(est.profit, currencySymbol)} profit
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
