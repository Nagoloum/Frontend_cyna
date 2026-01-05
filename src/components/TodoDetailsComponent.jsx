import React, { useState } from 'react';
import { Calendar, Flag, ListTodo, Edit2, Save, X } from 'lucide-react';
import { updateTodo } from '../services/api';

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', emoji: '🟢', color: 'text-green-600' },
  { value: 'medium', label: 'Medium', emoji: '🟡', color: 'text-yellow-600' },
  { value: 'high', label: 'High', emoji: '🔴', color: 'text-red-600' },
];

const LIST_OPTIONS = ['General', 'Home', 'School', 'Project', 'Health', 'Work', 'Personal'];

export default function TodoDetailsComponent({ todo, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTodo, setEditedTodo] = useState(null);
  const [loading, setLoading] = useState(false);

  const startEditing = () => {
    setEditedTodo({
      title: todo.title || '',
      description: todo.description || '',
      completed: todo.completed || false,
      dueDate: todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : '',
      list: todo.list || 'General',
      priority: todo.priority || 'medium',
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditedTodo(null);
  };

  const saveChanges = async () => {
    if (!editedTodo.title.trim()) return;

    setLoading(true);
    try {
      const updates = {
        title: editedTodo.title.trim(),
        description: editedTodo.description.trim() || null,
        completed: editedTodo.completed,
        dueDate: editedTodo.dueDate || null,
        list: editedTodo.list,
        priority: editedTodo.priority,
      };

      // On fait toujours la requête pour persister en base
    await updateTodo(todo._id, updates);

    // On construit l'objet mis à jour localement (on garde l'_id original !)
    const updatedTodo = {
      ...todo,           // tout l'ancien todo (dont _id, createdAt, etc.)
      ...updates,        // on applique les modifications
      // optionnel : mettre à jour updatedAt si tu veux
      // updatedAt: new Date().toISOString(),
    };

    // On passe cet objet complet et sûr au parent
    onUpdate(updatedTodo);

    setIsEditing(false);
    setEditedTodo(null);
    
    } catch (err) {
      console.error('Error updating task:', err);
      // Tu peux ajouter un toast ici
    } finally {
      setLoading(false);
    }
  };

  if (!todo) {
    return (
      <div className="col-span-12 md:col-span-6 bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 flex flex-col items-center justify-center text-center">
        <div className="text-5xl mb-4 opacity-50">👆</div>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Select a task
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Click on a task from the list to view and edit details
        </p>
      </div>
    );
  }

  const current = isEditing ? editedTodo : todo;

  return (
    <div className="col-span-12 md:col-span-5 bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 overflow-y-auto max-h-[calc(100vh-6rem)]">
      {/* Header avec bouton Edit/Save */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
          Task Details
        </h2>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={cancelEditing}
                disabled={loading}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={saveChanges}
                disabled={loading || !editedTodo?.title.trim()}
                className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg transition flex items-center gap-1"
              >
                <Save className="w-5 h-5" />
              </button>
            </>
          ) : (
            <button
              onClick={startEditing}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <Edit2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Title */}
        <div>
          {isEditing ? (
            <input
              type="text"
              value={editedTodo.title}
              onChange={(e) => setEditedTodo({ ...editedTodo, title: e.target.value })}
              className="w-full text-xl font-bold px-3 py-2 rounded-xl border dark:text-white border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          ) : (
            <h3 className={`text-xl font-bold ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
              {todo.title}
            </h3>
          )}
        </div>

        {/* Status Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => isEditing && setEditedTodo({ ...editedTodo, completed: !editedTodo.completed })}
            disabled={!isEditing}
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
              current.completed
                ? 'bg-indigo-600 border-indigo-600'
                : 'border-gray-400 dark:border-gray-500'
            } ${!isEditing ? 'cursor-default' : ''}`}
          >
            {current.completed && <div className="w-3 h-3 bg-white rounded-full" />}
          </button>
          <span className={`font-medium ${current.completed ? 'text-green-600' : 'text-orange-600'}`}>
            {current.completed ? 'Completed' : 'In Progress'}
          </span>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Description</h4>
          {isEditing ? (
            <textarea
              value={editedTodo.description}
              onChange={(e) => setEditedTodo({ ...editedTodo, description: e.target.value })}
              rows="4"
              placeholder="Add a description..."
              className="w-full px-3 py-2 rounded-xl border dark:text-white border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          ) : (
            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              {todo.description || <span className="italic text-gray-500">No description</span>}
            </p>
          )}
        </div>

        {/* List */}
        <div className="flex items-center gap-4">
          <ListTodo className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div className="flex-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">List</p>
            {isEditing ? (
              <select
                value={editedTodo.list}
                onChange={(e) => setEditedTodo({ ...editedTodo, list: e.target.value })}
                className="mt-1 px-3 py-2 rounded-lg border dark:text-white border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {LIST_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <p className="font-medium text-gray-900 dark:text-white">{todo.list || 'General'}</p>
            )}
          </div>
        </div>

        {/* Priority */}
        <div className="flex items-center gap-4">
          <Flag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div className="flex-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">Priority</p>
            {isEditing ? (
              <div className="mt-2 flex gap-2">
                {PRIORITY_OPTIONS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setEditedTodo({ ...editedTodo, priority: p.value })}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                      editedTodo.priority === p.value
                        ? `${p.color} bg-opacity-20 ring-2 ring-indigo-500`
                        : 'bg-gray-100 dark:text-white dark:bg-gray-700'
                    }`}
                  >
                    {p.emoji} {p.label}
                  </button>
                ))}
              </div>
            ) : (
              <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                {PRIORITY_OPTIONS.find(p => p.value === (todo.priority || 'medium'))?.emoji || '🟡'}
                {PRIORITY_OPTIONS.find(p => p.value === (todo.priority || 'medium'))?.label || 'Medium'}
              </p>
            )}
          </div>
        </div>

        {/* Due Date */}
        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div className="flex-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">Due Date</p>
            {isEditing ? (
              <input
                type="date"
                value={editedTodo.dueDate}
                onChange={(e) => setEditedTodo({ ...editedTodo, dueDate: e.target.value })}
                className="mt-1 px-3 py-2 rounded-lg border dark:text-white border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <p className="font-medium text-gray-900 dark:text-white">
                {todo.dueDate
                  ? new Date(todo.dueDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : <span className="italic text-gray-500">No due date</span>}
              </p>
            )}
          </div>
        </div>

        {/* Created / Updated */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
          <p>Created: {new Date(todo.createdAt).toLocaleDateString('en-US')}</p>
          {todo.updatedAt !== todo.createdAt && (
            <p>Updated: {new Date(todo.updatedAt).toLocaleDateString('en-US')}</p>
          )}
        </div>
      </div>
    </div>
  );
}