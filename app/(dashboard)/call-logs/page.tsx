'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Download, PhoneCall, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type CallLog = {
  id: string;
  customerName: string;
  phone: string;
  direction: 'INBOUND' | 'OUTBOUND';
  status: 'COMPLETED' | 'MISSED' | 'FAILED';
  duration: number;
  timestamp: string;
  recordingUrl: string | null;
  transcription: string;
  orderSummary: string | null;
  aiConfidence: number | null;
};

function statusBadge(status: CallLog['status']) {
  const map = {
    COMPLETED: 'badge-success',
    MISSED: 'badge-warning',
    FAILED: 'badge-danger'
  };
  return map[status] || 'badge-neutral';
}

function directionBadge(direction: CallLog['direction']) {
  return direction === 'INBOUND' ? 'badge-info' : 'badge border-violet-200 bg-violet-50 text-violet-700';
}

export default function CallLogsPage() {
  const [logs, setLogs] = useState<CallLog[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [direction, setDirection] = useState('');
  const [sortBy, setSortBy] = useState<'timestamp' | 'duration'>('timestamp');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (status) params.set('status', status);
    if (direction) params.set('direction', direction);

    const res = await fetch(`/api/call-logs?${params.toString()}`);
    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      setLogs([]);
      setError(json?.error || 'Failed to load call logs');
      setLoading(false);
      return;
    }

    setLogs(Array.isArray(json.logs) ? json.logs : []);
    setError('');
    setLoading(false);
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, []);

  const sorted = useMemo(() => {
    const clone = [...logs];
    clone.sort((a, b) => {
      if (sortBy === 'duration') return b.duration - a.duration;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    return clone;
  }, [logs, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">Call Logs</h1>
          <p className="mt-1 page-subtitle">AI call activity with transcript and order extraction</p>
        </div>
        <a href="/api/call-logs/export">
          <Button variant="secondary" size="sm" className="gap-1.5">
            <Download size={14} />
            Export CSV
          </Button>
        </a>
      </div>

      {/* Filters */}
      <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={14} className="text-ink-400" />
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-400">Filters</span>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <div className="relative md:col-span-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" size={15} />
            <Input className="pl-10" placeholder="Search phone..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <select
            className="filter-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="MISSED">Missed</option>
            <option value="FAILED">Failed</option>
          </select>
          <select
            className="filter-select"
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
          >
            <option value="">All Directions</option>
            <option value="INBOUND">Inbound</option>
            <option value="OUTBOUND">Outbound</option>
          </select>
          <Button onClick={load} className="w-full">Apply Filters</Button>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[var(--line-light)] pt-3">
          <p className="text-xs font-medium text-ink-400">
            {loading ? 'Refreshing...' : `${sorted.length} call${sorted.length !== 1 ? 's' : ''} found`}
          </p>
          <select
            className="rounded-lg border border-[var(--line)] bg-white px-2.5 py-1.5 text-xs text-ink-600 outline-none"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'timestamp' | 'duration')}
          >
            <option value="timestamp">Sort by time</option>
            <option value="duration">Sort by duration</option>
          </select>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}
      </section>

      {/* Call list */}
      <section className="space-y-3">
        {loading && sorted.length === 0 ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-20 animate-pulse rounded-2xl border border-[var(--line)] bg-white" />
            ))}
          </div>
        ) : sorted.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--line)] bg-white py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink-100">
              <PhoneCall size={20} className="text-ink-400" />
            </div>
            <p className="mt-4 text-sm font-medium text-ink-600">No call logs found</p>
            <p className="mt-1 text-xs text-ink-400">Try adjusting your filters or check back later</p>
          </div>
        ) : null}

        {sorted.map((log) => {
          const isOpen = expanded === log.id;
          return (
            <article
              key={log.id}
              className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-card transition-shadow duration-200 hover:shadow-card-hover"
            >
              <button
                onClick={() => setExpanded(isOpen ? null : log.id)}
                className="w-full px-5 py-4 text-left transition-colors hover:bg-ink-50/50"
              >
                <div className="grid gap-3 md:grid-cols-[1.8fr_1fr_1fr_1.2fr_auto] md:items-center">
                  <div>
                    <p className="font-semibold text-ink-900">{log.customerName}</p>
                    <p className="mt-0.5 text-sm text-ink-400">{log.phone}</p>
                  </div>
                  <span className={directionBadge(log.direction)}>
                    {log.direction}
                  </span>
                  <span className={statusBadge(log.status)}>
                    {log.status}
                  </span>
                  <p className="text-sm text-ink-500 md:text-right">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                  <ChevronDown
                    size={16}
                    className={`justify-self-end text-ink-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                    className="border-t border-[var(--line-light)]"
                  >
                    <div className="grid gap-4 p-5 lg:grid-cols-2">
                      {/* Transcription */}
                      <div className="rounded-xl border border-[var(--line-light)] bg-[#faf8f6] p-4">
                        <p className="text-2xs font-semibold uppercase tracking-[0.1em] text-ink-400">Transcription</p>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-700">{log.transcription}</p>
                      </div>

                      {/* Details */}
                      <div className="space-y-4">
                        <div className="rounded-xl border border-[var(--line-light)] bg-[#faf8f6] p-4">
                          <p className="text-2xs font-semibold uppercase tracking-[0.1em] text-ink-400">Order Summary</p>
                          <p className="mt-3 text-sm text-ink-700">{log.orderSummary || 'No order parsed for this call.'}</p>
                        </div>

                        <div className="rounded-xl border border-[var(--line-light)] bg-[#faf8f6] p-4">
                          <div className="flex items-center justify-between">
                            <p className="text-2xs font-semibold uppercase tracking-[0.1em] text-ink-400">AI Confidence</p>
                            <span className="text-sm font-bold text-ink-800">
                              {log.aiConfidence !== null ? `${Math.round(log.aiConfidence * 100)}%` : 'N/A'}
                            </span>
                          </div>
                          <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink-100">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-spice-400 to-spice-600 transition-all duration-500"
                              style={{ width: `${Math.max(4, Math.round((log.aiConfidence ?? 0) * 100))}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between rounded-xl border border-[var(--line-light)] bg-[#faf8f6] px-4 py-3 text-sm">
                          <span className="text-ink-500">Duration: <span className="font-semibold text-ink-800">{log.duration}s</span></span>
                          {log.recordingUrl ? (
                            <a
                              href={log.recordingUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 font-medium text-spice-600 transition hover:text-spice-700"
                            >
                              <PhoneCall size={14} /> Play Recording
                            </a>
                          ) : (
                            <span className="text-ink-400">No recording</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </article>
          );
        })}
      </section>
    </div>
  );
}
