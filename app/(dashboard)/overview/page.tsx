'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PhoneCall, ShoppingCart, DollarSign, UtensilsCrossed, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

type OverviewData = {
  totalCallsToday: number;
  totalOrdersToday: number;
  revenue: number;
  mostOrderedItem: string;
  activeMenuItemsCount: number;
  unavailableItemsCount: number;
};

const kpiConfig = [
  {
    key: 'totalCallsToday',
    title: 'Calls Today',
    icon: PhoneCall,
    color: 'from-blue-500 to-blue-600',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-600'
  },
  {
    key: 'totalOrdersToday',
    title: 'Orders Today',
    icon: ShoppingCart,
    color: 'from-emerald-500 to-emerald-600',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-600'
  },
  {
    key: 'revenue',
    title: 'Revenue',
    icon: DollarSign,
    color: 'from-spice-500 to-spice-600',
    bgLight: 'bg-spice-50',
    textColor: 'text-spice-600'
  },
  {
    key: 'activeMenuItemsCount',
    title: 'Active Items',
    icon: UtensilsCrossed,
    color: 'from-violet-500 to-violet-600',
    bgLight: 'bg-violet-50',
    textColor: 'text-violet-600'
  }
] as const;

export default function OverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await fetch('/api/overview');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
      setLoading(false);
    };

    load();
  }, []);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="page-title">Overview</h1>
        <p className="mt-1 page-subtitle">Daily operations snapshot and key performance metrics</p>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {kpiConfig.map((card, index) => {
          const Icon = card.icon;
          const rawValue = data?.[card.key];
          const value = card.key === 'revenue' ? formatCurrency(Number(rawValue ?? 0)) : rawValue ?? 0;

          return (
            <motion.article
              key={card.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.08, ease: [0.4, 0, 0.2, 1] }}
              className="group relative overflow-hidden rounded-2xl border border-[var(--line)] bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
            >
              {/* Gradient accent line at top */}
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.color}`} />

              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-400">{card.title}</p>
                  {loading ? (
                    <div className="mt-3 h-9 w-28 animate-pulse rounded-lg bg-ink-100" />
                  ) : (
                    <p className="mt-3 text-3xl font-bold tracking-tight text-ink-900">{value}</p>
                  )}
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.bgLight}`}>
                  <Icon size={20} className={card.textColor} />
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

      {/* Bottom cards */}
      <div className="grid gap-5 lg:grid-cols-2">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.35 }}
          className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-card"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-spice-50">
              <TrendingUp size={18} className="text-spice-600" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-400">Most Ordered Item</p>
              <p className="mt-1 text-xl font-bold text-ink-900">
                {loading ? (
                  <span className="inline-block h-6 w-40 animate-pulse rounded-md bg-ink-100" />
                ) : (
                  data?.mostOrderedItem || 'N/A'
                )}
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.4 }}
          className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-card"
        >
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${(data?.unavailableItemsCount ?? 0) > 0 ? 'bg-amber-50' : 'bg-emerald-50'}`}>
              <AlertTriangle size={18} className={(data?.unavailableItemsCount ?? 0) > 0 ? 'text-amber-600' : 'text-emerald-600'} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-400">Availability Watch</p>
              <p className="mt-1 text-xl font-bold text-ink-900">
                {loading ? (
                  <span className="inline-block h-6 w-48 animate-pulse rounded-md bg-ink-100" />
                ) : (
                  <>
                    <span className={(data?.unavailableItemsCount ?? 0) > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                      {data?.unavailableItemsCount ?? 0}
                    </span>
                    {' '}unavailable items
                  </>
                )}
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
