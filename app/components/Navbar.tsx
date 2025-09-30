'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50 backdrop-blur-lg bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="font-bold text-lg bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  WorkTracker
                </span>
              </Link>
            </div>
            {session && (
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-2">
                  <Link
                    href="/dashboard"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive('/dashboard')
                        ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md'
                        : 'text-gray-700 hover:bg-primary-50'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/tasks"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive('/tasks')
                        ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md'
                        : 'text-gray-700 hover:bg-primary-50'
                    }`}
                  >
                    Zadania
                  </Link>
                  <Link
                    href="/reports"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive('/reports')
                        ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md'
                        : 'text-gray-700 hover:bg-primary-50'
                    }`}
                  >
                    Raporty
                  </Link>
                  {session?.user?.role === 'ADMIN' && (
                    <>
                      <Link
                        href="/admin/users"
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                          pathname?.startsWith('/admin/users')
                            ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md'
                            : 'text-gray-700 hover:bg-primary-50'
                        }`}
                      >
                        Użytkownicy
                      </Link>
                      <Link
                        href="/admin/clients"
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                          pathname?.startsWith('/admin/clients')
                            ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md'
                            : 'text-gray-700 hover:bg-primary-50'
                        }`}
                      >
                        Klienci
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              {session && (
                <div className="text-sm text-gray-700">
                  <span className="font-medium">{session.user?.name || session.user?.email}</span>
                  <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-700 rounded-md text-xs font-medium">
                    {session.user?.role}
                  </span>
                </div>
              )}
              {session ? (
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Wyloguj
                </button>
              ) : (
                <Link
                  href="/"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Zaloguj
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 