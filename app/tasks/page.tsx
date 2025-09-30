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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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

  // Pagination
  const totalPages = Math.ceil(sortedTasks.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTasks = sortedTasks.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Generate page numbers with ellipsis for long lists
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Maximum number of page buttons to show

    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Zarządzanie zadaniami
            </h1>
            <p className="mt-2 text-gray-600">Przeglądaj i zarządzaj wszystkimi zadaniami</p>
          </div>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 transition-all duration-150"
          >
            Wróć do dashboardu
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-gray-100">
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-gray-700">Filtruj:</label>
              <select
                value={filter}
                onChange={(e) => { setFilter(e.target.value as 'all' | 'active' | 'completed'); setCurrentPage(1); }}
                className="rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="all">Wszystkie</option>
                <option value="active">Aktywne</option>
                <option value="completed">Zakończone</option>
              </select>
            </div>
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-gray-700">Sortuj po:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'startTime' | 'endTime')}
                className="rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="startTime">Czas rozpoczęcia</option>
                <option value="endTime">Czas zakończenia</option>
              </select>
            </div>
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-gray-700">Kolejność:</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
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
                {currentTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50 transition-colors">
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
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        task.endTime
                          ? 'bg-gradient-to-r from-secondary-100 to-secondary-200 text-secondary-800'
                          : 'bg-gradient-to-r from-accent-100 to-accent-200 text-accent-800'
                      }`}>
                        {task.endTime ? 'Zakończone' : 'Aktywne'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {!task.endTime && (
                        <button
                          onClick={() => stopTask(task.id)}
                          className="text-red-600 hover:text-red-800 font-medium transition-colors"
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Poprzednia
                </button>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Następna
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Wyświetlanie <span className="font-medium">{indexOfFirstItem + 1}</span> do{' '}
                    <span className="font-medium">{Math.min(indexOfLastItem, sortedTasks.length)}</span> z{' '}
                    <span className="font-medium">{sortedTasks.length}</span> wyników
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="sr-only">Poprzednia</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {getPageNumbers().map((page, index) => {
                      if (page === '...') {
                        return (
                          <span
                            key={`ellipsis-${index}`}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                          >
                            ...
                          </span>
                        );
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => paginate(page as number)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-all duration-150 ${
                            currentPage === page
                              ? 'z-10 bg-gradient-to-r from-primary-500 to-secondary-500 border-primary-500 text-white shadow-md'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="sr-only">Następna</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 