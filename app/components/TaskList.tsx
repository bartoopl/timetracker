'use client';

import { useState, useEffect } from 'react';
import { Task } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface TaskWithClient extends Task {
  client?: {
    id: string;
    name: string;
  } | null;
}

export default function TaskList() {
  const [tasks, setTasks] = useState<TaskWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      fetchTasks();
    }
  }, [session]);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = async () => {
    router.push('/tasks/new');
  };

  const handleStopTask = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}/stop`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to stop task');

      await fetchTasks();
    } catch (error) {
      console.error('Error stopping task:', error);
    }
  };

  if (!session) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please log in to view your tasks.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Twoje zadania
          </h2>
          <p className="text-gray-600 mt-1">Śledź swój czas pracy</p>
        </div>
        <button
          onClick={handleStartTask}
          className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-150 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          + Nowe zadanie
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-gray-100">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <p className="text-gray-600 text-lg">Brak zadań. Rozpocznij pierwsze zadanie!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white/80 backdrop-blur-sm p-5 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-150"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg">{task.title}</h3>
                    {!task.endTime && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-accent-100 to-accent-200 text-accent-800 rounded-full text-xs font-semibold">
                        <span className="w-2 h-2 bg-accent-500 rounded-full animate-pulse"></span>
                        W trakcie
                      </span>
                    )}
                  </div>
                  {task.description && (
                    <p className="text-gray-600 mb-3">{task.description}</p>
                  )}
                  {task.client && (
                    <div className="inline-flex items-center gap-1 mb-3">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-sm text-gray-600">
                        {task.client.name}
                      </span>
                    </div>
                  )}
                  <div className="flex gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>
                        Rozpoczęto: {new Date(task.startTime).toLocaleString('pl-PL')}
                      </span>
                    </div>
                    {task.endTime && (
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          Zakończono: {new Date(task.endTime).toLocaleString('pl-PL')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {!task.endTime && (
                  <button
                    onClick={() => handleStopTask(task.id)}
                    className="ml-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm shadow-md hover:shadow-lg"
                  >
                    Zakończ
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 