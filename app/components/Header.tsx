'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-48">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center">
              <Image
                src="/images/logo.png"
                alt="Logo"
                width={320}
                height={320}
                className="h-40 w-40 object-contain"
                priority
              />
            </Link>
          </div>
          {session && (
            <div className="flex items-center space-x-8 text-xl">
              <Link
                href="/tasks"
                className="text-gray-600 hover:text-gray-900"
              >
                Zadania
              </Link>
              <Link
                href="/reports"
                className="text-gray-600 hover:text-gray-900"
              >
                Raporty
              </Link>
              <button
                onClick={() => signOut()}
                className="text-gray-600 hover:text-gray-900"
              >
                Wyloguj
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 