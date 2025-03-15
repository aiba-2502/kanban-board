import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, closestCorners } from '@dnd-kit/core';
import { Column } from './components/Column';
import { useBoardStore } from './store/boardStore';
import { Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { TaskCard } from './components/TaskCard';
import { Task, Column as ColumnType } from './types';

function App() {
  const { columns, isLoading, error, fetchBoard, moveTask, addColumn } = useBoardStore();
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = event.active.id as string;
    const columnId = columns.find((col: ColumnType) => 
      col.tasks.some((task: Task) => task.id === taskId)
    )?.id || null;
    
    if (columnId) {
      const task = columns.find((col: ColumnType) => col.id === columnId)?.tasks.find((t: Task) => t.id === taskId);
      if (task) {
        setActiveTask(task);
        setActiveColumnId(columnId);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    // ドロップ先がない場合は移動をキャンセル
    if (!over) {
      setActiveTask(null);
      setActiveColumnId(null);
      return;
    }

    const taskId = active.id as string;
    const fromColumnId = columns.find((col: ColumnType) => 
      col.tasks.some((task: Task) => task.id === taskId)
    )?.id;

    if (!fromColumnId) {
      setActiveTask(null);
      setActiveColumnId(null);
      return;
    }

    // ドロップ先がカラムの場合
    const isOverColumn = columns.some((col: ColumnType) => col.id === over.id);
    
    let toColumnId: string;
    
    if (isOverColumn) {
      // カラムの上にドロップした場合
      toColumnId = over.id as string;
    } else {
      // タスクの上にドロップした場合、そのタスクが属するカラムを特定
      const overTaskId = over.id as string;
      const overTaskColumn = columns.find((col: ColumnType) => 
        col.tasks.some((task: Task) => task.id === overTaskId)
      );
      
      if (!overTaskColumn) {
        setActiveTask(null);
        setActiveColumnId(null);
        return;
      }
      
      toColumnId = overTaskColumn.id;
    }

    // 同じカラム内での移動は無視
    if (fromColumnId !== toColumnId) {
      moveTask(taskId, fromColumnId, toColumnId);
    }

    setActiveTask(null);
    setActiveColumnId(null);
  };

  const handleAddColumn = async () => {
    if (newColumnTitle.trim()) {
      await addColumn(newColumnTitle);
      setNewColumnTitle('');
      setIsAddingColumn(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center bg-cover bg-center bg-no-repeat bg-fixed"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=80")',
        }}
      >
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-lg flex flex-col items-center">
          <RefreshCw size={48} className="animate-spin text-blue-500 mb-4" />
          <p className="text-lg">カンバンボードをロード中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center bg-cover bg-center bg-no-repeat bg-fixed"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=80")',
        }}
      >
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-lg">
          <div className="flex items-center gap-2 text-red-500 mb-4">
            <AlertCircle size={24} />
            <h2 className="text-xl font-bold">エラーが発生しました</h2>
          </div>
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => fetchBoard()} 
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-8 bg-cover bg-center bg-no-repeat bg-fixed"
      style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=80")',
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8 bg-black/70 backdrop-blur-sm p-4 rounded-lg">
          <h1 className="text-2xl font-bold text-white">Kanban Board</h1>
          {!isAddingColumn && (
            <button
              onClick={() => setIsAddingColumn(true)}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
            >
              <Plus size={16} className="mr-2" />
              Add Column
            </button>
          )}
        </div>

        {isAddingColumn && (
          <div className="mb-6 flex gap-2 items-center bg-black/70 backdrop-blur-sm p-4 rounded-lg">
            <input
              type="text"
              placeholder="Column title"
              className="px-4 py-2 border rounded-lg text-sm"
              value={newColumnTitle}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewColumnTitle(e.target.value)}
            />
            <button
              onClick={handleAddColumn}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
            >
              Add
            </button>
            <button
              onClick={() => setIsAddingColumn(false)}
              className="px-4 py-2 text-white hover:bg-gray-800 rounded-lg text-sm"
            >
              Cancel
            </button>
          </div>
        )}

        <DndContext 
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd} 
          collisionDetection={closestCorners}
          children={
            <>
              <div className="flex gap-6 overflow-x-auto pb-4">
                {columns.map((column: ColumnType) => (
                  <React.Fragment key={column.id}>
                    <Column column={column} />
                  </React.Fragment>
                ))}
              </div>
              <DragOverlay>
                {activeTask && activeColumnId && (
                  <div className="transform-none">
                    <TaskCard task={activeTask} columnId={activeColumnId} isDragging />
                  </div>
                )}
              </DragOverlay>
            </>
          }
        />
      </div>
    </div>
  );
}

export default App;