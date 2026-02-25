import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen">
      {/* Left decorative panel */}
      <div className="hidden w-[45%] flex-col justify-between bg-[#1b1918] p-10 lg:flex">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-spice-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Spice Hut</span>
          </div>
        </div>

        <div>
          <blockquote className="text-xl font-medium leading-relaxed text-white/80">
            &ldquo;Streamline your restaurant operations with AI-powered call management and real-time menu control.&rdquo;
          </blockquote>
          <p className="mt-4 text-sm text-white/40">Operations Dashboard v1.0</p>
        </div>

        <p className="text-xs text-white/30">&copy; 2026 Spice Hut. All rights reserved.</p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center bg-[var(--surface-bg)] px-6 py-12">
        {children}
      </div>
    </main>
  );
}
