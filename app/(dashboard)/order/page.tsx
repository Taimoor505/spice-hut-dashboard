'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FileSpreadsheet, PhoneCall } from 'lucide-react';

type CallLog = {
  id: string;
  customerName: string;
  phone: string;
  timestamp: string;
  orderSummary: string | null;
  recordingUrl: string | null;
};

export default function OrderPage() {
  const [logs, setLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const activeCallId = searchParams.get('callId');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await fetch('/api/call-logs');
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setLogs([]);
        setError(json?.error || 'Failed to load order sheet');
        setLoading(false);
        return;
      }

      setLogs(Array.isArray(json.logs) ? json.logs : []);
      setError('');
      setLoading(false);
    };

    load();
  }, []);

  useEffect(() => {
    if (!activeCallId || loading) return;
    const row = document.getElementById(`order-row-${activeCallId}`);
    if (!row) return;
    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeCallId, loading, logs]);

  const rows = useMemo(
    () =>
      logs.map((log, index) => ({
        srNo: index + 1,
        id: log.id,
        orderId: `ORD-${log.id.slice(-6).toUpperCase()}`,
        callTime: new Date(log.timestamp).toLocaleString(),
        customer: log.customerName || 'Customer name pending',
        phone: log.phone || 'Phone pending',
        items: log.orderSummary || 'Order items pending update',
        orderType: 'Not selected',
        address: 'Address pending',
        payment: 'Payment mode pending',
        amount: 'Amount pending',
        status: 'Open',
        notes: 'Additional notes pending',
        recordingUrl: log.recordingUrl
      })),
    [logs]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Order</h1>
        <p className="mt-1 page-subtitle">Excel-style order sheet with placeholders for complete order details</p>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-card">
        <div className="border-b border-[var(--line-light)] bg-[#faf8f6] px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink-700">
            <FileSpreadsheet size={16} className="text-spice-600" />
            Order Register
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1300px] table-fixed border-collapse text-sm">
            <thead className="bg-ink-50">
              <tr>
                {['S.No', 'Order ID', 'Call Time', 'Customer', 'Phone', 'Order Items', 'Order Type', 'Delivery Address', 'Payment', 'Total Amount', 'Status', 'Notes', 'Call Recording'].map((column) => (
                  <th key={column} className="border border-[var(--line-light)] px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.08em] text-ink-500">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={idx}>
                    {Array.from({ length: 13 }).map((__, cellIdx) => (
                      <td key={cellIdx} className="border border-[var(--line-light)] px-3 py-3">
                        <div className="h-4 w-full animate-pulse rounded bg-ink-100" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={13} className="border border-[var(--line-light)] px-3 py-10 text-center text-ink-400">
                    No order rows available yet.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    id={`order-row-${row.id}`}
                    key={row.id}
                    className={activeCallId === row.id ? 'bg-spice-50' : 'odd:bg-white even:bg-[#fcfbfa]'}
                  >
                    <td className="border border-[var(--line-light)] px-3 py-2">{row.srNo}</td>
                    <td className="border border-[var(--line-light)] px-3 py-2 font-medium text-ink-800">{row.orderId}</td>
                    <td className="border border-[var(--line-light)] px-3 py-2 text-ink-600">{row.callTime}</td>
                    <td className="border border-[var(--line-light)] px-3 py-2">{row.customer}</td>
                    <td className="border border-[var(--line-light)] px-3 py-2">{row.phone}</td>
                    <td className="border border-[var(--line-light)] px-3 py-2 text-ink-600">{row.items}</td>
                    <td className="border border-[var(--line-light)] px-3 py-2 text-ink-500">{row.orderType}</td>
                    <td className="border border-[var(--line-light)] px-3 py-2 text-ink-500">{row.address}</td>
                    <td className="border border-[var(--line-light)] px-3 py-2 text-ink-500">{row.payment}</td>
                    <td className="border border-[var(--line-light)] px-3 py-2 text-ink-500">{row.amount}</td>
                    <td className="border border-[var(--line-light)] px-3 py-2">{row.status}</td>
                    <td className="border border-[var(--line-light)] px-3 py-2 text-ink-500">{row.notes}</td>
                    <td className="border border-[var(--line-light)] px-3 py-2">
                      {row.recordingUrl ? (
                        <a
                          href={row.recordingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-spice-600 hover:text-spice-700"
                        >
                          <PhoneCall size={13} />
                          Open
                        </a>
                      ) : (
                        <span className="text-xs text-ink-400">N/A</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
