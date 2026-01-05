import React, { useState, useEffect } from 'react';
import TodoListComponent from '../components/TodoListComponent';
import TodoDetailsComponent from '../components/TodoDetailsComponent';
import NewTaskFloatingComponent from '../components/NewTaskFloatingComponent'; // À ajouter
import { getTodos } from '../services/api';

export default function MainPage() {
  const [todos, setTodos] = useState([]);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger les tâches au montage
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const res = await getTodos();
      setTodos(res.data || []);
    } catch (err) {
      console.error('Erreur chargement tâches:', err);
    } finally {
      setLoading(false);
    }
  };

  // Quand une nouvelle tâche est créée
  const handleTodoCreated = (newTodo) => {
   setTodos((prev) => [newTodo, ...prev]);
    // setSelectedTodo(newTodo); // Optionnel : sélectionner automatiquement
  };

  // Quand une tâche est mise à jour (depuis détails ou toggle)
  const handleTodoUpdated = (updatedTodo) => {
    setTodos(prev => prev.map(t => t._id === updatedTodo._id ? updatedTodo : t));
    if (selectedTodo?._id === updatedTodo._id) {
      setSelectedTodo(updatedTodo);
    }
  };

  // Quand une tâche est supprimée
  const handleTodoDeleted = (deletedId) => {
    setTodos(prev => prev.filter(t => t._id !== deletedId));
    if (selectedTodo?._id === deletedId) {
      setSelectedTodo(null);
    }
  };

  return (
    <>
      {/* Liste des tâches */}
      <TodoListComponent
        todos={todos}
        selectedTodoId={selectedTodo?._id}
        onSelectTodo={setSelectedTodo}
        onTodoUpdated={handleTodoUpdated}
        onTodoDeleted={handleTodoDeleted}
        loading={loading}
      />

      {/* Détails de la tâche sélectionnée */}
      <TodoDetailsComponent
        todo={selectedTodo}
        onUpdate={handleTodoUpdated}
      />

      {/* Bouton flottant pour ajouter une tâche */}
      <NewTaskFloatingComponent onSuccess={handleTodoCreated} />
    </>
  );
}