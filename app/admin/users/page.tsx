'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
}

export default function UserPermissions() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [userClients, setUserClients] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      if (session.user.role !== 'ADMIN') {
        router.push('/');
        return;
      }
      fetchUsers();
      fetchClients();
    }
  }, [status, session, router]);

  const fetchUsers = async () => {
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
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Błąd podczas pobierania klientów');
      }
      
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error('Błąd podczas pobierania klientów:', error);
      setError('Nie udało się pobrać listy klientów');
    }
  };

  const fetchUserClients = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/clients`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Błąd podczas pobierania klientów użytkownika');
      }
      
      const data = await response.json();
      setUserClients(data.map((client: Client) => client.id));
    } catch (error) {
      console.error('Błąd podczas pobierania klientów użytkownika:', error);
      setError('Nie udało się pobrać listy klientów użytkownika');
    }
  };

  const handleUserChange = (userId: string) => {
    setSelectedUser(userId);
    if (userId) {
      fetchUserClients(userId);
    } else {
      setUserClients([]);
    }
  };

  const handleClientToggle = (clientId: string) => {
    setUserClients(prev => {
      if (prev.includes(clientId)) {
        return prev.filter(id => id !== clientId);
      } else {
        return [...prev, clientId];
      }
    });
  };

  const handleSave = async () => {
    if (!selectedUser) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${selectedUser}/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          clientIds: userClients,
        }),
      });

      if (!response.ok) {
        throw new Error('Błąd podczas zapisywania uprawnień');
      }

      alert('Uprawnienia zostały zapisane');
    } catch (error) {
      console.error('Błąd podczas zapisywania uprawnień:', error);
      setError('Nie udało się zapisać uprawnień');
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

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Zarządzanie uprawnieniami użytkowników</h1>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wybierz użytkownika
              </label>
              <select
                value={selectedUser}
                onChange={(e) => handleUserChange(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              >
                <option value="">Wybierz użytkownika</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email}) - {user.role}
                  </option>
                ))}
              </select>
            </div>

            {selectedUser && (
              <div>
                <h2 className="text-lg font-medium mb-4">Przypisani klienci</h2>
                <div className="space-y-2">
                  {clients.map((client) => (
                    <label key={client.id} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={userClients.includes(client.id)}
                        onChange={() => handleClientToggle(client.id)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">
                        {client.name} ({client.email})
                      </span>
                    </label>
                  ))}
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                  >
                    {loading ? 'Zapisywanie...' : 'Zapisz uprawnienia'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 