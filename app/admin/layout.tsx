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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <nav className="bg-white/80 backdrop-blur-lg shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/admin" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                    Panel Administratora
                  </span>
                </Link>
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-2">
                <Link
                  href="/admin"
                  className="text-gray-700 hover:bg-primary-50 px-4 py-2 rounded-lg inline-flex items-center text-sm font-medium transition-all duration-150"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/users"
                  className="text-gray-700 hover:bg-primary-50 px-4 py-2 rounded-lg inline-flex items-center text-sm font-medium transition-all duration-150"
                >
                  Użytkownicy
                </Link>
                <Link
                  href="/admin/clients"
                  className="text-gray-700 hover:bg-primary-50 px-4 py-2 rounded-lg inline-flex items-center text-sm font-medium transition-all duration-150"
                >
                  Klienci
                </Link>
                <Link
                  href="/admin/tasks"
                  className="text-gray-700 hover:bg-primary-50 px-4 py-2 rounded-lg inline-flex items-center text-sm font-medium transition-all duration-150"
                >
                  Zadania
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
              >
                ← Wróć do aplikacji
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
} 