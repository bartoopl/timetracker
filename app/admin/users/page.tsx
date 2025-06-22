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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Użytkownicy</h1>
            <button
              onClick={() => router.push('/admin/users/new')}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Dodaj nowego użytkownika
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {users.map((user) => (
                <li key={user.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-lg font-medium">
                              {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || 'Brak nazwy'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email || 'Brak emaila'}
                          </div>
                          <div className="text-sm text-gray-500">
                            Rola: {user.role}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => router.push(`/admin/users/${user.id}`)}
                          className="text-blue-600 hover:text-blue-900"
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
    </div>
  );
} 