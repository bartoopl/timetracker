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
        <h2 className="text-2xl font-bold text-gray-900">Your Tasks</h2>
        <button
          onClick={handleStartTask}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Start New Task
        </button>
      </div>

      {tasks.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No tasks yet. Start your first task!</p>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{task.title}</h3>
                  {task.description && (
                    <p className="text-gray-600 mt-1">{task.description}</p>
                  )}
                  {task.client && (
                    <p className="text-sm text-gray-500 mt-1">
                      Client: {task.client.name}
                    </p>
                  )}
                  <div className="text-sm text-gray-500 mt-2">
                    <p>
                      Started:{' '}
                      {new Date(task.startTime).toLocaleString()}
                    </p>
                    {task.endTime && (
                      <p>
                        Ended:{' '}
                        {new Date(task.endTime).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                {!task.endTime && (
                  <button
                    onClick={() => handleStopTask(task.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition-colors text-sm"
                  >
                    Stop
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