import { useState } from 'react';
import { toast } from 'sonner';

export const useTodos = (userId) => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Firebase removed - use backend API instead
  const addTodo = async (todo) => {
    console.warn('addTodo: Firebase functionality removed, use backend API');
    toast('Todo functionality is not available. Use backend API instead.');
  };

  const updateTodo = async (id, updatedData) => {
    console.warn('updateTodo: Firebase functionality removed, use backend API');
  };

  const deleteTodo = async (id) => {
    console.warn('deleteTodo: Firebase functionality removed, use backend API');
    toast('Todo functionality is not available. Use backend API instead.');
  };

  return { todos, loading, addTodo, updateTodo, deleteTodo };
};
