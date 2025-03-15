import { create } from 'zustand';
import { BoardState, Task } from '../types';

export const useBoardStore = create<BoardState>((set) => ({
  columns: [
    { id: '1', title: 'To Do', tasks: [] },
    { id: '2', title: 'In Progress', tasks: [] },
    { id: '3', title: 'Done', tasks: [] },
  ],
  
  addTask: (columnId, title, description) => 
    set((state) => {
      const newTask: Task = {
        id: Math.random().toString(36).substr(2, 9),
        title,
        description,
        createdAt: new Date(),
      };
      
      return {
        columns: state.columns.map((col) =>
          col.id === columnId
            ? { ...col, tasks: [...col.tasks, newTask] }
            : col
        ),
      };
    }),

  editTask: (columnId, taskId, title, description) =>
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
    })),

  deleteTask: (columnId, taskId) =>
    set((state) => ({
      columns: state.columns.map((col) =>
        col.id === columnId
          ? { ...col, tasks: col.tasks.filter((task) => task.id !== taskId) }
          : col
      ),
    })),

  moveTask: (taskId, fromColumnId, toColumnId) =>
    set((state) => {
      const fromColumn = state.columns.find((col) => col.id === fromColumnId);
      const toColumn = state.columns.find((col) => col.id === toColumnId);
      
      if (!fromColumn || !toColumn) return state;
      
      const task = fromColumn.tasks.find((t) => t.id === taskId);
      if (!task) return state;
      
      return {
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
              tasks: [...col.tasks, task],
            };
          }
          return col;
        }),
      };
    }),

  addColumn: (title) =>
    set((state) => ({
      columns: [
        ...state.columns,
        {
          id: Math.random().toString(36).substr(2, 9),
          title,
          tasks: [],
        },
      ],
    })),

  editColumn: (columnId, title) =>
    set((state) => ({
      columns: state.columns.map((col) =>
        col.id === columnId
          ? { ...col, title }
          : col
      ),
    })),

  deleteColumn: (columnId) =>
    set((state) => ({
      columns: state.columns.filter((col) => col.id !== columnId),
    })),
}));