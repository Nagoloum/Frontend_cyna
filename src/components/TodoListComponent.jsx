import React from 'react';
import { Check, Trash2, Calendar, Flag } from 'lucide-react';
import { updateTodo, deleteTodo } from '../services/api';

const PRIORITY_COLORS = {
  low: 'text-green-600 bg-green-100 dark:bg-green-900/30',
  medium: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
  high: 'text-red-600 bg-red-100 dark:bg-red-900/30',
};

const LIST_COLORS = {
  Home: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  School: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  Project: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  Health: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  Work: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  Personal: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  General: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

export default function TodoListComponent({
  todos,
  selectedTodoId,
  onSelectTodo,
  onTodoUpdated,
  onTodoDeleted,
  loading,
}) {
  const toggleComplete = async (todo) => {
    try {
      const res = await updateTodo(todo._id, { completed: !todo.completed });
      onTodoUpdated(res);
    } catch (err) {
      console.error('Erreur toggle completed:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTodo(id);
      onTodoDeleted(id);
    } catch (err) {
      console.error('Erreur suppression:', err);
    }
  };

  if (loading) {
    return <div className="col-span-12 md:col-span-5 text-center py-12 text-gray-500">Loading tasks...</div>;
  }

  if (todos.length === 0) {
    return (
      <div className="col-span-12 md:col-span-5 bg-gray-50 dark:bg-gray-900 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
        <div className="text-6xl mb-6">📝</div>
        <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No tasks yet</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Click the + button to add your first task!</p>
      </div>
    );
  }

  return (
    <div className="col-span-12 md:col-span-5 bg-gray-50 dark:bg-gray-900 rounded-3xl p-4 overflow-y-auto max-h-[calc(100vh-6rem)]">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 px-2">My Tasks</h2>
      <ul className="space-y-3">
        {todos.map((todo) => (
          <li
            key={todo._id}
            onClick={() => onSelectTodo(todo)}
            className={`p-5 rounded-2xl cursor-pointer transition-all duration-200 ${selectedTodoId === todo._id
              ? 'bg-indigo-100 dark:bg-indigo-900/50 ring-2 ring-indigo-500 shadow-md'
              : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm'
              }`}
          >
            {/* ... le reste du JSX identique ... */}
            {/* (garde tout le contenu de la carte : checkbox, titre, badges, delete) */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleComplete(todo);
                  }}
                  className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${todo.completed
                    ? 'bg-indigo-600 border-indigo-600'
                    : 'border-gray-400 dark:border-gray-500'
                    }`}
                >
                  {todo.completed && <Check className="w-3.5 h-3.5 text-white" />}
                </button>

                <div className="flex-1 min-w-0">
                  <h4 className={`text-base font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                    {todo.title}
                  </h4>
                  {todo.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {todo.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                    <span className={`px-2.5 py-1 rounded-full font-medium ${LIST_COLORS[todo.list || 'General']}`}>
                      {todo.list || 'General'}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${PRIORITY_COLORS[todo.priority || 'medium']}`}>
                      <Flag className="w-3.5 h-3.5" />
                      {todo.priority?.charAt(0).toUpperCase() + todo.priority?.slice(1) || 'Medium'}
                    </span>
                    {todo.dueDate && (
                      <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        {new Date(todo.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(todo._id);
                }}
                className="text-red-500 hover:text-red-700 transition p-1.5"
              >
                <Trash2 className="w-4.5 h-4.5" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}