export interface Task {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

export interface BoardState {
  columns: Column[];
  addTask: (columnId: string, title: string, description: string) => void;
  editTask: (columnId: string, taskId: string, title: string, description: string) => void;
  deleteTask: (columnId: string, taskId: string) => void;
  moveTask: (taskId: string, fromColumnId: string, toColumnId: string) => void;
  addColumn: (title: string) => void;
  editColumn: (columnId: string, title: string) => void;
  deleteColumn: (columnId: string) => void;
}