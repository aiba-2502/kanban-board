export interface Task {
  id: string;
  title: string;
  description: string;
  column_id: string;
  position: number;
  created_at: Date;
}

export interface Column {
  id: string;
  title: string;
  position: number;
  tasks: Task[];
}

export interface BoardState {
  columns: Column[];
  isLoading: boolean;
  error: string | null;
  fetchBoard: () => Promise<void>;
  addTask: (columnId: string, title: string, description: string) => Promise<Task | undefined>;
  editTask: (columnId: string, taskId: string, title: string, description: string) => Promise<void>;
  deleteTask: (columnId: string, taskId: string) => Promise<void>;
  moveTask: (taskId: string, fromColumnId: string, toColumnId: string) => Promise<void>;
  addColumn: (title: string) => Promise<void>;
  editColumn: (columnId: string, title: string) => Promise<void>;
  deleteColumn: (columnId: string) => Promise<void>;
}