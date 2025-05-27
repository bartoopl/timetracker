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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toPDF, targetRef } = usePDF({ filename: 'raport-zadan.pdf' });

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTasks();
    }
  }, [status, session]);

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
        
        const formattedStartDate = start.toISOString().split('T')[0];
        const formattedEndDate = end.toISOString().split('T')[0];
        
        url.searchParams.set('startDate', formattedStartDate);
        url.searchParams.set('endDate', formattedEndDate);
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch tasks');
      }

      const data = await response.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
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

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setStartDate(value);
    } else {
      setEndDate(value);
    }

    if (startDate && endDate) {
      fetchTasks();
    } else if (type === 'start' && endDate) {
      fetchTasks();
    } else if (type === 'end' && startDate) {
      fetchTasks();
    }
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
          <div className="text-center">Ładowanie zadań...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  const stats = calculateStats();
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold mb-6">Raporty</h1>
          
          <div className="mb-6 flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data początkowa
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleDateChange('start', e.target.value)}
                className="border rounded px-3 py-2"
                min="2025-01-01"
                max="2025-12-31"
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
                className="border rounded px-3 py-2"
                min="2025-01-01"
                max="2025-12-31"
              />
            </div>
            <button
              onClick={() => toPDF()}
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
            >
              Exportuj do PDF
            </button>
          </div>

          <div ref={targetRef}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Łączna liczba zadań</h3>
                <p className="text-3xl font-bold text-black">{stats.totalTasks}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Łączny czas pracy</h3>
                <p className="text-3xl font-bold text-black">
                  {formatDuration(stats.totalDuration)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Średni czas zadania</h3>
                <p className="text-3xl font-bold text-black">
                  {formatDuration(stats.averageDuration)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Zadania według dnia</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.tasksByDay}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#8884d8" name="Liczba zadań" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Zadania według użytkownika</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.tasksByUser}
                        dataKey="count"
                        nameKey="user"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {stats.tasksByUser.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Lista zadań</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Zadanie
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Użytkownik
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data rozpoczęcia
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data zakończenia
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Czas trwania
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tasks.map((task) => (
                        <tr key={task.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {task.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {task.user.name} ({task.user.email})
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {new Date(task.startTime).toLocaleString('pl-PL')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {task.endTime ? new Date(task.endTime).toLocaleString('pl-PL') : 'W trakcie'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {formatDuration(task.duration)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 