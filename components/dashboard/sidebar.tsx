'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, PhoneCall, UtensilsCrossed, Bot, X, LogOut, Flame, Sheet } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/call-logs', label: 'Call Logs', icon: PhoneCall },
  { href: '/order', label: 'Order', icon: Sheet },
  { href: '/menu', label: 'Menu', icon: UtensilsCrossed },
  { href: '/ai-settings', label: 'AI Integration', icon: Bot }
];

type SidebarProps = {
  open?: boolean;
  onClose?: () => void;
};

export function Sidebar({ open = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const navContent = (
    <>
      {/* Brand */}
      <div className="mb-8 px-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-spice-600 shadow-glow-spice">
            <Flame size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white tracking-tight">Spice Hut</p>
            <p className="text-2xs text-ink-400 uppercase tracking-[0.15em]">Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2">
        <p className="mb-2 px-3 text-2xs font-semibold uppercase tracking-[0.15em] text-ink-500">
          Navigation
        </p>
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200',
                active
                  ? 'bg-white/10 text-white shadow-sm backdrop-blur-sm'
                  : 'text-ink-400 hover:bg-white/[0.06] hover:text-ink-200'
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200',
                  active
                    ? 'bg-spice-600 text-white shadow-glow-spice'
                    : 'bg-white/[0.06] text-ink-400 group-hover:bg-white/10 group-hover:text-ink-200'
                )}
              >
                <Icon size={16} />
              </div>
              <span>{link.label}</span>
              {active && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-spice-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="mt-auto border-t border-white/[0.08] px-2 pt-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-ink-400 transition-all duration-200 hover:bg-white/[0.06] hover:text-ink-200"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06]">
            <LogOut size={15} />
          </div>
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden h-screen w-[260px] shrink-0 flex-col bg-[var(--surface-sidebar)] py-5 md:flex md:sticky md:top-0">
        {navContent}
      </aside>

      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-200 md:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
      />

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-[var(--surface-sidebar)] py-5 transition-transform duration-300 ease-out md:hidden',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="absolute right-3 top-4">
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-ink-300 transition hover:bg-white/15 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
        {navContent}
      </aside>
    </>
  );
}
