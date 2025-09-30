import React from 'react';
import { ReactNode } from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {children}
    </main>
  );
} 