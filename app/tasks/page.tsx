'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
}

export default function TasksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'startTime' | 'endTime'>('startTime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTasks();
    }
  }, [status]);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks/all', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Błąd podczas pobierania zadań');
      }
      
      const data = await response.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Błąd podczas pobierania zadań:', error);
      setError(error instanceof Error ? error.message : 'Wystąpił nieznany błąd');
    } finally {
      setIsLoading(false);
    }
  };

  const stopTask = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Błąd podczas zatrzymywania zadania');
      }

      fetchTasks();
    } catch (error) {
      console.error('Błąd podczas zatrzymywania zadania:', error);
      setError(error instanceof Error ? error.message : 'Wystąpił nieznany błąd');
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.endTime;
    if (filter === 'completed') return task.endTime;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const dateA = new Date(filter === 'completed' ? a.endTime! : a.startTime);
    const dateB = new Date(filter === 'completed' ? b.endTime! : b.startTime);
    return sortOrder === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
  });

  const calculateDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Ładowanie...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Zarządzanie zadaniami</h1>
          <Link
            href="/dashboard"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90"
          >
            Wróć do dashboardu
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Filtruj:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'completed')}
                className="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              >
                <option value="all">Wszystkie</option>
                <option value="active">Aktywne</option>
                <option value="completed">Zakończone</option>
              </select>
            </div>
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Sortuj po:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'startTime' | 'endTime')}
                className="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              >
                <option value="startTime">Czas rozpoczęcia</option>
                <option value="endTime">Czas zakończenia</option>
              </select>
            </div>
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Kolejność:</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              >
                <option value="desc">Malejąco</option>
                <option value="asc">Rosnąco</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tytuł
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Opis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rozpoczęto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zakończono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Czas trwania
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedTasks.map((task) => (
                  <tr key={task.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {task.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {task.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(task.startTime).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {task.endTime ? new Date(task.endTime).toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {calculateDuration(task.startTime, task.endTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        task.endTime ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {task.endTime ? 'Zakończone' : 'Aktywne'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {!task.endTime && (
                        <button
                          onClick={() => stopTask(task.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Zakończ
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 