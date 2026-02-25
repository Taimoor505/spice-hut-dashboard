'use client';

import { useEffect, useState } from 'react';
import { Copy, CheckCircle2, Zap, Shield } from 'lucide-react';

function CopyField({ label, value, hint }: { label: string; value: string; hint: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-4 transition-shadow hover:shadow-card">
      <div className="flex items-center gap-2 mb-3">
        <p className="text-sm font-semibold text-ink-800">{label}</p>
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-[var(--line-light)] bg-[#faf8f6] p-2">
        <code className="flex-1 truncate px-2 text-xs text-ink-600 font-mono">{value}</code>
        <button
          onClick={onCopy}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
            copied
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-white text-ink-600 border border-[var(--line)] hover:bg-ink-50 hover:text-ink-800'
          }`}
        >
          {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="mt-2.5 flex items-center gap-1.5">
        <Shield size={12} className="text-ink-400" />
        <p className="text-2xs text-ink-400">{hint}</p>
      </div>
    </div>
  );
}

export default function AISettingsPage() {
  const [base, setBase] = useState('');

  useEffect(() => {
    setBase(window.location.origin);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">AI Integration</h1>
        <p className="mt-1 page-subtitle">Webhook and payload endpoints for GoHighLevel agents</p>
      </div>

      {/* Connection status card */}
      <div className="rounded-2xl border border-[var(--line)] bg-white shadow-card overflow-hidden">
        {/* Status header */}
        <div className="flex items-center justify-between border-b border-[var(--line-light)] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
              <Zap size={18} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-800">Connection Status</p>
              <p className="text-2xs text-ink-400">Real-time AI agent connectivity</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <span className="status-dot bg-emerald-500 pulse-soft" />
            Online
          </div>
        </div>

        {/* Endpoints */}
        <div className="grid gap-4 p-6 md:grid-cols-2">
          <CopyField
            label="📡 Call Log Webhook"
            value={`${base || 'https://your-domain.com'}/api/call-log-webhook`}
            hint="Header required: x-webhook-secret"
          />
          <CopyField
            label="🔗 AI Menu Payload"
            value={`${base || 'https://your-domain.com'}/api/ai-menu-payload`}
            hint="Header required: x-ai-menu-token"
          />
        </div>
      </div>

      {/* Integration guide */}
      <div className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-card">
        <h2 className="text-base font-bold text-ink-900">Quick Setup Guide</h2>
        <div className="mt-4 space-y-3">
          {[
            { step: '1', text: 'Copy the Call Log Webhook URL and paste it into your GoHighLevel workflow trigger.' },
            { step: '2', text: 'Set the x-webhook-secret header to match your WEBHOOK_SECRET environment variable.' },
            { step: '3', text: 'Copy the AI Menu Payload URL for your AI agent to fetch real-time menu data.' },
            { step: '4', text: 'Set the x-ai-menu-token header to match your AI_MENU_TOKEN environment variable.' }
          ].map((item) => (
            <div key={item.step} className="flex gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-spice-50 text-xs font-bold text-spice-600">
                {item.step}
              </div>
              <p className="text-sm leading-relaxed text-ink-600 pt-0.5">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
