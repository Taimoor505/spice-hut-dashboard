'use client';

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Menu, Bell } from 'lucide-react';
import { Sidebar } from '@/components/dashboard/sidebar';

type DashboardShellProps = {
  userName: string;
  userRole: string;
  children: ReactNode;
};

export function DashboardShell({ userName, userRole, children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = useMemo(() => {
    const parts = userName.split(' ').filter(Boolean);
    if (parts.length === 0) return 'SH';
    return `${parts[0][0] || ''}${parts[1]?.[0] || ''}`.toUpperCase();
  }, [userName]);

  return (
    <div className="min-h-screen md:flex">
      <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex min-h-screen flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--line)] bg-white/80 px-4 backdrop-blur-xl md:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--line)] bg-white text-ink-600 shadow-card transition hover:bg-ink-50 md:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={16} />
            </button>

            {/* Breadcrumb area - just brand on mobile */}
            <div className="hidden items-center gap-3 md:flex">
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                <span className="status-dot bg-emerald-500 pulse-soft" />
                AI Online
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--line)] bg-white text-ink-500 shadow-card transition hover:bg-ink-50 hover:text-ink-700">
              <Bell size={16} />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-spice-500" />
            </button>

            {/* Divider */}
            <div className="hidden h-8 w-px bg-[var(--line)] sm:block" />

            {/* User info */}
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-ink-800 leading-tight">{userName}</p>
                <p className="text-2xs uppercase tracking-wider text-ink-400">{userRole}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-spice-500 to-spice-700 text-xs font-bold text-white shadow-sm">
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
