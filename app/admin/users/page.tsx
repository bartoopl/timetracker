'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User } from '@/types/user';

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      if (session.user.role !== 'ADMIN') {
        router.push('/');
        return;
      }
      fetchUsers();
    }
  }, [status, session, router]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Błąd podczas pobierania użytkowników');
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Błąd podczas pobierania użytkowników:', error);
      setError('Nie udało się pobrać listy użytkowników');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Ładowanie...</div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-red-500">Nie jesteś zalogowany</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Ładowanie użytkowników...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Użytkownicy
            </h1>
            <p className="text-gray-600 mt-1">Zarządzaj użytkownikami systemu</p>
          </div>
          <button
            onClick={() => router.push('/admin/users/new')}
            className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 transform hover:-translate-y-0.5"
          >
            + Dodaj użytkownika
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <ul className="divide-y divide-gray-200">
            {users.map((user) => (
              <li key={user.id} className="hover:bg-gray-50 transition-colors">
                <div className="px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                          <span className="text-primary-700 text-lg font-semibold">
                            {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {user.name || 'Brak nazwy'}
                        </div>
                        <div className="text-sm text-gray-600 mt-0.5">
                          {user.email || 'Brak emaila'}
                        </div>
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'ADMIN'
                              ? 'bg-gradient-to-r from-accent-100 to-accent-200 text-accent-800'
                              : 'bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-800'
                          }`}>
                            {user.role === 'ADMIN' ? 'Administrator' : 'Użytkownik'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => router.push(`/admin/users/${user.id}`)}
                        className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        Edytuj
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
} 