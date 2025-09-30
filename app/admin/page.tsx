'use client';

import React from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
          Panel administracyjny
        </h1>
        <p className="text-gray-600 mt-2">Zarządzaj systemem WorkTracker</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/admin/users"
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100 group hover:-translate-y-1"
        >
          <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Użytkownicy</h2>
          <p className="text-gray-600 leading-relaxed">Zarządzaj użytkownikami systemu, ich rolami i uprawnieniami</p>
        </Link>

        <Link
          href="/admin/clients"
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100 group hover:-translate-y-1"
        >
          <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-gradient-to-br from-secondary-500 to-secondary-600 text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Klienci</h2>
          <p className="text-gray-600 leading-relaxed">Zarządzaj klientami, przypisuj do użytkowników</p>
        </Link>

        <Link
          href="/admin/tasks"
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100 group hover:-translate-y-1"
        >
          <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Zadania</h2>
          <p className="text-gray-600 leading-relaxed">Przeglądaj wszystkie zadania w systemie</p>
        </Link>
      </div>

      <div className="mt-8 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-6 border border-primary-100">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Panel administracyjny</h3>
            <p className="text-sm text-gray-600">Tutaj możesz zarządzać wszystkimi zasobami systemu. Wybierz jedną z opcji powyżej, aby rozpocząć.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 