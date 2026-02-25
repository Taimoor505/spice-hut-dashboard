import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAuthToken } from '@/lib/jwt';
import { DashboardShell } from '@/components/dashboard/shell';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('spice_hut_token')?.value;

  if (!token) redirect('/login');

  const user = await verifyAuthToken(token);
  if (!user) redirect('/login');

  return (
    <DashboardShell userName={user.name} userRole={user.role}>
      {children}
    </DashboardShell>
  );
}
