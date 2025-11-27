import React, { useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ListTodo, Plus, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { menuItems } from '@/components/NavigationConfig';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { toast } from 'sonner';

import TaskColumn from '../components/tasks/TaskColumn';
import TaskModal from '../components/tasks/TaskModal';

const STATUSES = ['todo', 'in_progress', 'review', 'done'];
const TASK_CATEGORIES = [
  ...menuItems.map(item => item.label),
  'Feedback',
  'Bugs',
  'Features'
];

const TasksPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list({ sort: { created_date: -1 } }),
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task updated successfully!');
    },
    onError: () => toast.error('Failed to update task.'),
  });

  const createTaskMutation = useMutation({
    mutationFn: (data) => base44.entities.Task.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created successfully!');
    },
    onError: () => toast.error('Failed to create task.'),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id) => base44.entities.Task.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted.');
    },
    onError: () => toast.error('Failed to delete task.'),
  });

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    const task = tasks.find(t => String(t.id) === draggableId);
    if (task && task.status !== destination.droppableId) {
      updateTaskMutation.mutate({ id: task.id, data: { status: destination.droppableId } });
    }
  };

  const handleOpenModal = (task = null) => {
    if (task) {
        setSelectedTask(task);
    } else {
        const defaultCategory = menuItems.find(item => item.page === 'Tasks')?.label || 'Tasks';
        setSelectedTask({ title: '', description: '', category: defaultCategory, priority: 'medium', status: 'todo', attachments: [] });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleSaveTask = (taskData) => {
    if (taskData.id) {
      const { id, ...data } = taskData;
      updateTaskMutation.mutate({ id, data });
    } else {
      createTaskMutation.mutate(taskData);
    }
  };

  // Chart data - dynamic based on actual tasks
  const statusDistribution = STATUSES.map(status => ({
    name: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: tasks.filter(t => t.status === status).length
  }));
  const priorityDistribution = ['low', 'medium', 'high', 'urgent'].map(p => ({ 
      name: p.charAt(0).toUpperCase() + p.slice(1),
      count: tasks.filter(t => t.priority === p).length 
  }));

  const COLORS = ['#8b5cf6', '#3b82f6', '#f59e0b', '#10b981'];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-full mx-auto">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                    <ListTodo className="w-8 h-8 text-purple-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Tasks</h1>
                        <p className="text-sm text-gray-500">Task Management</p>
                    </div>
                </div>
          <Button onClick={() => handleOpenModal()} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>

        {isLoading ? (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
            </div>
        ) : (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Status Distribution</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={statusDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                    {statusDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm lg:col-span-2">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Priority Breakdown</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={priorityDistribution}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{fontSize: 12}} />
                                <YAxis allowDecimals={false} tick={{fontSize: 12}} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <DragDropContext onDragEnd={handleDragEnd}>
                  <div className="flex gap-4 overflow-x-auto pb-4">
                    {STATUSES.map(status => (
                      <TaskColumn
                        key={status}
                        status={status}
                        tasks={tasks.filter(t => t.status === status)}
                        onTaskClick={handleOpenModal}
                      />
                    ))}
                  </div>
                </DragDropContext>

                {/* All Tasks List */}
                <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">All Tasks</h2>
                    <div className="space-y-2">
                        {tasks.map(task => (
                            <div 
                                key={task.id}
                                onClick={() => handleOpenModal(task)}
                                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-purple-50 hover:border-purple-200 cursor-pointer transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`w-2 h-2 rounded-full ${
                                        task.priority === 'urgent' ? 'bg-red-500' :
                                        task.priority === 'high' ? 'bg-orange-500' :
                                        task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                    }`} />
                                    <span className="font-medium text-gray-800">{task.title || 'Untitled Task'}</span>
                                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{task.category}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs px-2 py-1 rounded ${
                                        task.status === 'done' ? 'bg-green-100 text-green-700' :
                                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                        task.status === 'review' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                        {task.status === 'in_progress' ? 'In Progress' : task.status === 'todo' ? 'To Do' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                                    </span>
                                    {task.due_date && <span className="text-xs text-gray-500">{task.due_date}</span>}
                                </div>
                            </div>
                        ))}
                        {tasks.length === 0 && (
                            <p className="text-center text-gray-500 py-4">No tasks yet. Create one to get started!</p>
                        )}
                    </div>
                </div>
            </>
        )}

        <TaskModal 
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={handleSaveTask}
            onDelete={deleteTaskMutation.mutate}
            task={selectedTask}
            categories={TASK_CATEGORIES}
        />
      </div>
    </div>
  );
};

export default TasksPage;