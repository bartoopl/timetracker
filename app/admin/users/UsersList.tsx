'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User } from '@/types/user';

export default function UsersList({ users }: { users: User[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tego użytkownika?')) {
      return;
    }

    setDeletingId(id);
    setError('');

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Nie udało się usunąć użytkownika');
      }

      router.refresh();
    } catch (error) {
      setError('Nie udało się usunąć użytkownika');
    } finally {
      setDeletingId(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    setError('');

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error('Nie udało się zaktualizować uprawnień');
      }

      router.refresh();
    } catch (error) {
      setError('Nie udało się zaktualizować uprawnień');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Użytkownicy</h1>
        <Link
          href="/admin/users/new"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Dodaj nowego użytkownika
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
          {error}
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
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edytuj
                    </Link>
                    <button
                      onClick={() => handleDelete(user.id)}
                      disabled={deletingId === user.id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      {deletingId === user.id ? 'Usuwanie...' : 'Usuń'}
                    </button>
                    <div className="flex items-center space-x-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={updatingId === user.id}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="USER">Użytkownik</option>
                        <option value="ADMIN">Administrator</option>
                      </select>
                      {updatingId === user.id && (
                        <span className="text-sm text-gray-500">Aktualizacja...</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 