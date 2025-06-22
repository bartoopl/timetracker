'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRef } from 'react';
import { usePDF } from 'react-to-pdf';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface Task {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  duration: number;
  user: {
    name: string;
    email: string;
  };
  client: {
    id: string;
    name: string;
  } | null;
}

interface TaskStats {
  totalTasks: number;
  totalDuration: number;
  averageDuration: number;
  tasksByDay: { date: string; count: number }[];
  tasksByUser: { user: string; count: number }[];
}

export default function Reports() {
  const { data: session, status } = useSession();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [clients, setClients] = useState<{ id: string; name: string; }[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string; }[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toPDF, targetRef } = usePDF({ filename: 'raport-zadan.pdf' });

  useEffect(() => {
    if (status === 'authenticated') {
      fetchClients();
      if (session.user.role === 'ADMIN') {
        fetchUsers();
      }
      fetchTasks();
    }
  }, [status, session]);

  const fetchClients = async () => {
    try {
      console.log('Fetching clients...');
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
      console.log('Fetched clients:', data);
      setClients(data);
    } catch (error) {
      console.error('Błąd podczas pobierania klientów:', error);
      setClients([]);
    }
  };

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
      setUsers([]);
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);

    try {
      const url = new URL('/api/tasks/all', window.location.origin);
      
      if (startDate && endDate) {
        const start = new Date(startDate);
        start.setUTCHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setUTCHours(23, 59, 59, 999);
        
        url.searchParams.set('startDate', start.toISOString());
        url.searchParams.set('endDate', end.toISOString());
      }

      if (selectedClientId) {
        url.searchParams.set('clientId', selectedClientId);
      }

      if (selectedUserId) {
        url.searchParams.set('userId', selectedUserId);
      }
      
      console.log('Fetching tasks with URL:', url.toString());
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch tasks');
      }

      const data = await response.json();
      console.log('Fetched tasks:', data.map((task: any) => ({
        id: task.id,
        title: task.title,
        clientId: task.clientId,
        client: task.client,
        startTime: task.startTime,
        endTime: task.endTime
      })));
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (duration: number) => {
    if (!duration || isNaN(duration)) return '0h 0m';
    
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
  };

  const handleClientChange = (clientId: string) => {
    console.log('Client changed to:', clientId);
    setSelectedClientId(clientId);
  };

  const handleUserChange = (userId: string) => {
    setSelectedUserId(userId);
  };

  const handleFilter = () => {
    if (!startDate || !endDate) {
      setError('Wybierz zakres dat');
      return;
    }
    fetchTasks();
  };

  const calculateStats = (): TaskStats => {
    const totalTasks = tasks.length;
    const totalDuration = tasks.reduce((acc, task) => acc + (task.duration || 0), 0);
    const averageDuration = totalTasks > 0 ? totalDuration / totalTasks : 0;

    // Group tasks by day
    const tasksByDay = tasks.reduce((acc: { [key: string]: number }, task) => {
      const date = new Date(task.startTime).toLocaleDateString('pl-PL');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Group tasks by user
    const tasksByUser = tasks.reduce((acc: { [key: string]: number }, task) => {
      const user = task.user.name;
      acc[user] = (acc[user] || 0) + 1;
      return acc;
    }, {});

    return {
      totalTasks,
      totalDuration,
      averageDuration,
      tasksByDay: Object.entries(tasksByDay).map(([date, count]) => ({ date, count })),
      tasksByUser: Object.entries(tasksByUser).map(([user, count]) => ({ user, count }))
    };
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Ładowanie sesji...</div>
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
          <div className="text-center">Ładowanie danych...</div>
        </div>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold mb-6">Raporty</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-600">Łączna liczba zadań</h3>
              <p className="text-2xl font-bold text-blue-700">{stats.totalTasks}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-600">Łączny czas</h3>
              <p className="text-2xl font-bold text-green-700">{formatDuration(stats.totalDuration)}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-purple-600">Średni czas zadania</h3>
              <p className="text-2xl font-bold text-purple-700">{formatDuration(stats.averageDuration)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data początkowa
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleDateChange('start', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data końcowa
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleDateChange('end', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Klient
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => handleClientChange(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Wszyscy klienci</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            {session?.user.role === 'ADMIN' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Użytkownik
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => handleUserChange(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="">Wszyscy użytkownicy</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="mb-6">
            <button
              onClick={handleFilter}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Filtruj
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div ref={targetRef} className="print-optimized">
            {/* Nagłówek raportu */}
            <div className="bg-white p-6 rounded-lg shadow mb-6 text-center">
              <h2 className="text-xl font-bold mb-2">
                Raport dla {selectedClientId ? clients.find(c => c.id === selectedClientId)?.name || 'Wszystkich klientów' : 'Wszystkich klientów'}
              </h2>
              <p className="text-gray-600">
                za pracę w okresie {startDate && endDate ? `${new Date(startDate).toLocaleDateString('pl-PL')} - ${new Date(endDate).toLocaleDateString('pl-PL')}` : 'wszystkich dat'}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 no-print">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">Zadania według dnia</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.tasksByDay}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#3B82F6" name="Liczba zadań" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">Zadania według użytkownika</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.tasksByUser}
                        dataKey="count"
                        nameKey="user"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label
                      >
                        {stats.tasksByUser.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">Lista zadań</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">
                        Tytuł
                      </th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                        Klient
                      </th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                        Użytkownik
                      </th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                        Data
                      </th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                        Czas
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tasks.map((task) => (
                      <tr key={task.id} className="page-break-inside-avoid">
                        <td className="px-2 py-2 text-xs text-gray-900 align-top">
                          <div className="max-w-xs break-words">
                            {task.title}
                          </div>
                        </td>
                        <td className="px-2 py-2 text-xs text-gray-500 align-top">
                          {task.client?.name || '-'}
                        </td>
                        <td className="px-2 py-2 text-xs text-gray-500 align-top">
                          {task.user.name}
                        </td>
                        <td className="px-2 py-2 text-xs text-gray-500 align-top">
                          {formatDate(task.startTime)}
                        </td>
                        <td className="px-2 py-2 text-xs text-gray-500 align-top">
                          {formatDuration(task.duration)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={() => toPDF()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Pobierz raport PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 