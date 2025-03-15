import { create } from 'zustand';
import { BoardState, Task, Column } from '../types';

// Docker環境内では、ホスト名は'localhost'ではなくサービス名を使用
const API_URL = 'http://localhost:3001/api';

export const useBoardStore = create<BoardState>((set, get) => ({
  columns: [],
  isLoading: false,
  error: null,
  
  // データの初期ロード
  fetchBoard: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/columns`);
      if (!response.ok) throw new Error('Failed to fetch board data');
      
      const columns = await response.json();
      set({ columns, isLoading: false });
    } catch (error) {
      console.error('Error fetching board:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        isLoading: false 
      });
    }
  },
  
  addTask: async (columnId, title, description) => {
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, column_id: columnId }),
      });
      
      if (!response.ok) throw new Error('Failed to add task');
      
      const newTask = await response.json();
      
      set((state) => ({
        columns: state.columns.map((col) =>
          col.id === columnId
            ? { ...col, tasks: [...col.tasks, newTask] }
            : col
        ),
      }));
      
      return newTask;
    } catch (error) {
      console.error('Error adding task:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add task' 
      });
    }
  },

  editTask: async (columnId, taskId, title, description) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });
      
      if (!response.ok) throw new Error('Failed to update task');
      
      set((state) => ({
        columns: state.columns.map((col) =>
          col.id === columnId
            ? {
                ...col,
                tasks: col.tasks.map((task) =>
                  task.id === taskId
                    ? { ...task, title, description }
                    : task
                ),
              }
            : col
        ),
      }));
    } catch (error) {
      console.error('Error updating task:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update task' 
      });
    }
  },

  deleteTask: async (columnId, taskId) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete task');
      
      set((state) => ({
        columns: state.columns.map((col) =>
          col.id === columnId
            ? { ...col, tasks: col.tasks.filter((task) => task.id !== taskId) }
            : col
        ),
      }));
    } catch (error) {
      console.error('Error deleting task:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete task' 
      });
    }
  },

  moveTask: async (taskId, fromColumnId, toColumnId) => {
    try {
      // 先にUIを更新して即座に反応するようにする
      const fromColumn = get().columns.find((col) => col.id === fromColumnId);
      const toColumn = get().columns.find((col) => col.id === toColumnId);
      
      if (!fromColumn || !toColumn) {
        console.error('Column not found:', { fromColumnId, toColumnId });
        return;
      }
      
      const task = fromColumn.tasks.find((t) => t.id === taskId);
      if (!task) {
        console.error('Task not found:', { taskId, fromColumnId });
        return;
      }
      
      // タスクのコピーを作成して新しいカラムに追加するためのオブジェクト
      const taskToMove = {
        ...task,
        column_id: toColumnId
      };
      
      set((state) => ({
        columns: state.columns.map((col) => {
          if (col.id === fromColumnId) {
            return {
              ...col,
              tasks: col.tasks.filter((t) => t.id !== taskId),
            };
          }
          if (col.id === toColumnId) {
            return {
              ...col,
              tasks: [...col.tasks, taskToMove],
            };
          }
          return col;
        }),
      }));
      
      // APIを呼び出してサーバー側も更新
      const response = await fetch(`${API_URL}/tasks/${taskId}/move`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          from_column_id: fromColumnId, 
          to_column_id: toColumnId 
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to move task');
      }
      
    } catch (error) {
      console.error('Error moving task:', error);
      // エラーが発生した場合は元に戻すか、ボードを再取得
      get().fetchBoard();
      set({ 
        error: error instanceof Error ? error.message : 'Failed to move task' 
      });
    }
  },

  addColumn: async (title) => {
    try {
      const response = await fetch(`${API_URL}/columns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      
      if (!response.ok) throw new Error('Failed to add column');
      
      const newColumn = await response.json();
      
      set((state) => ({
        columns: [...state.columns, newColumn],
      }));
    } catch (error) {
      console.error('Error adding column:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add column' 
      });
    }
  },

  editColumn: async (columnId, title) => {
    try {
      const response = await fetch(`${API_URL}/columns/${columnId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      
      if (!response.ok) throw new Error('Failed to update column');
      
      set((state) => ({
        columns: state.columns.map((col) =>
          col.id === columnId
            ? { ...col, title }
            : col
        ),
      }));
    } catch (error) {
      console.error('Error updating column:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update column' 
      });
    }
  },

  deleteColumn: async (columnId) => {
    try {
      const response = await fetch(`${API_URL}/columns/${columnId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete column');
      
      set((state) => ({
        columns: state.columns.filter((col) => col.id !== columnId),
      }));
    } catch (error) {
      console.error('Error deleting column:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete column' 
      });
    }
  },
}));