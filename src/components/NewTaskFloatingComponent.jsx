import React, { useState } from 'react';
import { Plus, X, Calendar, Flag } from 'lucide-react';
import { createTodo } from '../services/api';

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' },
  { value: 'high', label: 'High', color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
];

const LIST_OPTIONS = ['Home', 'School', 'Project', 'Health', 'Work', 'Personal'];

export default function NewTaskFloatingComponent({ onSuccess }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [list, setList] = useState('General');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Le titre est requis');
      return;
    }

    setLoading(true);
    try {
      const todoData = {
        title: trimmedTitle,
      };

      if (description.trim()) todoData.description = description.trim();
      if (dueDate) todoData.dueDate = dueDate;
      if (list && list !== 'General') todoData.list = list; // General est déjà la valeur par défaut
      if (priority && priority !== 'medium') todoData.priority = priority;

      console.log('Envoi:', todoData);

      const newTodo = await createTodo(todoData); // ← directement l'objet todo
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(newTodo);
      }else {
        console.warn('onSuccess n\'est pas une fonction valide');
      }
      
      // Réinitialisation du formulaire
      setTitle('');
      setDescription('');
      setDueDate('');
      setList('General');
      setPriority('medium');
      setOpen(false);

    } catch (err) {
      console.error('Erreur création tâche:', err);
      setError(err.response?.data?.message || 'Erreur lors de la création de la tâche');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-8 right-8 z-50 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-3 shadow-2xl transition-all group flex items-center gap-3"
      >
        <Plus className="w-7 h-7" />
        <span className="font-medium text-xl pr-4">New</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 m-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">New Task</h2>
              <button onClick={() => setOpen(false)} disabled={loading}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Titre */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Buy groceries"
                  className="w-full px-4 py-3 rounded-xl border dark:text-white border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  autoFocus
                  required
                  disabled={loading}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Additional details..."
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl border dark:text-white border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 resize-none text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  disabled={loading}
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl dark:text-white border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  disabled={loading}
                />
              </div>

              {/* List */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  List
                </label>
                <select
                  value={list}
                  onChange={(e) => setList(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border dark:text-white border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  disabled={loading}
                >
                  <option value="General">General</option>
                  {LIST_OPTIONS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5" />
                  Priority
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {PRIORITY_OPTIONS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPriority(p.value)}
                      disabled={loading}
                      className={`py-2.5 px-3 rounded-xl text-sm  font-medium transition-all ${priority === p.value
                        ? `${p.color} ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-gray-800`
                        : 'bg-gray-100 dark:bg-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Boutons */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 transition disabled:opacity-50 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !title.trim()}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-medium transition text-sm flex items-center gap-2"
                >
                  {loading ? 'Adding...' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}